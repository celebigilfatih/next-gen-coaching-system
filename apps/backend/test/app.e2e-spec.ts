import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import {
  ACCOUNT_DELIVERY_CONFIG,
  ACCOUNT_MAIL_TRANSPORT,
} from './../src/accounts/account-delivery.config';
import { PrismaService } from './../src/prisma/prisma.service';

describe('NGCS authorization boundaries (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let systemAdminToken: string;
  let clubAdminAToken: string;
  let coachAToken: string;
  let playerAToken: string;
  let clubAId: string;
  let clubBId: string;
  let groupAId: string;
  let groupBId: string;
  let planAId: string;
  let planBId: string;
  let coachAId: string;
  let coachBId: string;
  let playerAId: string;
  let playerBId: string;
  let seasonAId: string;
  let seasonBId: string;
  let drillId: string;

  beforeAll(async () => {
    const testDatabaseUrl = process.env.TEST_DATABASE_URL;
    if (
      !testDatabaseUrl ||
      process.env.E2E_ALLOW_DESTRUCTIVE_RESET !== 'true'
    ) {
      throw new Error(
        'E2E requires TEST_DATABASE_URL and E2E_ALLOW_DESTRUCTIVE_RESET=true; the suite deletes test data',
      );
    }
    const parsedTestDatabaseUrl = new URL(testDatabaseUrl);
    if (
      !['postgres:', 'postgresql:'].includes(parsedTestDatabaseUrl.protocol)
    ) {
      throw new Error('TEST_DATABASE_URL must be a PostgreSQL URL');
    }
    process.env.DATABASE_URL = testDatabaseUrl;
    process.env.JWT_SECRET = 'e2e-secret-that-is-at-least-32-characters';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    prisma = app.get(PrismaService);

    await prisma.securityAuditEvent.deleteMany();
    await prisma.availabilityPeriod.deleteMany();
    await prisma.externalIdentity.deleteMany();
    await prisma.sportingAssignment.deleteMany();
    await prisma.roleCapability.deleteMany();
    await prisma.functionalRole.deleteMany();
    await prisma.teamSeason.deleteMany();
    await prisma.clubSeason.deleteMany();
    await prisma.team.deleteMany();
    await prisma.passwordResetToken.deleteMany();
    await prisma.accountInvitation.deleteMany();
    await prisma.attendance.deleteMany();
    await prisma.dayPlan.deleteMany();
    await prisma.weekPlan.deleteMany();
    await prisma.match.deleteMany();
    await prisma.season.deleteMany();
    await prisma.planDrill.deleteMany();
    await prisma.trainingPlan.deleteMany();
    await prisma.drill.deleteMany();
    await prisma.groupMember.deleteMany();
    await prisma.playerGroup.deleteMany();
    await prisma.user.deleteMany();
    await prisma.person.deleteMany();
    await prisma.club.deleteMany();

    const [clubA, clubB] = await Promise.all([
      prisma.club.create({ data: { name: 'Club A' } }),
      prisma.club.create({ data: { name: 'Club B' } }),
    ]);
    clubAId = clubA.id;
    clubBId = clubB.id;
    const [groupA, groupB] = await Promise.all([
      prisma.playerGroup.create({
        data: { name: 'Group A', clubId: clubA.id, ageGroup: 'SENIOR' },
      }),
      prisma.playerGroup.create({
        data: { name: 'Group B', clubId: clubB.id, ageGroup: 'SENIOR' },
      }),
    ]);
    groupAId = groupA.id;
    groupBId = groupB.id;

    const passwordHash = await bcrypt.hash('safe-password', 10);
    const [systemAdmin, clubAdminA, coachA, playerA, coachB, playerB] =
      await Promise.all([
        prisma.user.create({
          data: {
            name: 'System Admin',
            email: 'system-admin@example.com',
            passwordHash,
            role: 'SYSTEM_ADMIN',
          },
        }),
        prisma.user.create({
          data: {
            name: 'Club Admin A',
            email: 'club-admin-a@example.com',
            passwordHash,
            role: 'CLUB_ADMIN',
            clubId: clubA.id,
          },
        }),
        prisma.user.create({
          data: {
            name: 'Coach A',
            email: 'coach-a@example.com',
            passwordHash,
            role: 'COACH',
            clubId: clubA.id,
          },
        }),
        prisma.user.create({
          data: {
            name: 'Player A',
            email: 'player-a@example.com',
            passwordHash,
            role: 'PLAYER',
            clubId: clubA.id,
          },
        }),
        prisma.user.create({
          data: {
            name: 'Coach B',
            email: 'coach-b@example.com',
            passwordHash,
            role: 'COACH',
            clubId: clubB.id,
          },
        }),
        prisma.user.create({
          data: {
            name: 'Player B',
            email: 'player-b@example.com',
            passwordHash,
            role: 'PLAYER',
            clubId: clubB.id,
          },
        }),
      ]);
    coachAId = coachA.id;
    coachBId = coachB.id;
    playerAId = playerA.id;
    playerBId = playerB.id;

    await prisma.groupMember.createMany({
      data: [
        { groupId: groupA.id, userId: coachA.id },
        { groupId: groupA.id, userId: playerA.id },
        { groupId: groupB.id, userId: coachB.id },
        { groupId: groupB.id, userId: playerB.id },
      ],
    });

    const [planA, planB] = await Promise.all([
      prisma.trainingPlan.create({
        data: {
          title: 'Plan A',
          clubId: clubA.id,
          coachId: coachA.id,
          groupId: groupA.id,
        },
      }),
      prisma.trainingPlan.create({
        data: {
          title: 'Plan B',
          clubId: clubB.id,
          coachId: coachB.id,
          groupId: groupB.id,
        },
      }),
    ]);
    planAId = planA.id;
    planBId = planB.id;

    const drill = await prisma.drill.create({
      data: {
        title: 'Authorization E2E Drill',
        category: 'TECHNICAL',
        ageGroup: 'SENIOR',
        durationMin: 20,
        difficulty: 'MEDIUM',
        jsonData: {},
      },
    });
    drillId = drill.id;

    const [seasonA, seasonB] = await Promise.all([
      prisma.season.create({
        data: {
          name: 'Season A',
          clubId: clubA.id,
          groupId: groupA.id,
          userId: coachA.id,
          startDate: new Date('2026-08-01'),
          endDate: new Date('2027-05-31'),
        },
      }),
      prisma.season.create({
        data: {
          name: 'Season B',
          clubId: clubB.id,
          groupId: groupB.id,
          userId: coachB.id,
          startDate: new Date('2026-08-01'),
          endDate: new Date('2027-05-31'),
        },
      }),
    ]);
    seasonAId = seasonA.id;
    seasonBId = seasonB.id;

    const login = async (email: string) => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email, password: 'safe-password' })
        .expect(201);
      return response.body.access_token as string;
    };
    [systemAdminToken, clubAdminAToken, coachAToken, playerAToken] =
      await Promise.all([
        login(systemAdmin.email),
        login(clubAdminA.email),
        login(coachA.email),
        login(playerA.email),
      ]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects malformed plan writes without changing persisted records', async () => {
    const before = await prisma.trainingPlan.findUniqueOrThrow({
      where: { id: planAId },
    });
    const count = await prisma.trainingPlan.count();
    for (const invalid of [
      { title: { set: 'invalid' } },
      { date: '2026-02-30T12:00:00Z' },
      { notes: { set: 'invalid' } },
    ]) {
      await request(app.getHttpServer())
        .post('/training-plans')
        .set('Authorization', `Bearer ${coachAToken}`)
        .send({ title: 'Invalid plan', groupId: groupAId, ...invalid })
        .expect(400);
      await request(app.getHttpServer())
        .put(`/training-plans/${planAId}`)
        .set('Authorization', `Bearer ${coachAToken}`)
        .send(invalid)
        .expect(400);
    }
    await request(app.getHttpServer())
      .put(`/training-plans/${planAId}`)
      .set('Authorization', `Bearer ${coachAToken}`)
      .send({ totalDuration: 1.5 })
      .expect(400);
    expect(await prisma.trainingPlan.count()).toBe(count);
    expect(
      await prisma.trainingPlan.findUnique({ where: { id: planAId } }),
    ).toEqual(before);
  });

  it('preserves plan identity, timestamp offsets, null clearing and player write denial', async () => {
    const payload = {
      title: 'DTO contract plan',
      groupId: groupAId,
      clubId: clubBId,
      coachId: coachBId,
      date: '2028-02-29T12:00:00+03:00',
      notes: 'Demo note',
    };
    await request(app.getHttpServer())
      .post('/training-plans')
      .set('Authorization', `Bearer ${playerAToken}`)
      .send(payload)
      .expect(403);
    const created = await request(app.getHttpServer())
      .post('/training-plans')
      .set('Authorization', `Bearer ${coachAToken}`)
      .send(payload)
      .expect(201);
    const id = created.body.id as string;
    try {
      expect(created.body).toMatchObject({
        clubId: clubAId,
        coachId: coachAId,
        date: '2028-02-29T09:00:00.000Z',
      });
      await request(app.getHttpServer())
        .put(`/training-plans/${id}`)
        .set('Authorization', `Bearer ${coachAToken}`)
        .send({
          title: '',
          totalDuration: 0,
          date: null,
          notes: null,
          clubId: clubBId,
          coachId: coachBId,
        })
        .expect(200);
      expect(
        await prisma.trainingPlan.findUniqueOrThrow({ where: { id } }),
      ).toMatchObject({
        title: '',
        totalDuration: 0,
        date: null,
        notes: null,
        clubId: clubAId,
        coachId: coachAId,
        groupId: groupAId,
      });
    } finally {
      await prisma.trainingPlan.delete({ where: { id } });
    }
  });

  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

  it('contains nested season writes while preserving season/week/day/match contracts', async () => {
    const server = app.getHttpServer();
    const auth = `Bearer ${coachAToken}`;
    const seasonInput = {
      name: 'DTO season',
      startDate: '2028-01-01',
      endDate: '2028-01-14',
      groupId: groupAId,
      clubId: clubBId,
      userId: coachBId,
    };
    await request(server)
      .post('/seasons')
      .set('Authorization', `Bearer ${playerAToken}`)
      .send(seasonInput)
      .expect(403);
    const created = await request(server)
      .post('/seasons')
      .set('Authorization', auth)
      .send(seasonInput)
      .expect(201);
    const seasonId = created.body.id as string;
    try {
      expect(created.body).toMatchObject({
        clubId: clubAId,
        groupId: groupAId,
        userId: coachAId,
      });
      const foreignSeason = await prisma.season.findUniqueOrThrow({
        where: { id: seasonBId },
      });
      const weekResult = await request(server)
        .post(`/seasons/${seasonId}/weeks`)
        .set('Authorization', auth)
        .send({
          weekNumber: 1,
          startDate: '2028-01-01',
          endDate: '2028-01-07',
          notes: null,
          days: {
            create: {
              dayOfWeek: 1,
              date: '2028-01-01T00:00:00Z',
              trainingPlanId: planBId,
            },
          },
        })
        .expect(201);
      const weekId = weekResult.body.id as string;
      expect(weekResult.body.days).toEqual([]);
      expect(weekResult.body.totalLoad).toBe(0);
      const dayResult = await request(server)
        .post(`/seasons/weeks/${weekId}/days`)
        .set('Authorization', auth)
        .send({
          dayOfWeek: 1,
          date: '2028-01-01',
          title: null,
          drillIds: null,
          duration: null,
          intensity: null,
        })
        .expect(201);
      expect(dayResult.body).toMatchObject({
        type: 'TRAINING',
        completed: false,
        drillIds: [],
        duration: null,
      });
      for (const extra of [
        { seasonId: seasonBId },
        { season: { connect: { id: seasonBId } } },
        { days: { deleteMany: {} } },
        {
          days: {
            create: {
              dayOfWeek: 2,
              date: '2028-01-02T00:00:00Z',
              trainingPlanId: planBId,
            },
          },
        },
      ]) {
        await request(server)
          .put(`/seasons/weeks/${weekId}`)
          .set('Authorization', auth)
          .send({ notes: 'Allowed note', totalLoad: 0, ...extra })
          .expect(200);
        expect(
          (await prisma.weekPlan.findUniqueOrThrow({ where: { id: weekId } }))
            .seasonId,
        ).toBe(seasonId);
        expect(await prisma.dayPlan.count({ where: { weekId } })).toBe(1);
      }
      expect(
        await prisma.season.findUnique({ where: { id: seasonBId } }),
      ).toEqual(foreignSeason);
      const match = await request(server)
        .post(`/seasons/${seasonId}/matches`)
        .set('Authorization', auth)
        .send({
          date: '2028-01-02T12:00:00+03:00',
          opponent: '',
          location: '',
          competition: null,
          tacticalBoard: { invalid: true },
          id: 'ignored-client-id',
        })
        .expect(201);
      expect(match.body).toMatchObject({
        groupId: groupAId,
        tacticalBoard: null,
        date: '2028-01-02T09:00:00.000Z',
      });
      expect(match.body.id).not.toBe('ignored-client-id');
      for (const opponentAnalysis of [
        { summary: 'Demo', focus: ['press'] },
        ['clip'],
        null,
      ]) {
        await request(server)
          .put(`/seasons/matches/${match.body.id}`)
          .set('Authorization', auth)
          .send({
            date: null,
            notes: null,
            ourFormation: null,
            opponentAnalysis,
            videoLinks: [],
            seasonId: seasonBId,
          })
          .expect(200);
        expect(
          await prisma.match.findUnique({ where: { id: match.body.id } }),
        ).toMatchObject({
          date: new Date('2028-01-02T09:00:00Z'),
          notes: null,
          ourFormation: null,
          opponentAnalysis,
          videoLinks: [],
          seasonId,
        });
      }
    } finally {
      await prisma.season.delete({ where: { id: seasonId } });
    }
  });

  it('rejects malformed season resources without writes or authorization weakening', async () => {
    const server = app.getHttpServer();
    const auth = `Bearer ${coachAToken}`;
    const week = await prisma.weekPlan.create({
      data: {
        seasonId: seasonAId,
        weekNumber: 700,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-01-07'),
      },
    });
    try {
      const before = await prisma.weekPlan.findUnique({
        where: { id: week.id },
      });
      for (const body of [
        { totalLoad: '10' },
        { notes: {} },
        { totalLoad: null },
      ])
        await request(server)
          .put(`/seasons/weeks/${week.id}`)
          .set('Authorization', auth)
          .send(body)
          .expect(400);
      expect(
        await prisma.weekPlan.findUnique({ where: { id: week.id } }),
      ).toEqual(before);
      for (const patch of [
        { date: '2026-02-30' },
        { type: 'UNKNOWN' },
        { intensity: 2.5 },
        { drillIds: [1] },
      ])
        await request(server)
          .post(`/seasons/weeks/${week.id}/days`)
          .set('Authorization', auth)
          .send({ dayOfWeek: 1, date: '2026-01-01', ...patch })
          .expect(400);
      expect(await prisma.dayPlan.count({ where: { weekId: week.id } })).toBe(
        0,
      );
      await request(server)
        .post(`/seasons/${seasonBId}/weeks`)
        .set('Authorization', auth)
        .send({})
        .expect(403);
      await request(server)
        .post(`/seasons/${seasonAId}/matches`)
        .set('Authorization', auth)
        .send({ date: 'invalid', opponent: '', location: '' })
        .expect(400);
    } finally {
      await prisma.weekPlan.delete({ where: { id: week.id } });
    }
  });

  it('blocks cross-club plan reads and mutations', async () => {
    await request(app.getHttpServer())
      .get(`/training-plans/${planBId}`)
      .set(bearer(clubAdminAToken))
      .expect(403);

    await request(app.getHttpServer())
      .put(`/training-plans/${planBId}`)
      .set(bearer(coachAToken))
      .send({ title: 'Cross-club overwrite' })
      .expect(403);

    await request(app.getHttpServer())
      .put(`/training-plans/${planBId}/drills`)
      .set(bearer(coachAToken))
      .send({
        drills: [{ drillId, phase: 'TECHNICAL', order: 0 }],
      })
      .expect(403);
  });

  it('blocks cross-club group, season and attendance access', async () => {
    await request(app.getHttpServer())
      .get(`/groups/${groupBId}`)
      .set(bearer(playerAToken))
      .expect(403);

    await request(app.getHttpServer())
      .get(`/seasons/${seasonBId}`)
      .set(bearer(playerAToken))
      .expect(403);

    await request(app.getHttpServer())
      .post('/attendance')
      .set(bearer(coachAToken))
      .send({ planId: planBId, playerId: playerBId, status: 'PRESENT' })
      .expect(403);

    await request(app.getHttpServer())
      .get('/users/by-email')
      .query({ email: 'player-b@example.com' })
      .set(bearer(clubAdminAToken))
      .expect(404);
  });

  it('keeps one attendance row under concurrent first marks and applies a later status', async () => {
    await prisma.attendance.deleteMany({
      where: { planId: planAId, playerId: playerAId },
    });

    await Promise.all([
      request(app.getHttpServer())
        .post('/attendance')
        .set(bearer(coachAToken))
        .send({ planId: planAId, playerId: playerAId, status: 'PRESENT' })
        .expect(201),
      request(app.getHttpServer())
        .post('/attendance')
        .set(bearer(coachAToken))
        .send({ planId: planAId, playerId: playerAId, status: 'ABSENT' })
        .expect(201),
    ]);

    expect(
      await prisma.attendance.count({
        where: { planId: planAId, playerId: playerAId },
      }),
    ).toBe(1);

    await request(app.getHttpServer())
      .post('/attendance')
      .set(bearer(coachAToken))
      .send({ planId: planAId, playerId: playerAId, status: 'PRESENT' })
      .expect(201);

    await expect(
      prisma.attendance.findUniqueOrThrow({
        where: {
          planId_playerId: { planId: planAId, playerId: playerAId },
        },
      }),
    ).resolves.toMatchObject({ status: 'PRESENT' });
  });

  it('isolates dashboard drills while preserving the global catalog', async () => {
    const [clubADrill, clubBDrill] = await Promise.all([
      prisma.drill.create({
        data: {
          title: 'Club A Dashboard Drill',
          category: 'TACTICAL',
          ageGroup: 'SENIOR',
          durationMin: 15,
          difficulty: 'MEDIUM',
          jsonData: {},
          scope: 'CLUB',
          clubId: clubAId,
          groupId: groupAId,
          createdById: coachAId,
          createdAt: new Date('2026-09-05T10:00:00.000Z'),
        },
      }),
      prisma.drill.create({
        data: {
          title: 'Club B Dashboard Drill',
          category: 'TACTICAL',
          ageGroup: 'SENIOR',
          durationMin: 15,
          difficulty: 'MEDIUM',
          jsonData: { private: 'club-b' },
          scope: 'CLUB',
          clubId: clubBId,
          groupId: groupBId,
          createdById: coachBId,
          createdAt: new Date('2026-09-05T11:00:00.000Z'),
        },
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get('/stats/dashboard')
      .set(bearer(clubAdminAToken))
      .expect(200);

    expect(response.body.recentDrills).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: drillId, scope: 'GLOBAL' }),
        expect.objectContaining({ id: clubADrill.id, clubId: clubAId }),
      ]),
    );
    expect(
      response.body.recentDrills.some(
        (drill: { id: string }) => drill.id === clubBDrill.id,
      ),
    ).toBe(false);
    expect(response.body.recentDrills[0]).not.toHaveProperty('jsonData');
    expect(response.body.recentDrills[0]).not.toHaveProperty('createdById');
  });

  it('rejects same-club cross-group aggregate links and preserves same-group links', async () => {
    const groupA2 = await prisma.playerGroup.create({
      data: { name: 'Group A2', clubId: clubAId, ageGroup: 'SENIOR' },
    });
    const [planA2, groupA2Drill, weekA] = await Promise.all([
      prisma.trainingPlan.create({
        data: {
          title: 'Plan A2',
          clubId: clubAId,
          coachId: coachAId,
          groupId: groupA2.id,
        },
      }),
      prisma.drill.create({
        data: {
          title: 'Group A2 Private Drill',
          category: 'TACTICAL',
          ageGroup: 'SENIOR',
          durationMin: 25,
          difficulty: 'MEDIUM',
          jsonData: {},
          scope: 'CLUB',
          clubId: clubAId,
          groupId: groupA2.id,
          createdById: coachAId,
        },
      }),
      prisma.weekPlan.create({
        data: {
          seasonId: seasonAId,
          weekNumber: 70,
          startDate: new Date('2026-09-07T00:00:00.000Z'),
          endDate: new Date('2026-09-13T23:59:59.000Z'),
        },
      }),
    ]);

    await request(app.getHttpServer())
      .post(`/training-plans/${planAId}/drills`)
      .set(bearer(clubAdminAToken))
      .send({
        drillId: groupA2Drill.id,
        phase: 'TACTICAL',
        order: 0,
      })
      .expect(400);

    await request(app.getHttpServer())
      .put(`/training-plans/${planAId}/drills`)
      .set(bearer(clubAdminAToken))
      .send({
        drills: [{ drillId: groupA2Drill.id, phase: 'TACTICAL', order: 0 }],
      })
      .expect(400);

    await request(app.getHttpServer())
      .put(`/training-plans/${planA2.id}/drills`)
      .set(bearer(clubAdminAToken))
      .send({
        drills: [{ drillId: groupA2Drill.id, phase: 'TACTICAL', order: 0 }],
      })
      .expect(200);

    await request(app.getHttpServer())
      .put(`/training-plans/${planA2.id}`)
      .set(bearer(clubAdminAToken))
      .send({ groupId: groupAId })
      .expect(400);

    await request(app.getHttpServer())
      .post(`/seasons/weeks/${weekA.id}/days`)
      .set(bearer(clubAdminAToken))
      .send({
        dayOfWeek: 1,
        date: '2026-09-07T10:00:00.000Z',
        type: 'TRAINING',
        trainingPlanId: planA2.id,
      })
      .expect(400);

    await request(app.getHttpServer())
      .post(`/seasons/weeks/${weekA.id}/days`)
      .set(bearer(clubAdminAToken))
      .send({
        dayOfWeek: 2,
        date: '2026-09-08T10:00:00.000Z',
        type: 'TRAINING',
        trainingPlanId: planAId,
      })
      .expect(201);

    await request(app.getHttpServer())
      .put(`/training-plans/${planAId}`)
      .set(bearer(clubAdminAToken))
      .send({ groupId: groupA2.id })
      .expect(400);
  });

  it('does not allow mass-assignment to move a group across clubs', async () => {
    await request(app.getHttpServer())
      .put(`/groups/${groupAId}`)
      .set(bearer(clubAdminAToken))
      .send({ name: 'Renamed Group A', clubId: clubBId })
      .expect(200);

    await expect(
      prisma.playerGroup.findUnique({
        where: { id: groupAId },
        select: { clubId: true, name: true },
      }),
    ).resolves.toEqual({ clubId: clubAId, name: 'Renamed Group A' });
  });

  it('validates and projects club and group mutation bodies', async () => {
    let temporaryClubId: string | undefined;
    const temporaryGroupIds: string[] = [];
    try {
      const club = await request(app.getHttpServer())
        .post('/clubs')
        .set(bearer(systemAdminToken))
        .send({
          name: '',
          logo: null,
          description: '',
          id: 'client-controlled-club',
          createdAt: '2000-01-01T00:00:00.000Z',
          users: { create: { id: 'nested-user' } },
          groups: { create: { id: 'nested-group' } },
        })
        .expect(201);
      temporaryClubId = club.body.id as string;
      expect(club.body).toMatchObject({
        name: '',
        logo: null,
        description: '',
      });
      expect(temporaryClubId).not.toBe('client-controlled-club');
      await expect(
        prisma.user.count({ where: { id: 'nested-user' } }),
      ).resolves.toBe(0);
      await expect(
        prisma.playerGroup.count({ where: { id: 'nested-group' } }),
      ).resolves.toBe(0);

      const pathGroup = await request(app.getHttpServer())
        .post(`/clubs/${temporaryClubId}/groups`)
        .set(bearer(systemAdminToken))
        .send({
          name: '',
          ageGroup: 'U16',
          category: 'A_TAKIM',
          clubId: clubBId,
          id: 'client-path-group',
          members: { create: { userId: playerBId } },
        })
        .expect(201);
      temporaryGroupIds.push(pathGroup.body.id as string);
      expect(pathGroup.body).toMatchObject({
        clubId: temporaryClubId,
        name: '',
        ageGroup: 'U16',
        category: 'ALT_YAPI',
      });
      await expect(
        prisma.groupMember.count({ where: { groupId: pathGroup.body.id } }),
      ).resolves.toBe(0);

      const bodyGroup = await request(app.getHttpServer())
        .post('/groups')
        .set(bearer(systemAdminToken))
        .send({
          clubId: temporaryClubId,
          name: 'A Team',
          ageGroup: 'SENIOR',
          category: 'A_TAKIM',
          id: 'client-body-group',
          club: { connect: { id: clubBId } },
          members: { create: { userId: playerBId } },
        })
        .expect(201);
      temporaryGroupIds.push(bodyGroup.body.id as string);
      expect(bodyGroup.body).toMatchObject({
        clubId: temporaryClubId,
        ageGroup: 'SENIOR',
        category: 'A_TAKIM',
      });
      expect(bodyGroup.body.id).not.toBe('client-body-group');

      await request(app.getHttpServer())
        .put(`/clubs/${temporaryClubId}`)
        .set(bearer(systemAdminToken))
        .send({
          logo: '',
          description: null,
          id: clubBId,
          users: { deleteMany: {} },
        })
        .expect(200)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            id: temporaryClubId,
            logo: '',
            description: null,
          });
        });

      const beforeInvalid = await prisma.playerGroup.count({
        where: { clubId: temporaryClubId },
      });
      await request(app.getHttpServer())
        .post('/groups')
        .set(bearer(systemAdminToken))
        .send({ ...bodyGroup.body, category: 'A_TEAM' })
        .expect(400);
      await request(app.getHttpServer())
        .post(`/clubs/${temporaryClubId}/groups`)
        .set(bearer(systemAdminToken))
        .send({ name: 'Invalid', ageGroup: 'U17' })
        .expect(400);
      await request(app.getHttpServer())
        .post('/clubs')
        .set(bearer(systemAdminToken))
        .send({ name: null })
        .expect(400);
      await request(app.getHttpServer())
        .post(`/groups/${pathGroup.body.id}/members`)
        .set(bearer(systemAdminToken))
        .send({ userId: '' })
        .expect(400);
      await expect(
        prisma.playerGroup.count({ where: { clubId: temporaryClubId } }),
      ).resolves.toBe(beforeInvalid);

      await request(app.getHttpServer())
        .post(`/clubs/${clubBId}/groups`)
        .set(bearer(clubAdminAToken))
        .send({})
        .expect(403);
      await request(app.getHttpServer())
        .post('/groups')
        .set(bearer(clubAdminAToken))
        .send({ clubId: clubBId, name: null, ageGroup: 'U17' })
        .expect(403);

      await request(app.getHttpServer())
        .post('/clubs/nonexistent-club/groups')
        .set(bearer(systemAdminToken))
        .send({ name: 'Missing club', ageGroup: 'U16' })
        .expect(500)
        .expect({ statusCode: 500, message: 'Internal server error' });
    } finally {
      if (temporaryGroupIds.length) {
        await prisma.groupMember.deleteMany({
          where: { groupId: { in: temporaryGroupIds } },
        });
        await prisma.playerGroup.deleteMany({
          where: { id: { in: temporaryGroupIds } },
        });
      }
      if (temporaryClubId) {
        await prisma.club.delete({ where: { id: temporaryClubId } });
      }
    }
  });

  it('keeps failed group deletion atomic and contains membership failures', async () => {
    const memberIdsBefore = (
      await prisma.groupMember.findMany({
        where: { groupId: groupAId },
        select: { id: true },
        orderBy: { id: 'asc' },
      })
    ).map(({ id }) => id);
    expect(memberIdsBefore.length).toBeGreaterThan(0);

    await request(app.getHttpServer())
      .delete(`/groups/${groupAId}`)
      .set(bearer(clubAdminAToken))
      .expect(500)
      .expect({ statusCode: 500, message: 'Internal server error' });
    await expect(
      prisma.playerGroup.count({ where: { id: groupAId } }),
    ).resolves.toBe(1);
    await expect(
      prisma.groupMember.findMany({
        where: { groupId: groupAId },
        select: { id: true },
        orderBy: { id: 'asc' },
      }),
    ).resolves.toEqual(memberIdsBefore.map((id) => ({ id })));

    await request(app.getHttpServer())
      .post(`/groups/${groupAId}/members`)
      .set(bearer(clubAdminAToken))
      .send({ userId: playerAId })
      .expect(500)
      .expect({ statusCode: 500, message: 'Internal server error' });
    await request(app.getHttpServer())
      .post(`/groups/${groupAId}/members/delete`)
      .set(bearer(clubAdminAToken))
      .send({ userId: playerBId })
      .expect(500)
      .expect({ statusCode: 500, message: 'Internal server error' });
    await expect(
      prisma.groupMember.count({ where: { groupId: groupAId } }),
    ).resolves.toBe(memberIdsBefore.length);

    const disposableGroup = await prisma.playerGroup.create({
      data: { clubId: clubAId, name: 'Disposable group', ageGroup: 'U18' },
    });
    try {
      await request(app.getHttpServer())
        .post(`/groups/${disposableGroup.id}/members`)
        .set(bearer(clubAdminAToken))
        .send({ userId: playerAId })
        .expect(201);
      await request(app.getHttpServer())
        .delete(`/groups/${disposableGroup.id}`)
        .set(bearer(clubAdminAToken))
        .expect(200);
      await expect(
        prisma.playerGroup.count({ where: { id: disposableGroup.id } }),
      ).resolves.toBe(0);
      await expect(
        prisma.groupMember.count({ where: { groupId: disposableGroup.id } }),
      ).resolves.toBe(0);
    } finally {
      await prisma.groupMember.deleteMany({
        where: { groupId: disposableGroup.id },
      });
      await prisma.playerGroup.deleteMany({
        where: { id: disposableGroup.id },
      });
    }
  });

  it('contains club and drill mutation failures without changing records', async () => {
    const drillCountBefore = await prisma.drill.count();
    await request(app.getHttpServer())
      .post('/drills')
      .set(bearer(systemAdminToken))
      .send([])
      .expect(400);
    await expect(prisma.drill.count()).resolves.toBe(drillCountBefore);

    await request(app.getHttpServer())
      .put('/clubs/missing-club-update')
      .set(bearer(systemAdminToken))
      .send({ name: 'Missing club' })
      .expect(500)
      .expect({ statusCode: 500, message: 'Internal server error' });

    const disposableDrill = await prisma.drill.create({
      data: {
        title: 'Disposable linked drill',
        category: 'TACTICAL',
        ageGroup: 'SENIOR',
        durationMin: 10,
        difficulty: 'MEDIUM',
        jsonData: {},
      },
    });
    const link = await prisma.planDrill.create({
      data: {
        trainingPlanId: planAId,
        drillId: disposableDrill.id,
        phase: 'TACTICAL',
        order: 99,
      },
    });
    try {
      await request(app.getHttpServer())
        .put(`/drills/${disposableDrill.id}`)
        .set(bearer(systemAdminToken))
        .send([])
        .expect(400);
      await expect(
        prisma.drill.findUnique({ where: { id: disposableDrill.id } }),
      ).resolves.toMatchObject({ title: 'Disposable linked drill' });

      await request(app.getHttpServer())
        .delete(`/drills/${disposableDrill.id}`)
        .set(bearer(systemAdminToken))
        .expect(500)
        .expect({ statusCode: 500, message: 'Internal server error' });
      await expect(
        prisma.drill.count({ where: { id: disposableDrill.id } }),
      ).resolves.toBe(1);
      await expect(
        prisma.planDrill.count({ where: { id: link.id } }),
      ).resolves.toBe(1);
    } finally {
      await prisma.planDrill.deleteMany({ where: { id: link.id } });
      await prisma.drill.deleteMany({ where: { id: disposableDrill.id } });
    }
  });

  it('preserves same-group coach and player workflows', async () => {
    await request(app.getHttpServer())
      .get(`/training-plans/${planAId}`)
      .set(bearer(coachAToken))
      .expect(200);

    const planWithDrills = await request(app.getHttpServer())
      .put(`/training-plans/${planAId}/drills`)
      .set(bearer(coachAToken))
      .send({
        drills: [
          {
            drillId,
            phase: 'TECHNICAL',
            order: 0,
            notes: 'Authorization E2E note',
          },
        ],
      })
      .expect(200);
    expect(planWithDrills.body).toMatchObject({
      totalDuration: 20,
      drills: [
        {
          drillId,
          phase: 'TECHNICAL',
          order: 0,
          notes: 'Authorization E2E note',
        },
      ],
    });

    await request(app.getHttpServer())
      .post('/attendance')
      .set(bearer(coachAToken))
      .send({ planId: planAId, playerId: playerAId, status: 'PRESENT' })
      .expect(201);

    const attendance = await request(app.getHttpServer())
      .get('/attendance')
      .query({ planId: planAId })
      .set(bearer(playerAToken))
      .expect(200);
    expect(attendance.body).toHaveLength(1);
    expect(attendance.body[0].playerId).toBe(playerAId);

    await request(app.getHttpServer())
      .get(`/seasons/${seasonAId}`)
      .set(bearer(playerAToken))
      .expect(200);
  });

  it('uses invitation-only provisioning and enforces inviter scope', async () => {
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        name: 'Public Player',
        email: 'public-player@example.com',
        password: 'safe-password',
      })
      .expect(404);

    await request(app.getHttpServer())
      .post('/accounts/invitations')
      .set(bearer(clubAdminAToken))
      .send({ email: 'rogue-admin@example.com', role: 'SYSTEM_ADMIN' })
      .expect(403);

    const invitationResponse = await request(app.getHttpServer())
      .post('/accounts/invitations')
      .set(bearer(clubAdminAToken))
      .send({
        email: 'invited-player@example.com',
        role: 'PLAYER',
        clubId: clubBId,
      })
      .expect(201);
    expect(invitationResponse.body.invitation.clubId).toBe(clubAId);
    expect(invitationResponse.body.token).toEqual(expect.any(String));
    expect(invitationResponse.headers['cache-control']).toBe('no-store');

    const storedInvitation = await prisma.accountInvitation.findUniqueOrThrow({
      where: { id: invitationResponse.body.invitation.id },
      select: { tokenHash: true },
    });
    expect(storedInvitation.tokenHash).not.toBe(invitationResponse.body.token);

    const accepted = await request(app.getHttpServer())
      .post('/accounts/invitations/accept')
      .send({
        token: invitationResponse.body.token,
        name: 'Invited Player',
        password: 'new-player-password',
      })
      .expect(201);
    expect(accepted.body).toMatchObject({
      email: 'invited-player@example.com',
      role: 'PLAYER',
      status: 'ACTIVE',
      clubId: clubAId,
    });

    await request(app.getHttpServer())
      .post('/accounts/invitations/accept')
      .send({
        token: invitationResponse.body.token,
        name: 'Replay',
        password: 'another-safe-password',
      })
      .expect(400);

    const systemInvitation = await request(app.getHttpServer())
      .post('/accounts/invitations')
      .set(bearer(systemAdminToken))
      .send({ email: 'system-admin-2@example.com', role: 'SYSTEM_ADMIN' })
      .expect(201);
    expect(systemInvitation.body.invitation.clubId).toBeNull();
  });

  it('pages the account directory with a minimal server-enforced tenant scope', async () => {
    const clubPage = await request(app.getHttpServer())
      .get('/accounts')
      .query({ clubId: clubBId, limit: 1 })
      .set(bearer(clubAdminAToken))
      .expect(200);
    expect(clubPage.body.total).toBe(4);
    expect(clubPage.body.items).toHaveLength(1);
    expect(clubPage.body.nextCursor).toEqual(expect.any(String));
    expect(
      clubPage.body.items.every(
        (item: {
          clubId: string;
          passwordHash?: unknown;
          authVersion?: unknown;
        }) =>
          item.clubId === clubAId &&
          item.passwordHash === undefined &&
          item.authVersion === undefined,
      ),
    ).toBe(true);

    const systemPage = await request(app.getHttpServer())
      .get('/accounts')
      .query({ clubId: clubBId, role: 'PLAYER', status: 'ACTIVE' })
      .set(bearer(systemAdminToken))
      .expect(200);
    expect(systemPage.body).toMatchObject({
      total: 1,
      summary: { active: 1, suspended: 0 },
    });
    expect(systemPage.body.items[0]).toMatchObject({
      id: playerBId,
      clubId: clubBId,
      role: 'PLAYER',
      status: 'ACTIVE',
    });

    await request(app.getHttpServer())
      .get('/accounts')
      .set(bearer(coachAToken))
      .expect(403);
  });

  it('suspends immediately, revokes sessions and completes one-time reset', async () => {
    const invitation = await request(app.getHttpServer())
      .post('/accounts/invitations')
      .set(bearer(clubAdminAToken))
      .send({ email: 'lifecycle-player@example.com', role: 'PLAYER' })
      .expect(201);
    const accepted = await request(app.getHttpServer())
      .post('/accounts/invitations/accept')
      .send({
        token: invitation.body.token,
        name: 'Lifecycle Player',
        password: 'initial-safe-password',
      })
      .expect(201);
    const userId = accepted.body.id as string;

    const firstLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'lifecycle-player@example.com',
        password: 'initial-safe-password',
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/accounts/${userId}/suspend`)
      .set(bearer(clubAdminAToken))
      .expect(201);
    await request(app.getHttpServer())
      .get('/auth/me')
      .set(bearer(firstLogin.body.access_token))
      .expect(401);
    await request(app.getHttpServer())
      .post(`/accounts/${userId}/reactivate`)
      .set(bearer(clubAdminAToken))
      .expect(201);

    const reset = await request(app.getHttpServer())
      .post(`/accounts/${userId}/password-reset`)
      .set(bearer(clubAdminAToken))
      .expect(201);
    expect(reset.headers['cache-control']).toBe('no-store');
    const resetAttempts = await Promise.all([
      request(app.getHttpServer())
        .post('/accounts/password-resets/complete')
        .send({ token: reset.body.token, newPassword: 'replacement-password' }),
      request(app.getHttpServer())
        .post('/accounts/password-resets/complete')
        .send({ token: reset.body.token, newPassword: 'competing-password' }),
    ]);
    expect(resetAttempts.map((attempt) => attempt.status).sort()).toEqual([
      201, 400,
    ]);
    const winningPassword =
      resetAttempts[0].status === 201
        ? 'replacement-password'
        : 'competing-password';
    const changedPassword = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { passwordHash: true },
    });
    await expect(
      bcrypt.compare('initial-safe-password', changedPassword.passwordHash),
    ).resolves.toBe(false);
    await expect(
      bcrypt.compare(winningPassword, changedPassword.passwordHash),
    ).resolves.toBe(true);

    await request(app.getHttpServer())
      .post(`/accounts/${playerBId}/suspend`)
      .set(bearer(clubAdminAToken))
      .expect(403);

    const audit = await request(app.getHttpServer())
      .get('/accounts/audit')
      .query({ targetUserId: userId })
      .set(bearer(clubAdminAToken))
      .expect(200);
    expect(audit.body.map((event: { action: string }) => event.action)).toEqual(
      expect.arrayContaining([
        'INVITATION_ACCEPTED',
        'ACCOUNT_SUSPENDED',
        'ACCOUNT_REACTIVATED',
        'PASSWORD_RESET_COMPLETED',
      ]),
    );
  });

  it('blocks unsafe role changes until coach-owned work is reassigned', async () => {
    await request(app.getHttpServer())
      .patch(`/accounts/${playerBId}/access`)
      .set(bearer(clubAdminAToken))
      .send({ role: 'COACH' })
      .expect(403);

    await request(app.getHttpServer())
      .patch(`/accounts/${coachAId}/access`)
      .set(bearer(clubAdminAToken))
      .send({ role: 'PLAYER' })
      .expect(409);
  });

  it('proves the U17 to U19 pathway with historical rosters and club isolation', async () => {
    const [playerPerson, coachPerson, foreignPerson] = await Promise.all([
      prisma.person.create({
        data: { clubId: clubAId, displayName: 'Pathway Player' },
      }),
      prisma.person.create({
        data: { clubId: clubAId, displayName: 'Pathway Coach' },
      }),
      prisma.person.create({
        data: { clubId: clubBId, displayName: 'Foreign Player' },
      }),
    ]);
    await Promise.all([
      prisma.playerProfile.create({
        data: {
          personId: playerPerson.id,
          primaryPosition: 'ORTA_SAHA',
          preferredFoot: 'RIGHT',
        },
      }),
      prisma.staffProfile.create({
        data: { personId: coachPerson.id, title: 'Pathway Coach' },
      }),
      prisma.playerProfile.create({
        data: { personId: foreignPerson.id, primaryPosition: 'DEFANS' },
      }),
      prisma.user.update({
        where: { id: playerAId },
        data: { personId: playerPerson.id },
      }),
      prisma.user.update({
        where: { id: coachAId },
        data: { personId: coachPerson.id },
      }),
      prisma.user.update({
        where: { id: playerBId },
        data: { personId: foreignPerson.id },
      }),
    ]);

    const [u17, u19, firstTeam, foreignTeam] = await Promise.all([
      prisma.team.upsert({
        where: { legacyGroupId: groupAId },
        update: {
          name: 'U17',
          categoryKey: 'U17',
          categoryLabel: 'U17',
          ageGroupLabel: 'U17',
        },
        create: {
          clubId: clubAId,
          name: 'U17',
          categoryKey: 'U17',
          categoryLabel: 'U17',
          ageGroupLabel: 'U17',
          legacyGroupId: groupAId,
        },
      }),
      prisma.team.create({
        data: {
          clubId: clubAId,
          name: 'U19',
          categoryKey: 'U19',
          categoryLabel: 'U19',
          ageGroupLabel: 'U19',
        },
      }),
      prisma.team.create({
        data: {
          clubId: clubAId,
          name: 'A Takım',
          categoryKey: 'FIRST_TEAM',
          categoryLabel: 'A Takım',
        },
      }),
      prisma.team.upsert({
        where: { legacyGroupId: groupBId },
        update: { name: 'Club B U19' },
        create: {
          clubId: clubBId,
          name: 'Club B U19',
          categoryKey: 'U19',
          categoryLabel: 'U19',
          legacyGroupId: groupBId,
        },
      }),
    ]);

    const [playerRole, pathwayRole] = await Promise.all([
      prisma.functionalRole.upsert({
        where: { clubId_key: { clubId: clubAId, key: 'PLAYER' } },
        update: {},
        create: {
          clubId: clubAId,
          key: 'PLAYER',
          name: 'Oyuncu',
          systemKey: 'PLAYER',
        },
      }),
      prisma.functionalRole.create({
        data: {
          clubId: clubAId,
          key: 'PATHWAY_COACH',
          name: 'Oyuncu Gelişim Antrenörü',
          systemKey: 'HEAD_COACH',
          capabilities: {
            create: [
              { capability: 'TEAM_VIEW' },
              { capability: 'PLAYER_VIEW' },
              { capability: 'PLAYER_HISTORY_VIEW' },
              { capability: 'ASSIGNMENT_MANAGE' },
            ],
          },
        },
      }),
    ]);

    await prisma.sportingAssignment.createMany({
      data: [
        {
          clubId: clubAId,
          personId: coachPerson.id,
          roleDefinitionId: pathwayRole.id,
          assignmentType: 'STAFF',
          validFrom: new Date('2025-07-01T00:00:00.000Z'),
          source: 'E2E_FIXTURE',
        },
        {
          clubId: clubAId,
          personId: playerPerson.id,
          teamId: u17.id,
          roleDefinitionId: playerRole.id,
          assignmentType: 'PRIMARY_REGISTERED',
          validFrom: new Date('2026-01-01T12:00:00.000Z'),
          source: 'E2E_FIXTURE',
        },
      ],
    });

    const createAssignment = (
      assignmentType: 'TRAINING_GUEST' | 'MATCH_ELIGIBLE',
      teamId: string,
      validFrom: string,
      reason: string,
    ) =>
      request(app.getHttpServer())
        .post('/sporting/assignments')
        .set(bearer(coachAToken))
        .send({
          personId: playerPerson.id,
          teamId,
          roleDefinitionId: playerRole.id,
          assignmentType,
          validFrom,
          reason,
          clubId: clubBId,
          createdById: playerBId,
          source: 'UNTRUSTED',
        });

    const guest = await createAssignment(
      'TRAINING_GUEST',
      u19.id,
      '2026-02-01T12:00:00.000Z',
      'Older-team exposure',
    ).expect(201);
    expect(guest.body).toMatchObject({
      clubId: clubAId,
      personId: playerPerson.id,
      teamId: u19.id,
      source: 'NGCS_API_V1',
      createdById: coachAId,
    });

    const transition = await request(app.getHttpServer())
      .post('/sporting/assignments/transition-primary')
      .set(bearer(coachAToken))
      .send({
        personId: playerPerson.id,
        teamId: u19.id,
        roleDefinitionId: playerRole.id,
        validAt: '2026-03-01T12:00:00.000Z',
        reason: 'Approved permanent promotion',
      })
      .expect(201);
    expect(transition.body).toMatchObject({
      assignment: {
        assignmentType: 'PRIMARY_REGISTERED',
        teamId: u19.id,
        source: 'NGCS_TRANSITION_V1',
      },
    });

    await createAssignment(
      'TRAINING_GUEST',
      firstTeam.id,
      '2026-04-01T12:00:00.000Z',
      'First-team training invitation',
    ).expect(201);

    const januaryU17 = await request(app.getHttpServer())
      .get(`/sporting/teams/${u17.id}/roster`)
      .query({ asOf: '2026-01-15T12:00:00.000Z' })
      .set(bearer(coachAToken))
      .expect(200);
    expect(
      januaryU17.body.assignments.map(
        (item: { person: { id: string } }) => item.person.id,
      ),
    ).toContain(playerPerson.id);

    const marchU17 = await request(app.getHttpServer())
      .get(`/sporting/teams/${u17.id}/roster`)
      .query({ asOf: '2026-03-15T12:00:00.000Z' })
      .set(bearer(coachAToken))
      .expect(200);
    expect(
      marchU17.body.assignments.map(
        (item: { person: { id: string } }) => item.person.id,
      ),
    ).not.toContain(playerPerson.id);

    const januaryPlayer360 = await request(app.getHttpServer())
      .get(`/sporting/players/${playerPerson.id}`)
      .query({ asOf: '2026-01-15T12:00:00.000Z' })
      .set(bearer(coachAToken))
      .expect(200);
    expect(januaryPlayer360.body.assignments).toHaveLength(1);
    expect(januaryPlayer360.body.assignments[0]).toMatchObject({
      assignmentType: 'PRIMARY_REGISTERED',
      team: { name: 'U17' },
    });

    const player360 = await request(app.getHttpServer())
      .get(`/sporting/players/${playerPerson.id}`)
      .query({ asOf: '2026-04-15T12:00:00.000Z' })
      .set(bearer(coachAToken))
      .expect(200);
    expect(player360.body.assignments).toHaveLength(4);
    expect(
      player360.body.assignments.map(
        (item: { team: { name: string } }) => item.team.name,
      ),
    ).toEqual(expect.arrayContaining(['U17', 'U19', 'A Takım']));
    expect(player360.body.evidence.matchParticipation).toBeNull();
    expect(player360.body).not.toHaveProperty('availabilityPeriods');

    await request(app.getHttpServer())
      .post('/sporting/assignments')
      .set(bearer(coachAToken))
      .send({
        personId: playerPerson.id,
        teamId: firstTeam.id,
        roleDefinitionId: playerRole.id,
        assignmentType: 'PRIMARY_REGISTERED',
        validFrom: '2026-04-10T12:00:00.000Z',
      })
      .expect(409);

    const adminView = await request(app.getHttpServer())
      .get(`/sporting/players/${playerPerson.id}`)
      .query({ asOf: '2026-04-15T12:00:00.000Z' })
      .set(bearer(clubAdminAToken))
      .expect(200);
    expect(adminView.body.availabilityPeriods).toEqual([]);

    await request(app.getHttpServer())
      .get(`/sporting/players/${playerPerson.id}`)
      .set(bearer(playerAToken))
      .expect(200);
    await request(app.getHttpServer())
      .get(`/sporting/players/${foreignPerson.id}`)
      .set(bearer(coachAToken))
      .expect(403);
    await request(app.getHttpServer())
      .post('/sporting/assignments')
      .set(bearer(coachAToken))
      .send({
        personId: foreignPerson.id,
        teamId: foreignTeam.id,
        roleDefinitionId: playerRole.id,
        assignmentType: 'TRAINING_GUEST',
        validFrom: '2026-04-01T12:00:00.000Z',
      })
      .expect(403);

    expect(
      await prisma.securityAuditEvent.count({
        where: {
          actorId: coachAId,
          targetPersonId: playerPerson.id,
          action: {
            in: ['SPORTING_ASSIGNMENT_CREATED', 'SPORTING_ASSIGNMENT_ENDED'],
          },
        },
      }),
    ).toBe(4);
  });

  it('keeps legacy writes and sporting projections atomic, historical and revocable', async () => {
    const http = app.getHttpServer();
    const club = await request(http)
      .post('/clubs')
      .set(bearer(systemAdminToken))
      .send({ name: 'Compatibility Club' })
      .expect(201);
    const clubId = club.body.id as string;
    const group = await request(http)
      .post('/groups')
      .set(bearer(systemAdminToken))
      .send({ clubId, name: 'Compatibility U17', ageGroup: 'U18' })
      .expect(201);
    const groupId = group.body.id as string;
    const second = await request(http)
      .post(`/clubs/${clubId}/groups`)
      .set(bearer(systemAdminToken))
      .send({ name: 'Compatibility U19', ageGroup: 'U18' })
      .expect(201);
    expect(await prisma.team.count({ where: { clubId } })).toBe(2);

    async function invite(role: 'COACH' | 'PLAYER', email: string) {
      const issued = await request(http)
        .post('/accounts/invitations')
        .set(bearer(systemAdminToken))
        .send({ role, email, clubId })
        .expect(201);
      const accepted = await request(http)
        .post('/accounts/invitations/accept')
        .send({
          token: issued.body.token,
          name: role,
          password: 'compatibility-test-password',
        })
        .expect(201);
      return {
        id: accepted.body.id as string,
        token: app.get(JwtService).sign({ sub: accepted.body.id, ver: 0 }),
      };
    }
    const coach = await invite('COACH', 'compat-coach@example.test');
    const player = await invite('PLAYER', 'compat-player@example.test');
    const playerAccount = await prisma.user.findUniqueOrThrow({
      where: { id: player.id },
      select: { personId: true },
    });
    expect(playerAccount.personId).toBeTruthy();
    expect(
      await prisma.playerProfile.findUnique({
        where: { personId: playerAccount.personId! },
      }),
    ).toBeTruthy();
    for (const id of [coach.id, player.id])
      await request(http)
        .post(`/groups/${groupId}/members`)
        .set(bearer(systemAdminToken))
        .send({ userId: id })
        .expect(201);
    const season = await request(http)
      .post('/seasons')
      .set(bearer(systemAdminToken))
      .send({
        clubId,
        groupId,
        name: '2026–27',
        startDate: '2026-07-01',
        endDate: '2027-06-30',
      })
      .expect(201);
    const anotherSeason = await request(http)
      .post('/seasons')
      .set(bearer(systemAdminToken))
      .send({
        clubId,
        groupId: second.body.id,
        name: '2026–27',
        startDate: '2026-07-01',
        endDate: '2027-06-30',
      })
      .expect(201);
    expect(season.body.teamSeasonId).toBeTruthy();
    expect(anotherSeason.body.teamSeasonId).not.toBe(season.body.teamSeasonId);
    expect(await prisma.clubSeason.count({ where: { clubId } })).toBe(1);
    const workspace = await request(http)
      .get('/sporting/workspace')
      .set(bearer(coach.token))
      .expect(200);
    expect(workspace.body.teams.map((t: { id: string }) => t.id)).toEqual([
      groupId,
    ]);
    expect(workspace.body.clubs).toEqual([
      { id: clubId, name: 'Compatibility Club' },
    ]);
    await request(http)
      .get('/sporting/legacy-parity')
      .query({ clubId })
      .set(bearer(coach.token))
      .expect(403);
    const parity = await request(http)
      .get('/sporting/legacy-parity')
      .query({ clubId })
      .set(bearer(systemAdminToken))
      .expect(200);
    expect(parity.body.status).toBe('IN_SYNC');
    await request(http)
      .put(`/groups/${groupId}`)
      .set(bearer(systemAdminToken))
      .send({ name: 'Renamed U17' })
      .expect(200);
    expect(
      (
        await prisma.team.findUniqueOrThrow({
          where: { legacyGroupId: groupId },
        })
      ).name,
    ).toBe('Renamed U17');

    // A projection constraint failure rolls back the already-issued legacy write.
    await prisma.team.update({
      where: { legacyGroupId: groupId },
      data: { clubId: clubBId },
    });
    await request(http)
      .put(`/groups/${groupId}`)
      .set(bearer(systemAdminToken))
      .send({ name: 'Must roll back' })
      .expect(500);
    expect(
      (await prisma.playerGroup.findUniqueOrThrow({ where: { id: groupId } }))
        .name,
    ).toBe('Renamed U17');
    await prisma.team.update({
      where: { legacyGroupId: groupId },
      data: { clubId },
    });

    const beforeDelete = await prisma.sportingAssignment.findMany({
      where: { clubId },
    });
    await request(http)
      .delete(`/groups/${groupId}`)
      .set(bearer(systemAdminToken))
      .expect(500);
    expect(
      await prisma.sportingAssignment.findMany({ where: { clubId } }),
    ).toEqual(beforeDelete);
    await request(http)
      .patch(`/accounts/${coach.id}/access`)
      .set(bearer(systemAdminToken))
      .send({ role: 'PLAYER' })
      .expect(409);
    const legacy = beforeDelete.find(
      (a) => a.personId === playerAccount.personId,
    )!;
    await request(http)
      .post(`/sporting/assignments/${legacy.id}/end`)
      .set(bearer(systemAdminToken))
      .send({ validTo: new Date(Date.now() + 1000).toISOString() })
      .expect(400);
    await request(http)
      .post('/sporting/assignments')
      .set(bearer(systemAdminToken))
      .send({
        personId: playerAccount.personId,
        teamId: groupId,
        roleDefinitionId: legacy.roleDefinitionId,
        assignmentType: 'LEGACY_MEMBER',
        validFrom: new Date().toISOString(),
      })
      .expect(400);
    await request(http)
      .post('/sporting/assignments')
      .set(bearer(systemAdminToken))
      .send({
        personId: playerAccount.personId,
        teamId: groupId,
        roleDefinitionId: legacy.roleDefinitionId,
        assignmentType: 'PRIMARY_REGISTERED',
        validFrom: new Date().toISOString(),
      })
      .expect(201);
    const beforeRevocation = new Date().toISOString();
    await request(http)
      .post(`/groups/${groupId}/members/delete`)
      .set(bearer(systemAdminToken))
      .send({ userId: coach.id })
      .expect(201);
    const revoked = await request(http)
      .get('/sporting/workspace')
      .set(bearer(coach.token))
      .expect(200);
    expect(revoked.body.teams).toEqual([]);
    await request(http)
      .get(`/sporting/teams/${groupId}/roster`)
      .query({ asOf: beforeRevocation })
      .set(bearer(coach.token))
      .expect(403);
    await request(http)
      .post(`/groups/${groupId}/members/delete`)
      .set(bearer(systemAdminToken))
      .send({ userId: player.id })
      .expect(201);
    expect(
      (
        await prisma.sportingAssignment.findUniqueOrThrow({
          where: { id: legacy.id },
        })
      ).validTo,
    ).not.toBeNull();
    expect(
      await prisma.sportingAssignment.count({
        where: {
          clubId,
          personId: playerAccount.personId!,
          assignmentType: 'PRIMARY_REGISTERED',
          validTo: null,
        },
      }),
    ).toBe(1);
    const adds = await Promise.all(
      [1, 2].map(() =>
        request(http)
          .post(`/groups/${groupId}/members`)
          .set(bearer(systemAdminToken))
          .send({ userId: player.id }),
      ),
    );
    expect(adds.map((r) => r.status).sort()).toEqual([201, 500]);
    expect(
      await prisma.groupMember.count({ where: { groupId, userId: player.id } }),
    ).toBe(1);
    expect(
      await prisma.sportingAssignment.count({
        where: {
          clubId,
          personId: playerAccount.personId!,
          assignmentType: 'LEGACY_MEMBER',
        },
      }),
    ).toBe(2);
    const finalParity = await request(http)
      .get('/sporting/legacy-parity')
      .query({ clubId })
      .set(bearer(systemAdminToken))
      .expect(200);
    expect(finalParity.body.status).toBe('IN_SYNC');
  });

  it('delivers a fragment link without returning the SMTP token', async () => {
    const sent: Array<{ to: string; text: string }> = [];
    const sendMail = jest.fn(async (message: { to: string; text: string }) => {
      sent.push(message);
      return { accepted: [message.to] };
    });
    const smtpFixture = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(ACCOUNT_DELIVERY_CONFIG)
      .useValue({
        mode: 'smtp',
        publicBaseUrl: 'https://coach.example.test',
        host: 'smtp.example.test',
        port: 587,
        secure: false,
        timeoutMs: 10_000,
        from: 'no-reply@example.test',
      })
      .overrideProvider(ACCOUNT_MAIL_TRANSPORT)
      .useValue({ sendMail })
      .compile();
    const smtpApp = smtpFixture.createNestApplication();
    await smtpApp.init();

    try {
      const response = await request(smtpApp.getHttpServer())
        .post('/accounts/invitations')
        .set(bearer(systemAdminToken))
        .send({
          email: 'smtp-invited-player@example.com',
          role: 'PLAYER',
          clubId: clubAId,
        })
        .expect(201);

      expect(response.headers['cache-control']).toBe('no-store');
      expect(response.body).toMatchObject({
        delivery: { status: 'accepted' },
      });
      expect(response.body).not.toHaveProperty('token');
      expect(sent).toHaveLength(1);
      const link = sent[0].text
        .split('\n')
        .find((line) => line.startsWith('https://'));
      expect(link).toEqual(expect.any(String));
      const token = new URL(link as string).hash.replace('#token=', '');

      const accepted = await request(smtpApp.getHttpServer())
        .post('/accounts/invitations/accept')
        .send({
          token,
          name: 'SMTP Invited Player',
          password: 'smtp-player-password',
        })
        .expect(201);

      sendMail.mockRejectedValueOnce(new Error('fake sink unavailable'));
      const failedReset = await request(smtpApp.getHttpServer())
        .post(`/accounts/${accepted.body.id}/password-reset`)
        .set(bearer(systemAdminToken))
        .expect(503);
      expect(failedReset.body.message).toBe(
        'Account delivery is temporarily unavailable',
      );
      expect(failedReset.body).not.toHaveProperty('token');
      const revokedReset = await prisma.passwordResetToken.findFirstOrThrow({
        where: { userId: accepted.body.id },
        orderBy: { createdAt: 'desc' },
        select: { revokedAt: true },
      });
      expect(revokedReset.revokedAt).not.toBeNull();
    } finally {
      await smtpApp.close();
    }
  });
});
