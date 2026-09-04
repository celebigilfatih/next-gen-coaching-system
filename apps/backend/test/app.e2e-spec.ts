import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
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

  const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

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
    await request(app.getHttpServer())
      .post('/accounts/password-resets/complete')
      .send({ token: reset.body.token, newPassword: 'replacement-password' })
      .expect(201);
    await request(app.getHttpServer())
      .post('/accounts/password-resets/complete')
      .send({ token: reset.body.token, newPassword: 'replayed-password' })
      .expect(400);
    const changedPassword = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { passwordHash: true },
    });
    await expect(
      bcrypt.compare('initial-safe-password', changedPassword.passwordHash),
    ).resolves.toBe(false);
    await expect(
      bcrypt.compare('replacement-password', changedPassword.passwordHash),
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
});
