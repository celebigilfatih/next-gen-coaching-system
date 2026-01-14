import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { clubId: string; name: string; ageGroup: any; category?: string }) {
    try {
      return await this.prisma.playerGroup.create({
        data: {
          clubId: data.clubId,
          name: data.name,
          ageGroup: data.ageGroup,
          category: data.category || 'ALT_YAPI',
        } as any,
      });
    } catch (error) {
      console.error('Error creating player group:', error);
      if (error.code === 'P2003') {
        throw new Error(`Invalid clubId: ${data.clubId}. Club does not exist.`);
      }
      throw error;
    }
  }

  async listByClub(clubId: string) {
    return this.prisma.playerGroup.findMany({
      where: { clubId },
      include: { members: true },
    });
  }

  async update(id: string, data: { name?: string; ageGroup?: any; category?: string }) {
    console.log('GroupsService.update called:', { id, data });
    return this.prisma.playerGroup.update({
      where: { id },
      data: data as any,
    });
  }

  async delete(id: string) {
    // First delete all members
    await this.prisma.groupMember.deleteMany({
      where: { groupId: id },
    });
    // Then delete the group
    return this.prisma.playerGroup.delete({
      where: { id },
    });
  }

  async addMember(groupId: string, userId: string) {
    // Check if already a member
    const existing = await this.prisma.groupMember.findFirst({
      where: { groupId, userId },
    });
    if (existing) {
      throw new Error('User is already a member of this group');
    }
    return this.prisma.groupMember.create({ data: { groupId, userId } });
  }

  async removeMember(groupId: string, userId: string) {
    const member = await this.prisma.groupMember.findFirst({
      where: { groupId, userId },
    });
    if (!member) {
      throw new Error('Member not found');
    }
    return this.prisma.groupMember.delete({ where: { id: member.id } });
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
}
