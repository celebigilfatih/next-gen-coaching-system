import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DrillContentStatus,
  DrillScope,
  Prisma,
  type SportingCapability,
} from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseDrillContentBody,
  parseReviewBody,
  type DrillContentInput,
} from './drill-content.dto';
import { parseAgeLabel } from '../sporting/age-label';
import {
  assertLegacyTacticalWrite,
  rethrowTacticalConflict,
} from '../tactics/tactical-persistence';
import { validateTacticalBoardDocument } from '../tactics/tactical-board';
import { starterDrillIds } from './drill-starter-pack';

@Injectable()
export class DrillContentService {
  private readonly logger = new Logger(DrillContentService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async createDraft(principal: AuthPrincipal, request: unknown) {
    await this.requireCapability(principal, 'DRILL_CONTENT_AUTHOR');
    const input = parseDrillContentBody(request);
    return this.prisma.$transaction(async (tx) => {
      const duplicateSource = await tx.drillSource.findUnique({
        where: { contentHash: input.source.contentHash },
        select: { id: true },
      });
      if (duplicateSource)
        throw new BadRequestException('This content checksum already exists');
      const existing = input.drillId
        ? await tx.drill.findUnique({ where: { id: input.drillId } })
        : null;
      if (input.drillId && !existing)
        throw new NotFoundException('Drill not found');
      if (existing && existing.scope !== DrillScope.GLOBAL)
        throw new BadRequestException(
          'Only global drills can be versioned here',
        );
      const drill =
        existing ??
        (await tx.drill.create({
          data: {
            title: input.title,
            category: input.category,
            ageGroup: input.ageVariants[0].ageGroup,
            durationMin: input.durationMin,
            difficulty: input.difficulty,
            equipment: input.equipmentItems.join(', '),
            jsonData: input.boardDocument as never,
            scope: DrillScope.GLOBAL,
          },
        }));
      const latest = await tx.drillVersion.aggregate({
        where: { drillId: drill.id },
        _max: { version: true },
      });
      const source = await tx.drillSource.create({
        data: {
          ...input.source,
          verifiedById: null,
          licenseVerifiedAt: null,
        },
      });
      const version = await tx.drillVersion.create({
        data: {
          drillId: drill.id,
          version: (latest._max.version ?? 0) + 1,
          status: DrillContentStatus.DRAFT,
          ...this.versionData(input),
          sourceId: source.id,
          createdById: principal.id,
          ageVariants: {
            create: input.ageVariants.map((variant) => ({
              ...variant,
              rules: variant.rules as Prisma.InputJsonValue,
              coachingPoints: variant.coachingPoints as Prisma.InputJsonValue,
            })),
          },
        },
        include: this.contentInclude,
      });
      await tx.securityAuditEvent.create({
        data: {
          action: 'DRILL_CONTENT_DRAFT_CREATED',
          actorId: principal.id,
          clubId: principal.clubId,
          metadata: {
            drillId: drill.id,
            versionId: version.id,
            version: version.version,
          },
        },
      });
      return version;
    });
  }

  async submit(principal: AuthPrincipal, versionId: string) {
    const version = await this.version(versionId);
    await this.assertAuthor(principal, version.createdById);
    if (version.status !== DrillContentStatus.DRAFT)
      throw new BadRequestException('Only draft content can be submitted');
    return this.transition(principal, versionId, {
      status: DrillContentStatus.IN_REVIEW,
      submittedAt: new Date(),
      reviewComment: null,
      action: 'DRILL_CONTENT_SUBMITTED',
    });
  }

  async approve(principal: AuthPrincipal, versionId: string, request: unknown) {
    await this.requireCapability(principal, 'DRILL_CONTENT_REVIEW');
    const version = await this.version(versionId);
    if (version.status !== DrillContentStatus.IN_REVIEW)
      throw new BadRequestException('Only submitted content can be approved');
    if (version.createdById === principal.id)
      throw new ForbiddenException('Authors cannot approve their own content');
    const { comment } = parseReviewBody(request);
    return this.prisma.$transaction(async (tx) => {
      await tx.drillSource.update({
        where: { id: version.sourceId },
        data: { verifiedById: principal.id, licenseVerifiedAt: new Date() },
      });
      const updated = await tx.drillVersion.update({
        where: { id: versionId },
        data: {
          status: DrillContentStatus.APPROVED,
          reviewedById: principal.id,
          approvedAt: new Date(),
          reviewComment: comment,
        },
        include: this.contentInclude,
      });
      await this.audit(tx, principal, 'DRILL_CONTENT_APPROVED', updated);
      return updated;
    });
  }

  async reject(principal: AuthPrincipal, versionId: string, request: unknown) {
    await this.requireCapability(principal, 'DRILL_CONTENT_REVIEW');
    const version = await this.version(versionId);
    if (version.status !== DrillContentStatus.IN_REVIEW)
      throw new BadRequestException('Only submitted content can be rejected');
    if (version.createdById === principal.id)
      throw new ForbiddenException('Authors cannot review their own content');
    const { comment } = parseReviewBody(request);
    if (!comment)
      throw new BadRequestException('A rejection comment is required');
    return this.transition(principal, versionId, {
      status: DrillContentStatus.DRAFT,
      reviewedById: principal.id,
      reviewComment: comment,
      action: 'DRILL_CONTENT_REJECTED',
    });
  }

  async publish(principal: AuthPrincipal, versionId: string) {
    if (principal.role !== 'SYSTEM_ADMIN') this.deny();
    const version = await this.version(versionId);
    if (starterDrillIds.includes(version.drillId)) {
      const released = await this.prisma.drillVersion.findMany({
        where: { drillId: { in: starterDrillIds }, publishedAt: { not: null } },
        distinct: ['drillId'],
        select: { drillId: true },
      });
      if (released.length !== 120)
        throw new BadRequestException(
          'İlk yayın 120 egzersiz birlikte tamamlanmalıdır. Başlangıç paketini yayımlayın.',
        );
    }
    if (version.status !== DrillContentStatus.APPROVED || !version.reviewedById)
      throw new BadRequestException(
        'Expert approval is required before publishing',
      );
    return this.prisma
      .$transaction(
        async (tx) => {
          return this.publishApprovedVersion(tx, principal, version);
        },
        { isolationLevel: 'Serializable' },
      )
      .catch((error: unknown) => {
        if (error instanceof HttpException) throw error;
        rethrowTacticalConflict(error);
        this.logger.error('DRILL_CONTENT_PUBLISH_FAILED');
        throw new InternalServerErrorException('Internal server error');
      });
  }

  private async publishApprovedVersion(
    tx: Prisma.TransactionClient,
    principal: AuthPrincipal,
    version: { id: string; drillId: string; boardDocument: Prisma.JsonValue },
  ) {
    const target = await tx.drill.findUnique({
      where: { id: version.drillId },
      select: { jsonData: true },
    });
    if (!target) throw new NotFoundException('Drill not found');
    assertLegacyTacticalWrite(target.jsonData);
    validateTacticalBoardDocument(version.boardDocument);
    await tx.drillVersion.updateMany({
      where: {
        drillId: version.drillId,
        status: DrillContentStatus.PUBLISHED,
        id: { not: version.id },
      },
      data: {
        status: DrillContentStatus.ARCHIVED,
        archivedAt: new Date(),
      },
    });
    const updated = await tx.drillVersion.update({
      where: {
        id: version.id,
        status: DrillContentStatus.APPROVED,
        reviewedById: { not: null },
      },
      data: {
        status: DrillContentStatus.PUBLISHED,
        publishedById: principal.id,
        publishedAt: new Date(),
      },
      include: this.contentInclude,
    });
    const primary = updated.ageVariants[0];
    await tx.drill.update({
      where: { id: updated.drillId },
      data: {
        title: updated.title,
        category: updated.category,
        ageGroup: primary?.ageGroup ?? 'TBD',
        durationMin: primary?.durationMin ?? updated.durationMin,
        difficulty: updated.difficulty,
        equipment: updated.equipmentItems.join(', '),
        jsonData: updated.boardDocument as never,
      },
    });
    await this.audit(tx, principal, 'DRILL_CONTENT_PUBLISHED', updated);
    return updated;
  }

  async publishStarterPack(principal: AuthPrincipal) {
    if (principal.role !== 'SYSTEM_ADMIN') this.deny();
    return this.prisma
      .$transaction(
        async (tx) => {
          const versions = await tx.drillVersion.findMany({
            where: {
              drillId: { in: starterDrillIds },
              status: DrillContentStatus.APPROVED,
            },
            orderBy: { version: 'desc' },
            distinct: ['drillId'],
          });
          if (
            versions.length !== 120 ||
            versions.some(
              (version) =>
                !version.reviewedById ||
                version.reviewedById === version.createdById,
            )
          )
            throw new BadRequestException(
              'Başlangıç paketindeki 120 egzersizin tamamı bağımsız uzman tarafından onaylanmalıdır.',
            );
          for (const version of versions)
            await this.publishApprovedVersion(tx, principal, version);
          return { published: versions.length };
        },
        { isolationLevel: 'Serializable', timeout: 30000 },
      )
      .catch((error: unknown) => {
        if (error instanceof HttpException) throw error;
        rethrowTacticalConflict(error);
        this.logger.error('DRILL_STARTER_PACK_PUBLISH_FAILED');
        throw new InternalServerErrorException('Internal server error');
      });
  }

  async archive(principal: AuthPrincipal, versionId: string) {
    if (principal.role !== 'SYSTEM_ADMIN') this.deny();
    const version = await this.version(versionId);
    if (version.status !== DrillContentStatus.PUBLISHED)
      throw new BadRequestException('Only published content can be archived');
    return this.transition(principal, versionId, {
      status: DrillContentStatus.ARCHIVED,
      archivedAt: new Date(),
      action: 'DRILL_CONTENT_ARCHIVED',
    });
  }

  async queue(principal: AuthPrincipal, rawStatus?: string) {
    if (principal.role !== 'SYSTEM_ADMIN') {
      const capability =
        rawStatus === DrillContentStatus.IN_REVIEW
          ? 'DRILL_CONTENT_REVIEW'
          : 'DRILL_CONTENT_AUTHOR';
      await this.requireCapability(principal, capability);
    }
    const status = rawStatus
      ? Object.values(DrillContentStatus).includes(
          rawStatus as DrillContentStatus,
        )
        ? (rawStatus as DrillContentStatus)
        : null
      : DrillContentStatus.DRAFT;
    if (!status) throw new BadRequestException('Invalid content status');
    const where = {
      status,
      ...(principal.role === 'SYSTEM_ADMIN'
        ? {}
        : status === DrillContentStatus.IN_REVIEW
          ? {}
          : { createdById: principal.id }),
    };
    const [items, total] = await Promise.all([
      this.prisma.drillVersion.findMany({
        where,
        orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
        take: 100,
        include: this.contentInclude,
      }),
      this.prisma.drillVersion.count({ where }),
    ]);
    return { items, total, limit: 100, nextCursor: null };
  }

  async publishedDetail(
    principal: AuthPrincipal,
    drillId: string,
    ageGroup?: string,
  ) {
    const requestedAgeGroup =
      ageGroup === undefined ? undefined : parseAgeLabel(ageGroup);
    const drill = await this.prisma.drill.findUnique({
      where: { id: drillId },
      include: {
        versions: {
          where: { status: DrillContentStatus.PUBLISHED },
          orderBy: { version: 'desc' },
          take: 1,
          include: this.contentInclude,
        },
      },
    });
    if (!drill) throw new NotFoundException('Drill not found');
    await this.assertDrillView(principal, drill);
    const version = drill.versions[0];
    if (!version) {
      const versions = await this.prisma.drillVersion.count({
        where: { drillId },
      });
      if (versions)
        throw new NotFoundException('Published drill content not found');
      return {
        drill,
        version: null,
        variant: null,
        provenance: 'LEGACY_UNVERIFIED',
      };
    }
    return {
      drill: {
        id: drill.id,
        scope: drill.scope,
        clubId: drill.clubId,
        groupId: drill.groupId,
      },
      version,
      variant:
        requestedAgeGroup === undefined
          ? (version.ageVariants[0] ?? null)
          : (version.ageVariants.find(
              (item) => item.ageGroup === requestedAgeGroup,
            ) ?? null),
      provenance: version.source.license,
    };
  }

  private version(versionId: string) {
    return this.prisma.drillVersion
      .findUnique({ where: { id: versionId } })
      .then((value) => {
        if (!value) throw new NotFoundException('Drill version not found');
        return value;
      });
  }

  private versionData(input: DrillContentInput) {
    return {
      title: input.title,
      summary: input.summary,
      category: input.category,
      difficulty: input.difficulty,
      objectiveKey: input.objectiveKey,
      objectiveLabel: input.objectiveLabel,
      themes: input.themes,
      durationMin: input.durationMin,
      playerMin: input.playerMin,
      playerMax: input.playerMax,
      areaLengthM: input.areaLengthM,
      areaWidthM: input.areaWidthM,
      equipmentItems: input.equipmentItems,
      organization: input.organization,
      steps: input.steps as Prisma.InputJsonValue,
      coachingPoints: input.coachingPoints as Prisma.InputJsonValue,
      progressions: input.progressions as Prisma.InputJsonValue,
      regressions: input.regressions as Prisma.InputJsonValue,
      constraints: input.constraints as Prisma.InputJsonValue,
      safetyNotes: input.safetyNotes,
      boardDocument: input.boardDocument as Prisma.InputJsonValue,
      searchText: [
        input.title,
        input.summary,
        input.objectiveLabel,
        ...input.themes,
        ...input.equipmentItems,
      ]
        .join(' ')
        .toLocaleLowerCase('tr-TR'),
    };
  }

  private async transition(
    principal: AuthPrincipal,
    versionId: string,
    data: Record<string, unknown> & { action: string },
  ) {
    const { action, ...update } = data;
    return this.prisma.$transaction(async (tx) => {
      const version = await tx.drillVersion.update({
        where: { id: versionId },
        data: update,
        include: this.contentInclude,
      });
      await this.audit(tx, principal, action, version);
      return version;
    });
  }

  private async audit(
    tx: Prisma.TransactionClient,
    principal: AuthPrincipal,
    action: string,
    version: { id: string; drillId: string; version: number },
  ) {
    await tx.securityAuditEvent.create({
      data: {
        action: action as never,
        actorId: principal.id,
        clubId: principal.clubId,
        metadata: {
          drillId: version.drillId,
          versionId: version.id,
          version: version.version,
        },
      },
    });
  }

  private async assertAuthor(
    principal: AuthPrincipal,
    authorId: string | null,
  ) {
    if (principal.role === 'SYSTEM_ADMIN') return;
    await this.requireCapability(principal, 'DRILL_CONTENT_AUTHOR');
    if (authorId !== principal.id) this.deny();
  }

  private async requireCapability(
    principal: AuthPrincipal,
    capability: SportingCapability,
  ) {
    if (principal.role === 'SYSTEM_ADMIN') return;
    if (!principal.clubId || principal.role === 'PLAYER') this.deny();
    await this.authorization.assertSportingCapability(
      principal,
      capability,
      principal.clubId,
    );
  }

  private async assertDrillView(
    principal: AuthPrincipal,
    drill: { scope: DrillScope; clubId: string | null; groupId: string | null },
  ) {
    if (principal.role === 'SYSTEM_ADMIN' || drill.scope === DrillScope.GLOBAL)
      return;
    if (!principal.clubId || drill.clubId !== principal.clubId) this.deny();
    if (principal.role === 'CLUB_ADMIN' || !drill.groupId) return;
    if (!(await this.authorization.isGroupMember(principal.id, drill.groupId)))
      this.deny();
  }

  private deny(): never {
    throw new ForbiddenException('Resource is outside the authorized scope');
  }

  private readonly contentInclude = {
    source: true,
    ageVariants: { orderBy: { ageGroup: 'asc' as const } },
    createdBy: { select: { id: true, name: true } },
    reviewedBy: { select: { id: true, name: true } },
    publishedBy: { select: { id: true, name: true } },
  } as const;
}
