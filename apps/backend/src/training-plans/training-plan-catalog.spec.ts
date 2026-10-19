import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { AuthPrincipal } from '../auth/auth-principal';
import { TrainingPlanCatalogService } from './training-plan-catalog.service';
import {
  parseTrainingPlanPageQuery,
  trainingPlanBoundary,
  trainingPlanCursor,
} from './dto/training-plan-page.dto';

const cursor = (data: unknown) =>
  Buffer.from(JSON.stringify(data)).toString('base64url');
describe('Training plan page and full summary', () => {
  const principal = {
    id: 'coach',
    clubId: 'club',
    role: 'COACH',
  } as AuthPrincipal;
  let prisma: any;
  let auth: any;
  let service: TrainingPlanCatalogService;
  beforeEach(() => {
    prisma = {
      trainingPlan: {
        findMany: jest.fn().mockResolvedValue([
          { id: 'b', date: new Date('2026-09-01') },
          { id: 'a', date: null },
        ]),
        aggregate: jest.fn().mockResolvedValue({
          _count: { _all: 150, date: 120 },
          _sum: { totalDuration: 7500 },
        }),
      },
      attendance: { count: jest.fn().mockResolvedValue(240) },
      planDrill: {
        groupBy: jest
          .fn()
          .mockResolvedValue([{ trainingPlanId: 'b', _count: { _all: 3 } }]),
      },
      season: {
        findFirst: jest.fn().mockResolvedValue({
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-12-31'),
        }),
      },
    };
    auth = {
      assertGroupView: jest
        .fn()
        .mockResolvedValue({ id: 'group', clubId: 'club' }),
    };
    service = new TrainingPlanCatalogService(prisma, auth);
  });
  it('uses bounded minimal rows and full group totals outside the cursor boundary', async () => {
    const after = cursor({ id: 'z', date: '2026-10-01T00:00:00Z' });
    const result = await service.page(principal, {
      groupId: 'group',
      limit: '1',
      after,
    });
    expect(auth.assertGroupView).toHaveBeenCalledWith(principal, 'group');
    expect(result.items).toEqual([
      { id: 'b', date: new Date('2026-09-01'), phaseCount: 3 },
    ]);
    expect(result.nextCursor).toBe(trainingPlanCursor(result.items[0]));
    expect(result.summary).toEqual({
      total: 150,
      scheduled: 120,
      undated: 30,
      totalDuration: 7500,
      presentAttendance: 240,
    });
    const query = prisma.trainingPlan.findMany.mock.calls[0][0];
    expect(query.take).toBe(2);
    expect(query.orderBy).toEqual([
      { date: { sort: 'desc', nulls: 'last' } },
      { id: 'desc' },
    ]);
    expect(query.select.drills).toBeUndefined();
    expect(query.select._count).toBeUndefined();
    expect(prisma.planDrill.groupBy).toHaveBeenCalledWith({
      by: ['trainingPlanId'],
      where: {
        trainingPlanId: { in: ['b'] },
        trainingPlan: { groupId: 'group', clubId: 'club' },
      },
      _count: { _all: true },
    });
    expect(query.select.attendance).toBeUndefined();
    expect(query.where.AND[0]).toEqual({ groupId: 'group', clubId: 'club' });
    expect(prisma.trainingPlan.aggregate.mock.calls[0][0].where).toEqual(
      query.where.AND[0],
    );
    expect(prisma.attendance.count.mock.calls[0][0].where.plan).toEqual(
      query.where.AND[0],
    );
  });
  it('returns full current player count and page-only PRESENT aggregates without nested arrays', async () => {
    prisma.groupMember = { count: jest.fn().mockResolvedValue(40) };
    prisma.attendance.groupBy = jest
      .fn()
      .mockResolvedValue([{ planId: 'b', _count: { _all: 32 } }]);
    const result = await service.attendancePage(principal, {
      groupId: 'group',
      seasonId: 'season',
      limit: '1',
    });
    expect(result.items).toEqual([
      { id: 'b', date: new Date('2026-09-01'), presentCount: 32 },
    ]);
    expect(result.summary).toMatchObject({
      total: 150,
      playerCount: 40,
      presentAttendance: 240,
    });
    expect(prisma.groupMember.count).toHaveBeenCalledWith({
      where: { groupId: 'group', user: { role: 'PLAYER' } },
    });
    const query = prisma.attendance.groupBy.mock.calls[0][0];
    expect(query.where.planId).toEqual({ in: ['b'] });
    expect(query.where.status).toBe('PRESENT');
    expect(query.where.plan).toEqual(
      prisma.trainingPlan.aggregate.mock.calls[0][0].where,
    );
    expect(prisma.planDrill.groupBy).not.toHaveBeenCalled();
  });
  it('restricts attendance rows and the player denominator to self for PLAYER', async () => {
    prisma.groupMember = { count: jest.fn().mockResolvedValue(1) };
    prisma.attendance.groupBy = jest.fn().mockResolvedValue([]);
    const result = await service.attendancePage(
      { ...principal, role: 'PLAYER' },
      { groupId: 'group' },
    );
    expect(result.summary.playerCount).toBe(1);
    expect(prisma.groupMember.count.mock.calls[0][0].where.userId).toBe(
      principal.id,
    );
    expect(prisma.attendance.groupBy.mock.calls[0][0].where.playerId).toBe(
      principal.id,
    );
    expect(result.items[0]).toHaveProperty('presentCount', 0);
  });
  it('retains full counts on an empty attendance continuation and skips the page aggregate', async () => {
    prisma.groupMember = { count: jest.fn().mockResolvedValue(40) };
    prisma.attendance.groupBy = jest.fn();
    prisma.trainingPlan.findMany.mockResolvedValue([]);
    const result = await service.attendancePage(principal, {
      groupId: 'group',
      after: cursor({ id: 'a', date: null }),
    });
    expect(result.items).toEqual([]);
    expect(result.summary).toMatchObject({ total: 150, playerCount: 40 });
    expect(prisma.attendance.groupBy).not.toHaveBeenCalled();
  });
  it('rejects unauthorized attendance scopes and client projection fields before aggregate reads', async () => {
    auth.assertGroupView.mockRejectedValueOnce(new ForbiddenException());
    await expect(
      service.attendancePage(principal, { groupId: 'foreign' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.attendancePage(principal, {
        groupId: 'group',
        playerId: 'other',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    prisma.season.findFirst.mockResolvedValue(null);
    await expect(
      service.attendancePage(principal, {
        groupId: 'group',
        seasonId: 'foreign',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.trainingPlan.findMany).not.toHaveBeenCalled();
  });
  it('preserves inclusive UTC season-end day and undated drafts across every query', async () => {
    await service.page(principal, { groupId: 'group', seasonId: 'season' });
    expect(prisma.season.findFirst.mock.calls[0][0].where).toEqual({
      id: 'season',
      clubId: 'club',
      groupId: 'group',
    });
    const where = prisma.trainingPlan.findMany.mock.calls[0][0].where.AND[0];
    expect(where.OR).toEqual([
      { date: null },
      {
        date: {
          gte: new Date('2026-07-01'),
          lte: new Date('2026-12-31T23:59:59.999Z'),
        },
      },
    ]);
    expect(prisma.trainingPlan.aggregate.mock.calls[0][0].where).toEqual(where);
    expect(prisma.attendance.count.mock.calls[0][0].where.plan).toEqual(where);
  });
  it('does not aggregate other players attendance for a PLAYER', async () => {
    await service.page({ ...principal, role: 'PLAYER' }, { groupId: 'group' });
    expect(prisma.attendance.count.mock.calls[0][0].where).toEqual({
      plan: { groupId: 'group', clubId: 'club' },
      status: 'PRESENT',
      playerId: principal.id,
    });
  });
  it('intersects a half-open local period with season scope for rows and all counters', async () => {
    await service.page(principal, {
      groupId: 'group',
      seasonId: 'season',
      from: '2026-12-31T00:00:00+03:00',
      until: '2027-01-01T00:00:00+03:00',
      after: cursor({ id: 'z', date: '2026-12-31T12:00:00Z' }),
    });
    const where = prisma.trainingPlan.findMany.mock.calls[0][0].where.AND[0];
    expect(where.date).toEqual({
      gte: new Date('2026-12-30T21:00:00Z'),
      lt: new Date('2026-12-31T21:00:00Z'),
    });
    expect(where.OR).toHaveLength(2);
    expect(where.OR[1].date.lte).toEqual(new Date('2026-12-31T23:59:59.999Z'));
    expect(prisma.trainingPlan.aggregate.mock.calls[0][0].where).toEqual(where);
    expect(prisma.attendance.count.mock.calls[0][0].where.plan).toEqual(where);
    expect(
      prisma.planDrill.groupBy.mock.calls[0][0].where.trainingPlan,
    ).toEqual(where);
  });
  it('allows DST-short/long local days and a week crossing DST without requiring UTC midnights', () => {
    for (const [from, until, hours] of [
      ['2026-03-08T00:00:00-05:00', '2026-03-09T00:00:00-04:00', 23],
      ['2026-11-01T00:00:00-04:00', '2026-11-02T00:00:00-05:00', 25],
      ['2026-10-26T00:00:00-04:00', '2026-11-02T00:00:00-05:00', 169],
    ] as const) {
      const period = parseTrainingPlanPageQuery({
        groupId: 'g',
        from,
        until,
      }).period!;
      expect(period.until.getTime() - period.from.getTime()).toBe(
        hours * 3600000,
      );
    }
  });
  it.each([
    { from: '2026-09-01T00:00:00Z' },
    { until: '2026-09-02T00:00:00Z' },
    { from: null, until: null },
    { from: '2026-09-01', until: '2026-09-02T00:00:00Z' },
    { from: '2026-09-01T00:00:00', until: '2026-09-02T00:00:00Z' },
    { from: '2026-02-30T00:00:00Z', until: '2026-03-02T00:00:00Z' },
    { from: '2026-09-01T00:00:00Z', until: '2026-09-01T00:00:00Z' },
    { from: '2026-09-02T00:00:00Z', until: '2026-09-01T00:00:00Z' },
    { from: '2026-09-01T00:00:00Z', until: '2026-09-09T00:00:00.001Z' },
    { from: ['2026-09-01T00:00:00Z'], until: '2026-09-02T00:00:00Z' },
  ])('rejects unbounded or invalid period %j', (period) => {
    expect(() =>
      parseTrainingPlanPageQuery({ groupId: 'g', ...period }),
    ).toThrow(BadRequestException);
  });
  it('denies group or mismatched season before reading plans and counters', async () => {
    auth.assertGroupView.mockRejectedValueOnce(new ForbiddenException());
    await expect(
      service.page(principal, { groupId: 'group' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    prisma.season.findFirst.mockResolvedValue(null);
    await expect(
      service.page(principal, { groupId: 'group', seasonId: 'foreign' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.trainingPlan.findMany).not.toHaveBeenCalled();
    expect(prisma.trainingPlan.aggregate).not.toHaveBeenCalled();
    expect(prisma.attendance.count).not.toHaveBeenCalled();
  });
  it('distinguishes an empty continuation from an empty full scope', async () => {
    prisma.trainingPlan.findMany.mockResolvedValue([]);
    const result = await service.page(principal, {
      groupId: 'group',
      after: cursor({ id: 'a', date: null }),
    });
    expect(result.items).toEqual([]);
    expect(prisma.planDrill.groupBy).not.toHaveBeenCalled();
    expect(result.nextCursor).toBeNull();
    expect(result.summary.total).toBe(150);
    prisma.trainingPlan.aggregate.mockResolvedValue({
      _count: { _all: 0, date: 0 },
      _sum: { totalDuration: null },
    });
    prisma.attendance.count.mockResolvedValue(0);
    expect(
      (await service.page(principal, { groupId: 'group' })).summary,
    ).toEqual({
      total: 0,
      scheduled: 0,
      undated: 0,
      totalDuration: 0,
      presentAttendance: 0,
    });
  });
  it.each([
    null,
    [],
    {},
    { groupId: ['group'] },
    { groupId: ' group' },
    { groupId: 'g\nx' },
    { groupId: 'g', limit: '0' },
    { groupId: 'g', limit: '101' },
    { groupId: 'g', limit: 25 },
    { groupId: 'g', clubId: 'foreign' },
    { groupId: 'g', after: '!' },
    { groupId: 'g', after: 'a'.repeat(513) },
    ...[
      {},
      [],
      { id: 'x' },
      { id: 'x', date: '2026-09-01' },
      { id: 'x', date: '2026-02-30T00:00:00Z' },
      { id: 'x', date: null, scope: 'ALL' },
    ].map((data) => ({ groupId: 'g', after: cursor(data) })),
  ])('rejects invalid query %j', (input) => {
    expect(() => parseTrainingPlanPageQuery(input)).toThrow(
      BadRequestException,
    );
  });
  it('handles equal dates and the dated-to-null boundary without offset or cursor record lookup', () => {
    const parsed = parseTrainingPlanPageQuery({
      groupId: 'g',
      after: cursor({ id: 'p', date: '2026-09-01T03:00:00+03:00' }),
    });
    expect(parsed.limit).toBe(25);
    expect(trainingPlanBoundary(parsed.after)).toEqual({
      OR: [
        { date: { lt: new Date('2026-09-01') } },
        { date: new Date('2026-09-01'), id: { lt: 'p' } },
        { date: null },
      ],
    });
    expect(trainingPlanBoundary({ id: 'p', date: null })).toEqual({
      date: null,
      id: { lt: 'p' },
    });
    expect(trainingPlanBoundary(undefined)).toEqual({});
    expect(
      parseTrainingPlanPageQuery({ groupId: 'g', limit: '100' }).limit,
    ).toBe(100);
  });
});
