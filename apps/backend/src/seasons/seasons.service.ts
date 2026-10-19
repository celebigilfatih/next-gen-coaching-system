import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  assertLegacyTacticalWrite,
  rethrowTacticalConflict,
} from '../tactics/tactical-persistence';
import {
  legacyWrite,
  syncLegacySeason,
} from '../sporting/legacy-compatibility';
import type { AuthPrincipal } from '../auth/auth-principal';
import type { Prisma } from '@prisma/client';
import {
  CreateSeasonDto,
  CreateWeekDto,
  UpdateWeekDto,
  CreateDayDto,
  CreateMatchDto,
  parseCreateSeasonBody,
  parseCreateWeekBody,
  parseUpdateWeekBody,
  parseCreateDayBody,
  parseCreateMatchBody,
  parseUpdateMatchBody,
} from './dto/season.dto';

@Injectable()
export class SeasonsService {
  private static readonly MAX_SEASON_WEEKS = 80;
  private readonly logger = new Logger(SeasonsService.name);

  constructor(private prisma: PrismaService) {}

  private assertSafeSeasonRange(startDate: Date, endDate: Date) {
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();

    if (!Number.isFinite(startTime) || !Number.isFinite(endTime)) {
      throw new BadRequestException('Season dates must be valid');
    }

    if (startTime > endTime) {
      throw new BadRequestException(
        'Season start date must be before or equal to end date',
      );
    }

    const durationWeeks =
      Math.floor((endTime - startTime) / (7 * 24 * 60 * 60 * 1000)) + 1;

    if (durationWeeks > SeasonsService.MAX_SEASON_WEEKS) {
      throw new BadRequestException(
        `Season duration cannot exceed ${SeasonsService.MAX_SEASON_WEEKS} weeks`,
      );
    }
  }

  // Season CRUD
  async createSeason(userId: string, input: CreateSeasonDto) {
    const data = parseCreateSeasonBody(input);
    this.assertSafeSeasonRange(data.startDate, data.endDate);

    try {
      return await legacyWrite(this.prisma, async (tx) => {
        const season = await tx.season.create({
          data: {
            ...data,
            userId,
          },
          include: {
            club: true,
            _count: {
              select: {
                weeks: true,
                matches: true,
              },
            },
          },
        });
        const teamSeasonId = await syncLegacySeason(tx, season);
        return { ...season, teamSeasonId };
      });
    } catch {
      this.persistenceFailure('SEASON_CREATE_FAILED');
    }
  }

