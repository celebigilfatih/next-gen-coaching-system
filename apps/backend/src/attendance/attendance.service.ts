import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { publicUserSelect } from '../users/user.select';
import { parseMarkAttendanceBody } from './dto/mark-attendance.dto';
import { parseAttendancePageQuery } from './dto/attendance-page.dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(private prisma: PrismaService) {}

  async mark(planId: string, playerId: string, status: 'PRESENT' | 'ABSENT') {
    parseMarkAttendanceBody({ planId, playerId, status });
    try {
      return await this.prisma.attendance.upsert({
        where: { planId_playerId: { planId, playerId } },
        create: { planId, playerId, status },
        update: { status },
      });
    } catch {
      this.persistenceFailure();
    }
  }

  async listByPlan(planId: string, playerId?: string) {
    return this.prisma.attendance.findMany({
      where: { planId, playerId },
      include: { player: { select: publicUserSelect } },
    });
  }

  async playerPage(
    query: ReturnType<typeof parseAttendancePageQuery>,
    groupId: string | null,
    playerId?: string,
  ) {
    const empty = {
      items: [],
      total: 0,
      presentTotal: 0,
      limit: query.limit,
      nextCursor: null,
    };
    if (!groupId) return empty;
    const where = {
      groupId,
      user: { role: 'PLAYER' as const, ...(playerId ? { id: playerId } : {}) },
    };
    const [rows, total, presentTotal] = await Promise.all([
      this.prisma.groupMember.findMany({
        where: {
          ...where,
          ...(query.after ? { id: { gt: query.after } } : {}),
        },
        orderBy: { id: 'asc' },
        take: query.limit + 1,
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              attendances: {
                where: { planId: query.planId },
                select: { status: true },
              },
            },
          },
        },
      }),
      this.prisma.groupMember.count({ where }),
      this.prisma.groupMember.count({
        where: {
          ...where,
          user: {
            ...where.user,
            attendances: { some: { planId: query.planId, status: 'PRESENT' } },
          },
        },
      }),
    ]);
    const items = rows.slice(0, query.limit).map((row) => ({
      id: row.id,
      playerId: row.user.id,
      name: row.user.name,
      status: row.user.attendances[0]?.status ?? null,
    }));
    return {
      items,
      total,
      presentTotal,
      limit: query.limit,
      nextCursor: rows.length > query.limit ? items[items.length - 1].id : null,
    };
  }

  private persistenceFailure(): never {
    this.logger.error('ATTENDANCE_MARK_FAILED');
    throw new InternalServerErrorException({
      statusCode: 500,
      message: 'Internal server error',
    });
  }
}
