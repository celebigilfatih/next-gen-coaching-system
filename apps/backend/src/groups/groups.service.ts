import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseMemberPageQuery } from './dto/member-page.dto';
import {
  endLegacyMembers,
  legacyWrite,
  syncLegacyGroup,
  syncLegacyMember,
} from '../sporting/legacy-compatibility';
import {
  groupIdentifier,
  parseCreateGroupBody,
  parseUpdateGroupBody,
} from './dto/group.dto';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);
  constructor(private prisma: PrismaService) {}

  async create(input: unknown) {
    const data = parseCreateGroupBody(input);
    try {
      return await legacyWrite(this.prisma, async (tx) => {
        const group = await tx.playerGroup.create({
          data: {
            clubId: data.clubId,
            name: data.name,
            ageGroup: data.ageGroup,
            category: data.category || 'ALT_YAPI',
          },
        });
        await syncLegacyGroup(tx, group);
        return group;
      });
    } catch {
      this.persistenceFailure('GROUP_CREATE_FAILED');
    }
  }

  async listByClub(clubId?: string) {
    return this.prisma.playerGroup.findMany({
      where: { clubId, archivedAt: null },
      include: { members: true },
    });
  }

  async listForMember(clubId: string, userId: string) {
    return this.prisma.playerGroup.findMany({
      where: { clubId, archivedAt: null, members: { some: { userId } } },
    });
  }

  async findOne(id: string, includeMembers = true) {
    return this.prisma.playerGroup.findUnique({
      where: { id },
      include: {
        members: includeMembers
          ? {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    position: true,
                  },
                },
              },
            }
          : false,
        club: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async update(id: string, input: unknown) {
    const data = parseUpdateGroupBody(input);
    try {
      return await legacyWrite(this.prisma, async (tx) => {
        const current = await tx.playerGroup.findUniqueOrThrow({
          where: { id },
          select: { category: true },
        });
        if (data.category && data.category !== current.category)
          throw new ConflictException(
            'Team classification is managed by the sporting team lifecycle',
          );
        const group = await tx.playerGroup.update({
          where: { id },
          data: {
            name: data.name,
            ageGroup: data.ageGroup,
            category: data.category,
          },
        });
        await syncLegacyGroup(tx, group);
        return group;
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.persistenceFailure('GROUP_UPDATE_FAILED');
    }
  }

  async delete(id: string, actorId?: string) {
    id = groupIdentifier(id, 'groupId');
    try {
      return await this.prisma.$transaction(async (transaction) => {
        const mappedTeam = await transaction.team.findUnique({
          where: { legacyGroupId: id },
          select: { id: true },
        });
        if (mappedTeam)
          throw new ConflictException(
            'Mapped teams must be archived through the sporting team lifecycle',
          );
        await endLegacyMembers(transaction, id, undefined, actorId);
        await transaction.groupMember.deleteMany({ where: { groupId: id } });
        return transaction.playerGroup.delete({ where: { id } });
      });
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      this.persistenceFailure('GROUP_DELETE_FAILED');
    }
  }

  async addMember(groupId: string, userId: string, actorId?: string) {
    groupId = groupIdentifier(groupId, 'groupId');
    userId = groupIdentifier(userId, 'userId');
    try {
      return await legacyWrite(this.prisma, async (tx) => {
        const existing = await tx.groupMember.findFirst({
          where: { groupId, userId },
        });
        if (existing) throw new Error('Duplicate membership');
        const member = await tx.groupMember.create({
          data: { groupId, userId },
        });
        await syncLegacyMember(tx, member, actorId);
        return member;
      });
    } catch {
      this.persistenceFailure('GROUP_MEMBER_ADD_FAILED');
    }
  }

  async removeMember(groupId: string, userId: string, actorId?: string) {
    groupId = groupIdentifier(groupId, 'groupId');
    userId = groupIdentifier(userId, 'userId');
    try {
      return await legacyWrite(this.prisma, async (tx) => {
        const member = await tx.groupMember.findFirst({
          where: { groupId, userId },
        });
        if (!member) throw new Error('Missing membership');
        await endLegacyMembers(tx, groupId, userId, actorId);
        return tx.groupMember.delete({
          where: { id: member.id },
        });
      });
    } catch {
      this.persistenceFailure('GROUP_MEMBER_REMOVE_FAILED');
    }
  }

  async getMembers(groupId: string) {
    return this.prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            position: true,
          },
        },
      },
    });
  }

  async getPlayerMemberPage(groupId: string, input: unknown) {
    const query = parseMemberPageQuery(input);
    const where = { groupId, user: { role: 'PLAYER' as const } };
    const [rows, total] = await Promise.all([
      this.prisma.groupMember.findMany({
        where: {
          ...where,
          ...(query.after ? { id: { gt: query.after } } : {}),
        },
        orderBy: { id: 'asc' },
        take: query.limit + 1,
        select: {
          id: true,
          groupId: true,
          userId: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              position: true,
            },
          },
        },
      }),
      this.prisma.groupMember.count({ where }),
    ]);
    const items = rows.slice(0, query.limit);
    return {
      items,
      total,
      limit: query.limit,
      nextCursor: rows.length > query.limit ? items[items.length - 1].id : null,
    };
  }

  private persistenceFailure(event: string): never {
    this.logger.error(event);
    throw new InternalServerErrorException({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
