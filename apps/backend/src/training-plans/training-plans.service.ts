import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import type { AuthPrincipal } from '../auth/auth-principal';

@Injectable()
export class TrainingPlansService {
  constructor(private prisma: PrismaService) {}

  async listForPrincipal(
    principal: AuthPrincipal,
    filters: { clubId?: string; coachId?: string; groupId?: string },
  ) {
    const requested: any = {};
    if (filters.clubId) requested.clubId = filters.clubId;
    if (filters.coachId) requested.coachId = filters.coachId;
    if (filters.groupId) requested.groupId = filters.groupId;

    let scope: any = {};
    if (principal.role === 'CLUB_ADMIN') {
      scope = { clubId: principal.clubId ?? '__unassigned__' };
    } else if (principal.role === 'COACH') {
      scope = {
        clubId: principal.clubId ?? '__unassigned__',
        OR: [
          { coachId: principal.id },
          { group: { members: { some: { userId: principal.id } } } },
        ],
      };
    } else if (principal.role === 'PLAYER') {
      scope = {
        clubId: principal.clubId ?? '__unassigned__',
        group: { members: { some: { userId: principal.id } } },
      };
    }

    return this.prisma.trainingPlan.findMany({
      where: { AND: [scope, requested] },
      include: {
        attendance:
          principal.role === 'PLAYER'
            ? { where: { playerId: principal.id } }
            : true,
        drills: { include: { drill: true } },
      },
    });
  }

