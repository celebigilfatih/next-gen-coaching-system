import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaClient, UserRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('A Takım and academy lifecycle (disposable PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  const prefix = `team-life-${randomUUID()}`;
  const id = (label: string) => `${prefix}-${label}`;
  const clubs = [id('club-a'), id('club-b')];
  const clubSeasons = [id('season-a'), id('season-b')];
  const users = {
    system: id('system'),
    clubAdmin: id('club-admin-a'),
    foreignAdmin: id('club-admin-b'),
    coach: id('coach-a'),
    player: id('player-a'),
  };
  const tokens: Partial<Record<keyof typeof users, string>> = {};
  let firstTeamId = '';
  let academyTeamId = '';

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
    process.env.JWT_SECRET = 'team-lifecycle-e2e-secret-at-least-32-characters';
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
    await prisma.clubSeason.createMany({
      data: clubSeasons.map((seasonId, index) => ({
        id: seasonId,
        clubId: clubs[index],
        name: '2026–27',
        startDate: new Date('2026-07-01T00:00:00.000Z'),
        endDate: new Date('2027-06-30T23:59:59.999Z'),
      })),
    });
    const definitions: Array<{
      key: keyof typeof users;
      role: UserRole;
      clubId: string | null;
    }> = [
      { key: 'system', role: 'SYSTEM_ADMIN', clubId: null },
      { key: 'clubAdmin', role: 'CLUB_ADMIN', clubId: clubs[0] },
      { key: 'foreignAdmin', role: 'CLUB_ADMIN', clubId: clubs[1] },
      { key: 'coach', role: 'COACH', clubId: clubs[0] },
      { key: 'player', role: 'PLAYER', clubId: clubs[0] },
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
  });

  afterAll(async () => {
    if (prisma) {
      await prisma.securityAuditEvent.deleteMany({
        where: { clubId: { in: clubs } },
      });
      await prisma.match.deleteMany({
        where: { season: { clubId: clubs[0] } },
      });
      await prisma.trainingPlan.deleteMany({ where: { clubId: clubs[0] } });
      await prisma.groupMember.deleteMany({
        where: { group: { clubId: { in: clubs } } },
      });
      await prisma.season.deleteMany({ where: { clubId: { in: clubs } } });
      await prisma.teamSeason.deleteMany({ where: { clubId: { in: clubs } } });
      await prisma.team.deleteMany({ where: { clubId: { in: clubs } } });
      await prisma.playerGroup.deleteMany({ where: { clubId: { in: clubs } } });
      await prisma.user.deleteMany({
        where: { id: { in: Object.values(users) } },
      });
      await prisma.clubSeason.deleteMany({ where: { clubId: { in: clubs } } });
      await prisma.club.deleteMany({ where: { id: { in: clubs } } });
    }
    await app?.close();
    await prisma?.$disconnect();
  });

  const post = (path: string, token: string, body?: object) =>
    request(app.getHttpServer())
      .post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(body);

  it('allows exactly one concurrent first-team creation and protects it', async () => {
    const body = {
      clubId: clubs[0],
      clubSeasonId: clubSeasons[0],
      name: 'A Takım',
      ageGroupLabel: 'SENIOR',
      classification: 'FIRST_TEAM',
    };
    const replies = await Promise.all([
      post('/sporting/teams', tokens.system!, body),
      post('/sporting/teams', tokens.system!, body),
    ]);
    expect(replies.map((reply) => reply.status).sort()).toEqual([201, 409]);
    const created = replies.find((reply) => reply.status === 201)!;
    firstTeamId = created.body.id;
    expect(
      await prisma.team.count({
        where: { clubId: clubs[0], categoryKey: 'A_TAKIM', archivedAt: null },
      }),
    ).toBe(1);
    expect(
      await prisma.playerGroup.count({
        where: { clubId: clubs[0], category: 'A_TAKIM' },
      }),
    ).toBe(1);

    await request(app.getHttpServer())
      .patch(`/sporting/teams/${firstTeamId}`)
      .set('Authorization', `Bearer ${tokens.clubAdmin}`)
      .send({ name: 'NGCS A Takım', ageGroupLabel: 'Profesyonel' })
      .expect(200);
    await post(
      `/sporting/teams/${firstTeamId}/archive`,
      tokens.clubAdmin!,
    ).expect(409);
    await post('/sporting/teams', tokens.clubAdmin!, body).expect(403);
  });

  it('creates, archives and restores an academy team with history intact', async () => {
    const created = await post('/sporting/teams', tokens.clubAdmin!, {
      clubId: clubs[0],
      clubSeasonId: clubSeasons[0],
      name: 'U17 Gelişim',
      ageGroupLabel: 'U17',
      classification: 'ACADEMY',
    }).expect(201);
    academyTeamId = created.body.id;
    const groupId = created.body.legacyGroupId;
    const legacySeason = await prisma.season.findFirstOrThrow({
      where: { groupId, teamSeason: { teamId: academyTeamId } },
    });
    await prisma.groupMember.create({
      data: { groupId, userId: users.player },
    });
    await prisma.trainingPlan.create({
      data: {
        title: 'Korunan plan',
        clubId: clubs[0],
        coachId: users.coach,
        groupId,
      },
    });
    await prisma.match.create({
      data: {
        seasonId: legacySeason.id,
        groupId,
        date: new Date('2026-09-12T12:00:00.000Z'),
        opponent: 'Rakip',
        location: 'Ev',
      },
    });

    await post(
      `/sporting/teams/${academyTeamId}/archive`,
      tokens.clubAdmin!,
    ).expect(201);
    const active = await request(app.getHttpServer())
      .get('/sporting/teams/page')
      .set('Authorization', `Bearer ${tokens.clubAdmin}`)
      .query({
        clubId: clubs[0],
        clubSeasonId: clubSeasons[0],
        categoryKey: 'ALT_YAPI',
        status: 'ACTIVE',
      })
      .expect(200);
    expect(active.body.items).toEqual([]);
    const archived = await request(app.getHttpServer())
      .get('/sporting/teams/page')
      .set('Authorization', `Bearer ${tokens.clubAdmin}`)
      .query({
        clubId: clubs[0],
        clubSeasonId: clubSeasons[0],
        categoryKey: 'ALT_YAPI',
        status: 'ARCHIVED',
      })
      .expect(200);
    expect(archived.body.items.map((team: { id: string }) => team.id)).toEqual([
      academyTeamId,
    ]);
    expect(await prisma.groupMember.count({ where: { groupId } })).toBe(1);
    expect(await prisma.trainingPlan.count({ where: { groupId } })).toBe(1);
    expect(await prisma.match.count({ where: { groupId } })).toBe(1);

    const restored = await post(
      `/sporting/teams/${academyTeamId}/restore`,
      tokens.clubAdmin!,
    ).expect(201);
    expect(restored.body.id).toBe(academyTeamId);
    expect(restored.body.archivedAt).toBeNull();
  });

  it('fails closed for tenant, role and mass-assignment violations', async () => {
    const academyBody = {
      clubId: clubs[0],
      clubSeasonId: clubSeasons[0],
      name: 'U19',
      ageGroupLabel: 'U19',
      classification: 'ACADEMY',
    };
    await post('/sporting/teams', tokens.foreignAdmin!, academyBody).expect(
      403,
    );
    await post('/sporting/teams', tokens.coach!, academyBody).expect(403);
    await post('/sporting/teams', tokens.player!, academyBody).expect(403);
    await post('/sporting/teams', tokens.clubAdmin!, {
      ...academyBody,
      archivedAt: null,
    }).expect(400);
    await request(app.getHttpServer())
      .patch(`/sporting/teams/${academyTeamId}`)
      .set('Authorization', `Bearer ${tokens.clubAdmin}`)
      .send({ clubId: clubs[1], name: 'Owned' })
      .expect(400);
  });
});
