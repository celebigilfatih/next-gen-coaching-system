import { BadRequestException, Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  parseTrainingPlanPageQuery,
  trainingPlanBoundary,
  trainingPlanCursor,
} from './dto/training-plan-page.dto';

@Injectable()
export class TrainingPlanCatalogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authorization: AuthorizationService,
  ) {}

  async page(principal: AuthPrincipal, input: unknown) {
    return this.read(principal, input, false);
  }

  async attendancePage(principal: AuthPrincipal, input: unknown) {
    return this.read(principal, input, true);
  }

  private async read(
    principal: AuthPrincipal,
    input: unknown,
    attendance: boolean,
  ) {
    const query = parseTrainingPlanPageQuery(input);
    // This is the group-workspace catalog, not a replacement for the legacy
    // owner-only/unassigned-plan endpoint. Sporting grants do not grant access.
    const group = await this.authorization.assertGroupView(
      principal,
      query.groupId,
    );
    const where: Prisma.TrainingPlanWhereInput = {
      clubId: group.clubId,
      groupId: group.id,
    };
    if (query.seasonId) {
      const season = await this.prisma.season.findFirst({
        where: { id: query.seasonId, groupId: group.id, clubId: group.clubId },
        select: { startDate: true, endDate: true },
      });
      if (!season)
        throw new BadRequestException(
          'Season does not belong to the selected group',
        );
      const end = new Date(season.endDate);
      end.setUTCHours(23, 59, 59, 999);
      where.OR = [
        { date: null },
        { date: { gte: season.startDate, lte: end } },
      ];
    }
    // Half-open client-local period intersects (never replaces) season scope.
    // Null-date drafts stay available in the unfiltered catalog, not a calendar day.
    if (query.period) {
      where.date = { gte: query.period.from, lt: query.period.until };
    }
    // Counts use the full resource/date filter, never the cursor boundary.
    // These are live reads, not a frozen snapshot across requests.
    const [rows, totals, presentAttendance] = await Promise.all([
      this.prisma.trainingPlan.findMany({
        where: { AND: [where, trainingPlanBoundary(query.after)] },
        orderBy: [{ date: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }],
        take: query.limit + 1,
        select: {
          id: true,
          title: true,
          groupId: true,
          date: true,
          notes: true,
          totalDuration: true,
        },
      }),
      this.prisma.trainingPlan.aggregate({
        where,
        _count: { _all: true, date: true },
        _sum: { totalDuration: true },
      }),
      this.prisma.attendance.count({
        where: {
          plan: where,
          status: 'PRESENT',
          ...(principal.role === 'PLAYER' ? { playerId: principal.id } : {}),
        },
      }),
    ]);
    const pageRows = rows.slice(0, query.limit);
    // Count phases only for the returned IDs. A nested _count lets PostgreSQL
    // aggregate the whole phase table before applying the parent page LIMIT.
    const phases =
      !attendance && pageRows.length
        ? await this.prisma.planDrill.groupBy({
            by: ['trainingPlanId'],
            where: {
              trainingPlanId: { in: pageRows.map((row) => row.id) },
              trainingPlan: where,
            },
            _count: { _all: true },
          })
        : [];
    const counts = new Map(
      phases.map((row) => [row.trainingPlanId, row._count._all]),
    );
    const [playerCount, attendanceCounts]: [
      number | undefined,
      Array<{ planId: string; _count: { _all: number } }>,
    ] = attendance
      ? await Promise.all([
          this.prisma.groupMember.count({
            where: {
              groupId: group.id,
              user: { role: 'PLAYER' },
              ...(principal.role === 'PLAYER' ? { userId: principal.id } : {}),
            },
          }),
          pageRows.length
            ? this.prisma.attendance.groupBy({
                by: ['planId'],
                where: {
                  planId: { in: pageRows.map((row) => row.id) },
                  plan: where,
                  status: 'PRESENT',
                  ...(principal.role === 'PLAYER'
                    ? { playerId: principal.id }
                    : {}),
                },
                _count: { _all: true },
              })
            : Promise.resolve([]),
        ])
      : [undefined, []];
    const presentCounts = new Map(
      attendanceCounts.map((row) => [row.planId, row._count._all]),
    );
    const items = pageRows.map((row) => ({
      ...row,
      ...(attendance
        ? { presentCount: presentCounts.get(row.id) ?? 0 }
        : { phaseCount: counts.get(row.id) ?? 0 }),
    }));
    return {
      items,
      nextCursor:
        rows.length > query.limit
          ? trainingPlanCursor(items[items.length - 1])
          : null,
      limit: query.limit,
      summary: {
        ...(attendance ? { playerCount } : {}),
        total: totals._count._all,
        scheduled: totals._count.date,
        undated: totals._count._all - totals._count.date,
        totalDuration: totals._sum.totalDuration ?? 0,
        presentAttendance,
      },
    };
  }
}
