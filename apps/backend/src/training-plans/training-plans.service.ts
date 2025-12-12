import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TrainingPlansService {
  constructor(private prisma: PrismaService) {}

  async list(filters: { clubId?: string; coachId?: string; groupId?: string }) {
    const where: any = {};
    if (filters.clubId) where.clubId = filters.clubId;
    if (filters.coachId) where.coachId = filters.coachId;
    if (filters.groupId) where.groupId = filters.groupId;
    return this.prisma.trainingPlan.findMany({
      where,
      include: { attendance: true, drills: { include: { drill: true } } },
    });
  }

  async get(id: string) {
    return this.prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        drills: { include: { drill: true } },
        attendance: { include: { player: true } },
        group: { include: { members: { include: { user: true } } } },
      },
    });
  }

  async create(data: {
    title: string;
    clubId: string;
    coachId: string;
    groupId?: string;
    date?: Date;
  }) {
    const plan = await this.prisma.trainingPlan.create({ data: data as any });
    
    // If date is provided, try to link it to a season day plan
    if (data.date) {
      await this.linkPlanToSeasonDay(plan.id, plan.clubId, data.date);
    }
    
    return plan;
  }

  private async linkPlanToSeasonDay(planId: string, clubId: string, date: Date) {
    try {
      console.log('🔗 Linking plan to season day:', { planId, clubId, date: date.toISOString() });
      
      // Find active season for this club that contains this date
      const seasons = await this.prisma.season.findMany({
        where: {
          OR: [
            { clubId }, // Match specific club
            { clubId: null }, // Or match club-independent seasons
          ],
          startDate: { lte: date },
          endDate: { gte: date },
        },
        include: {
          weeks: {
            where: {
              startDate: { lte: date },
              endDate: { gte: date },
            },
          },
        },
      });

      console.log(`📅 Found ${seasons.length} seasons for club ${clubId}`);
      
      if (seasons.length === 0) {
        console.warn('⚠️  No active season found for this date:', date.toISOString());
        console.warn('⚠️  Please create a season that includes this date.');
        // Also search for ANY seasons for this club to help debugging
        const allSeasons = await this.prisma.season.findMany({
          where: { clubId },
          select: { id: true, name: true, startDate: true, endDate: true },
        });
        console.log('📋 Available seasons for this club:', allSeasons);
        return;
      }

      if (seasons[0].weeks.length === 0) {
        console.warn('⚠️  Season found but no weeks for this date.');
        console.warn('⚠️  Season:', seasons[0].id, seasons[0].name);
        console.warn('⚠️  Looking for week containing:', date.toISOString());
        // Check if ANY weeks exist for this season
        const allWeeks = await this.prisma.weekPlan.findMany({
          where: { seasonId: seasons[0].id },
          select: { weekNumber: true, startDate: true, endDate: true },
          orderBy: { weekNumber: 'asc' },
        });
        console.log('📋 All weeks in season:', allWeeks);
        if (allWeeks.length === 0) {
          console.warn('⚠️  No weeks exist at all. Please generate weeks first.');
        } else {
          console.warn('⚠️  Weeks exist but date doesn\'t fall within any week range.');
        }
        return;
      }

      const week = seasons[0].weeks[0];
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
      
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

      console.log(`📋 Creating day plan with ${trainingPlan.drills.length} drills`);

      // Create a day plan linked to this training plan
      const dayPlan = await this.prisma.dayPlan.create({
        data: {
          weekId: week.id,
          dayOfWeek,
          date,
          type: 'TRAINING',
          title: trainingPlan.title,
          trainingPlanId: planId,
          duration: trainingPlan.totalDuration,
          notes: `Kayıtlı Antrenman: ${trainingPlan.drills.length} drill`,
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
      date?: Date;
    }>,
  ) {
    return this.prisma.trainingPlan.update({
      where: { id },
      data: data as any,
    });
  }

  async listForUser(userId: string) {
    const groups = await this.prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });
    const groupIds = groups.map((g) => g.groupId);
    return this.prisma.trainingPlan.findMany({
      where: { OR: [{ groupId: { in: groupIds } }, { coachId: userId }] },
      include: { attendance: true, drills: { include: { drill: true } } },
    });
  }

  async remove(id: string) {
    return this.prisma.trainingPlan.delete({ where: { id } });
  }
}
