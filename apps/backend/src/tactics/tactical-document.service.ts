import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import { effectivePlanBoard } from '../training-plans/plan-drill-content';
import { validateVersionedTacticalDocument } from './tactical-document';
import {
  drillMetadataSelect,
  strictObject,
  tacticalDrillMetadata,
} from './tactical-drill-input';
import {
  isSerializationConflict,
  isV2,
  tacticalWriteToken,
} from './tactical-persistence';

export type TacticalResource =
  | { kind: 'drill'; id: string }
  | { kind: 'plan'; id: string; planId: string }
  | { kind: 'match'; id: string };

@Injectable()
export class TacticalDocumentService {
  private readonly logger = new Logger(TacticalDocumentService.name);
  constructor(private readonly prisma: PrismaService) {}

  drillMetadata(principal: AuthPrincipal, id: string, query: unknown = {}) {
    return this.run(async (tx) => {
      const drill = await this.authorizeDrill(tx, principal, id, false);
      this.query(query);
      return drill;
    });
  }

  saveDrill(
    principal: AuthPrincipal,
    id: string,
    body: unknown,
    query: unknown = {},
  ) {
    return this.run(async (tx) => {
      await this.authorizeDrill(tx, principal, id, true);
      const input = strictObject(body, [
        'metadata',
        'document',
        'expectedWriteToken',
      ]);
      const metadata = tacticalDrillMetadata(input.metadata);
      const envelope = await this.writeInTransaction(
        tx,
        principal,
        { kind: 'drill', id },
        {
          document: input.document,
          expectedWriteToken: input.expectedWriteToken,
        },
        query,
      );
      const drill = await tx.drill.update({
        where: { id },
        data: metadata,
        select: drillMetadataSelect,
      });
      return { drill, ...envelope };
    });
  }

  createDrill(principal: AuthPrincipal, body: unknown, query: unknown = {}) {
    return this.run(async (tx) => {
      if (!['SYSTEM_ADMIN', 'CLUB_ADMIN', 'COACH'].includes(principal.role))
        throw new ForbiddenException(
          'Resource is outside the authorized scope',
        );
      this.query(query);
      const input = strictObject(body, [
        'groupId',
        'metadata',
        'document',
        'sourceId',
        'expectedSourceToken',
      ]);
      if (typeof input.groupId !== 'string' || !input.groupId)
        throw new BadRequestException('groupId is required');
      const auth = new AuthorizationService(tx as PrismaService);
      const group = await auth.assertCoachGroupAssignment(
        principal,
        input.groupId,
      );
      const metadata = tacticalDrillMetadata(input.metadata);
      const document = validateVersionedTacticalDocument(input.document);
      if (
        document.schemaVersion === 2 &&
        process.env.TACTICAL_V2_WRITES_ENABLED !== 'true'
      )
        throw new ForbiddenException('TACTICAL_V2_WRITES_DISABLED');
      if (
        input.sourceId !== undefined ||
        input.expectedSourceToken !== undefined
      ) {
        if (
          typeof input.sourceId !== 'string' ||
          !input.sourceId ||
          typeof input.expectedSourceToken !== 'string'
        )
          throw new BadRequestException(
            'Source and source token are required together',
          );
        const source = await this.load(
          tx,
          principal,
          { kind: 'drill', id: input.sourceId },
          false,
        );
        if (this.envelope(source).writeToken !== input.expectedSourceToken)
          throw new ConflictException('TACTICAL_DOCUMENT_WRITE_CONFLICT');
        if (isV2(source.document) && document.schemaVersion !== 2)
          throw new ConflictException('TACTICAL_DOCUMENT_VERSION_CONFLICT');
      }
      const target = await tx.playerGroup.findUnique({
        where: { id: group.id },
        select: { ageGroup: true },
      });
      if (!target) throw new NotFoundException('Group not found');
      const drill = await tx.drill.create({
        data: {
          ...metadata,
          ageGroup: target.ageGroup,
          scope: 'CLUB',
          clubId: group.clubId,
          groupId: group.id,
          createdById: principal.id,
          jsonData: document as unknown as Prisma.InputJsonValue,
        },
        select: drillMetadataSelect,
      });
      return {
        drill,
        ...this.envelope({
          identity: { kind: 'drill', id: drill.id },
          document,
        }),
      };
    });
  }

  read(
    principal: AuthPrincipal,
    resource: TacticalResource,
    query: unknown = {},
  ) {
    return this.run(async (tx) => {
      const current = await this.load(tx, principal, resource, false);
      this.query(query);
      return this.envelope(current);
    });
  }

  write(
    principal: AuthPrincipal,
    resource: TacticalResource,
    body: unknown,
    query: unknown = {},
  ) {
    return this.run((tx) =>
      this.writeInTransaction(tx, principal, resource, body, query),
    );
  }

