import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';

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

  async listByPlan(planId: string, playerId?: string) {
    return this.prisma.attendance.findMany({
      where: { planId, playerId },
      include: { player: { select: publicUserSelect } },
    });
  }
}
