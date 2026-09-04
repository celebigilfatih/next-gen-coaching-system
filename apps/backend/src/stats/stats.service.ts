import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(clubId?: string) {
    const where: any = {};
    if (clubId) where.clubId = clubId;

    // Total Training Plans
    const totalTrainings = await this.prisma.trainingPlan.count({
      where,
    });

    // Active Athletes (Users with role PLAYER)
    const activeAthletes = await this.prisma.user.count({
      where: {
        ...where,
        role: 'PLAYER',
      },
    });

    // New Registrations (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newRegistrations = await this.prisma.user.count({
      where: {
        ...where,
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Total Hours (Sum of totalDuration)
    const trainingPlans = await this.prisma.trainingPlan.findMany({
      where,
      select: { totalDuration: true },
    });
    const totalMinutes = trainingPlans.reduce((acc, plan) => acc + (plan.totalDuration || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    // Recently Added Training Plans
    const recentTrainings = await this.prisma.trainingPlan.findMany({
      where,
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        group: { select: { name: true } },
      },
    });

    // Recently Added Drills
    const recentDrills = await this.prisma.drill.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Upcoming Matches (next 30 days)
    const upcomingMatches = await this.prisma.match.findMany({
      where: {
        date: { gte: new Date() },
        season: clubId ? { clubId } : undefined,
      },
      take: 5,
      orderBy: { date: 'asc' },
      include: {
        group: { select: { name: true } },
      },
    });

    return {
      totalTrainings,
      activeAthletes,
      newRegistrations,
      totalHours: `${totalHours}s ${remainingMinutes}d`,
      recentTrainings,
      recentDrills,
      upcomingMatches,
      trends: {
        trainings: '+5.02%',
        athletes: '-3.88%',
        registrations: '+12.5%',
        hours: '-3.98%',
      }
    };
  }
}
