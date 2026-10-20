import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { configureBodyParsers } from '../src/tactics/tactical-body-parser';
import { ClubSetupService } from '../src/sporting/club-setup.service';
import { PlanningService } from '../src/planning/planning.service';
import { planningClock } from '../src/planning/planning-automation';
import type { AuthPrincipal } from '../src/auth/auth-principal';
import type { Prisma } from '@prisma/client';

// These PostgreSQL cases create and verify complete ten-team programs.
jest.setTimeout(30_000);

describe('weekly planning (exact dedicated PostgreSQL)', () => {
  let app: INestApplication, db: PrismaService, admin: AuthPrincipal;
  let adminToken: string, playerToken: string, foreignToken: string;
  let seasonIds: string[], clubId: string, groupId: string;
  const post = (path: string, body: object, token = adminToken) =>
    request(app.getHttpServer())
      .post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  const get = (path: string, token = adminToken) =>
    request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);
  const program = () => ({ weekStart: '2026-10-19', seasonIds });
  beforeAll(async () => {
    jest.spyOn(planningClock, 'today').mockReturnValue('2026-10-19');
    const url = process.env.TEST_DATABASE_URL;
    if (
      !url ||
      new URL(url).pathname !== '/ngcs_week_planning_test' ||
      !['localhost', '127.0.0.1'].includes(new URL(url).hostname)
    )
      throw new Error('Exact dedicated weekly test database required');
    process.env.DATABASE_URL = url;
    process.env.JWT_SECRET = randomUUID() + randomUUID();
    process.env.PERSISTENT_SESSIONS_ENABLED = 'false';
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ bodyParser: false });
    configureBodyParsers(app);
    await app.init();
    db = app.get(PrismaService);
    const user = await db.user.create({
      data: {
        name: 'TEST planner',
        email: `${randomUUID()}@example.test`,
        passwordHash: randomUUID(),
        role: 'SYSTEM_ADMIN',
        status: 'ACTIVE',
      },
    });
    admin = {
      id: user.id,
      userId: user.id,
      email: user.email,
      role: user.role,
      clubId: user.clubId,
    };
    adminToken = app
      .get(JwtService)
      .sign({ sub: user.id, ver: user.authVersion });
    const foreign = await db.club.create({ data: { name: 'TEST foreign' } });
    for (const role of ['PLAYER', 'CLUB_ADMIN'] as const) {
      const u = await db.user.create({
        data: {
          name: 'TEST role',
          email: `${randomUUID()}@example.test`,
          passwordHash: randomUUID(),
          role,
          status: 'ACTIVE',
          clubId: foreign.id,
        },
      });
      const token = app.get(JwtService).sign({ sub: u.id, ver: u.authVersion });
      if (role === 'PLAYER') playerToken = token;
      else foreignToken = token;
    }
  });
  beforeEach(async () => {
    const created = await app.get(ClubSetupService).create(admin, {
      requestId: randomUUID(),
      club: {
        name: `TEST weekly ${randomUUID()}`,
        primaryColor: '#0878ed',
        secondaryColor: '#0a203b',
      },
      season: {
        name: '2026-2027',
        startDate: '2026-08-14',
        endDate: '2027-05-23',
      },
      firstTeam: { name: 'A Takım', ageGroupLabel: 'SENIOR' },
      academyTeams: Array.from({ length: 9 }, (_, i) => ({
        key: `u${i + 8}`,
        name: `U${i + 8}`,
        ageGroupLabel: `U${i + 8}`,
      })),
      staff: [],
    });
    clubId = created.clubId;
    groupId = created.firstTeamId;
    seasonIds = (
      await db.season.findMany({ where: { clubId }, orderBy: { id: 'asc' } })
    ).map((s) => s.id);
    const senior = await db.season.findFirstOrThrow({ where: { groupId } });
    await db.match.createMany({
      data: [
        {
          seasonId: senior.id,
          groupId,
          date: new Date('2026-10-18T16:00:00+03:00'),
          opponent: 'TEST previous',
          location: 'Example',
        },
        {
          seasonId: senior.id,
          groupId,
          date: new Date('2026-10-25T16:00:00+03:00'),
          opponent: 'TEST next',
          location: 'Example',
        },
      ],
    });
  });
  afterAll(async () => {
    await app?.close();
  });
  it('rechecks coach assignment before apply and never widens to another team', async () => {
    const season = await db.season.findUniqueOrThrow({
      where: { id: seasonIds[0] },
    });
    const coach = await db.user.create({
      data: {
        name: 'TEST coach',
        email: `${randomUUID()}@example.test`,
        passwordHash: randomUUID(),
        clubId,
        role: 'COACH',
      },
    });
    const member = await db.groupMember.create({
      data: { userId: coach.id, groupId: season.groupId },
    });
    const token = app
      .get(JwtService)
      .sign({ sub: coach.id, ver: coach.authVersion });
    const selected = { ...program(), seasonIds: [season.id] };
    const preview = (
      await post('/planning/week/preview', selected, token).expect(201)
    ).body;
    await post('/planning/week/preview', program(), token).expect(403);
    await db.groupMember.delete({ where: { id: member.id } });
    await post(
      '/planning/week/apply',
      {
        requestId: randomUUID(),
        previewToken: preview.token,
        program: selected,
      },
      token,
    ).expect(403);
    expect(await db.trainingPlan.count({ where: { clubId } })).toBe(0);
  });
  it('creates a manual recovery with four real phases and hides private meetings from calendar reads', async () => {
    const selected = await db.season.findUniqueOrThrow({
      where: { id: seasonIds[0] },
      include: { group: true },
    });
    const body = {
      requestId: randomUUID(),
      seasonId: selected.id,
      kind: 'RECOVERY',
      title: 'TEST toparlanma',
      startsAt: '2026-10-20T12:00:00+03:00',
      duration: 40,
      notes: 'Example',
    };
    const result = (await post('/planning/events', body).expect(201)).body;
    const plan = await db.trainingPlan.findUniqueOrThrow({
      where: { id: result.planIds[0] },
      include: { drills: { include: { drill: true } }, dayPlans: true },
    });
    expect(plan.drills).toHaveLength(4);
    expect(
      plan.drills.every((d) => d.drill.ageGroup === selected.group.ageGroup),
    ).toBe(true);
    expect(plan.dayPlans[0].type).toBe('RECOVERY');
    await db.dayPlan.create({
      data: {
        weekId: plan.dayPlans[0].weekId,
        dayOfWeek: 2,
        date: new Date('2026-10-20T15:00:00+03:00'),
        type: 'GORUSME',
        title: 'PRIVATE TEST',
      },
    });
    const page = (
      await get(
        `/planning/events/page?groupId=${selected.groupId}&seasonId=${selected.id}&from=2026-10-20T00:00:00Z&until=2026-10-21T00:00:00Z`,
      ).expect(200)
    ).body;
    expect(page.summary.trainingMinutes).toBe(40);
    expect(page.items).toHaveLength(1);
    expect(page.items[0].kind).toBe('RECOVERY');
    await get(
      `/planning/events/page?groupId=${selected.groupId}&from=2026-10-20T00:00:00Z&until=2026-10-21T00:00:00Z&after=invalid`,
    ).expect(400);
  });
  it('enforces anonymous/player/foreign club boundaries on preview, writes and catalog', async () => {
    await request(app.getHttpServer())
      .post('/planning/week/preview')
      .send(program())
      .expect(401);
    await post('/planning/week/preview', program(), playerToken).expect(403);
    await post('/planning/week/preview', program(), foreignToken).expect(403);
    await get(
      `/planning/events/page?groupId=${groupId}&from=2026-10-19T00:00:00Z&until=2026-10-20T00:00:00Z`,
      foreignToken,
    ).expect(403);
  });
  it('previews without writes and atomically creates ten age-specific programs, preserving fixtures/accounts', async () => {
    const beforeUsers = await db.user.count(),
      beforeMatches = await db.match.findMany({
        where: { season: { clubId } },
        orderBy: { id: 'asc' },
      });
    const preview = (
      await post('/planning/week/preview', program()).expect(201)
    ).body;
    expect(preview.conflicts).toEqual([]);
    expect(preview.teams).toHaveLength(10);
    expect(await db.trainingPlan.count({ where: { clubId } })).toBe(0);
    const body = {
      requestId: randomUUID(),
      previewToken: preview.token,
      program: program(),
    };
    const responses = await Promise.all(
      Array.from({ length: 4 }, () => post('/planning/week/apply', body)),
    );
    expect(responses.map((r) => r.status)).toEqual([201, 201, 201, 201]);
    const result = responses[0].body;
    for (const response of responses) expect(response.body).toEqual(result);
    expect(result.trainingCount).toBe(51);
    expect(result.teamCount).toBe(10);
    expect(result.meetingCount).toBe(13);
    expect(await db.trainingPlan.count({ where: { clubId } })).toBe(51);
    expect(
      await db.planDrill.count({ where: { trainingPlan: { clubId } } }),
    ).toBe(204);
    const plans = await db.trainingPlan.findMany({
      where: { clubId },
      include: { drills: { include: { drill: true } }, dayPlans: true },
    });
    for (const p of plans) {
      expect(p.drills.reduce((s, d) => s + d.drill.durationMin, 0)).toBe(
        p.totalDuration,
      );
      expect(
        p.drills.every(
          (d) =>
            d.drill.scope === 'CLUB' &&
            d.drill.clubId === clubId &&
            d.notes?.includes('Koçluk:'),
        ),
      ).toBe(true);
      expect(p.dayPlans).toHaveLength(1);
    }
    expect(await db.user.count()).toBe(beforeUsers);
    expect(
      await db.match.findMany({
        where: { season: { clubId } },
        orderBy: { id: 'asc' },
      }),
    ).toEqual(beforeMatches);
    const recreated = new PlanningService(db);
    expect(await recreated.status(admin, body.requestId)).toEqual(result);
    expect(await recreated.apply(admin, body)).toEqual(result);
    await post('/planning/week/apply', {
      ...body,
      program: {
        ...program(),
        overrides: [{ key: preview.teams[0].events[0].key, excluded: true }],
      },
    }).expect(409);
    const second = (await post('/planning/week/preview', program()).expect(201))
      .body;
    expect(second.conflicts.length).toBeGreaterThan(0);
    await post('/planning/week/apply', {
      requestId: randomUUID(),
      previewToken: second.token,
      program: program(),
    }).expect(409);
    const season = await db.season.findFirstOrThrow({ where: { groupId } });
    const path = `/planning/events/page?groupId=${groupId}&seasonId=${season.id}&from=2026-10-19T00:00:00%2B03:00&until=2026-10-26T00:00:00%2B03:00&limit=2`;
    const first = (await get(path).expect(200)).body;
    expect(first.items).toHaveLength(2);
    expect(first.summary.trainingCount).toBe(11);
    expect(first.summary.meetingCount).toBe(4);
    expect(first.summary.matchCount).toBe(1);
    const next = (await get(`${path}&after=${first.nextCursor}`).expect(200))
      .body;
    expect(first.items[1].date <= next.items[0].date).toBe(true);
    expect(next.summary).toEqual(first.summary);
    expect(first.summary.total).toBe(17);
    expect(await db.weekPlan.count({ where: { season: { clubId } } })).toBe(20);
  });
  it('clips partial season weeks but rejects edits moved outside season boundaries', async () => {
    const first = { weekStart: '2026-08-10', seasonIds };
    const preview = (await post('/planning/week/preview', first).expect(201))
      .body;
    expect(preview.conflicts).toEqual([]);
    const events = preview.teams.flatMap(
      (t: { events: { startsAt: string; key: string }[] }) => t.events,
    );
    expect(events.length).toBeGreaterThan(0);
    expect(
      events.every(
        (e: { startsAt: string }) => e.startsAt >= '2026-08-13T21:00:00.000Z',
      ),
    ).toBe(true);
    const moved = (
      await post('/planning/week/preview', {
        ...first,
        overrides: [
          { key: events[0].key, startsAt: '2026-08-12T17:00:00+03:00' },
        ],
      }).expect(201)
    ).body;
    expect(moved.conflicts.length).toBeGreaterThan(0);
    const body = {
      requestId: randomUUID(),
      previewToken: preview.token,
      program: first,
    };
    await post('/planning/week/apply', body).expect(201);
    expect(
      (await post('/planning/week/apply', body).expect(201)).body.requestId,
    ).toBe(body.requestId);
    expect(
      await db.dayPlan.count({
        where: {
          week: { season: { clubId } },
          date: { lt: new Date('2026-08-14T00:00:00+03:00') },
        },
      }),
    ).toBe(0);
    await db.season.updateMany({
      where: { clubId },
      data: { endDate: new Date('2027-05-19T00:00:00+03:00') },
    });
    const last = { weekStart: '2027-05-17', seasonIds };
    const final = (await post('/planning/week/preview', last).expect(201)).body;
    expect(final.conflicts).toEqual([]);
    expect(
      final.teams
        .flatMap((t: { events: { startsAt: string }[] }) => t.events)
        .every(
          (e: { startsAt: string }) => e.startsAt < '2027-05-19T21:00:00.000Z',
        ),
    ).toBe(true);
    await post('/planning/week/apply', {
      requestId: randomUUID(),
      previewToken: final.token,
      program: last,
    }).expect(201);
  });
  it('rejects stale previews, unknown overrides and overlapping edits without writes', async () => {
    let preview = (await post('/planning/week/preview', program())).body;
    const match = await db.match.findFirstOrThrow({
      where: { season: { clubId } },
    });
    await db.match.update({
      where: { id: match.id },
      data: { notes: 'changed' },
    });
    await post('/planning/week/apply', {
      requestId: randomUUID(),
      previewToken: preview.token,
      program: program(),
    }).expect(409);
    const row = preview.teams.find(
      (t: { ageGroup: string }) => t.ageGroup === 'SENIOR',
    ).events;
    const overridden = {
      ...program(),
      overrides: [{ key: row[1].key, startsAt: row[0].startsAt }],
    };
    preview = (await post('/planning/week/preview', overridden).expect(201))
      .body;
    expect(preview.conflicts.length).toBeGreaterThan(0);
    await post('/planning/week/apply', {
      requestId: randomUUID(),
      previewToken: preview.token,
      program: overridden,
    }).expect(409);
    await post('/planning/week/preview', {
      ...program(),
      overrides: [{ key: 'foreign-row', excluded: true }],
    }).expect(400);
    expect(await db.trainingPlan.count({ where: { clubId } })).toBe(0);
  });
  it('rolls back all phases, plans, days and weeks when the final audit fails', async () => {
    const preview = (
      await post('/planning/week/preview', program()).expect(201)
    ).body;
    const original = db.$transaction.bind(db);
    const spy = jest.spyOn(db, '$transaction').mockImplementation(((
      work: (tx: unknown) => Promise<unknown>,
      options: unknown,
    ) =>
      original(async (tx) => {
        const audit = tx.securityAuditEvent.create.bind(tx.securityAuditEvent);
        tx.securityAuditEvent.create = ((
          args: Prisma.SecurityAuditEventCreateArgs,
        ) => {
          if (args.data.id?.startsWith('planning_request_'))
            throw new Error('TEST injected late audit failure');
          return audit(args);
        }) as typeof tx.securityAuditEvent.create;
        return work(tx);
      }, options as never)) as typeof db.$transaction);
    try {
      await post('/planning/week/apply', {
        requestId: randomUUID(),
        previewToken: preview.token,
        program: program(),
      }).expect(500);
    } finally {
      spy.mockRestore();
    }
    expect(await db.trainingPlan.count({ where: { clubId } })).toBe(0);
    expect(await db.drill.count({ where: { clubId } })).toBe(0);
    expect(await db.weekPlan.count({ where: { season: { clubId } } })).toBe(0);
  });
  it('creates/replays/edits/removes a meeting; excludes its duration and rejects physical conversion', async () => {
    const event = {
      requestId: randomUUID(),
      seasonId: seasonIds[0],
      kind: 'TOPLANTI',
      title: 'TEST meeting',
      startsAt: '2026-10-20T15:00:00+03:00',
      duration: 25,
      notes: 'Example',
      location: 'Meeting area',
      topic: 'Team goals',
    };
    const result = (await post('/planning/events', event).expect(201)).body;
    expect((await post('/planning/events', event).expect(201)).body).toEqual(
      result,
    );
    const edit = { ...event, requestId: undefined };
    await request(app.getHttpServer())
      .put(`/planning/events/${result.eventIds[0]}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...edit,
        startsAt: '2026-10-20T16:00:00+03:00',
        topic: 'Updated agenda',
      })
      .expect(200);
    await request(app.getHttpServer())
      .put(`/planning/events/${result.eventIds[0]}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ ...edit, kind: 'TRAINING' })
      .expect(400);
    const season = await db.season.findUniqueOrThrow({
      where: { id: event.seasonId },
    });
    const page = (
      await get(
        `/planning/events/page?groupId=${season.groupId}&seasonId=${season.id}&from=2026-10-20T00:00:00Z&until=2026-10-21T00:00:00Z`,
      ).expect(200)
    ).body;
    expect(page.summary.trainingMinutes).toBe(0);
    expect(page.items[0].topic).toBe('Updated agenda');
    await request(app.getHttpServer())
      .delete(`/planning/events/${result.eventIds[0]}`)
      .set('Authorization', `Bearer ${foreignToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/planning/events/${result.eventIds[0]}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  async function managedWeeks(weeks = ['2026-10-19']) {
    const senior = await db.season.findFirstOrThrow({ where: { groupId } });
    const fixture = await db.match.findFirstOrThrow({
      where: { seasonId: senior.id, opponent: 'TEST next' },
    });
    for (const weekStart of weeks) {
      const input = { weekStart, seasonIds: [senior.id] };
      const preview = (await post('/planning/week/preview', input).expect(201))
        .body;
      expect(preview.conflicts).toEqual([]);
      await post('/planning/week/apply', {
        requestId: randomUUID(),
        previewToken: preview.token,
        program: input,
      }).expect(201);
    }
    return { senior, fixture };
  }
  const changeFixture = (id: string, date: string, token = adminToken) =>
    request(app.getHttpServer())
      .put(`/seasons/matches/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ date });
  async function programRows() {
    return {
      plans: await db.trainingPlan.findMany({
        where: { clubId },
        include: { drills: { orderBy: { id: 'asc' } }, dayPlans: true },
        orderBy: { id: 'asc' },
      }),
      days: await db.dayPlan.findMany({
        where: { week: { season: { clubId } } },
        orderBy: { id: 'asc' },
      }),
      audits: await db.securityAuditEvent.findMany({
        where: { clubId },
        orderBy: { id: 'asc' },
      }),
      matches: await db.match.findMany({
        where: { season: { clubId } },
        orderBy: { id: 'asc' },
      }),
    };
  }
  it.each([2, 3, 4, 5])(
    'preserves explicit preview time overrides during a %i-match reschedule',
    async (fixtureCount) => {
      const senior = await db.season.findFirstOrThrow({ where: { groupId } });
      if (fixtureCount >= 3)
        await db.match.create({
          data: {
            seasonId: senior.id,
            groupId,
            opponent: 'TEST early',
            location: 'Example',
            date: new Date('2026-10-19T16:00:00+03:00'),
          },
        });
      if (fixtureCount >= 4)
        await db.match.create({
          data: {
            seasonId: senior.id,
            groupId,
            opponent: 'TEST extra',
            location: 'Example',
            date: new Date('2026-10-20T16:00:00+03:00'),
          },
        });
      if (fixtureCount === 5)
        await db.match.create({
          data: {
            seasonId: senior.id,
            groupId,
            opponent: 'TEST fifth',
            location: 'Example',
            date: new Date('2026-10-22T20:00:00+03:00'),
          },
        });
      const midweek = await db.match.create({
        data: {
          seasonId: senior.id,
          groupId,
          opponent: 'TEST midweek',
          location: 'Example',
          date: new Date('2026-10-21T16:00:00+03:00'),
        },
      });
      const input = { weekStart: '2026-10-19', seasonIds: [senior.id] };
      const base = (await post('/planning/week/preview', input).expect(201))
        .body;
      const activation = base.teams[0].events.find(
        (e: { title: string; startsAt: string }) =>
          e.title === 'Maç günü hafif aktivasyon' &&
          e.startsAt === '2026-10-21T07:00:00.000Z',
      );
      const edited = {
        ...input,
        overrides: [
          { key: activation.key, startsAt: '2026-10-21T08:00:00.000Z' },
        ],
      };
      const preview = (await post('/planning/week/preview', edited).expect(201))
        .body;
      await post('/planning/week/apply', {
        requestId: randomUUID(),
        previewToken: preview.token,
        program: edited,
      }).expect(201);
      const plan = await db.trainingPlan.findFirstOrThrow({
        where: { clubId, date: new Date('2026-10-21T11:00:00+03:00') },
        include: { drills: { orderBy: { id: 'asc' } }, dayPlans: true },
      });
      const result = (
        await changeFixture(midweek.id, '2026-10-21T18:00:00+03:00').expect(200)
      ).body;
      expect(result.planningSync.protected).toBeGreaterThanOrEqual(1);
      expect(
        await db.trainingPlan.findUniqueOrThrow({
          where: { id: plan.id },
          include: { drills: { orderBy: { id: 'asc' } }, dayPlans: true },
        }),
      ).toEqual(plan);
    },
  );
  it('automatically shifts kickoff-relative sessions, preserving IDs/phases, and same-date saves do not repeat', async () => {
    const { fixture } = await managedWeeks();
    const activation = await db.trainingPlan.findFirstOrThrow({
      where: { clubId, title: 'Maç günü hafif aktivasyon' },
      include: { drills: { orderBy: { id: 'asc' } } },
    });
    const result = (
      await changeFixture(fixture.id, '2026-10-25T18:00:00+03:00').expect(200)
    ).body;
    expect(result.planningSync.updated).toBe(2);
    expect(result.planningSync.created).toBe(0);
    const updated = await db.trainingPlan.findUniqueOrThrow({
      where: { id: activation.id },
      include: { drills: { orderBy: { id: 'asc' } }, dayPlans: true },
    });
    expect(updated.date?.toISOString()).toBe('2026-10-25T09:00:00.000Z');
    expect(updated.dayPlans[0].date).toEqual(updated.date);
    expect(updated.drills).toEqual(activation.drills);
    const before = await programRows();
    expect(
      (await changeFixture(fixture.id, '2026-10-25T18:00:00+03:00').expect(200))
        .body.planningSync,
    ).toBeUndefined();
    const after = await programRows();
    expect(after.plans).toEqual(before.plans);
    expect(after.days).toEqual(before.days);
    expect(after.audits).toEqual(before.audits);
  });
  it('preserves edited physical phases and meetings, manual events and deletion tombstones', async () => {
    const { fixture } = await managedWeeks();
    const phase = await db.planDrill.findFirstOrThrow({
      where: {
        trainingPlan: { clubId, date: new Date('2026-10-20T10:00:00+03:00') },
      },
    });
    await db.planDrill.update({
      where: { id: phase.id },
      data: { notes: 'TEST manual coaching instruction' },
    });
    const meeting = await db.dayPlan.findFirstOrThrow({
      where: { week: { season: { clubId } }, title: 'Maç toplantısı' },
    });
    await db.dayPlan.update({
      where: { id: meeting.id },
      data: { topic: 'TEST manual agenda' },
    });
    const deleted = await db.dayPlan.findFirstOrThrow({
      where: { week: { season: { clubId } }, title: 'Maç planı toplantısı' },
    });
    await db.dayPlan.delete({ where: { id: deleted.id } });
    const beforePhase = await db.planDrill.findUnique({
      where: { id: phase.id },
    });
    const beforeMeeting = await db.dayPlan.findUnique({
      where: { id: meeting.id },
    });
    const result = (
      await changeFixture(fixture.id, '2026-10-25T18:00:00+03:00').expect(200)
    ).body;
    expect(result.planningSync.protected).toBeGreaterThanOrEqual(3);
    expect(await db.planDrill.findUnique({ where: { id: phase.id } })).toEqual(
      beforePhase,
    );
    expect(await db.dayPlan.findUnique({ where: { id: meeting.id } })).toEqual(
      beforeMeeting,
    );
    expect(
      await db.dayPlan.count({
        where: { week: { season: { clubId } }, title: 'Maç planı toplantısı' },
      }),
    ).toBe(0);
    // At19:00 activation would overlap the protected13:00 meeting; it must fail.
    await changeFixture(fixture.id, '2026-10-25T19:00:00+03:00').expect(409);
    await changeFixture(fixture.id, '2026-10-25T17:00:00+03:00').expect(200);
    expect(
      await db.dayPlan.count({
        where: { week: { season: { clubId } }, title: 'Maç planı toplantısı' },
      }),
    ).toBe(0);
  });
  it('rebuilds both enrolled weeks when a fixture moves across Monday without touching academy', async () => {
    const { fixture, senior } = await managedWeeks([
      '2026-10-19',
      '2026-10-26',
    ]);
    const oldDrills = await db.drill.findMany({
      where: { clubId },
      orderBy: { id: 'asc' },
    });
    const result = (
      await changeFixture(fixture.id, '2026-10-26T18:00:00+03:00').expect(200)
    ).body;
    expect(result.planningSync.weeks).toEqual(['2026-10-19', '2026-10-26']);
    expect(result.planningSync.updated).toBeGreaterThan(0);
    const rows = await db.trainingPlan.findMany({
      where: { clubId },
      include: {
        drills: { include: { drill: true } },
        dayPlans: { include: { week: true } },
      },
    });
    for (const plan of rows) {
      expect(plan.groupId).toBe(groupId);
      expect(plan.drills).toHaveLength(4);
      expect(plan.drills.reduce((sum, p) => sum + p.drill.durationMin, 0)).toBe(
        plan.totalDuration,
      );
      expect(plan.dayPlans).toHaveLength(1);
      expect(plan.dayPlans[0].week.seasonId).toBe(senior.id);
      expect(plan.dayPlans[0].date).toEqual(plan.date);
      expect(
        plan.date! >= plan.dayPlans[0].week.startDate &&
          plan.date! <= plan.dayPlans[0].week.endDate,
      ).toBe(true);
    }
    expect(
      await db.trainingPlan.count({
        where: {
          clubId,
          title: 'Toparlanma ve mobilite',
          date: new Date('2026-10-27T10:00:00+03:00'),
        },
      }),
    ).toBe(1);
    expect(
      await db.drill.findMany({
        where: { id: { in: oldDrills.map((d) => d.id) } },
        orderBy: { id: 'asc' },
      }),
    ).toEqual(oldDrills);
  });
  it('rolls back date, phases and checkpoints on a manual overlap or unsupported congestion', async () => {
    const selected = await db.season.findFirstOrThrow({ where: { groupId } });
    await db.match.create({
      data: {
        seasonId: selected.id,
        groupId,
        opponent: 'TEST midweek',
        location: 'Example',
        date: new Date('2026-10-21T16:00:00+03:00'),
      },
    });
    await db.match.create({
      data: {
        seasonId: selected.id,
        groupId,
        opponent: 'TEST early',
        location: 'Example',
        date: new Date('2026-10-19T16:00:00+03:00'),
      },
    });
    await db.match.create({
      data: {
        seasonId: selected.id,
        groupId,
        opponent: 'TEST fourth',
        location: 'Example',
        date: new Date('2026-10-20T16:00:00+03:00'),
      },
    });
    await db.match.create({
      data: {
        seasonId: selected.id,
        groupId,
        opponent: 'TEST fifth',
        location: 'Example',
        date: new Date('2026-10-22T20:00:00+03:00'),
      },
    });
    const { fixture, senior } = await managedWeeks();
    await post('/planning/events', {
      requestId: randomUUID(),
      seasonId: senior.id,
      kind: 'TOPLANTI',
      title: 'TEST protected appointment',
      startsAt: '2026-10-25T12:00:00+03:00',
      duration: 30,
    }).expect(201);
    const before = await programRows();
    await changeFixture(fixture.id, '2026-10-25T18:00:00+03:00').expect(409);
    expect(await programRows()).toEqual(before);
    await changeFixture(fixture.id, '2026-10-21T18:00:00+03:00').expect(409);
    expect(await programRows()).toEqual(before);
    await changeFixture(
      fixture.id,
      '2026-10-19T18:00:00+03:00',
      foreignToken,
    ).expect(403);
    await changeFixture(
      fixture.id,
      '2026-10-25T18:00:00+03:00',
      playerToken,
    ).expect(403);
    await changeFixture(fixture.id, '2027-05-24T18:00:00+03:00').expect(400);
    await db.match.create({
      data: {
        seasonId: senior.id,
        groupId,
        opponent: 'TEST congested',
        location: 'Example',
        date: new Date('2026-10-23T20:00:00+03:00'),
      },
    });
    const congested = await programRows();
    const refused = await changeFixture(
      fixture.id,
      '2026-10-24T20:00:00+03:00',
    ).expect(409);
    expect(refused.body.message).toContain('Altı');
    expect(await programRows()).toEqual(congested);
  });
  it('serializes concurrent reschedules and rolls back a late automation audit failure', async () => {
    const senior = await db.season.findFirstOrThrow({ where: { groupId } });
    await db.match.create({
      data: {
        seasonId: senior.id,
        groupId,
        opponent: 'TEST midweek',
        location: 'Example',
        date: new Date('2026-10-21T16:00:00+03:00'),
      },
    });
    await db.match.create({
      data: {
        seasonId: senior.id,
        groupId,
        opponent: 'TEST early',
        location: 'Example',
        date: new Date('2026-10-19T16:00:00+03:00'),
      },
    });
    await db.match.create({
      data: {
        seasonId: senior.id,
        groupId,
        opponent: 'TEST fourth',
        location: 'Example',
        date: new Date('2026-10-20T16:00:00+03:00'),
      },
    });
    await db.match.create({
      data: {
        seasonId: senior.id,
        groupId,
        opponent: 'TEST fifth',
        location: 'Example',
        date: new Date('2026-10-22T20:00:00+03:00'),
      },
    });
    const { fixture } = await managedWeeks();
    const responses = await Promise.all([
      changeFixture(fixture.id, '2026-10-25T18:00:00+03:00'),
      changeFixture(fixture.id, '2026-10-25T18:00:00+03:00'),
    ]);
    expect(responses.map((r) => r.status)).toEqual([200, 200]);
    expect(responses.filter((r) => r.body.planningSync)).toHaveLength(1);
    const before = await programRows(),
      original = db.$transaction.bind(db);
    const spy = jest.spyOn(db, '$transaction').mockImplementation(((
      work: (tx: unknown) => Promise<unknown>,
      options: unknown,
    ) =>
      original(async (tx) => {
        const create = tx.securityAuditEvent.create.bind(tx.securityAuditEvent);
        tx.securityAuditEvent.create = ((
          args: Prisma.SecurityAuditEventCreateArgs,
        ) => {
          if (
            (args.data.metadata as { operation?: string })?.operation ===
            'PLANNING_AUTOMATION_V1'
          )
            throw new Error('TEST late automation failure');
          return create(args);
        }) as typeof tx.securityAuditEvent.create;
        return work(tx);
      }, options as never)) as typeof db.$transaction);
    try {
      await changeFixture(fixture.id, '2026-10-25T19:00:00+03:00').expect(500);
    } finally {
      spy.mockRestore();
    }
    expect(await programRows()).toEqual(before);
  });
  it.each([2, 3, 4, 5])(
    'previews/applies %i fixtures and adapts interval changes across Monday while preserving manual edits and deletion',
    async (fixtureCount) => {
      const senior = await db.season.findFirstOrThrow({ where: { groupId } });
      if (fixtureCount >= 3)
        await db.match.create({
          data: {
            seasonId: senior.id,
            groupId,
            opponent: 'TEST early',
            location: 'Example',
            date: new Date('2026-10-19T16:00:00+03:00'),
          },
        });
      if (fixtureCount >= 4)
        await db.match.create({
          data: {
            seasonId: senior.id,
            groupId,
            opponent: 'TEST extra',
            location: 'Example',
            date: new Date('2026-10-20T16:00:00+03:00'),
          },
        });
      if (fixtureCount === 5)
        await db.match.create({
          data: {
            seasonId: senior.id,
            groupId,
            opponent: 'TEST fifth',
            location: 'Example',
            date: new Date('2026-10-22T20:00:00+03:00'),
          },
        });
      const midweek = await db.match.create({
        data: {
          seasonId: senior.id,
          groupId,
          opponent: 'TEST midweek',
          location: 'Example',
          date: new Date('2026-10-21T16:00:00+03:00'),
        },
      });
      const originalMatches = await db.match.findMany({
        where: { season: { clubId } },
        orderBy: { id: 'asc' },
      });
      const beforePreview = await programRows();
      const preview = (
        await post('/planning/week/preview', program()).expect(201)
      ).body;
      expect(preview.conflicts).toEqual([]);
      expect(
        preview.teams.find(
          (t: { seasonId: string }) => t.seasonId === senior.id,
        ).matches,
      ).toHaveLength(fixtureCount);
      expect(
        preview.teams
          .filter((t: { seasonId: string }) => t.seasonId !== senior.id)
          .every((t: { matches: unknown[] }) => t.matches.length === 0),
      ).toBe(true);
      expect(await programRows()).toEqual(beforePreview);
      await managedWeeks(['2026-10-19', '2026-10-26']);
      const phase = await db.planDrill.findFirstOrThrow({
        where: {
          trainingPlan: { clubId, date: new Date('2026-10-23T10:00:00+03:00') },
        },
      });
      await db.planDrill.update({
        where: { id: phase.id },
        data: { notes: 'TEST manual technique retained' },
      });
      const meeting = await db.dayPlan.findFirstOrThrow({
        where: {
          week: { seasonId: senior.id },
          type: 'TOPLANTI',
          date: new Date('2026-10-23T11:00:00+03:00'),
        },
      });
      await db.dayPlan.update({
        where: { id: meeting.id },
        data: { topic: 'TEST manual agenda retained' },
      });
      const deleted = await db.dayPlan.findFirstOrThrow({
        where: {
          week: { seasonId: senior.id },
          type: 'TOPLANTI',
          date: new Date('2026-10-24T11:00:00+03:00'),
        },
      });
      await db.dayPlan.delete({ where: { id: deleted.id } });
      const editedPlan = await db.trainingPlan.findUniqueOrThrow({
        where: { id: phase.trainingPlanId },
        include: { drills: { orderBy: { id: 'asc' } }, dayPlans: true },
      });
      const editedMeeting = await db.dayPlan.findUniqueOrThrow({
        where: { id: meeting.id },
      });
      const oldDrills = await db.drill.findMany({
        where: { clubId },
        orderBy: { id: 'asc' },
      });
      const response = (
        await changeFixture(
          midweek.id,
          fixtureCount === 5
            ? '2026-10-21T18:00:00+03:00'
            : '2026-10-22T18:00:00+03:00',
        ).expect(200)
      ).body;
      if (fixtureCount === 3)
        expect(
          await db.trainingPlan.findFirstOrThrow({
            where: { clubId, date: new Date('2026-10-20T10:00:00+03:00') },
          }),
        ).toMatchObject({ title: 'Toparlanma ve mobilite', totalDuration: 35 });
      if (fixtureCount === 4)
        expect(
          await db.trainingPlan.findFirstOrThrow({
            where: { clubId, date: new Date('2026-10-21T10:00:00+03:00') },
          }),
        ).toMatchObject({ title: 'Toparlanma ve mobilite', totalDuration: 30 });
      if (fixtureCount === 5)
        expect(
          await db.trainingPlan.findFirstOrThrow({
            where: { clubId, date: new Date('2026-10-21T12:00:00+03:00') },
          }),
        ).toMatchObject({
          title: 'Maç günü hafif aktivasyon',
          totalDuration: 20,
        });
      expect(response.planningSync.protected).toBeGreaterThanOrEqual(3);
      expect(
        await db.trainingPlan.findUniqueOrThrow({
          where: { id: editedPlan.id },
          include: { drills: { orderBy: { id: 'asc' } }, dayPlans: true },
        }),
      ).toEqual(editedPlan);
      expect(
        await db.dayPlan.findUniqueOrThrow({ where: { id: meeting.id } }),
      ).toEqual(editedMeeting);
      expect(
        await db.dayPlan.findUnique({ where: { id: deleted.id } }),
      ).toBeNull();
      const next = (
        await changeFixture(midweek.id, '2026-10-26T18:00:00+03:00').expect(200)
      ).body;
      expect(next.planningSync.weeks).toEqual(['2026-10-19', '2026-10-26']);
      expect(
        await db.dayPlan.findUnique({ where: { id: deleted.id } }),
      ).toBeNull();
      expect(
        await db.trainingPlan.count({
          where: {
            clubId,
            date: new Date('2026-10-27T10:00:00+03:00'),
            title: 'Toparlanma ve mobilite',
          },
        }),
      ).toBe(1);
      expect(
        await db.drill.findMany({
          where: { id: { in: oldDrills.map((d) => d.id) } },
          orderBy: { id: 'asc' },
        }),
      ).toEqual(oldDrills);
      expect(
        await db.match.findMany({
          where: {
            id: {
              in: originalMatches
                .filter((m) => m.id !== midweek.id)
                .map((m) => m.id),
            },
          },
          orderBy: { id: 'asc' },
        }),
      ).toEqual(originalMatches.filter((m) => m.id !== midweek.id));
      const beforeSame = await programRows();
      await changeFixture(midweek.id, '2026-10-26T18:00:00+03:00').expect(200);
      const afterSame = await programRows();
      expect(afterSame.plans).toEqual(beforeSame.plans);
      expect(afterSame.days).toEqual(beforeSame.days);
      expect(afterSame.audits).toEqual(beforeSame.audits);
    },
  );
});
