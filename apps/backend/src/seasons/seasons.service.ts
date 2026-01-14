import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeasonsService {
  constructor(private prisma: PrismaService) {}

  // Season CRUD
  async createSeason(userId: string, data: {
    name: string;
    startDate: Date;
    endDate: Date;
    clubId?: string;
  }) {
    return this.prisma.season.create({
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
  }

  async listSeasons(userId: string, clubId?: string) {
    const where: any = { userId };
    if (clubId) {
      where.clubId = clubId;
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
    return this.prisma.season.delete({ where: { id } });
  }

  // Week Plans
  async createWeek(seasonId: string, data: {
    weekNumber: number;
    startDate: Date;
    endDate: Date;
    notes?: string;
  }) {
    return this.prisma.weekPlan.create({
      data: {
        ...data,
        seasonId,
      },
      include: {
        days: true,
      },
    });
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

  async updateWeek(weekId: string, data: {
    notes?: string;
    totalLoad?: number;
  }) {
    return this.prisma.weekPlan.update({
      where: { id: weekId },
      data,
      include: {
        days: true,
      },
    });
  }

  // Day Plans
  async createOrUpdateDay(weekId: string, data: {
    dayOfWeek: number;
    date: Date;
    type: 'TRAINING' | 'MATCH' | 'REST' | 'RECOVERY' | 'TACTICAL';
    title?: string;
    trainingPlanId?: string;
    drillIds?: string[];
    duration?: number;
    intensity?: number;
    notes?: string;
  }) {
    // Allow multiple plans per day, so just create
    return this.prisma.dayPlan.create({
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
  }

  async toggleDayCompleted(dayId: string) {
    const day = await this.prisma.dayPlan.findUnique({
      where: { id: dayId },
    });
    
    if (!day) {
      throw new Error('Day plan not found');
    }
    
    return this.prisma.dayPlan.update({
      where: { id: dayId },
      data: { completed: !day.completed },
    });
  }

  async deleteDay(dayId: string) {
    return this.prisma.dayPlan.delete({
      where: { id: dayId },
    });
  }

  // Matches
  async createMatch(seasonId: string, data: {
    date: Date;
    opponent: string;
    location: string;
    competition?: string;
    notes?: string;
    groupId?: string;
  }) {
    return this.prisma.match.create({
      data: {
        ...data,
        seasonId,
        groupId: data.groupId || null,
      },
    });
  }

  async listMatches(seasonId: string) {
    return this.prisma.match.findMany({
      where: { seasonId },
      orderBy: { date: 'asc' },
    });
  }

  async updateMatch(matchId: string, data: any) {
    return this.prisma.match.update({
      where: { id: matchId },
      data,
    });
  }

  async deleteMatch(matchId: string) {
    return this.prisma.match.delete({ where: { id: matchId } });
  }

  // Generate weeks for season
  async generateWeeks(seasonId: string) {
    const season = await this.prisma.season.findUnique({
      where: { id: seasonId },
    });

    if (!season) throw new Error('Season not found');

    const weeks: {
      seasonId: string;
      weekNumber: number;
      startDate: Date;
      endDate: Date;
      totalLoad: number;
    }[] = [];
    let currentDate = new Date(season.startDate);
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

    return this.prisma.weekPlan.createMany({
      data: weeks,
      skipDuplicates: true,
    });
  }
}