  private async writeInTransaction(
    tx: Prisma.TransactionClient,
    principal: AuthPrincipal,
    resource: TacticalResource,
    body: unknown,
    query: unknown,
  ) {
    // Resource and source access precede input/token validation, in this transaction.
    const current = await this.load(tx, principal, resource, true);
    this.query(query);
    if (!body || typeof body !== 'object' || Array.isArray(body))
      throw new BadRequestException('Invalid tactical document request');
    const input = body as Record<string, unknown>;
    if (
      Object.keys(input).some(
        (key) => !['document', 'expectedWriteToken'].includes(key),
      ) ||
      typeof input.expectedWriteToken !== 'string' ||
      !/^td1_[a-f0-9]{64}$/.test(input.expectedWriteToken)
    )
      throw new BadRequestException('Invalid tactical document request');
    const previous = this.envelope(current);
    if (previous.writeToken !== input.expectedWriteToken)
      throw new ConflictException('TACTICAL_DOCUMENT_WRITE_CONFLICT');
    const document = validateVersionedTacticalDocument(input.document);
    if (isV2(current.document) && document.schemaVersion !== 2)
      throw new ConflictException('TACTICAL_DOCUMENT_VERSION_CONFLICT');
    if (
      document.schemaVersion === 2 &&
      process.env.TACTICAL_V2_WRITES_ENABLED !== 'true'
    )
      throw new ForbiddenException('TACTICAL_V2_WRITES_DISABLED');
    const json = document as unknown as Prisma.InputJsonValue;
    if (resource.kind === 'drill') {
      await tx.drill.update({
        where: { id: resource.id },
        data: { jsonData: json },
      });
    } else if (resource.kind === 'plan') {
      await tx.planDrill.update({
        where: { id: resource.id },
        data: { boardSnapshot: json },
      });
    } else {
      await tx.match.update({
        where: { id: resource.id },
        data: { tacticalBoard: json },
      });
    }
    // Snapshot creation changes provenance; read the saved envelope in the same transaction.
    return this.envelope(await this.load(tx, principal, resource, true));
  }

  private async load(
    tx: Prisma.TransactionClient,
    principal: AuthPrincipal,
    resource: TacticalResource,
    manage: boolean,
  ) {
    const auth = new AuthorizationService(tx as PrismaService);
    if (resource.kind === 'drill') {
      await this.authorizeDrill(tx, principal, resource.id, manage);
      const drill = await tx.drill.findUnique({
        where: { id: resource.id },
        select: { jsonData: true },
      });
      if (!drill) throw new NotFoundException('Drill not found');
      return { identity: resource, document: drill.jsonData };
    }
    if (resource.kind === 'match') {
      if (manage) await auth.assertMatchManage(principal, resource.id);
      else await auth.assertMatchView(principal, resource.id);
      const match = await tx.match.findUnique({
        where: { id: resource.id },
        select: { tacticalBoard: true },
      });
      if (!match) throw new NotFoundException('Match not found');
      return { identity: resource, document: match.tacticalBoard };
    }
    if (manage) await auth.assertPlanManage(principal, resource.planId);
    else await auth.assertPlanView(principal, resource.planId);
    await auth.assertPlanDrillSourceView(
      principal,
      resource.planId,
      resource.id,
    );
    const phase = await tx.planDrill.findFirst({
      where: { id: resource.id, trainingPlanId: resource.planId },
      select: {
        drillId: true,
        boardSnapshot: true,
        contentSnapshot: true,
        drill: { select: { jsonData: true } },
      },
    });
    if (!phase) throw new NotFoundException('Plan drill not found');
    return {
      identity: {
        ...resource,
        sourceId: phase.drillId,
        origin:
          phase.boardSnapshot != null || phase.contentSnapshot != null
            ? 'snapshot'
            : 'drill',
      },
      document: effectivePlanBoard(phase),
    };
  }

  private async authorizeDrill(
    tx: Prisma.TransactionClient,
    principal: AuthPrincipal,
    id: string,
    manage: boolean,
  ) {
    const auth = new AuthorizationService(tx as PrismaService);
    await auth.assertDrillView(principal, id);
    const drill = await tx.drill.findUnique({
      where: { id },
      select: drillMetadataSelect,
    });
    if (!drill) throw new NotFoundException('Drill not found');
    if (drill.scope === 'GLOBAL') {
      if (manage)
        throw new ForbiddenException(
          'Global content requires the review workflow',
        );
      if (principal.role !== 'SYSTEM_ADMIN') {
        const versions = await tx.drillVersion.count({
          where: { drillId: drill.id },
        });
        const published = await tx.drillVersion.count({
          where: { drillId: drill.id, status: 'PUBLISHED' },
        });
        if (versions && !published)
          throw new ForbiddenException(
            'Resource is outside the authorized scope',
          );
      }
    }
    if (manage && principal.role !== 'SYSTEM_ADMIN') {
      if (principal.role === 'PLAYER' || principal.clubId !== drill.clubId)
        throw new ForbiddenException(
          'Resource is outside the authorized scope',
        );
      if (principal.role !== 'CLUB_ADMIN') {
        if (
          principal.role !== 'COACH' ||
          drill.createdById !== principal.id ||
          !drill.groupId
        )
          throw new ForbiddenException(
            'Resource is outside the authorized scope',
          );
        await auth.assertCoachGroupAssignment(principal, drill.groupId);
      }
    }
    return drill;
  }

  private envelope(current: { identity: unknown; document: unknown }) {
    const document =
      current.document == null
        ? null
        : validateVersionedTacticalDocument(current.document);
    const identity = current.identity as TacticalResource & {
      sourceId?: string;
      origin?: 'snapshot' | 'drill';
    };
    return {
      document,
      writeToken: tacticalWriteToken(current.identity, document),
      ...(identity.kind === 'plan'
        ? {
            phase: {
              planId: identity.planId,
              planDrillId: identity.id,
              drillId: identity.sourceId,
              origin: document === null ? null : identity.origin,
            },
          }
        : {}),
    };
  }

  private query(query: unknown) {
    if (
      !query ||
      typeof query !== 'object' ||
      Array.isArray(query) ||
      Object.keys(query).length
    )
      throw new BadRequestException('Unknown tactical document query');
  }

  private async run<T>(
    work: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    try {
      return await this.prisma.$transaction(work, {
        isolationLevel: 'Serializable',
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;
      // No silent retry with a refreshed token. The caller keeps its draft.
      if (isSerializationConflict(error))
        throw new ConflictException('TACTICAL_DOCUMENT_WRITE_CONFLICT');
      this.logger.error('TACTICAL_DOCUMENT_PERSISTENCE_FAILED');
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
