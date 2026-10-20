import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { PrismaClient, UserRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Player notes and activity (disposable PostgreSQL)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;
  const prefix = `player-note-${randomUUID()}`;
  const id = (label: string) => `${prefix}-${label}`;
  const clubs = [id('club-a'), id('club-b')];
  const teams = [id('team-a'), id('team-b')];
  const foreignTeam = id('team-foreign');
  const targetPerson = id('target-player');
  const users = {
    author: id('author'),
    teammate: id('teammate'),
    receivingCoach: id('receiving-coach'),
    clubAdmin: id('club-admin'),
    foreignAdmin: id('foreign-admin'),
    player: id('player-account'),
  };
  const tokens: Partial<Record<keyof typeof users, string>> = {};
  let noteId = '';

  beforeAll(async () => {
    const url = process.env.TEST_DATABASE_URL;
    if (!url || process.env.E2E_ALLOW_DESTRUCTIVE_RESET !== 'true')
      throw new Error('Explicit disposable database required');
    const target = new URL(url);
    if (
      !['127.0.0.1', 'localhost'].includes(target.hostname) ||
      !/(e2e|test)/i.test(target.pathname) ||
      target.pathname.includes('local_session_dev')
    )
      throw new Error('Only loopback disposable test databases allowed');

    process.env.DATABASE_URL = url;
    process.env.JWT_SECRET = 'player-notes-e2e-secret-at-least-32-characters';
    process.env.PERSISTENT_SESSIONS_ENABLED = 'false';
    prisma = new PrismaClient({ datasourceUrl: url });
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');

    await prisma.club.createMany({
      data: [
        { id: clubs[0], name: 'Player note club' },
        { id: clubs[1], name: 'Foreign player note club' },
      ],
    });
    await prisma.team.createMany({
      data: [
        {
          id: teams[0],
          clubId: clubs[0],
          name: 'U18',
          categoryKey: 'ACADEMY',
          categoryLabel: 'Altyapı',
        },
        {
          id: teams[1],
          clubId: clubs[0],
          name: 'A Takım',
          categoryKey: 'A_TAKIM',
          categoryLabel: 'A Takım',
        },
        {
          id: foreignTeam,
          clubId: clubs[1],
          name: 'Foreign team',
          categoryKey: 'ACADEMY',
          categoryLabel: 'Altyapı',
        },
      ],
    });
    const roles = await Promise.all([
      prisma.functionalRole.create({
        data: {
          id: id('manage-role'),
          clubId: clubs[0],
          key: 'NOTE_MANAGER',
          name: 'Teknik direktör',
          systemKey: 'HEAD_COACH',
          capabilities: {
            create: [
              { capability: 'PLAYER_NOTE_VIEW' },
              { capability: 'PLAYER_NOTE_MANAGE' },
              { capability: 'PLAYER_HISTORY_VIEW' },
            ],
          },
        },
      }),
      prisma.functionalRole.create({
        data: {
          id: id('view-role'),
          clubId: clubs[0],
          key: 'NOTE_VIEWER',
          name: 'Takım yöneticisi',
          systemKey: 'TEAM_MANAGER',
          capabilities: { create: { capability: 'PLAYER_NOTE_VIEW' } },
        },
      }),
      prisma.functionalRole.create({
        data: {
          id: id('player-role'),
          clubId: clubs[0],
          key: 'NOTE_PLAYER',
          name: 'Oyuncu',
          systemKey: 'PLAYER',
        },
      }),
    ]);
    const people = {
      target: targetPerson,
      author: id('author-person'),
      teammate: id('teammate-person'),
      receivingCoach: id('receiving-coach-person'),
    };
    await prisma.person.createMany({
      data: [
        { id: people.target, clubId: clubs[0], displayName: 'Test Oyuncusu' },
        { id: people.author, clubId: clubs[0], displayName: 'Not Yazarı' },
        { id: people.teammate, clubId: clubs[0], displayName: 'Ekip Arkadaşı' },
        {
          id: people.receivingCoach,
          clubId: clubs[0],
          displayName: 'Yeni Takım Koçu',
        },
      ],
    });
    await prisma.playerProfile.create({ data: { personId: people.target } });
    const definitions: Array<{
      key: keyof typeof users;
      role: UserRole;
      clubId: string;
      personId?: string;
    }> = [
      {
        key: 'author',
        role: 'COACH',
        clubId: clubs[0],
        personId: people.author,
      },
      {
        key: 'teammate',
        role: 'COACH',
        clubId: clubs[0],
        personId: people.teammate,
      },
      {
        key: 'receivingCoach',
        role: 'COACH',
        clubId: clubs[0],
        personId: people.receivingCoach,
      },
      { key: 'clubAdmin', role: 'CLUB_ADMIN', clubId: clubs[0] },
      { key: 'foreignAdmin', role: 'CLUB_ADMIN', clubId: clubs[1] },
      {
        key: 'player',
        role: 'PLAYER',
        clubId: clubs[0],
        personId: people.target,
      },
    ];
    const jwt = app.get(JwtService);
    for (const definition of definitions) {
      const user = await prisma.user.create({
        data: {
          id: users[definition.key],
          name: definition.key,
          email: `${users[definition.key]}@example.test`,
          passwordHash: 'not-a-login-credential',
          role: definition.role,
          clubId: definition.clubId,
          personId: definition.personId,
        },
      });
      tokens[definition.key] = jwt.sign({
        sub: user.id,
        ver: user.authVersion,
      });
    }
    await prisma.sportingAssignment.createMany({
      data: [
        {
          id: id('target-origin'),
          clubId: clubs[0],
          personId: people.target,
          teamId: teams[0],
          roleDefinitionId: roles[2].id,
          assignmentType: 'PRIMARY_REGISTERED',
          validFrom: new Date('2026-07-01T00:00:00.000Z'),
        },
        {
          id: id('target-receiving'),
          clubId: clubs[0],
          personId: people.target,
          teamId: teams[1],
          roleDefinitionId: roles[2].id,
          assignmentType: 'TRAINING_GUEST',
          validFrom: new Date('2026-07-01T00:00:00.000Z'),
        },
        {
          id: id('author-assignment'),
          clubId: clubs[0],
          personId: people.author,
          teamId: teams[0],
          roleDefinitionId: roles[0].id,
          assignmentType: 'STAFF',
          validFrom: new Date('2026-07-01T00:00:00.000Z'),
        },
        {
          id: id('teammate-assignment'),
          clubId: clubs[0],
          personId: people.teammate,
          teamId: teams[0],
          roleDefinitionId: roles[1].id,
          assignmentType: 'STAFF',
          validFrom: new Date('2026-07-01T00:00:00.000Z'),
        },
        {
          id: id('receiving-assignment'),
          clubId: clubs[0],
          personId: people.receivingCoach,
          teamId: teams[1],
          roleDefinitionId: roles[1].id,
          assignmentType: 'STAFF',
          validFrom: new Date('2026-07-01T00:00:00.000Z'),
        },
      ],
    });
  }, 30000);

  afterAll(async () => {
    if (prisma) {
      await prisma.securityAuditEvent.deleteMany({
        where: { clubId: { in: clubs } },
      });
      await prisma.playerNoteTeamGrant.deleteMany({
        where: { note: { clubId: { in: clubs } } },
      });
      await prisma.playerNoteRevision.deleteMany({
        where: { note: { clubId: { in: clubs } } },
      });
      await prisma.playerNote.deleteMany({
        where: { clubId: { in: clubs } },
      });
      await prisma.sportingAssignment.deleteMany({
        where: { clubId: { in: clubs } },
      });
      await prisma.user.deleteMany({ where: { clubId: { in: clubs } } });
      await prisma.playerProfile.deleteMany({
        where: { person: { clubId: { in: clubs } } },
      });
      await prisma.person.deleteMany({ where: { clubId: { in: clubs } } });
      await prisma.roleCapability.deleteMany({
        where: { roleDefinition: { clubId: { in: clubs } } },
      });
      await prisma.functionalRole.deleteMany({
        where: { clubId: { in: clubs } },
      });
      await prisma.team.deleteMany({ where: { clubId: { in: clubs } } });
      await prisma.club.deleteMany({ where: { id: { in: clubs } } });
    }
    await app?.close();
    await prisma?.$disconnect();
  });

  const api = (token: string) => ({
    get: (path: string) =>
      request(app.getHttpServer())
        .get(path)
        .set('Authorization', `Bearer ${token}`),
    post: (path: string, body: object) =>
      request(app.getHttpServer())
        .post(path)
        .set('Authorization', `Bearer ${token}`)
        .send(body),
    patch: (path: string, body: object) =>
      request(app.getHttpServer())
        .patch(path)
        .set('Authorization', `Bearer ${token}`)
        .send(body),
    put: (path: string, body: object) =>
      request(app.getHttpServer())
        .put(path)
        .set('Authorization', `Bearer ${token}`)
        .send(body),
  });

  it('keeps account-independent notes scoped, versioned, shareable and recoverable', async () => {
    const base = `/sporting/players/${targetPerson}/notes`;
    const created = await api(tokens.author!)
      .post(base, {
        originTeamId: teams[0],
        category: 'TECHNICAL',
        body: 'İlk kontrol yönünü baskıya göre ayarla.',
        observedAt: '2026-09-09T09:00:00.000Z',
        followUpAt: '2026-09-16T09:00:00.000Z',
        followUpStatus: 'OPEN',
      })
      .expect(201);
    noteId = created.body.id;
    expect(created.body.version).toBe(1);

    expect(
      (await api(tokens.teammate!).get(`${base}/page`).expect(200)).body.items,
    ).toHaveLength(1);
    await api(tokens.teammate!)
      .patch(`${base}/${noteId}`, {
        expectedVersion: 1,
        category: 'TECHNICAL',
        body: 'Başkasının notu',
        observedAt: '2026-09-09T09:00:00.000Z',
      })
      .expect(403);
    await api(tokens.author!)
      .patch(`${base}/${noteId}`, {
        expectedVersion: 0,
        category: 'TECHNICAL',
        body: 'Mass assignment denemesi',
        observedAt: '2026-09-09T09:00:00.000Z',
        authorId: users.teammate,
      })
      .expect(400);

    const updated = await api(tokens.author!)
      .patch(`${base}/${noteId}`, {
        expectedVersion: 1,
        category: 'TACTICAL',
        body: 'İlk kontrol sonrası üçüncü oyuncuyu daha erken tara.',
        observedAt: '2026-09-09T09:00:00.000Z',
        followUpAt: '2026-09-16T09:00:00.000Z',
        followUpStatus: 'OPEN',
      })
      .expect(200);
    expect(updated.body.version).toBe(2);
    await api(tokens.author!)
      .patch(`${base}/${noteId}`, {
        expectedVersion: 1,
        category: 'TACTICAL',
        body: 'Eski sürüm',
        observedAt: '2026-09-09T09:00:00.000Z',
      })
      .expect(409);

    const shared = await api(tokens.clubAdmin!)
      .put(`${base}/${noteId}/shares`, {
        expectedVersion: 2,
        teamIds: [teams[1]],
      })
      .expect(200);
    expect(shared.body.version).toBe(3);
    expect(
      (await api(tokens.receivingCoach!).get(`${base}/page`).expect(200)).body
        .items,
    ).toHaveLength(1);
    await api(tokens.player!).get(`${base}/page`).expect(403);
    await api(tokens.foreignAdmin!).get(`${base}/page`).expect(403);

    const archived = await api(tokens.author!)
      .post(`${base}/${noteId}/archive`, { expectedVersion: 3 })
      .expect(201);
    expect(archived.body.version).toBe(4);
    expect(
      (await api(tokens.author!).get(`${base}/page`).expect(200)).body.items,
    ).toHaveLength(0);
    expect(
      (
        await api(tokens.author!)
          .get(`${base}/page?status=ARCHIVED`)
          .expect(200)
      ).body.items,
    ).toHaveLength(1);
    expect(
      (
        await api(tokens.author!)
          .get(`${base}/${noteId}/revisions/page`)
          .expect(200)
      ).body.items,
    ).toHaveLength(4);

    const restored = await api(tokens.clubAdmin!)
      .post(`${base}/${noteId}/restore`, { expectedVersion: 4 })
      .expect(201);
    expect(restored.body.version).toBe(5);
    const audit = await prisma.securityAuditEvent.findMany({
      where: { targetPersonId: targetPerson },
      select: { metadata: true },
    });
    expect(JSON.stringify(audit)).not.toContain('İlk kontrol');
  });

  it('returns dated activity while preserving PLAYER self scope', async () => {
    const path = `/sporting/players/${targetPerson}/activity/page`;
    const coachResult = await api(tokens.author!).get(path).expect(200);
    expect(coachResult.body.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'ASSIGNMENT',
          team: { id: teams[0], name: 'U18' },
        }),
      ]),
    );
    await api(tokens.player!).get(path).expect(200);
    await api(tokens.foreignAdmin!).get(path).expect(403);
  });
});
