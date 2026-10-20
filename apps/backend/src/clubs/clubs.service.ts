import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { legacyWrite, syncLegacyGroup } from '../sporting/legacy-compatibility';
import type { CreateClubGroupDto } from './dto/club.dto';
import {
  parseCreateClubBody,
  parseCreateClubGroupBody,
  parseUpdateClubBody,
} from './dto/club.dto';

@Injectable()
export class ClubsService {
  private readonly logger = new Logger(ClubsService.name);
  constructor(private prisma: PrismaService) {}

  async createClub(input: unknown) {
    const data = parseCreateClubBody(input);
    try {
      return await this.prisma.club.create({ data });
    } catch {
      this.persistenceFailure('CLUB_CREATE_FAILED');
    }
  }

  async listClubs() {
    return this.prisma.club.findMany({ orderBy: { createdAt: 'desc' } });
  }

  async getClubById(clubId: string) {
    return this.prisma.club.findUnique({ where: { id: clubId } });
  }

  async createGroup(clubId: string, input: CreateClubGroupDto) {
    const data = parseCreateClubGroupBody(input);
    try {
      return await legacyWrite(this.prisma, async (tx) => {
        const group = await tx.playerGroup.create({
          data: { clubId, name: data.name, ageGroup: data.ageGroup },
        });
        await syncLegacyGroup(tx, group);
        return group;
      });
    } catch {
      this.persistenceFailure('CLUB_GROUP_CREATE_FAILED');
    }
  }

  async listGroups(clubId: string) {
    return this.prisma.playerGroup.findMany({
      where: { clubId, archivedAt: null },
    });
  }

  async listGroupsForUser(clubId: string, userId: string) {
    return this.prisma.playerGroup.findMany({
      where: { clubId, archivedAt: null, members: { some: { userId } } },
    });
  }

  async updateClub(clubId: string, input: unknown) {
    const data = parseUpdateClubBody(input);
    try {
      return await this.prisma.club.update({
        where: { id: clubId },
        data: {
          name: data.name,
          logo: data.logo,
          description: data.description,
        },
      });
    } catch {
      this.persistenceFailure('CLUB_UPDATE_FAILED');
    }
  }

  private persistenceFailure(event: string): never {
    this.logger.error(event);
    throw new InternalServerErrorException({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
