import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaClient, UserRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Training plan lifecycle (disposable PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  const prefix = `plan-life-${randomUUID()}`;
  const id = (label: string) => `${prefix}-${label}`;
  const clubs = [id('club-a'), id('club-b')];
  const groups = [id('group-a'), id('group-b')];
  const users = {
    coach: id('coach-a'),
    player: id('player-a'),
    foreignCoach: id('coach-b'),
    admin: id('admin-a'),
    system: id('system'),
  };
  const tokens: Partial<Record<keyof typeof users, string>> = {};
  const seasonId = id('season');
  const weekIds = [id('week-1'), id('week-2')];
  const drillId = id('drill');
  let planId = '';

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
    process.env.JWT_SECRET = 'plan-lifecycle-e2e-secret-at-least-32-characters';
    process.env.PERSISTENT_SESSIONS_ENABLED = 'false';
    prisma = new PrismaClient({ datasourceUrl: url });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');

    await prisma.club.createMany({
      data: clubs.map((clubId) => ({ id: clubId, name: clubId })),
    });
    const definitions: Array<{
      key: keyof typeof users;
      role: UserRole;
      clubId: string | null;
    }> = [
      { key: 'coach', role: 'COACH', clubId: clubs[0] },
      { key: 'player', role: 'PLAYER', clubId: clubs[0] },
      { key: 'foreignCoach', role: 'COACH', clubId: clubs[1] },
      { key: 'admin', role: 'CLUB_ADMIN', clubId: clubs[0] },
      { key: 'system', role: 'SYSTEM_ADMIN', clubId: null },
    ];
    for (const definition of definitions) {
      const user = await prisma.user.create({
        data: {
          id: users[definition.key],
          name: definition.key,
          email: `${users[definition.key]}@example.test`,
          role: definition.role,
          clubId: definition.clubId,
          passwordHash: 'not-a-login-credential',
        },
      });
      tokens[definition.key] = app
        .get(JwtService)
        .sign({ sub: user.id, ver: user.authVersion });
    }
    await prisma.playerGroup.createMany({
      data: [
        {
          id: groups[0],
          clubId: clubs[0],
          name: 'Lifecycle A',
          ageGroup: 'U18',
        },
        {
          id: groups[1],
          clubId: clubs[1],
          name: 'Lifecycle B',
          ageGroup: 'U18',
        },
      ],
    });
    await prisma.groupMember.createMany({
      data: [
        { groupId: groups[0], userId: users.coach },
        { groupId: groups[0], userId: users.player },
        { groupId: groups[1], userId: users.foreignCoach },
      ],
    });
    await prisma.season.create({
      data: {
        id: seasonId,
        name: 'Lifecycle season',
        clubId: clubs[0],
        groupId: groups[0],
        userId: users.coach,
        startDate: new Date('2026-09-01T00:00:00.000Z'),
        endDate: new Date('2026-09-30T23:59:59.999Z'),
      },
    });
    await prisma.weekPlan.createMany({
      data: [
        {
          id: weekIds[0],
          seasonId,
          weekNumber: 1,
          startDate: new Date('2026-09-01T00:00:00.000Z'),
          endDate: new Date('2026-09-07T23:59:59.999Z'),
        },
        {
          id: weekIds[1],
          seasonId,
          weekNumber: 2,
          startDate: new Date('2026-09-08T00:00:00.000Z'),
          endDate: new Date('2026-09-14T23:59:59.999Z'),
        },
      ],
    });
    await prisma.drill.create({
      data: {
        id: drillId,
        title: 'Lifecycle drill',
        category: 'TACTICAL',
        ageGroup: 'U18',
        durationMin: 20,
        difficulty: 'EASY',
        jsonData: {
          schemaVersion: 1,
          kind: 'tactical-board',
          pitch: { type: 'full', width: 1200, height: 800 },
          elements: [],
        },
      },
    });
  });

  afterAll(async () => {
    if (prisma) {
      if (planId) {
        await prisma.dayPlan.deleteMany({ where: { trainingPlanId: planId } });
        await prisma.attendance.deleteMany({ where: { planId } });
        await prisma.planDrill.deleteMany({
          where: { trainingPlanId: planId },
        });
        await prisma.trainingPlan.deleteMany({ where: { id: planId } });
      }
      await prisma.drill.deleteMany({ where: { id: drillId } });
      await prisma.weekPlan.deleteMany({ where: { id: { in: weekIds } } });
      await prisma.season.deleteMany({ where: { id: seasonId } });
      await prisma.groupMember.deleteMany({
        where: { groupId: { in: groups } },
      });
      await prisma.playerGroup.deleteMany({ where: { id: { in: groups } } });
      await prisma.user.deleteMany({
        where: { id: { in: Object.values(users) } },
      });
      await prisma.club.deleteMany({ where: { id: { in: clubs } } });
    }
    await app?.close();
    await prisma?.$disconnect();
  });

  const call = (
    method: 'post' | 'put' | 'delete',
    path: string,
    actor: keyof typeof users,
  ) =>
    request(app.getHttpServer())
      [method](path)
      .set('Authorization', `Bearer ${tokens[actor]}`);

  it('creates, updates projections, adds attendance/phase and permanently deletes atomically', async () => {
    const created = await call('post', '/training-plans', 'coach')
      .send({
        title: 'Lifecycle plan',
        groupId: groups[0],
        date: '2026-09-06T12:00:00.000Z',
        notes: 'Initial purpose',
      })
      .expect(201);
    planId = created.body.id as string;
    expect(planId).toBeTruthy();
    expect(
      await prisma.dayPlan.count({ where: { trainingPlanId: planId } }),
    ).toBe(1);

    await call('put', `/training-plans/${planId}`, 'player')
      .send({ title: 'Forbidden' })
      .expect(403);
    await call('delete', `/training-plans/${planId}`, 'foreignCoach').expect(
      403,
    );

    await call('post', `/training-plans/${planId}/drills`, 'coach')
      .send({ drillId, phase: 'TACTICAL', order: 0 })
      .expect(201);
    await call('post', '/attendance', 'coach')
      .send({ planId, playerId: users.player, status: 'PRESENT' })
      .expect(201);

    await call('put', `/training-plans/${planId}`, 'coach')
      .send({
        title: 'Updated lifecycle plan',
        date: '2026-09-10T15:30:00.000Z',
        notes: 'Updated purpose',
      })
      .expect(200);
    const [plan, day] = await Promise.all([
      prisma.trainingPlan.findUniqueOrThrow({ where: { id: planId } }),
      prisma.dayPlan.findFirstOrThrow({ where: { trainingPlanId: planId } }),
    ]);
    expect(plan).toMatchObject({
      title: 'Updated lifecycle plan',
      notes: 'Updated purpose',
      totalDuration: 20,
    });
    expect(day).toMatchObject({
      weekId: weekIds[1],
      title: 'Updated lifecycle plan',
      notes: 'Updated purpose',
      duration: 20,
    });

    await call('delete', `/training-plans/${planId}`, 'coach').expect(200);
    const counts = await Promise.all([
      prisma.trainingPlan.count({ where: { id: planId } }),
      prisma.dayPlan.count({ where: { trainingPlanId: planId } }),
      prisma.attendance.count({ where: { planId } }),
      prisma.planDrill.count({ where: { trainingPlanId: planId } }),
    ]);
    expect(counts).toEqual([0, 0, 0, 0]);

    const page = await request(app.getHttpServer())
      .get(`/training-plans/catalog/page?groupId=${groups[0]}&limit=25`)
      .set('Authorization', `Bearer ${tokens.coach}`)
      .expect(200);
    expect(page.body.items).toEqual([]);
  });
});
