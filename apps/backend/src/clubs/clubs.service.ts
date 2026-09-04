import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClubsService {
  constructor(private prisma: PrismaService) {}

  async createClub(data: {
    name: string;
    logo?: string;
    description?: string;
  }) {
    return this.prisma.club.create({ data });
  }

  async listClubs() {
    return this.prisma.club.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getClubById(clubId: string) {
    return this.prisma.club.findUnique({ where: { id: clubId } });
  }

  async createGroup(
    clubId: string,
    name: string,
    ageGroup: 'U8' | 'U10' | 'U12' | 'U14' | 'U16' | 'U18' | 'SENIOR',
  ) {
    return this.prisma.playerGroup.create({
      data: { clubId, name, ageGroup: ageGroup as any },
    });
  }

  async listGroups(clubId: string) {
    return this.prisma.playerGroup.findMany({ where: { clubId } });
  }

  async listGroupsForUser(clubId: string, userId: string) {
    return this.prisma.playerGroup.findMany({
      where: { clubId, members: { some: { userId } } },
    });
  }

  async updateClub(
    clubId: string,
    data: { name?: string; logo?: string; description?: string },
  ) {
    return this.prisma.club.update({
      where: { id: clubId },
      data: {
        name: data.name,
        logo: data.logo,
        description: data.description,
      },
    });
  }
}
