import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  async mark(planId: string, playerId: string, status: 'PRESENT' | 'ABSENT') {
    const existing = await this.prisma.attendance.findFirst({
      where: { planId, playerId },
    });
    if (existing) {
      return this.prisma.attendance.update({
        where: { id: existing.id },
        data: { status: status as any },
      });
    }
    return this.prisma.attendance.create({
      data: { planId, playerId, status: status as any },
    });
  }

  async listByPlan(planId: string) {
    return this.prisma.attendance.findMany({
      where: { planId },
      include: { player: true },
    });
  }
}