  async get(id: string, principal: AuthPrincipal) {
    return this.prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        drills: { include: { drill: true } },
        attendance: {
          where:
            principal.role === 'PLAYER'
              ? { playerId: principal.id }
              : undefined,
          include: { player: { select: publicUserSelect } },
        },
        group:
          principal.role === 'PLAYER'
            ? true
            : {
                include: {
                  members: {
                    include: { user: { select: publicUserSelect } },
                  },
                },
              },
      },
    });
  }

  async create(data: {
    title: string;
    clubId: string;
    coachId: string;
    groupId?: string;
    date?: Date | string;
    notes?: string;
  }) {
    const plan = await this.prisma.trainingPlan.create({
      data: {
        title: data.title,
        clubId: data.clubId,
        coachId: data.coachId,
        groupId: data.groupId,
        date: data.date,
        notes: data.notes,
      } as any,
    });

    // If date is provided, try to link it to a season day plan
    if (data.date && plan.groupId) {
      await this.linkPlanToSeasonDay(
        plan.id,
        plan.clubId,
        plan.groupId,
        data.date,
      );
    }

    return plan;
  }

  private async linkPlanToSeasonDay(
    planId: string,
    clubId: string,
    groupId: string,
    date: Date | string,
  ) {
    try {
      // Ensure date is a Date object
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      console.log('🔗 Linking plan to season day:', {
        planId,
        clubId,
        date: dateObj.toISOString(),
      });

      // Find active season for this club that contains this date
      const seasons = await this.prisma.season.findMany({
        where: {
          clubId,
          groupId,
          startDate: { lte: dateObj },
          endDate: { gte: dateObj },
        },
        include: {
          weeks: {
            where: {
              startDate: { lte: dateObj },
              endDate: { gte: dateObj },
            },
          },
        },
      });

      console.log(`📅 Found ${seasons.length} seasons for club ${clubId}`);

      if (seasons.length === 0) {
        console.warn(
          '⚠️  No active season found for this date:',
          dateObj.toISOString(),
        );
        console.warn('⚠️  Please create a season that includes this date.');
        // Also search for ANY seasons for this club to help debugging
        const allSeasons = await this.prisma.season.findMany({
          where: { clubId },
          select: { id: true, name: true, startDate: true, endDate: true },
        });
        console.log('📋 Available seasons for this club:', allSeasons);
        return;
      }

      // Access the weeks using the correct relation name
      const seasonWeeks = seasons[0].weeks || [];
      if (seasonWeeks.length === 0) {
        console.warn('⚠️  Season found but no weeks for this date.');
        console.warn('⚠️  Season:', seasons[0].id, seasons[0].name);
        console.warn('⚠️  Looking for week containing:', dateObj.toISOString());
        // Check if ANY weeks exist for this season
        const allWeeks = await this.prisma.weekPlan.findMany({
          where: { seasonId: seasons[0].id },
          select: { weekNumber: true, startDate: true, endDate: true },
          orderBy: { weekNumber: 'asc' },
        });
        console.log('📋 All weeks in season:', allWeeks);
        if (allWeeks.length === 0) {
          console.warn(
            '⚠️  No weeks exist at all. Please generate weeks first.',
          );
        } else {
          console.warn(
            "⚠️  Weeks exist but date doesn't fall within any week range.",
          );
        }
        return;
      }

      const week = seasonWeeks[0];
      const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();

      console.log(`📆 Found week: ${week.weekNumber}, day: ${dayOfWeek}`);

      // Get training plan details
      const trainingPlan = await this.prisma.trainingPlan.findUnique({
        where: { id: planId },
        include: {
          drills: { include: { drill: true } },
        },
      });

      if (!trainingPlan) {
        console.error('❌ Training plan not found:', planId);
        return;
      }

      console.log(
        `📋 Creating day plan with ${trainingPlan.drills.length} drills`,
      );

      // Create a day plan linked to this training plan
      const dayPlan = await this.prisma.dayPlan.create({
        data: {
          weekId: week.id,
          dayOfWeek,
          date: dateObj,
          type: 'TRAINING',
          title: trainingPlan.title,
          trainingPlanId: planId,
          duration: trainingPlan.totalDuration,
          notes:
            trainingPlan.notes ||
            `Kayıtlı Antrenman: ${trainingPlan.drills.length} drill`,
        },
      });

      console.log('✅ Day plan created successfully:', dayPlan.id);
    } catch (error) {
      console.error('❌ Error linking plan to season day:', error);
      // Don't throw - this is optional functionality
    }
  }

  async addDrill(
    planId: string,
    drillId: string,
    phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN',
    order: number,
    notes?: string,
  ) {
    const pd = await this.prisma.planDrill.create({
      data: {
        trainingPlanId: planId,
        drillId,
        phase: phase as any,
        order,
        notes,
      },
    });
    await this.recalculateTotalDuration(planId);
    return pd;
  }

  async replaceDrills(
    planId: string,
    entries: Array<{
      drillId: string;
      phase: 'WARM_UP' | 'TECHNICAL' | 'TACTICAL' | 'COOL_DOWN';
      order: number;
      notes?: string;
    }>,
  ) {
    const phases = new Set(['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN']);
    if (!Array.isArray(entries) || entries.length > 50) {
      throw new BadRequestException('drills must contain at most 50 entries');
    }
    if (
      entries.some(
        (entry) =>
          !entry ||
          typeof entry.drillId !== 'string' ||
          !entry.drillId ||
          !phases.has(entry.phase) ||
          !Number.isInteger(entry.order) ||
          entry.order < 0 ||
          (entry.notes !== undefined && typeof entry.notes !== 'string'),
      )
    ) {
      throw new BadRequestException('Invalid plan drill entry');
    }

    const drillIds = [...new Set(entries.map((entry) => entry.drillId))];
    const drills = await this.prisma.drill.findMany({
      where: { id: { in: drillIds } },
      select: { id: true, durationMin: true },
    });
    if (drills.length !== drillIds.length) {
      throw new BadRequestException('One or more drills do not exist');
    }

    const durationByDrill = new Map(
      drills.map((drill) => [drill.id, drill.durationMin]),
    );
    const totalDuration = entries.reduce(
      (total, entry) => total + (durationByDrill.get(entry.drillId) ?? 0),
      0,
    );

    return this.prisma.$transaction(async (transaction) => {
      await transaction.planDrill.deleteMany({
        where: { trainingPlanId: planId },
      });
      if (entries.length > 0) {
        await transaction.planDrill.createMany({
          data: entries.map((entry) => ({
            trainingPlanId: planId,
            drillId: entry.drillId,
            phase: entry.phase,
            order: entry.order,
            notes: entry.notes,
          })),
        });
      }
      await transaction.dayPlan.updateMany({
        where: { trainingPlanId: planId },
        data: { duration: totalDuration },
      });
      return transaction.trainingPlan.update({
        where: { id: planId },
        data: { totalDuration },
        include: {
          attendance: true,
          drills: {
            include: { drill: true },
            orderBy: [{ phase: 'asc' }, { order: 'asc' }],
          },
        },
      });
    });
  }

  async updateBoardSnapshot(
    planId: string,
    planDrillId: string,
    boardSnapshot: Record<string, unknown>,
  ) {
    const planDrill = await this.prisma.planDrill.findFirst({
      where: { id: planDrillId, trainingPlanId: planId },
      select: { id: true },
    });
    if (!planDrill) {
      throw new BadRequestException(
        'Plan drill does not belong to the training plan',
      );
    }
    return this.prisma.planDrill.update({
      where: { id: planDrillId },
      data: { boardSnapshot } as never,
      include: { drill: true },
    });
  }

  private async recalculateTotalDuration(planId: string) {
    const drills = await this.prisma.planDrill.findMany({
      where: { trainingPlanId: planId },
      include: { drill: true },
    });
    const total = drills.reduce(
      (sum, d) => sum + (d.drill?.durationMin ?? 0),
      0,
    );
    await this.prisma.trainingPlan.update({
      where: { id: planId },
      data: { totalDuration: total },
    });
  }

  async update(
    id: string,
    data: Partial<{
      title: string;
      totalDuration: number;
      groupId?: string;
      date?: Date | string;
      notes?: string;
    }>,
  ) {
    return this.prisma.trainingPlan.update({
      where: { id },
      data: {
        title: data.title,
        totalDuration: data.totalDuration,
        groupId: data.groupId,
        date: data.date,
        notes: data.notes,
      } as any,
    });
  }

  async remove(id: string) {
    return this.prisma.trainingPlan.delete({ where: { id } });
  }
}