  async listForPrincipal(principal: AuthPrincipal) {
    const where: any = {};
    if (principal.role === 'CLUB_ADMIN') {
      where.clubId = principal.clubId ?? '__unassigned__';
    } else if (principal.role === 'COACH' || principal.role === 'PLAYER') {
      where.clubId = principal.clubId ?? '__unassigned__';
      where.group = { members: { some: { userId: principal.id } } };
    } else if (principal.role !== 'SYSTEM_ADMIN') {
      where.id = '__forbidden__';
    }

    return this.prisma.season.findMany({
      where,
      include: {
        club: true,
        _count: {
          select: {
            weeks: true,
            matches: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getSeason(id: string) {
    return this.prisma.season.findUnique({
      where: { id },
      include: {
        club: true,
        weeks: {
          include: {
            days: {
              include: {
                trainingPlan: {
                  include: {
                    group: true,
                    drills: {
                      include: {
                        drill: true,
                      },
                    },
                  },
                },
              },
            },
          },
          orderBy: { weekNumber: 'asc' },
        },
        matches: {
          include: {
            group: true,
          },
          orderBy: { date: 'asc' },
        },
      },
    });
  }

  async deleteSeason(id: string) {
    try {
      return await this.prisma.season.delete({ where: { id } });
    } catch {
      this.persistenceFailure('SEASON_DELETE_FAILED');
    }
  }

  // Week Plans
  async createWeek(seasonId: string, input: CreateWeekDto) {
    const data = parseCreateWeekBody(input);
    try {
      return await this.prisma.weekPlan.create({
        data: {
          ...data,
          seasonId,
        },
        include: {
          days: true,
        },
      });
    } catch {
      this.persistenceFailure('SEASON_WEEK_CREATE_FAILED');
    }
  }

  async getWeek(seasonId: string, weekNumber: number) {
    return this.prisma.weekPlan.findUnique({
      where: {
        seasonId_weekNumber: {
          seasonId,
          weekNumber,
        },
      },
      include: {
        days: {
          orderBy: { dayOfWeek: 'asc' },
        },
      },
    });
  }

  async updateWeek(weekId: string, input: UpdateWeekDto) {
    const data = parseUpdateWeekBody(input);
    try {
      return await this.prisma.weekPlan.update({
        where: { id: weekId },
        data,
        include: {
          days: true,
        },
      });
    } catch {
      this.persistenceFailure('SEASON_WEEK_UPDATE_FAILED');
    }
  }

  // Day Plans
  async createOrUpdateDay(weekId: string, input: CreateDayDto) {
    const data = parseCreateDayBody(input);
    try {
      return await this.prisma.$transaction(
        async (transaction) => {
          if (data.trainingPlanId) {
            const [week, plan] = await Promise.all([
              transaction.weekPlan.findUnique({
                where: { id: weekId },
                select: {
                  season: { select: { clubId: true, groupId: true } },
                },
              }),
              transaction.trainingPlan.findUnique({
                where: { id: data.trainingPlanId },
                select: { clubId: true, groupId: true },
              }),
            ]);
            if (!week || !plan) {
              throw new BadRequestException(
                'Week and training plan must both exist',
              );
            }
            if (
              plan.clubId !== week.season.clubId ||
              plan.groupId !== week.season.groupId
            ) {
              throw new BadRequestException(
                'Training plan must belong to the season group',
              );
            }
          }

          // Multiple plans per day remain supported.
          return transaction.dayPlan.create({
            data: {
              weekId,
              dayOfWeek: data.dayOfWeek,
              date: data.date,
              type: data.type,
              title: data.title,
              trainingPlanId: data.trainingPlanId,
              drillIds: data.drillIds || [],
              duration: data.duration,
              intensity: data.intensity,
              notes: data.notes,
            },
          });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.persistenceFailure('SEASON_DAY_WRITE_FAILED');
    }
  }

  async toggleDayCompleted(dayId: string) {
    let day;
    try {
      day = await this.prisma.dayPlan.findUnique({
        where: { id: dayId },
      });
    } catch {
      this.persistenceFailure('SEASON_DAY_TOGGLE_FAILED');
    }

    if (!day) {
      this.persistenceFailure('SEASON_DAY_TOGGLE_FAILED');
    }

    try {
      return await this.prisma.dayPlan.update({
        where: { id: dayId },
        data: { completed: !day.completed },
      });
    } catch {
      this.persistenceFailure('SEASON_DAY_TOGGLE_FAILED');
    }
  }

  async deleteDay(dayId: string) {
    try {
      return await this.prisma.dayPlan.delete({
        where: { id: dayId },
      });
    } catch {
      this.persistenceFailure('SEASON_DAY_DELETE_FAILED');
    }
  }

  // Matches
  async createMatch(seasonId: string, input: CreateMatchDto) {
    const data = parseCreateMatchBody(input);
    try {
      return await this.prisma.match.create({
        data: {
          ...data,
          seasonId,
          groupId: data.groupId || null,
        },
      });
    } catch {
      this.persistenceFailure('SEASON_MATCH_CREATE_FAILED');
    }
  }

  async listMatches(seasonId: string) {
    return this.prisma.match.findMany({
      where: { seasonId },
      orderBy: { date: 'asc' },
    });
  }

  async updateMatch(matchId: string, input: unknown) {
    const data = parseUpdateMatchBody(input);
    try {
      return await this.prisma.match.update({
        where: { id: matchId },
        data: {
          date: data.date,
          opponent: data.opponent,
          location: data.location,
          competition: data.competition,
          result: data.result,
          opponentAnalysis: data.opponentAnalysis,
          ourFormation: data.ourFormation,
          notes: data.notes,
          videoLinks: data.videoLinks,
        } as Prisma.MatchUncheckedUpdateInput,
      });
    } catch {
      this.persistenceFailure('SEASON_MATCH_UPDATE_FAILED');
    }
  }

  async updateMatchTacticalBoard(
    matchId: string,
    tacticalBoard: Record<string, unknown>,
  ) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const match = await tx.match.findUnique({
            where: { id: matchId },
            select: { tacticalBoard: true },
          });
          assertLegacyTacticalWrite(match?.tacticalBoard);
          return await tx.match.update({
            where: { id: matchId },
            data: { tacticalBoard } as never,
          });
        },
        { isolationLevel: 'Serializable' },
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      rethrowTacticalConflict(error);
      this.persistenceFailure('SEASON_MATCH_BOARD_UPDATE_FAILED');
    }
  }

  async deleteMatch(matchId: string) {
    try {
      return await this.prisma.match.delete({ where: { id: matchId } });
    } catch {
      this.persistenceFailure('SEASON_MATCH_DELETE_FAILED');
    }
  }

  // Generate weeks for season
  async generateWeeks(seasonId: string) {
    let season;
    try {
      season = await this.prisma.season.findUnique({
        where: { id: seasonId },
      });
    } catch {
      this.persistenceFailure('SEASON_WEEKS_GENERATE_FAILED');
    }

    if (!season) this.persistenceFailure('SEASON_WEEKS_GENERATE_FAILED');

    this.assertSafeSeasonRange(season.startDate, season.endDate);

    const weeks: {
      seasonId: string;
      weekNumber: number;
      startDate: Date;
      endDate: Date;
      totalLoad: number;
    }[] = [];
    const currentDate = new Date(season.startDate);
    const endDate = new Date(season.endDate);
    let weekNumber = 1;

    while (currentDate <= endDate) {
      const weekStart = new Date(currentDate);
      const weekEnd = new Date(currentDate);
      weekEnd.setDate(weekEnd.getDate() + 6);

      weeks.push({
        seasonId,
        weekNumber,
        startDate: weekStart,
        endDate: weekEnd > endDate ? endDate : weekEnd,
        totalLoad: 0,
      });

      currentDate.setDate(currentDate.getDate() + 7);
      weekNumber++;
    }

    try {
      return await this.prisma.weekPlan.createMany({
        data: weeks,
        skipDuplicates: true,
      });
    } catch {
      this.persistenceFailure('SEASON_WEEKS_GENERATE_FAILED');
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
