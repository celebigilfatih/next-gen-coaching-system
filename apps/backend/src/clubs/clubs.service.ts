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

  async addUserToClub(userId: string, clubId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { clubId } });
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

  async updateClub(
    clubId: string,
    data: { name?: string; logo?: string; description?: string },
  ) {
    return this.prisma.club.update({
      where: { id: clubId },
      data,
    });
  }
}
