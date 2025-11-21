import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  async create(data: { clubId: string; name: string; ageGroup: any }) {
    return this.prisma.playerGroup.create({
      data: {
        clubId: data.clubId,
        name: data.name,
        ageGroup: data.ageGroup,
      } as any,
    });
  }

  async listByClub(clubId: string) {
    return this.prisma.playerGroup.findMany({
      where: { clubId },
      include: { members: true },
    });
  }

  async addMember(groupId: string, userId: string) {
    return this.prisma.groupMember.create({ data: { groupId, userId } });
  }
}
