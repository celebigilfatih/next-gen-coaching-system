import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMatchWeekDto } from './dto/create-match-week.dto';

@Injectable()
export class MatchWeekService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMatchWeekDto) {
    return this.prisma.matchWeekAnalysis.create({
      data: {
        seasonId: dto.seasonId,
        weekNumber: dto.weekNumber,
        opponentName: dto.opponentName,
        userId,
        opponentAnalysis: dto.opponentAnalysis,
        setPieces: dto.setPieces,
        videoLinks: dto.videoLinks,
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async findBySeasonId(seasonId: string) {
    return this.prisma.matchWeekAnalysis.findMany({
      where: { seasonId },
      orderBy: { weekNumber: 'asc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }
}
