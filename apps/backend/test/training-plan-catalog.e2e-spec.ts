import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Prisma, PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Training plan catalog: isolated query plans and authorization (e2e)', () => {
  let app: INestApplication;
  const client = (url: string) =>
    new PrismaClient({
      datasourceUrl: url,
      log: [{ emit: 'event', level: 'query' }],
      omit: { user: { passwordHash: true } },
    });
  let prisma: ReturnType<typeof client>;
  const prefix = `plan-catalog-${randomUUID()}`;
  let clubId: string;
  let foreignClubId: string;
  let groupId: string;
  let hiddenGroupId: string;
  let foreignGroupId: string;
  let seasonId: string;
  let coachId: string;
  let systemId: string;
  let playerId: string;
  let coachToken: string;
  let playerToken: string;
  let adminToken: string;
  let systemToken: string;
  const planIds = Array.from(
    { length: 152 },
    (_, i) => `${prefix}-plan-${String(i).padStart(3, '0')}`,
  );
  const captured: Array<{ query: string; params: string }> = [];
  let capture = false;
  beforeAll(async () => {
    const url = process.env.TEST_DATABASE_URL;
    if (!url || process.env.E2E_ALLOW_DESTRUCTIVE_RESET !== 'true')
      throw new Error('Explicit disposable database required');
    const target = new URL(url);
    if (
      !['postgres:', 'postgresql:'].includes(target.protocol) ||
      !['127.0.0.1', 'localhost'].includes(target.hostname) ||
      !/(e2e|test)/i.test(target.pathname) ||
      target.pathname.includes('local_session_dev')
    )
      throw new Error('Loopback disposable test database required');
    process.env.DATABASE_URL = url;
    process.env.JWT_SECRET =
      'plan-catalog-e2e-only-secret-at-least-32-characters';
    process.env.PERSISTENT_SESSIONS_ENABLED = 'false';
    prisma = client(url);
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication();
    await app.init();
    prisma.$on('query', (e) => {
      if (capture) captured.push({ query: e.query, params: e.params });
    });
    clubId = (await prisma.club.create({ data: { name: `${prefix} club` } }))
      .id;
    foreignClubId = (
      await prisma.club.create({ data: { name: `${prefix} foreign` } })
    ).id;
    const makeUser = (
      label: string,
      role: 'COACH' | 'PLAYER' | 'CLUB_ADMIN' | 'SYSTEM_ADMIN',
    ) =>
      prisma.user.create({
        data: {
          name: `Synthetic ${label}`,
          email: `${prefix}-${label}@example.test`,
          clubId: role === 'SYSTEM_ADMIN' ? null : clubId,
          role,
          passwordHash: 'not-a-login-credential',
        },
      });
    const [coach, player, otherPlayer, admin, system] = await Promise.all([
      makeUser('coach', 'COACH'),
      makeUser('player', 'PLAYER'),
      makeUser('other', 'PLAYER'),
      makeUser('admin', 'CLUB_ADMIN'),
      makeUser('system', 'SYSTEM_ADMIN'),
    ]);
    coachId = coach.id;
    systemId = system.id;
    playerId = player.id;
    const jwt = app.get(JwtService);
    [coachToken, playerToken, adminToken, systemToken] = [
      coach,
      player,
      admin,
      system,
    ].map((user) => jwt.sign({ sub: user.id, ver: user.authVersion }));
    groupId = (
      await prisma.playerGroup.create({
        data: {
          name: 'Assigned',
          clubId,
          ageGroup: 'U18',
          members: {
            create: [coach, player, otherPlayer].map((u) => ({ userId: u.id })),
          },
        },
      })
    ).id;
    hiddenGroupId = (
      await prisma.playerGroup.create({
        data: { name: 'Unassigned', clubId, ageGroup: 'U18' },
      })
    ).id;
    foreignGroupId = (
      await prisma.playerGroup.create({
        data: { name: 'Foreign', clubId: foreignClubId, ageGroup: 'U18' },
      })
    ).id;
    seasonId = (
      await prisma.season.create({
        data: {
          name: 'Selected',
          clubId,
          groupId,
          userId: coach.id,
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-12-31'),
        },
      })
    ).id;
    await prisma.trainingPlan.createMany({
      data: planIds.map((id, i) => ({
        id,
        clubId,
        groupId,
        coachId,
        title: `Plan ${i}`,
        date:
          i >= 150
            ? new Date('2025-01-01')
            : i >= 120
              ? null
              : i === 0
                ? new Date('2026-07-01')
                : i === 119
                  ? new Date('2026-12-31T23:59:59.999Z')
                  : new Date('2026-09-01'),
        totalDuration: i >= 120 ? 10 : 60,
      })),
    });
    await prisma.trainingPlan.create({
      data: {
        clubId,
        groupId: hiddenGroupId,
        coachId,
        title: 'Hidden owner plan',
      },
    });
    const drill = await prisma.drill.create({
      data: {
        id: `${prefix}-drill`,
        title: 'Synthetic drill',
        category: 'WARM_UP',
        ageGroup: 'U18',
        durationMin: 30,
        difficulty: 'EASY',
        jsonData: { fixtureOnly: 'x'.repeat(8192) },
      },
    });
    await prisma.planDrill.createMany({
      data: planIds.slice(0, 120).flatMap((trainingPlanId) =>
        [0, 1].map((order) => ({
          trainingPlanId,
          drillId: drill.id,
          phase: 'WARM_UP',
          order,
          boardSnapshot: { fixtureOnly: 'x'.repeat(8192) },
        })),
      ),
    });
    await prisma.attendance.createMany({
      data: planIds.slice(0, 120).flatMap((planId) =>
        [player, otherPlayer].map((p) => ({
          planId,
          playerId: p.id,
          status: 'PRESENT' as const,
        })),
      ),
    });
    // Synthetic planner statistics only; no DDL/index changes or retained tables.
    await prisma.$executeRawUnsafe(
      'ANALYZE "TrainingPlan", "PlanDrill", "Attendance"',
    );
  }, 60000);
  afterAll(async () => {
    if (prisma && clubId) {
      await prisma.attendance.deleteMany({ where: { plan: { clubId } } });
      await prisma.planDrill.deleteMany({
        where: { trainingPlan: { clubId } },
      });
      await prisma.trainingPlan.deleteMany({
        where: { clubId: { in: [clubId, foreignClubId] } },
      });
      await prisma.drill.deleteMany({
        where: {
          id: `${prefix}-drill`,
        },
      });
      await prisma.season.deleteMany({ where: { clubId } });
      await prisma.groupMember.deleteMany({ where: { group: { clubId } } });
      await prisma.playerGroup.deleteMany({
        where: { clubId: { in: [clubId, foreignClubId] } },
      });
      await prisma.user.deleteMany({
        where: { OR: [{ clubId }, { email: `${prefix}-system@example.test` }] },
      });
      await prisma.club.deleteMany({
        where: { id: { in: [clubId, foreignClubId] } },
      });
    }
    await app?.close();
    await prisma?.$disconnect();
  });
  const get = (query: Record<string, string>, token = coachToken) =>
    request(app.getHttpServer())
      .get('/training-plans/catalog/page')
      .set('Authorization', `Bearer ${token}`)
      .query(query);

  it('traverses equal dates and drafts with complete scoped summaries and no nested board/attendance payloads', async () => {
    const query = { groupId, seasonId };
    await request(app.getHttpServer())
      .get('/training-plans/catalog/page')
      .query(query)
      .expect(401);
    const ids: string[] = [];
    let after: string | undefined;
    let pages = 0;
    do {
      const body = (
        await get({ ...query, ...(after ? { after } : {}) }).expect(200)
      ).body;
      expect(body.items).toHaveLength(25);
      expect(body.summary).toEqual({
        total: 150,
        scheduled: 120,
        undated: 30,
        totalDuration: 7500,
        presentAttendance: 240,
      });
      for (const row of body.items) {
        expect(row.phaseCount).toBe(row.date ? 2 : 0);
        expect(row.drills).toBeUndefined();
        expect(row.attendance).toBeUndefined();
        expect(row.boardSnapshot).toBeUndefined();
      }
      ids.push(...body.items.map((p: any) => p.id));
      after = body.nextCursor;
      pages++;
    } while (after);
    expect(pages).toBe(6);
    const expected = await prisma.trainingPlan.findMany({
      where: {
        groupId,
        OR: [
          { date: null },
          {
            date: {
              gte: new Date('2026-07-01'),
              lte: new Date('2026-12-31T23:59:59.999Z'),
            },
          },
        ],
      },
      orderBy: [{ date: { sort: 'desc', nulls: 'last' } }, { id: 'desc' }],
      select: { id: true },
    });
    expect(ids).toEqual(expected.map((p) => p.id));
    expect(new Set(ids).size).toBe(150);
    const lastCursor = Buffer.from(
      JSON.stringify({ id: planIds[120], date: null }),
    ).toString('base64url');
    const empty = (await get({ ...query, after: lastCursor }).expect(200)).body;
    expect(empty.items).toEqual([]);
    expect(empty.summary.total).toBe(150);
    const all = (await get({ groupId }).expect(200)).body;
    expect(all.summary.total).toBe(152);
    expect(
      (await get(query, playerToken).expect(200)).body.summary
        .presentAttendance,
    ).toBe(120);
    expect((await get(query, adminToken).expect(200)).body.summary).toEqual({
      total: 150,
      scheduled: 120,
      undated: 30,
      totalDuration: 7500,
      presentAttendance: 240,
    });
    await get({ groupId: foreignGroupId }).expect(403);
    await get({ groupId: hiddenGroupId }).expect(403);
    await get({ groupId: foreignGroupId }, playerToken).expect(403);
    await get({ groupId: foreignGroupId }, adminToken).expect(403);
    expect(
      (await get({ groupId: foreignGroupId }, systemToken).expect(200)).body
        .summary.total,
    ).toBe(0);
    await get({ groupId: hiddenGroupId, seasonId }, adminToken).expect(400);
    await get({ ...query, limit: '101' }).expect(400);
    await get({ ...query, clubId: foreignClubId }).expect(400);
    await get({ ...query, after: 'bad!' }).expect(400);
    // Legacy full-array behavior is still available and is not silently paged.
    const old = (
      await request(app.getHttpServer())
        .get('/training-plans')
        .set('Authorization', `Bearer ${coachToken}`)
        .query({ groupId })
        .expect(200)
    ).body;
    expect(old).toHaveLength(152);
    expect(old.find((p: any) => p.id === planIds[0]).drills).toHaveLength(2);
  }, 60000);

  it('pages a local calendar day with full totals, half-open bounds and unchanged scope enforcement', async () => {
    const period = {
      from: '2026-09-01T00:00:00+03:00',
      until: '2026-09-02T00:00:00+03:00',
    };
    const query = { groupId, seasonId, ...period };
    const ids: string[] = [];
    let after: string | undefined;
    do {
      const body = (
        await get({ ...query, ...(after ? { after } : {}) }).expect(200)
      ).body;
      expect(body.items.length).toBeLessThanOrEqual(25);
      expect(body.summary).toMatchObject({
        total: 118,
        totalDuration: 7080,
        undated: 0,
        presentAttendance: 236,
      });
      expect(
        body.items.every(
          (item: any) => item.date !== null && item.drills === undefined,
        ),
      ).toBe(true);
      ids.push(...body.items.map((item: any) => item.id));
      after = body.nextCursor;
    } while (after);
    expect(ids).toHaveLength(118);
    expect(new Set(ids).size).toBe(118);
    expect(
      (await get(query, playerToken).expect(200)).body.summary
        .presentAttendance,
    ).toBe(118);
    expect(
      (
        await get({
          groupId,
          from: '2026-08-31T00:00:00Z',
          until: '2026-09-01T00:00:00Z',
        }).expect(200)
      ).body.summary.total,
    ).toBe(0);
    expect(
      (
        await get({
          groupId,
          seasonId,
          from: '2027-01-01T00:00:00+03:00',
          until: '2027-01-02T00:00:00+03:00',
        }).expect(200)
      ).body.summary.total,
    ).toBe(1);
    expect(
      (
        await get({
          groupId,
          seasonId,
          from: '2025-01-01T00:00:00Z',
          until: '2025-01-02T00:00:00Z',
        }).expect(200)
      ).body.summary.total,
    ).toBe(0);
    expect(
      (
        await get({
          groupId,
          from: '2025-01-01T00:00:00Z',
          until: '2025-01-02T00:00:00Z',
        }).expect(200)
      ).body.summary.total,
    ).toBe(2);
    await get({ ...query, groupId: hiddenGroupId }).expect(403);
    await get({ ...query, groupId: foreignGroupId }).expect(403);
    await get({ ...query, groupId: hiddenGroupId }, adminToken).expect(400);
    await get({ groupId, from: period.from }).expect(400);
    await get({ ...query, until: period.from }).expect(400);
    await get({ ...query, until: '2026-10-01T00:00:00Z' }).expect(400);
    await get({ ...query, clubId: foreignClubId }).expect(400);
    await request(app.getHttpServer())
      .get('/training-plans/catalog/page')
      .query(query)
      .expect(401);
  });

  it('pages attendance with full player counts, self-only PLAYER projection and fresh post-write summaries', async () => {
    const attendance = (query: Record<string, string>, token = coachToken) =>
      request(app.getHttpServer())
        .get('/training-plans/catalog/attendance/page')
        .set('Authorization', `Bearer ${token}`)
        .query(query);
    const query = { groupId, seasonId };
    const first = (await attendance(query).expect(200)).body;
    expect(first.items).toHaveLength(25);
    expect(first.summary).toMatchObject({
      total: 150,
      playerCount: 2,
      presentAttendance: 240,
    });
    expect(first.items[0]).toMatchObject({ id: planIds[119], presentCount: 2 });
    expect(first.items[0].attendance).toBeUndefined();
    expect(first.items[0].drills).toBeUndefined();
    expect(first.items[0].phaseCount).toBeUndefined();
    const second = (
      await attendance({ ...query, after: first.nextCursor }).expect(200)
    ).body;
    expect(second.summary).toEqual(first.summary);
    expect(
      second.items.some((item: any) => item.id === first.items[0].id),
    ).toBe(false);
    const player = (await attendance(query, playerToken).expect(200)).body;
    expect(player.summary).toMatchObject({
      playerCount: 1,
      presentAttendance: 120,
    });
    expect(player.items[0].presentCount).toBe(1);
    expect((await attendance({ groupId }).expect(200)).body.summary.total).toBe(
      152,
    );
    for (const token of [coachToken, playerToken, adminToken])
      await attendance({ groupId: foreignGroupId }, token).expect(403);
    await attendance({ groupId: hiddenGroupId }).expect(403);
    await attendance({ groupId: hiddenGroupId, seasonId }, adminToken).expect(
      400,
    );
    await attendance({ ...query, playerId }).expect(400);
    await request(app.getHttpServer())
      .get('/training-plans/catalog/attendance/page')
      .query(query)
      .expect(401);
    await request(app.getHttpServer())
      .post('/attendance')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ planId: planIds[119], playerId, status: 'ABSENT' })
      .expect(201);
    const updated = (await attendance(query).expect(200)).body;
    expect(updated.items[0].presentCount).toBe(1);
    expect(updated.summary.presentAttendance).toBe(239);
    await request(app.getHttpServer())
      .post('/attendance')
      .set('Authorization', `Bearer ${coachToken}`)
      .send({ planId: planIds[119], playerId, status: 'PRESENT' })
      .expect(201);
  });

  it('pages the drill library with legacy visibility parity and no board payloads', async () => {
    const ids = Array.from(
      { length: 35 },
      (_, i) => `${prefix}-library-${String(i).padStart(3, '0')}`,
    );
    await prisma.drill.createMany({
      data: ids.map((id, i) => ({
        id,
        title: `Library ${i}`,
        category: i === 30 ? 'TACTICAL' : 'WARM_UP',
        ageGroup: i === 33 ? 'U16' : 'U18',
        durationMin: 20,
        difficulty: 'EASY',
        scope: [30, 31, 32, 34].includes(i) ? 'CLUB' : 'GLOBAL',
        createdById: [30, 31, 32, 34].includes(i) ? systemId : null,
        clubId:
          i === 32 ? foreignClubId : [30, 31, 34].includes(i) ? clubId : null,
        groupId:
          i === 30
            ? groupId
            : i === 31
              ? hiddenGroupId
              : i === 32
                ? foreignGroupId
                : null,
        createdAt: new Date('2030-01-01T00:00:00Z'),
        jsonData:
          i !== 29
            ? { kind: 'tactical-board', fixture: 'x'.repeat(8192) }
            : { fixture: 'x'.repeat(8192) },
      })),
    });
    const read = (query: Record<string, string>, token = coachToken) =>
      request(app.getHttpServer())
        .get('/drills/catalog/page')
        .set('Authorization', `Bearer ${token}`)
        .query(query);
    try {
      const seen: string[] = [];
      let after: string | undefined;
      do {
        const body = (
          await read({ groupId, ...(after ? { after } : {}) }).expect(200)
        ).body;
        expect(body.items.length).toBeLessThanOrEqual(25);
        expect(body.total).toBe(33);
        for (const item of body.items) {
          expect(item.jsonData).toBeUndefined();
          expect(item.createdById).toBeUndefined();
        }
        seen.push(...body.items.map((item: any) => item.id));
        after = body.nextCursor;
      } while (after);
      expect(new Set(seen).size).toBe(33);
      const legacy = (
        await request(app.getHttpServer())
          .get('/drills')
          .set('Authorization', `Bearer ${coachToken}`)
          .query({ groupId, ageGroup: 'U18' })
          .expect(200)
      ).body;
      expect([...seen].sort()).toEqual(
        legacy.map((item: any) => item.id).sort(),
      );
      const tactical = (
        await read({ groupId, category: 'TACTICAL' }).expect(200)
      ).body;
      expect(tactical.total).toBe(1);
      expect(tactical.items[0]).toMatchObject({ id: ids[30], isBoard: true });
      const boardIds: string[] = [];
      after = undefined;
      do {
        const body = (
          await read({
            groupId,
            kind: 'tactical-board',
            ...(after ? { after } : {}),
          }).expect(200)
        ).body;
        expect(body.total).toBe(31);
        expect(body.items.length).toBeLessThanOrEqual(25);
        expect(
          body.items.every(
            (item: any) => item.isBoard && item.jsonData === undefined,
          ),
        ).toBe(true);
        boardIds.push(...body.items.map((item: any) => item.id));
        after = body.nextCursor;
      } while (after);
      expect(boardIds).toHaveLength(31);
      expect(new Set(boardIds).size).toBe(31);
      expect([...boardIds].sort()).toEqual(
        legacy
          .filter((item: any) => item.jsonData?.kind === 'tactical-board')
          .map((item: any) => item.id)
          .sort(),
      );
      expect(
        (
          await read({
            groupId,
            kind: 'tactical-board',
            category: 'WARM_UP',
          }).expect(200)
        ).body.total,
      ).toBe(30);
      for (const [token, total] of [
        [playerToken, 31],
        [adminToken, 32],
        [systemToken, 33],
      ] as const) {
        expect(
          (await read({ groupId, kind: 'tactical-board' }, token).expect(200))
            .body.total,
        ).toBe(total);
      }
      await read({ groupId: foreignGroupId, kind: 'tactical-board' }).expect(
        403,
      );
      await read({ groupId: hiddenGroupId, kind: 'tactical-board' }).expect(
        403,
      );
      await read({ groupId, kind: 'TACTICAL' }).expect(400);
      expect(
        (await read({ groupId }, playerToken).expect(200)).body.total,
      ).toBe(33);
      expect((await read({ groupId }, adminToken).expect(200)).body.total).toBe(
        34,
      );
      expect(
        (await read({ groupId }, systemToken).expect(200)).body.total,
      ).toBe(35);
      await read({ groupId: foreignGroupId }).expect(403);
      await read({ groupId: hiddenGroupId }).expect(403);
      await read({ groupId, clubId: foreignClubId }).expect(400);
      await read({ groupId, category: 'BAD' }).expect(400);
      await read({ groupId, ageGroup: 'U16' }).expect(400);
      await read({ groupId, after: '!' }).expect(400);
      await request(app.getHttpServer())
        .get('/drills/catalog/page')
        .query({ groupId })
        .expect(401);
    } finally {
      await prisma.drill.deleteMany({ where: { id: { in: ids } } });
    }
  });

  it('pages player memberships without changing role or group access', async () => {
    const ids = Array.from(
      { length: 28 },
      (_, i) => `${prefix}-member-${String(i).padStart(3, '0')}`,
    );
    const read = (
      query: Record<string, string> = {},
      token = coachToken,
      group = groupId,
    ) =>
      request(app.getHttpServer())
        .get(`/groups/${group}/members/players/page`)
        .set('Authorization', `Bearer ${token}`)
        .query(query);
    try {
      await prisma.user.createMany({
        data: ids.map((id) => ({
          id,
          name: id,
          email: `${id}@example.test`,
          role: 'PLAYER',
          clubId,
          passwordHash: 'not-a-login-credential',
        })),
      });
      await prisma.groupMember.createMany({
        data: ids.map((userId) => ({ groupId, userId })),
      });
      const first = (await read().expect(200)).body;
      expect(first.total).toBe(30);
      expect(first.items).toHaveLength(25);
      expect(first.items.every((row: any) => row.user.role === 'PLAYER')).toBe(
        true,
      );
      expect(first.items[0].user).not.toHaveProperty('passwordHash');
      expect(first.items[0].user).not.toHaveProperty('authVersion');
      const next = (await read({ after: first.nextCursor }).expect(200)).body;
      expect(next.items).toHaveLength(5);
      expect(next.total).toBe(30);
      expect(
        new Set([...first.items, ...next.items].map((row: any) => row.id)).size,
      ).toBe(30);
      for (const token of [adminToken, systemToken])
        expect((await read({ limit: '1' }, token).expect(200)).body.total).toBe(
          30,
        );
      await read({}, playerToken).expect(403);
      await read({}, coachToken, hiddenGroupId).expect(403);
      await read({}, coachToken, foreignGroupId).expect(403);
      await read({ role: 'COACH' }).expect(400);
      await read({ after: '' }).expect(400);
      const attendancePage = (
        query: Record<string, string> = {},
        token = coachToken,
      ) =>
        request(app.getHttpServer())
          .get('/attendance/page')
          .set('Authorization', `Bearer ${token}`)
          .query({ planId: planIds[0], ...query });
      const attendanceFirst = (await attendancePage().expect(200)).body;
      expect(attendanceFirst.total).toBe(30);
      expect(attendanceFirst.items).toHaveLength(25);
      const attendanceNext = (
        await attendancePage({ after: attendanceFirst.nextCursor }).expect(200)
      ).body;
      expect(attendanceNext.items).toHaveLength(5);
      expect(attendanceNext.total).toBe(30);
      expect(attendanceNext.presentTotal).toBe(attendanceFirst.presentTotal);
      const target = attendanceNext.items[0];
      await request(app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${coachToken}`)
        .send({
          planId: planIds[0],
          playerId: target.playerId,
          status: 'PRESENT',
        })
        .expect(201);
      const afterWrite = (
        await attendancePage({ after: attendanceFirst.nextCursor }).expect(200)
      ).body;
      expect(afterWrite.items[0].status).toBe('PRESENT');
      expect(afterWrite.presentTotal).toBe(
        attendanceFirst.presentTotal + (target.status === 'PRESENT' ? 0 : 1),
      );
      expect(Object.keys(afterWrite.items[0]).sort()).toEqual([
        'id',
        'name',
        'playerId',
        'status',
      ]);
      const self = (await attendancePage({}, playerToken).expect(200)).body;
      expect(self.total).toBe(1);
      expect(
        self.items.map((item: { playerId: string }) => item.playerId),
      ).toEqual([playerId]);
      await request(app.getHttpServer())
        .post('/attendance')
        .set('Authorization', `Bearer ${playerToken}`)
        .send({ planId: planIds[0], playerId, status: 'PRESENT' })
        .expect(403);
      for (const token of [adminToken, systemToken])
        expect((await attendancePage({}, token).expect(200)).body.total).toBe(
          30,
        );
      const invalidAttendanceQueries: Array<Record<string, string>> = [
        { groupId: foreignGroupId },
        { playerId: ids[0] },
        { after: '' },
        { limit: '101' },
      ];
      for (const query of invalidAttendanceQueries)
        await attendancePage(query).expect(400);
      for (const group of [hiddenGroupId, foreignGroupId]) {
        const restricted = await prisma.trainingPlan.create({
          data: {
            title: 'Restricted attendance',
            clubId: group === foreignGroupId ? foreignClubId : clubId,
            groupId: group,
            coachId: systemId,
          },
        });
        await attendancePage({ planId: restricted.id }).expect(403);
        await request(app.getHttpServer())
          .get(`/training-plans/${restricted.id}/editor`)
          .set('Authorization', `Bearer ${coachToken}`)
          .expect(403);
      }
      for (const token of [coachToken, adminToken, systemToken, playerToken]) {
        const editor = (
          await request(app.getHttpServer())
            .get(`/training-plans/${planIds[0]}/editor`)
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
        ).body;
        expect(editor.attendance).toBeUndefined();
        expect(editor.group).toBeUndefined();
        expect(editor.drills).toHaveLength(2);
      }
      await request(app.getHttpServer())
        .get('/attendance/page')
        .query({ planId: planIds[0] })
        .expect(401);
      await request(app.getHttpServer())
        .get(`/training-plans/${planIds[0]}/editor`)
        .expect(401);
      await request(app.getHttpServer())
        .get(`/groups/${groupId}/members/players/page`)
        .expect(401);
    } finally {
      await prisma.attendance.deleteMany({ where: { playerId: { in: ids } } });
      await prisma.groupMember.deleteMany({ where: { userId: { in: ids } } });
      await prisma.user.deleteMany({ where: { id: { in: ids } } });
    }
  });

  it('pages season-owned matches with full totals, minimal projections and unchanged tenant access', async () => {
    const read = (query: Record<string, string>, token = coachToken) =>
      request(app.getHttpServer())
        .get('/matches/catalog/page')
        .set('Authorization', `Bearer ${token}`)
        .query(query);
    const ids = Array.from(
      { length: 55 },
      (_, i) => `${prefix}-match-${String(i).padStart(3, '0')}`,
    );
    const extraSeasons = await Promise.all(
      [
        [groupId, clubId],
        [hiddenGroupId, clubId],
        [foreignGroupId, foreignClubId],
      ].map(([groupId, clubId], i) =>
        prisma.season.create({
          data: {
            name: `Synthetic match season ${i}`,
            groupId,
            clubId,
            userId: coachId,
            startDate: new Date('2026-01-01'),
            endDate: new Date('2026-12-31'),
          },
        }),
      ),
    );
    try {
      await prisma.match.createMany({
        data: ids.map((id, i) => ({
          id,
          seasonId,
          groupId: i === 0 ? null : groupId,
          opponent: `Synthetic opponent ${i}`,
          location: 'HOME',
          date: new Date(
            i === 0
              ? '2026-08-31T21:00:00Z'
              : i === 54
                ? '2026-09-01T21:00:00Z'
                : '2026-09-01T12:00:00Z',
          ),
          notes: 'Synthetic coach note',
          ourFormation: '4-3-3',
          tacticalBoard:
            i === 0
              ? Prisma.DbNull
              : i === 1
                ? Prisma.JsonNull
                : { kind: 'tactical-board', fixture: 'x'.repeat(8192) },
          opponentAnalysis: { fixture: 'x'.repeat(8192) },
          videoLinks: ['https://example.test/synthetic'],
        })),
      });
      await prisma.match.createMany({
        data: extraSeasons.map((season, i) => ({
          id: `${prefix}-extra-match-${i}`,
          seasonId: season.id,
          groupId: season.groupId,
          opponent: `Extra ${i}`,
          date: new Date('2026-09-01T12:00:00Z'),
          location: 'AWAY',
        })),
      });
      const query = { groupId, seasonId };
      const detail = (
        id: string,
        scope: Record<string, string>,
        token = coachToken,
      ) =>
        request(app.getHttpServer())
          .get(`/matches/catalog/detail/${id}`)
          .set('Authorization', `Bearer ${token}`)
          .query(scope);
      await request(app.getHttpServer())
        .get(`/matches/catalog/detail/${ids[0]}`)
        .query(query)
        .expect(401);
      for (const token of [coachToken, playerToken, adminToken, systemToken]) {
        const one = (await detail(ids[0], query, token).expect(200)).body;
        expect(one.id).toBe(ids[0]);
        expect(one.groupId).toBeNull(); // owning season, not optional match group
        expect(one.opponentAnalysis.fixture).toHaveLength(8192);
        expect(one).not.toHaveProperty('videoLinks');
        expect(one).not.toHaveProperty('season');
      }
      expect(
        (await detail(ids[2], query).expect(200)).body.tacticalBoard.fixture,
      ).toHaveLength(8192);
      await detail(ids[0], { groupId }).expect(200);
      await detail(ids[0], { groupId, seasonId: extraSeasons[0].id }).expect(
        404,
      );
      await detail(`${prefix}-extra-match-1`, query).expect(404);
      await detail(`${prefix}-extra-match-2`, query).expect(404);
      await detail(ids[0], { groupId: hiddenGroupId }).expect(403);
      await detail(ids[0], { groupId: foreignGroupId }).expect(403);
      await detail(ids[0], { ...query, limit: '25' }).expect(400);
      await detail('missing', query).expect(404);
      await request(app.getHttpServer())
        .get('/matches/catalog/page')
        .query(query)
        .expect(401);
      const seen: string[] = [];
      let after: string | undefined;
      do {
        const body = (
          await read({ ...query, ...(after ? { after } : {}) }).expect(200)
        ).body;
        expect(body.total).toBe(55);
        expect(body.items.length).toBeLessThanOrEqual(25);
        for (const row of body.items) {
          expect(row.hasBoard).toBe(!ids.slice(0, 2).includes(row.id));
          for (const key of [
            'tacticalBoard',
            'opponentAnalysis',
            'videoLinks',
            'season',
            'group',
          ])
            expect(row[key]).toBeUndefined();
        }
        seen.push(...body.items.map((row: any) => row.id));
        after = body.nextCursor;
      } while (after);
      expect(seen).toEqual(ids);
      expect(new Set(seen).size).toBe(55);
      const old = (
        await request(app.getHttpServer())
          .get(`/seasons/${seasonId}/matches`)
          .set('Authorization', `Bearer ${coachToken}`)
          .expect(200)
      ).body;
      expect(old).toHaveLength(55);
      expect(
        old.find((row: any) => row.id === ids[2]).tacticalBoard.fixture,
      ).toHaveLength(8192);
      for (const token of [coachToken, playerToken, adminToken, systemToken]) {
        expect((await read(query, token).expect(200)).body.total).toBe(55);
        expect((await read({ groupId }, token).expect(200)).body.total).toBe(
          56,
        );
      }
      const period = {
        from: '2026-09-01T00:00:00+03:00',
        until: '2026-09-02T00:00:00+03:00',
      };
      expect((await read({ ...query, ...period }).expect(200)).body.total).toBe(
        54,
      );
      expect((await read({ groupId, ...period }).expect(200)).body.total).toBe(
        55,
      );
      const last = Buffer.from(
        JSON.stringify({ id: ids[54], date: '2026-09-01T21:00:00Z' }),
      ).toString('base64url');
      const empty = (await read({ ...query, after: last }).expect(200)).body;
      expect(empty.items).toEqual([]);
      expect(empty.total).toBe(55);
      expect(empty.nextCursor).toBeNull();
      for (const token of [coachToken, playerToken, adminToken])
        await read({ groupId: foreignGroupId }, token).expect(403);
      for (const token of [coachToken, playerToken])
        await read({ groupId: hiddenGroupId }, token).expect(403);
      expect(
        (await read({ groupId: hiddenGroupId }, adminToken).expect(200)).body
          .total,
      ).toBe(1);
      expect(
        (await read({ groupId: foreignGroupId }, systemToken).expect(200)).body
          .total,
      ).toBe(1);
      await read({ ...query, seasonId: extraSeasons[1].id }, adminToken).expect(
        400,
      );
      await read(
        { ...query, seasonId: extraSeasons[2].id },
        systemToken,
      ).expect(400);
      await read({ ...query, clubId: foreignClubId }).expect(400);
      await read({ ...query, limit: '101' }).expect(400);
      await read({ ...query, after: '!' }).expect(400);
      await read({ ...query, from: period.from }).expect(400);
      const elapsed: number[] = [];
      let bytes = 0;
      let samples: typeof captured = [];
      for (let i = 0; i < 10; i++) {
        captured.length = 0;
        capture = true;
        const start = performance.now();
        const response = await read(query).expect(200);
        elapsed.push(performance.now() - start);
        capture = false;
        samples = [...captured];
        expect(samples.length).toBeLessThanOrEqual(8);
        bytes = Buffer.byteLength(JSON.stringify(response.body));
      }
      const plans: unknown[] = [];
      // Replay scalar page/count SQL only. Query-event JSON loses the typed
      // JSON-null sentinel used by the marker query; rebinding it as SQL NULL
      // would explain a different predicate. Marker correctness is tested above.
      for (const sample of samples.filter(
        (q) =>
          q.query.startsWith('SELECT') &&
          q.query.includes('"Match"') &&
          !q.query.includes('"tacticalBoard"'),
      )) {
        const result = await prisma.$queryRawUnsafe<any[]>(
          `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sample.query}`,
          ...(JSON.parse(sample.params) as unknown[]).map((value) =>
            typeof value === 'string' && /^\d{4}-\d{2}-\d{2}[T ]/.test(value)
              ? new Date(value)
              : value,
          ),
        );
        const plan = result[0]['QUERY PLAN'][0];
        plans.push({
          node: plan.Plan['Node Type'],
          rows: plan.Plan['Actual Rows'],
          executionMs: plan['Execution Time'],
        });
      }
      expect(plans).toHaveLength(2);
      elapsed.sort((a, b) => a - b);
      console.info(
        'BL043_MATCH_CATALOG_MEASUREMENT',
        JSON.stringify({
          fixtureMatches: 58,
          samples: 10,
          p50Ms: +elapsed[4].toFixed(2),
          maxMs: +elapsed[9].toFixed(2),
          queries: samples.length,
          pageBytes: bytes,
          legacySeasonBytes: Buffer.byteLength(JSON.stringify(old)),
          plans,
        }),
      );
    } finally {
      capture = false;
      await prisma.match.deleteMany({
        where: {
          seasonId: { in: [seasonId, ...extraSeasons.map((s) => s.id)] },
        },
      });
      await prisma.season.deleteMany({
        where: { id: { in: extraSeasons.map((s) => s.id) } },
      });
    }
  }, 60000);

  // Opt-in: run alone so other tests cannot consume its rate-limit window or
  // contaminate query-event counts. This is not a production load generator.
  (process.env.NGCS_MIXED_BENCH === 'true' ? it : it.skip)(
    'measures mixed read batches and editor payload growth',
    async () => {
      // A shared listener avoids Supertest auto-close races across parallel
      // requests when given a non-listening server. No fixed dev port is used.
      await app.listen(0, '127.0.0.1');
      const baseUrl = await app.getUrl();
      const userIds = Array.from(
        { length: 298 },
        (_, i) => `${prefix}-bench-user-${String(i).padStart(3, '0')}`,
      );
      const matchIds = Array.from(
        { length: 30 },
        (_, i) => `${prefix}-bench-match-${i}`,
      );
      const phaseIds = Array.from(
        { length: 48 },
        (_, i) => `${prefix}-bench-phase-${i}`,
      );
      const http = (path: string, query: Record<string, string> = {}) =>
        request(baseUrl)
          .get(path)
          .set('Authorization', `Bearer ${coachToken}`)
          .query(query)
          .expect(200);
      const round = async (players: number) => {
        const responses = await Promise.all([
          http('/training-plans/catalog/page', {
            groupId,
            seasonId,
            limit: '3',
          }),
          http('/drills/catalog/page', { groupId, limit: '1' }),
          http('/matches/catalog/page', { groupId, seasonId, limit: '3' }),
          http(`/groups/${groupId}/members/players/page`),
          http('/attendance/page', { planId: planIds[0] }),
        ]);
        expect(responses.map((r) => r.body.items.length)).toEqual([
          3, 1, 3, 25, 25,
        ]);
        expect(responses[0].body.summary.total).toBe(150);
        expect(responses[2].body.total).toBe(30);
        expect(responses[3].body.total).toBe(players);
        expect(responses[4].body.total).toBe(players);
        expect(responses[4].body.presentTotal).toBe(players);
        const bytes = responses.map((r) =>
          Buffer.byteLength(JSON.stringify(r.body)),
        );
        // Synthetic fixture regression guards, NOT approved production budgets.
        for (const value of bytes) expect(value).toBeLessThan(32 * 1024);
        return bytes;
      };
      const records: unknown[] = [];
      const percentile = (values: number[], fraction: number) =>
        +[...values]
          .sort((a, b) => a - b)
          [Math.ceil(values.length * fraction) - 1].toFixed(2);
      try {
        await prisma.match.createMany({
          data: matchIds.map((id, i) => ({
            id,
            seasonId,
            opponent: `Synthetic opponent ${i}`,
            location: 'HOME',
            date: new Date('2026-09-01'),
          })),
        });
        for (const players of [30, 300]) {
          const additions =
            players === 30 ? userIds.slice(0, 28) : userIds.slice(28);
          await prisma.user.createMany({
            data: additions.map((id) => ({
              id,
              name: 'Synthetic benchmark player',
              email: `${id}@example.test`,
              role: 'PLAYER',
              clubId,
              passwordHash: 'not-a-login-credential',
            })),
          });
          await prisma.groupMember.createMany({
            data: additions.map((userId) => ({ groupId, userId })),
          });
          await prisma.attendance.createMany({
            data: additions.map((playerId) => ({
              planId: planIds[0],
              playerId,
              status: 'PRESENT',
            })),
          });
          await prisma.$executeRawUnsafe(
            'ANALYZE "GroupMember", "Attendance", "User", "Match"',
          );
          for (const concurrency of [1, 3]) {
            await Promise.all(
              Array.from({ length: concurrency }, () => round(players)),
            );
            const times: number[] = [];
            const queries: number[] = [];
            let bytes: number[] = [];
            for (let sample = 0; sample < 10; sample++) {
              captured.length = 0;
              capture = true;
              const start = performance.now();
              const batches = await Promise.all(
                Array.from({ length: concurrency }, () => round(players)),
              );
              times.push(performance.now() - start);
              capture = false;
              queries.push(captured.length);
              bytes = batches[0];
              // Count the aggregate only: concurrent Prisma events cannot be
              // reliably attributed to individual HTTP requests by this hook.
              expect(captured.length).toBeLessThanOrEqual(50 * concurrency);
            }
            records.push({
              players,
              concurrency,
              samples: 10,
              p50BatchMs: percentile(times, 0.5),
              p95BatchMs: percentile(times, 0.95),
              maxBatchQueries: Math.max(...queries),
              normalizedBatchQueriesPerJourney:
                Math.max(...queries) / concurrency,
              responseBytes: bytes,
              batchBytes: bytes.reduce((a, b) => a + b, 0) * concurrency,
            });
          }
        }
        const editors: Array<{
          phases: number;
          bytes: number;
          maxQueries: number;
          p50Ms: number;
          p95Ms: number;
        }> = [];
        for (const phases of [2, 50]) {
          if (phases === 50)
            await prisma.planDrill.createMany({
              data: phaseIds.map((id, i) => ({
                id,
                trainingPlanId: planIds[0],
                drillId: `${prefix}-drill`,
                phase: 'WARM_UP',
                order: i + 2,
                boardSnapshot: { fixtureOnly: 'x'.repeat(8192) },
              })),
            });
          const times: number[] = [];
          let bytes = 0,
            maxQueries = 0;
          for (let i = 0; i < 5; i++) {
            captured.length = 0;
            capture = true;
            const start = performance.now();
            const result = await http(`/training-plans/${planIds[0]}/editor`);
            times.push(performance.now() - start);
            capture = false;
            maxQueries = Math.max(maxQueries, captured.length);
            expect(result.body.drills).toHaveLength(phases);
            expect(result.body).not.toHaveProperty('attendance');
            expect(result.body).not.toHaveProperty('group');
            bytes = Buffer.byteLength(JSON.stringify(result.body));
          }
          editors.push({
            phases,
            bytes,
            maxQueries,
            p50Ms: percentile(times, 0.5),
            p95Ms: percentile(times, 0.95),
          });
        }
        expect(editors[1].bytes).toBeGreaterThan(editors[0].bytes * 10);
        console.info(
          'BL043_MIXED_READ_MEASUREMENT',
          JSON.stringify({
            version: 1,
            node: process.version,
            platform: process.platform,
            architecture: process.arch,
            phaseJsonBytes: 8192,
            scopedPlans: 152,
            matchCount: 30,
            samplesPerProfile: 10,
            batchReadOrder: [
              'plans',
              'drills',
              'matches',
              'members',
              'attendance',
            ],
            records,
            editors,
          }),
        );
      } finally {
        capture = false;
        await prisma.planDrill.deleteMany({ where: { id: { in: phaseIds } } });
        await prisma.attendance.deleteMany({
          where: { playerId: { in: userIds } },
        });
        await prisma.groupMember.deleteMany({
          where: { userId: { in: userIds } },
        });
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
        await prisma.match.deleteMany({ where: { id: { in: matchIds } } });
      }
    },
    60000,
  );

  (process.env.NGCS_READ_WRITE_BENCH === 'true' ? it : it.skip)(
    'measures mixed attendance writes and isolated SELECT row work',
    async () => {
      await app.listen(0, '127.0.0.1');
      const baseUrl = await app.getUrl();
      const extraUsers = Array.from(
        { length: 298 },
        (_, i) => `${prefix}-rw-user-${i}`,
      );
      const extraPlans = Array.from(
        { length: 1350 },
        (_, i) => `${prefix}-rw-plan-${i}`,
      );
      const read = (path: string, query: Record<string, string> = {}) =>
        request(baseUrl)
          .get(path)
          .set('Authorization', `Bearer ${coachToken}`)
          .query(query)
          .expect(200);
      const write = (
        target: string,
        status: 'PRESENT' | 'ABSENT',
        token = coachToken,
        planId = planIds[0],
      ) =>
        request(baseUrl)
          .post('/attendance')
          .set('Authorization', `Bearer ${token}`)
          .send({ planId, playerId: target, status });
      const paths = () => [
        read('/training-plans/catalog/page', { groupId, seasonId, limit: '3' }),
        read('/drills/catalog/page', { groupId, limit: '1' }),
        read(`/groups/${groupId}/members/players/page`),
        read('/attendance/page', { planId: planIds[0] }),
        read(`/training-plans/${planIds[0]}/editor-metadata`),
      ];
      type ExplainNode = {
        'Node Type': string;
        'Relation Name'?: string;
        'Actual Rows': number;
        'Actual Loops': number;
        'Rows Removed by Filter'?: number;
        'Rows Removed by Join Filter'?: number;
        'Shared Hit Blocks'?: number;
        'Shared Read Blocks'?: number;
        Plans?: ExplainNode[];
      };
      const rowWork = async (
        label: string,
        operation: () => ReturnType<typeof read>,
      ) => {
        captured.length = 0;
        capture = true;
        try {
          await operation();
        } finally {
          capture = false;
        }
        const selects = captured.filter((sample) =>
          sample.query.startsWith('SELECT'),
        );
        expect(selects.length).toBeGreaterThan(0);
        const plans: unknown[] = [];
        for (const sample of selects) {
          // Replay only trusted SELECT statements; never EXPLAIN ANALYZE a write.
          const explained = await prisma.$queryRawUnsafe<
            Array<{
              'QUERY PLAN': Array<{
                Plan: ExplainNode;
                'Execution Time': number;
              }>;
            }>
          >(
            `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sample.query}`,
            ...(JSON.parse(sample.params) as unknown[]).map((value) =>
              typeof value === 'string' && /^\d{4}-\d{2}-\d{2}[T ]/.test(value)
                ? new Date(value)
                : value,
            ),
          );
          const { Plan: root, 'Execution Time': executionMs } =
            explained[0]['QUERY PLAN'][0];
          const nodes: ExplainNode[] = [];
          const visit = (node: ExplainNode) => {
            nodes.push(node);
            node.Plans?.forEach(visit);
          };
          visit(root);
          plans.push({
            root: root['Node Type'],
            rows: root['Actual Rows'],
            executionMs,
            relations: [
              ...new Set(
                nodes.flatMap((node) =>
                  node['Relation Name'] ? [node['Relation Name']] : [],
                ),
              ),
            ],
            scanRowEmissions: nodes
              .filter((node) => node['Relation Name'])
              .reduce(
                (sum, node) => sum + node['Actual Rows'] * node['Actual Loops'],
                0,
              ),
            filteredRowEmissions: nodes.reduce(
              (sum, node) =>
                sum +
                ((node['Rows Removed by Filter'] ?? 0) +
                  (node['Rows Removed by Join Filter'] ?? 0)) *
                  node['Actual Loops'],
              0,
            ),
            sharedHits: root['Shared Hit Blocks'] ?? 0,
            sharedReads: root['Shared Read Blocks'] ?? 0,
          });
        }
        return { label, plans };
      };
      const records: unknown[] = [];
      const quantile = (values: number[], fraction: number) =>
        Number(
          [...values]
            .sort((a, b) => a - b)
            [Math.ceil(values.length * fraction) - 1].toFixed(2),
        );
      try {
        for (const players of [30, 300]) {
          const additions =
            players === 30 ? extraUsers.slice(0, 28) : extraUsers.slice(28);
          await prisma.user.createMany({
            data: additions.map((id) => ({
              id,
              name: 'Synthetic RW player',
              email: `${id}@example.test`,
              role: 'PLAYER',
              clubId,
              passwordHash: 'not-a-login-credential',
            })),
          });
          await prisma.groupMember.createMany({
            data: additions.map((userId) => ({ groupId, userId })),
          });
          await prisma.attendance.createMany({
            data: additions.map((playerId) => ({
              planId: planIds[0],
              playerId,
              status: 'PRESENT',
            })),
          });
          if (players === 300) {
            await prisma.trainingPlan.createMany({
              data: extraPlans.map((id) => ({
                id,
                clubId,
                groupId,
                coachId,
                title: 'Synthetic RW plan',
                date: new Date('2026-09-01'),
                totalDuration: 60,
              })),
            });
            await prisma.planDrill.createMany({
              data: extraPlans.flatMap((trainingPlanId) =>
                [0, 1].map((order) => ({
                  trainingPlanId,
                  drillId: `${prefix}-drill`,
                  phase: 'WARM_UP',
                  order,
                })),
              ),
            });
            await prisma.attendance.createMany({
              data: extraPlans.flatMap((planId) =>
                [playerId, extraUsers[0]].map((playerId) => ({
                  planId,
                  playerId,
                  status: 'PRESENT',
                })),
              ),
            });
          }
          await prisma.attendance.updateMany({
            where: { planId: planIds[0] },
            data: { status: 'PRESENT' },
          });
          await prisma.$executeRaw`ANALYZE "User", "GroupMember", "TrainingPlan", "PlanDrill", "Attendance", "Drill"`;
          const selectedPlans = players === 30 ? 150 : 1500;
          const round = async (status: 'PRESENT' | 'ABSENT') => {
            const responses = await Promise.all([
              ...paths(),
              write(playerId, status).expect(201),
              write(extraUsers[0], status).expect(201),
            ]);
            expect(responses[0].body.summary.total).toBe(selectedPlans);
            expect(responses[0].body.items).toHaveLength(3);
            expect(responses[2].body.total).toBe(players);
            expect(responses[3].body.total).toBe(players);
            // Concurrent reads may precede either write; only stable membership totals are asserted here.
            expect(responses[3].body.presentTotal).toBeGreaterThanOrEqual(
              players - 2,
            );
            expect(responses[3].body.presentTotal).toBeLessThanOrEqual(players);
            expect(responses[4].body.drills).toHaveLength(2);
            expect(responses[4].body).not.toHaveProperty('attendance');
            for (const response of responses.slice(5))
              expect(response.body.status).toBe(status);
            return responses.map((response) =>
              Buffer.byteLength(JSON.stringify(response.body)),
            );
          };
          await round('PRESENT');
          const times: number[] = [],
            counts: number[] = [],
            maxBytes: number[] = [];
          for (let sample = 0; sample < 10; sample++) {
            const status = sample % 2 === 0 ? 'ABSENT' : 'PRESENT';
            captured.length = 0;
            capture = true;
            const start = performance.now();
            let bytes: number[];
            try {
              bytes = await round(status);
            } finally {
              capture = false;
            }
            times.push(performance.now() - start);
            counts.push(captured.length);
            expect(captured.length).toBeLessThanOrEqual(80); // Fixture regression guard, not an API/SLO budget.
            bytes.forEach((value, index) => {
              maxBytes[index] = Math.max(maxBytes[index] ?? 0, value);
            });
            const settled = (
              await read('/attendance/page', { planId: planIds[0] })
            ).body;
            expect(settled.presentTotal).toBe(
              status === 'PRESENT' ? players : players - 2,
            );
            expect(
              await prisma.attendance.count({ where: { planId: planIds[0] } }),
            ).toBe(players);
          }
          // Same-key contention: one row, no claim about order of concurrent completion.
          await Promise.all([
            write(playerId, 'PRESENT').expect(201),
            write(playerId, 'ABSENT').expect(201),
          ]);
          expect(
            await prisma.attendance.count({
              where: { planId: planIds[0], playerId },
            }),
          ).toBe(1);
          await write(playerId, 'PRESENT').expect(201);
          expect(
            (await read('/attendance/page', { planId: planIds[0] })).body
              .presentTotal,
          ).toBe(players);
          const plans = await rowWork('training catalog', () =>
            read('/training-plans/catalog/page', {
              groupId,
              seasonId,
              limit: '3',
            }),
          );
          const attendance = await rowWork('attendance page', () =>
            read('/attendance/page', { planId: planIds[0] }),
          );
          records.push({
            players,
            selectedPlans,
            samples: 10,
            concurrentReads: 5,
            concurrentWrites: 2,
            p50BatchMs: quantile(times, 0.5),
            p95BatchMs: quantile(times, 0.95),
            maxBatchQueries: Math.max(...counts),
            maxResponseBytes: maxBytes,
            storedPhases: await prisma.planDrill.count({
              where: { trainingPlan: { clubId } },
            }),
            storedAttendance: await prisma.attendance.count({
              where: { plan: { clubId } },
            }),
            rowWork: [plans, attendance],
          });
        }
        await write(playerId, 'ABSENT', playerToken).expect(403);
        const hidden = await prisma.trainingPlan.findFirstOrThrow({
          where: { groupId: hiddenGroupId },
        });
        await write(playerId, 'ABSENT', coachToken, hidden.id).expect(403);
        expect(
          await prisma.attendance.count({ where: { planId: hidden.id } }),
        ).toBe(0);
        console.info(
          'BL043_READ_WRITE_ROW_WORK',
          JSON.stringify({
            version: 1,
            node: process.version,
            persistentSessions: false,
            readOrder: [
              'plans',
              'drills',
              'members',
              'attendance',
              'editorMetadata',
            ],
            records,
          }),
        );
      } finally {
        capture = false;
      }
      // Existing suite cleanup deletes only its synthetic club's rows, including these additions.
    },
    60_000,
  );

  it('measures exact generated SELECT plans and revokes current group access on subsequent reads', async () => {
    const elapsed: number[] = [];
    let bytes = 0;
    let queryCount = 0;
    let querySamples: typeof captured = [];
    for (let i = 0; i < 20; i++) {
      captured.length = 0;
      capture = true;
      const start = performance.now();
      const response = await get({ groupId, seasonId }).expect(200);
      elapsed.push(performance.now() - start);
      capture = false;
      queryCount = Math.max(queryCount, captured.length);
      querySamples = [...captured];
      bytes = Buffer.byteLength(JSON.stringify(response.body));
    }
    expect(queryCount).toBeLessThanOrEqual(10);
    const planSummaries: unknown[] = [];
    for (const sample of querySamples.filter(
      (q) => q.query.startsWith('SELECT') && q.query.includes('"TrainingPlan"'),
    )) {
      // SQL is captured from this trusted Prisma request, never user input.
      // Parameters remain in memory and are not printed or persisted.
      const result = await prisma.$queryRawUnsafe<any[]>(
        `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${sample.query}`,
        ...(JSON.parse(sample.params) as unknown[]).map((value) =>
          typeof value === 'string' && /^\d{4}-\d{2}-\d{2}[T ]/.test(value)
            ? new Date(value)
            : value,
        ),
      );
      const plan = result[0]['QUERY PLAN'][0];
      const nodes: Array<{
        node: string;
        relation?: string;
        rows: number;
        loops: number;
        sharedHits: number;
      }> = [];
      const visit = (n: any) => {
        nodes.push({
          node: n['Node Type'],
          relation: n['Relation Name'],
          rows: n['Actual Rows'],
          loops: n['Actual Loops'],
          sharedHits: n['Shared Hit Blocks'],
        });
        (n.Plans ?? []).forEach(visit);
      };
      visit(plan.Plan);
      planSummaries.push({ executionMs: plan['Execution Time'], nodes });
    }
    expect(planSummaries.length).toBeGreaterThanOrEqual(3);
    elapsed.sort((a, b) => a - b);
    const legacy = (
      await request(app.getHttpServer())
        .get('/training-plans')
        .set('Authorization', `Bearer ${coachToken}`)
        .query({ groupId })
        .expect(200)
    ).body;
    console.info(
      'BL043_TRAINING_CATALOG_MEASUREMENT',
      JSON.stringify({
        fixturePlans: 152,
        phases: 240,
        attendanceRows: 240,
        samples: 20,
        p50Ms: +elapsed[9].toFixed(2),
        p95Ms: +elapsed[18].toFixed(2),
        maxQueries: queryCount,
        pageBytes: bytes,
        legacyAllSeasonsBytes: Buffer.byteLength(JSON.stringify(legacy)),
        plans: planSummaries,
      }),
    );
    await prisma.groupMember.deleteMany({
      where: { userId: { in: [coachId, playerId] }, groupId },
    });
    await get({ groupId, seasonId }).expect(403);
    await get({ groupId, seasonId }, playerToken).expect(403);
    for (const token of [coachToken, playerToken])
      await request(app.getHttpServer())
        .get('/matches/catalog/page')
        .set('Authorization', `Bearer ${token}`)
        .query({ groupId, seasonId })
        .expect(403);
    for (const token of [coachToken, playerToken])
      await request(app.getHttpServer())
        .get('/matches/catalog/detail/revoked')
        .set('Authorization', `Bearer ${token}`)
        .query({ groupId, seasonId })
        .expect(403);
  }, 60000);
});
