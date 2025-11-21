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
    return this.prisma.trainingPlan.create({ data: data as any });
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
