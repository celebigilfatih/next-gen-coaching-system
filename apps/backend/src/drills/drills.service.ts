import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DrillContentStatus, DrillScope } from '@prisma/client';
import type { Prisma } from '@prisma/client';
import { parseDrillPageQuery } from './drill-page.dto';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  isTacticalBoardDocument,
  validateTacticalBoardDocument,
} from '../tactics/tactical-board';
import { parseAgeLabel } from '../sporting/age-label';
import {
  assertLegacyTacticalWrite,
  rethrowTacticalConflict,
} from '../tactics/tactical-persistence';

const CATEGORIES = new Set(['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN']);
const DIFFICULTIES = new Set(['EASY', 'MEDIUM', 'HARD']);

export interface DrillWriteInput {
  title: string;
  category: string;
  ageGroup: string;
  durationMin: number;
  difficulty: string;
  equipment?: string | null;
  jsonData: unknown;
  imageUrl?: string | null;
}

@Injectable()
export class DrillsService {
  private readonly logger = new Logger(DrillsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async list(
    principal: AuthPrincipal,
    filters: {
      category?: string;
      ageGroup?: string;
      difficulty?: string;
      groupId?: string;
    },
  ) {
    if (filters.groupId) {
      await this.authorization.assertGroupView(principal, filters.groupId);
    }

    return this.prisma.drill.findMany({
      where: {
        AND: [
          this.visibilityWhere(principal, filters.groupId),
          {
            category: filters.category as never,
            ageGroup: filters.ageGroup as never,
            difficulty: filters.difficulty as never,
          },
        ],
      } as never,
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(principal: AuthPrincipal, id: string) {
    const drill = await this.findDrill(id);
    await this.assertView(principal, drill);
    if (drill.scope === DrillScope.GLOBAL) {
      const [versionCount, publishedCount] = await Promise.all([
        this.prisma.drillVersion.count({ where: { drillId: id } }),
        this.prisma.drillVersion.count({
          where: { drillId: id, status: DrillContentStatus.PUBLISHED },
        }),
      ]);
      if (
        versionCount > 0 &&
        publishedCount === 0 &&
        principal.role !== 'SYSTEM_ADMIN'
      )
        this.deny();
    }
    return drill;
  }

  async page(principal: AuthPrincipal, input: unknown) {
    const query = parseDrillPageQuery(input);
    const group = await this.authorization.assertGroupView(
      principal,
      query.groupId,
    );
    const metadata = await this.prisma.playerGroup.findFirst({
      where: { id: group.id, clubId: group.clubId },
      select: { ageGroup: true },
    });
    if (!metadata) throw new NotFoundException('Group not found');
    const ageGroup = query.ageGroup ?? metadata.ageGroup;
    const sourceWhere: Prisma.DrillSourceWhereInput | undefined =
      query.source === 'NGCS'
        ? { kind: 'NGCS_ORIGINAL' }
        : query.source === 'OPEN_LICENSE'
          ? { kind: 'OPEN_LICENSE' }
          : query.source === 'LEGACY'
            ? { kind: 'LEGACY' }
            : undefined;
    const variantWhere: Prisma.DrillAgeVariantWhereInput = {
      ageGroup,
      durationMin: {
        gte: query.minDuration,
        lte: query.maxDuration,
      },
      playerMax: query.minPlayers ? { gte: query.minPlayers } : undefined,
      playerMin: query.maxPlayers ? { lte: query.maxPlayers } : undefined,
    };
    const versionWhere: Prisma.DrillVersionWhereInput = {
      status: DrillContentStatus.PUBLISHED,
      category: query.category,
      difficulty: query.difficulty,
      objectiveKey: query.objective,
      searchText: query.search
        ? { contains: query.search, mode: 'insensitive' }
        : undefined,
      equipmentItems: query.equipment ? { has: query.equipment } : undefined,
      source: sourceWhere,
      ageVariants: { some: variantWhere },
    };
    const legacyFallback: Prisma.DrillWhereInput = {
      versions: { none: {} },
      ageGroup,
      category: query.category,
      difficulty: query.difficulty,
      title: query.search
        ? { contains: query.search, mode: 'insensitive' }
        : undefined,
      equipment: query.equipment
        ? { contains: query.equipment, mode: 'insensitive' }
        : undefined,
      ...(query.source && !['CLUB', 'MINE'].includes(query.source)
        ? { id: '__none__' }
        : {}),
    };
    const where: Prisma.DrillWhereInput = {
      AND: [
        this.visibilityWhere(principal, group.id),
        { scope: query.scope },
        query.source === 'CLUB' ? { scope: DrillScope.CLUB } : {},
        query.source === 'MINE' ? { createdById: principal.id } : {},
        { OR: [{ versions: { some: versionWhere } }, legacyFallback] },
        ...(query.kind
          ? [
              {
                OR: [
                  {
                    versions: {
                      some: {
                        ...versionWhere,
                        boardDocument: {
                          path: ['kind'],
                          equals: query.kind,
                        },
                      },
                    },
                  },
                  {
                    versions: { none: {} },
                    jsonData: { path: ['kind'], equals: query.kind },
                  },
                ],
              },
            ]
          : []),
      ],
    };
    const boundary: Prisma.DrillWhereInput = query.after
      ? {
          OR: [
            { createdAt: { lt: query.after.createdAt } },
            { createdAt: query.after.createdAt, id: { lt: query.after.id } },
          ],
        }
      : {};
    const [rows, total] = await Promise.all([
      this.prisma.drill.findMany({
        where: { AND: [where, boundary] },
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        take: query.limit + 1,
        select: {
          id: true,
          title: true,
          category: true,
          ageGroup: true,
          durationMin: true,
          difficulty: true,
          equipment: true,
          scope: true,
          createdAt: true,
          versions: {
            where: versionWhere,
            orderBy: { version: 'desc' },
            take: 1,
            select: {
              id: true,
              version: true,
              title: true,
              summary: true,
              category: true,
              difficulty: true,
              durationMin: true,
              objectiveKey: true,
              objectiveLabel: true,
              themes: true,
              equipmentItems: true,
              source: {
                select: {
                  kind: true,
                  title: true,
                  license: true,
                  attribution: true,
                },
              },
              ageVariants: {
                where: variantWhere,
                take: 1,
                select: {
                  ageGroup: true,
                  durationMin: true,
                  playerMin: true,
                  playerMax: true,
                  areaLengthM: true,
                  areaWidthM: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.drill.count({ where }),
    ]);
    const items = rows.slice(0, query.limit);
    // Classify only returned IDs without selecting or transferring board documents.
    const boardIds = items.length
      ? await this.prisma.drill.findMany({
          where: {
            AND: [
              where,
              {
                id: { in: items.map((item) => item.id) },
                OR: [
                  {
                    versions: {
                      some: {
                        ...versionWhere,
                        boardDocument: {
                          path: ['kind'],
                          equals: 'tactical-board',
                        },
                      },
                    },
                  },
                  {
                    versions: { none: {} },
                    jsonData: { path: ['kind'], equals: 'tactical-board' },
                  },
                ],
              },
            ],
          },
          select: { id: true },
        })
      : [];
    const boards = new Set(boardIds.map((item) => item.id));
    const last = items[items.length - 1];
    return {
      items: items.map((item) => {
        const version = item.versions?.[0];
        const variant = version?.ageVariants?.[0];
        return {
          id: item.id,
          title: version?.title ?? item.title,
          category: version?.category ?? item.category,
          ageGroup: variant?.ageGroup ?? item.ageGroup,
          durationMin:
            variant?.durationMin ?? version?.durationMin ?? item.durationMin,
          difficulty: version?.difficulty ?? item.difficulty,
          equipment: version?.equipmentItems.length
            ? version.equipmentItems.join(', ')
            : item.equipment,
          scope: item.scope,
          createdAt: item.createdAt,
          isBoard: boards.has(item.id),
          contentVersion: version?.version ?? null,
          contentVersionId: version?.id ?? null,
          summary: version?.summary ?? null,
          objectiveKey: version?.objectiveKey ?? null,
          objectiveLabel: version?.objectiveLabel ?? null,
          themes: version?.themes ?? [],
          playerMin: variant?.playerMin ?? null,
          playerMax: variant?.playerMax ?? null,
          areaLengthM: variant?.areaLengthM ?? null,
          areaWidthM: variant?.areaWidthM ?? null,
          source: version?.source ?? {
            kind: 'LEGACY',
            title: 'Kaynağı doğrulanmamış kayıt',
            license: 'LEGACY_UNVERIFIED',
            attribution: null,
          },
        };
      }),
      nextCursor:
        rows.length > query.limit
          ? Buffer.from(
              JSON.stringify({
                v: 1,
                id: last.id,
                createdAt: last.createdAt.toISOString(),
              }),
            ).toString('base64url')
          : null,
      limit: query.limit,
      total,
      ageGroup,
    };
  }

  async create(principal: AuthPrincipal, request: unknown) {
    const input = this.writeBody<
      DrillWriteInput & {
        scope?: 'GLOBAL' | 'CLUB';
        clubId?: string;
        groupId?: string;
      }
    >(request);
    const scope = this.resolveCreateScope(principal, input.scope);
    let clubId: string | null = null;
    let groupId: string | null = null;

    if (scope === DrillScope.CLUB) {
      clubId =
        principal.role === 'SYSTEM_ADMIN'
          ? (input.clubId ?? null)
          : principal.clubId;
      if (!clubId) throw new BadRequestException('clubId is required');
      groupId = input.groupId ?? null;

      if (principal.role === 'CLUB_ADMIN') {
        this.authorization.assertClubManage(principal, clubId);
      }
      if (principal.role === 'COACH' && !groupId) {
        throw new BadRequestException('COACH drills require an assigned group');
      }
      if (groupId) {
        const group =
          principal.role === 'COACH'
            ? await this.authorization.assertCoachGroupAssignment(
                principal,
                groupId,
              )
            : await this.authorization.assertGroupView(principal, groupId);
        if (group.clubId !== clubId) {
          throw new BadRequestException('Group must belong to the drill club');
        }
      }
    }

    const data = this.validateWriteInput(input, scope);
    try {
      return await this.prisma.drill.create({
        data: {
          ...data,
          scope,
          clubId,
          groupId,
          createdById: scope === DrillScope.CLUB ? principal.id : null,
        } as never,
      });
    } catch {
      this.persistenceFailure('DRILL_CREATE_FAILED');
    }
  }

  async update(principal: AuthPrincipal, id: string, request: unknown) {
    return this.prisma
      .$transaction(
        async (tx) => {
          const scoped = new DrillsService(
            tx as PrismaService,
            new AuthorizationService(tx as PrismaService),
          );
          const drill = await scoped.findDrill(id);
          if (drill.scope === DrillScope.GLOBAL)
            throw new BadRequestException(
              'Global content must be updated through the review workflow',
            );
          await scoped.assertManage(principal, drill);
          const input = this.writeBody<Partial<DrillWriteInput>>(request);
          if (input.jsonData !== undefined)
            assertLegacyTacticalWrite(drill.jsonData);

          const data = this.validateWriteInput(
            {
              title: input.title ?? drill.title,
              category: input.category ?? drill.category,
              ageGroup: input.ageGroup ?? drill.ageGroup,
              durationMin: input.durationMin ?? drill.durationMin,
              difficulty: input.difficulty ?? drill.difficulty,
              equipment:
                input.equipment === undefined
                  ? drill.equipment
                  : input.equipment,
              jsonData:
                input.jsonData === undefined ? drill.jsonData : input.jsonData,
              imageUrl:
                input.imageUrl === undefined ? drill.imageUrl : input.imageUrl,
            },
            drill.scope,
            input.jsonData !== undefined,
          );

          try {
            const { jsonData, ...metadata } = data;
            return await tx.drill.update({
              where: { id },
              data: (input.jsonData === undefined
                ? metadata
                : { ...metadata, jsonData }) as never,
            });
          } catch (error) {
            rethrowTacticalConflict(error);
            this.persistenceFailure('DRILL_UPDATE_FAILED');
          }
        },
        { isolationLevel: 'Serializable' },
      )
      .catch((error: unknown) => {
        if (error instanceof HttpException) throw error;
        rethrowTacticalConflict(error);
        this.persistenceFailure('DRILL_UPDATE_FAILED');
      });
  }

  async remove(principal: AuthPrincipal, id: string) {
    const drill = await this.findDrill(id);
    if (drill.scope === DrillScope.GLOBAL)
      throw new BadRequestException(
        'Global content must be archived through the review workflow',
      );
    await this.assertManage(principal, drill);
    try {
      return await this.prisma.drill.delete({ where: { id } });
    } catch {
      this.persistenceFailure('DRILL_DELETE_FAILED');
    }
  }

  private writeBody<T>(input: unknown): T {
    if (input === null || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('body must be an object');
    }
    return input as T;
  }

  private persistenceFailure(event: string): never {
    this.logger.error(event);
    throw new InternalServerErrorException({
      statusCode: 500,
      message: 'Internal server error',
    });
  }

  private visibilityWhere(principal: AuthPrincipal, groupId?: string) {
    if (principal.role === 'SYSTEM_ADMIN') return {};
    if (!principal.clubId) return { scope: DrillScope.GLOBAL };
    if (principal.role === 'CLUB_ADMIN') {
      return {
        OR: [
          { scope: DrillScope.GLOBAL },
          { scope: DrillScope.CLUB, clubId: principal.clubId },
        ],
      };
    }

    const clubVisibility = groupId
      ? { OR: [{ groupId: null }, { groupId }] }
      : {
          OR: [
            { groupId: null },
            { group: { members: { some: { userId: principal.id } } } },
          ],
        };
    return {
      OR: [
        { scope: DrillScope.GLOBAL },
        {
          scope: DrillScope.CLUB,
          clubId: principal.clubId,
          ...clubVisibility,
        },
      ],
    };
  }

  private resolveCreateScope(
    principal: AuthPrincipal,
    requested?: 'GLOBAL' | 'CLUB',
  ) {
    if (principal.role !== 'SYSTEM_ADMIN') {
      if (requested === 'GLOBAL') {
        throw new ForbiddenException(
          'Only SYSTEM_ADMIN can create global drills',
        );
      }
      return DrillScope.CLUB;
    }
    if (requested !== 'CLUB') {
      throw new BadRequestException(
        'Global content must be created through the review workflow',
      );
    }
    return DrillScope.CLUB;
  }

  private validateWriteInput(
    input: DrillWriteInput,
    scope: DrillScope,
    validateBoard = true,
  ) {
    if (
      typeof input.title !== 'string' ||
      input.title.trim().length < 1 ||
      input.title.trim().length > 120
    ) {
      throw new BadRequestException('title must contain 1 to 120 characters');
    }
    if (!CATEGORIES.has(input.category)) {
      throw new BadRequestException('Invalid category');
    }
    const ageGroup = parseAgeLabel(input.ageGroup);
    if (!DIFFICULTIES.has(input.difficulty)) {
      throw new BadRequestException('Invalid difficulty');
    }
    if (
      !Number.isInteger(input.durationMin) ||
      input.durationMin < 1 ||
      input.durationMin > 300
    ) {
      throw new BadRequestException(
        'durationMin must be an integer from 1 to 300',
      );
    }
    if (
      input.equipment != null &&
      (typeof input.equipment !== 'string' || input.equipment.length > 500)
    ) {
      throw new BadRequestException(
        'equipment must contain at most 500 characters',
      );
    }
    if (
      input.imageUrl != null &&
      (typeof input.imageUrl !== 'string' || input.imageUrl.length > 2048)
    ) {
      throw new BadRequestException(
        'imageUrl must contain at most 2048 characters',
      );
    }

    if (
      validateBoard &&
      (scope === DrillScope.CLUB || isTacticalBoardDocument(input.jsonData))
    ) {
      validateTacticalBoardDocument(input.jsonData);
    }

    return {
      title: input.title.trim(),
      category: input.category as never,
      ageGroup,
      durationMin: input.durationMin,
      difficulty: input.difficulty as never,
      equipment: input.equipment ?? null,
      jsonData: input.jsonData as never,
      imageUrl: input.imageUrl ?? null,
    };
  }

  private async findDrill(id: string) {
    const drill = await this.prisma.drill.findUnique({ where: { id } });
    if (!drill) throw new NotFoundException('Drill not found');
    return drill;
  }

  private async assertView(
    principal: AuthPrincipal,
    drill: Awaited<ReturnType<DrillsService['findDrill']>>,
  ) {
    if (principal.role === 'SYSTEM_ADMIN' || drill.scope === DrillScope.GLOBAL)
      return;
    if (!principal.clubId || principal.clubId !== drill.clubId) this.deny();
    if (principal.role === 'CLUB_ADMIN' || !drill.groupId) return;
    if (
      !(await this.authorization.isGroupMember(principal.id, drill.groupId))
    ) {
      this.deny();
    }
  }

  private async assertManage(
    principal: AuthPrincipal,
    drill: Awaited<ReturnType<DrillsService['findDrill']>>,
  ) {
    if (principal.role === 'SYSTEM_ADMIN') return;
    if (drill.scope === DrillScope.GLOBAL) this.deny();
    if (!principal.clubId || principal.clubId !== drill.clubId) this.deny();
    if (principal.role === 'CLUB_ADMIN') return;
    if (
      principal.role !== 'COACH' ||
      drill.createdById !== principal.id ||
      !drill.groupId ||
      !(await this.authorization.isGroupMember(principal.id, drill.groupId))
    ) {
      this.deny();
    }
  }

  private deny(): never {
    throw new ForbiddenException('Resource is outside the authorized scope');
  }
}
