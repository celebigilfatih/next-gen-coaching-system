import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DrillScope } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  isTacticalBoardDocument,
  validateTacticalBoardDocument,
} from '../tactics/tactical-board';

const CATEGORIES = new Set(['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN']);
const AGE_GROUPS = new Set(['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'SENIOR']);
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
    return drill;
  }

  async create(
    principal: AuthPrincipal,
    input: DrillWriteInput & {
      scope?: 'GLOBAL' | 'CLUB';
      clubId?: string;
      groupId?: string;
    },
  ) {
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
    return this.prisma.drill.create({
      data: {
        ...data,
        scope,
        clubId,
        groupId,
        createdById: scope === DrillScope.CLUB ? principal.id : null,
      } as never,
    });
  }

  async update(
    principal: AuthPrincipal,
    id: string,
    input: Partial<DrillWriteInput>,
  ) {
    const drill = await this.findDrill(id);
    await this.assertManage(principal, drill);

    const data = this.validateWriteInput(
      {
        title: input.title ?? drill.title,
        category: input.category ?? drill.category,
        ageGroup: input.ageGroup ?? drill.ageGroup,
        durationMin: input.durationMin ?? drill.durationMin,
        difficulty: input.difficulty ?? drill.difficulty,
        equipment:
          input.equipment === undefined ? drill.equipment : input.equipment,
        jsonData:
          input.jsonData === undefined ? drill.jsonData : input.jsonData,
        imageUrl:
          input.imageUrl === undefined ? drill.imageUrl : input.imageUrl,
      },
      drill.scope,
    );

    return this.prisma.drill.update({
      where: { id },
      data: data as never,
    });
  }

  async remove(principal: AuthPrincipal, id: string) {
    const drill = await this.findDrill(id);
    await this.assertManage(principal, drill);
    return this.prisma.drill.delete({ where: { id } });
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
    return requested === 'CLUB' ? DrillScope.CLUB : DrillScope.GLOBAL;
  }

  private validateWriteInput(input: DrillWriteInput, scope: DrillScope) {
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
    if (!AGE_GROUPS.has(input.ageGroup)) {
      throw new BadRequestException('Invalid ageGroup');
    }
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

    if (scope === DrillScope.CLUB || isTacticalBoardDocument(input.jsonData)) {
      validateTacticalBoardDocument(input.jsonData);
    }

    return {
      title: input.title.trim(),
      category: input.category as never,
      ageGroup: input.ageGroup as never,
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
