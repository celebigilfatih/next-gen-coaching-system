import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Player paging: isolated scale and access (e2e)', () => {
  let app: INestApplication;
  const createClient = (url: string) =>
    new PrismaClient({
      datasourceUrl: url,
      log: [{ emit: 'event', level: 'query' }],
      omit: { user: { passwordHash: true } },
    });
  let prisma: ReturnType<typeof createClient>;
  let queries = 0;
  const prefix = `paging-${randomUUID()}`;
  let clubId: string;
  let teamId: string;
  let foreignTeamId: string;
  let hiddenTeamId: string;
  let coachGrantId: string;
  let coachToken: string;
  let playerToken: string;
  let foreignClubId: string;
  const playerIds = Array.from(
    { length: 1000 },
    (_, i) => `${prefix}-${String(i).padStart(4, '0')}`,
  );

  beforeAll(async () => {
    const url = process.env.TEST_DATABASE_URL;
    if (!url || process.env.E2E_ALLOW_DESTRUCTIVE_RESET !== 'true')
      throw new Error('Explicit disposable database required');
    const target = new URL(url);
    if (
      !['localhost', '127.0.0.1'].includes(target.hostname) ||
      !/(e2e|test)/i.test(target.pathname) ||
      target.pathname.includes('local_session_dev')
    )
      throw new Error('Only loopback disposable test databases allowed');
    process.env.DATABASE_URL = url;
    process.env.JWT_SECRET = 'paging-e2e-only-secret-at-least-32-characters';
    process.env.PERSISTENT_SESSIONS_ENABLED = 'false';
    // Instantiate after target validation; no inherited retained-DB connection.
    prisma = createClient(url);
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication();
    await app.init();
    prisma.$on('query', () => {
      queries += 1;
    });
    clubId = (await prisma.club.create({ data: { name: `${prefix} club` } }))
      .id;
    foreignClubId = (
      await prisma.club.create({ data: { name: `${prefix} foreign` } })
    ).id;
    teamId = (
      await prisma.team.create({
        data: {
          clubId,
          name: 'Paging team',
          categoryKey: 'ACADEMY',
          categoryLabel: 'Academy',
        },
      })
    ).id;
    foreignTeamId = (
      await prisma.team.create({
        data: {
          clubId: foreignClubId,
          name: 'Foreign',
          categoryKey: 'ACADEMY',
          categoryLabel: 'Academy',
        },
      })
    ).id;
    hiddenTeamId = (
      await prisma.team.create({
        data: {
          clubId,
          name: 'Unassigned same-club team',
          categoryKey: 'ACADEMY',
          categoryLabel: 'Academy',
        },
      })
    ).id;
    const role = await prisma.functionalRole.create({
      data: {
        clubId,
        key: 'PAGING_TEST',
        name: 'Paging test',
        systemKey: 'OTHER',
        capabilities: { create: { capability: 'PLAYER_VIEW' } },
      },
    });
    await prisma.person.createMany({
      data: playerIds.map((id, i) => ({
        id,
        clubId,
        displayName: i === 999 ? 'Remote needle' : 'Repeated name',
      })),
    });
    await prisma.playerProfile.createMany({
      data: playerIds.map((personId, index) => ({
        personId,
        primaryPosition: index < 10 ? ('DEFANS' as const) : null,
      })),
    });
    await prisma.sportingAssignment.createMany({
      data: playerIds.flatMap((personId) =>
        [0, 1, 2].map((i) => ({
          clubId,
          personId,
          teamId,
          roleDefinitionId: role.id,
          assignmentType: 'TRAINING_GUEST' as const,
          validFrom: new Date(`2026-01-0${i + 1}T00:00:00Z`),
        })),
      ),
    });
    const coachPerson = await prisma.person.create({
      data: { clubId, displayName: 'Paging test coach' },
    });
    const coach = await prisma.user.create({
      data: {
        clubId,
        personId: coachPerson.id,
        name: 'Paging test coach',
        email: `${prefix}@example.test`,
        passwordHash: 'not-a-login-credential',
        role: 'COACH',
      },
    });
    const player = await prisma.user.create({
      data: {
        clubId,
        personId: playerIds[0],
        name: 'Paging test player',
        email: `${prefix}-player@example.test`,
        passwordHash: 'not-a-login-credential',
        role: 'PLAYER',
      },
    });
    coachGrantId = (
      await prisma.sportingAssignment.create({
        data: {
          clubId,
          personId: coachPerson.id,
          teamId,
          roleDefinitionId: role.id,
          assignmentType: 'STAFF',
          validFrom: new Date('2026-01-01T00:00:00Z'),
        },
      })
    ).id;
    const jwt = app.get(JwtService);
    coachToken = jwt.sign({ sub: coach.id, ver: coach.authVersion });
    playerToken = jwt.sign({ sub: player.id, ver: player.authVersion });
  }, 60000);

  afterAll(async () => {
    // Remove only this suite's newly created fixture clubs, never a retained DB.
    if (clubId) {
      await prisma.sportingAssignment.deleteMany({ where: { clubId } });
      await prisma.user.deleteMany({ where: { clubId } });
      await prisma.club.delete({ where: { id: clubId } });
    }
    if (foreignClubId)
      await prisma.club.delete({ where: { id: foreignClubId } });
    await app?.close();
    await prisma?.$disconnect();
  });

  it('pages dated rosters and history without truncating totals or restoring revoked access', async () => {
    const grant = await prisma.sportingAssignment.findUniqueOrThrow({
      where: { id: coachGrantId },
    });
    await prisma.roleCapability.createMany({
      data: ['TEAM_VIEW', 'PLAYER_HISTORY_VIEW'].map((capability) => ({
        roleDefinitionId: grant.roleDefinitionId,
        capability: capability as 'TEAM_VIEW' | 'PLAYER_HISTORY_VIEW',
      })),
    });
    await prisma.staffProfile.create({
      data: { personId: grant.personId, title: 'Synthetic coach' },
    });
    const asOf = '2026-09-06T12:00:00.000Z';
    const rosterPath = `/sporting/teams/${teamId}/roster/page`;
    const playerPath = `/sporting/players/${playerIds[0]}/assignments/page`;
    const get = (
      path: string,
      query: Record<string, string> = {},
      token = coachToken,
    ) =>
      request(app.getHttpServer())
        .get(path)
        .set('Authorization', `Bearer ${token}`)
        .query({ asOf, ...query });
    await request(app.getHttpServer())
      .get(rosterPath)
      .query({ asOf })
      .expect(401);
    await request(app.getHttpServer())
      .get(playerPath)
      .query({ asOf })
      .expect(401);
    await get(rosterPath, { after: 'bad' }).expect(400);
    await get(playerPath, { asOf: '2026-02-30T12:00:00Z' }).expect(400);
    await get(`/sporting/teams/${foreignTeamId}/roster/page`).expect(403);
    await get(`/sporting/teams/${hiddenTeamId}/roster/page`).expect(403);
    await get(
      `/sporting/players/${playerIds[1]}/assignments/page`,
      {},
      playerToken,
    ).expect(403);
    const rosterIds: string[] = [];
    let cursor: string | undefined;
    do {
      const r = (
        await get(rosterPath, {
          limit: '100',
          ...(cursor ? { after: cursor } : {}),
        }).expect(200)
      ).body;
      expect(r.assignments.length).toBeLessThanOrEqual(100);
      expect(r.page).toMatchObject({
        total: 3001,
        playerAssignments: 3000,
        staffAssignments: 1,
      });
      expect(r.team).not.toHaveProperty('teamSeasons');
      rosterIds.push(...r.assignments.map((a: { id: string }) => a.id));
      cursor = r.page.nextCursor;
    } while (cursor);
    expect(new Set(rosterIds).size).toBe(3001);
    expect(rosterIds).toHaveLength(3001);
    expect(
      (await get(rosterPath, { asOf: '2026-01-02T00:00:00Z' }).expect(200)).body
        .page.total,
    ).toBe(2001);
    const season = await prisma.clubSeason.create({
      data: {
        clubId,
        name: 'Synthetic scope',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
      },
    });
    const teamSeason = await prisma.teamSeason.create({
      data: { clubId, teamId, clubSeasonId: season.id },
    });
    const two = await prisma.sportingAssignment.findMany({
      where: { personId: playerIds[0] },
      take: 2,
      select: { id: true },
    });
    await prisma.sportingAssignment.updateMany({
      where: { id: { in: two.map((a) => a.id) } },
      data: { teamSeasonId: teamSeason.id },
    });
    expect(
      (await get(rosterPath, { teamSeasonId: teamSeason.id }).expect(200)).body
        .page.total,
    ).toBe(2);
    await get(`/sporting/teams/${hiddenTeamId}/roster/page`, {
      teamSeasonId: teamSeason.id,
    }).expect(403);
    await get(rosterPath, { teamSeasonId: 'missing-season' }).expect(404);
    const historyIds = Array.from(
      { length: 600 },
      (_, i) => `${prefix}-history-${String(i).padStart(4, '0')}`,
    );
    await prisma.sportingAssignment.createMany({
      data: historyIds.map((id) => ({
        id,
        clubId,
        personId: playerIds[0],
        teamId,
        roleDefinitionId: grant.roleDefinitionId,
        assignmentType: 'TRAINING_GUEST',
        validFrom: new Date('2026-08-01'),
        validTo: new Date('2026-09-01'),
      })),
    });
    const future = await prisma.sportingAssignment.create({
      data: {
        clubId,
        personId: playerIds[0],
        teamId,
        roleDefinitionId: grant.roleDefinitionId,
        assignmentType: 'TRAINING_GUEST',
        validFrom: new Date('2028-01-01'),
      },
    });
    const history: string[] = [];
    cursor = undefined;
    do {
      const r = (
        await get(playerPath, {
          limit: '100',
          ...(cursor ? { after: cursor } : {}),
        }).expect(200)
      ).body;
      expect(r.assignmentPage).toMatchObject({
        total: 603,
        activeCount: 3,
        historyVisible: true,
      });
      expect(r.assignments.length).toBeLessThanOrEqual(100);
      history.push(...r.assignments.map((a: { id: string }) => a.id));
      cursor = r.assignmentPage.nextCursor;
    } while (cursor);
    expect(history).toHaveLength(603);
    expect(new Set(history).size).toBe(603);
    expect(history.slice(0, 600)).toEqual([...historyIds].reverse());
    expect(history).not.toContain(future.id);
    const samples: number[] = [];
    const calls: number[] = [];
    let bytes = 0;
    for (let i = 0; i < 20; i++) {
      queries = 0;
      const started = performance.now();
      const r = (await get(playerPath).expect(200)).body;
      samples.push(performance.now() - started);
      calls.push(queries);
      expect(r.assignments).toHaveLength(25);
      bytes = Buffer.byteLength(JSON.stringify(r));
    }
    samples.sort((a, b) => a - b);
    expect(Math.max(...calls)).toBeLessThanOrEqual(24);
    console.info(
      'BL043_ASSIGNMENT_PAGE_MEASUREMENT',
      JSON.stringify({
        rosterAssignments: 3001,
        historyAssignments: 603,
        samples: 20,
        p50Ms: +samples[9].toFixed(2),
        p95Ms: +samples[18].toFixed(2),
        maxQueries: Math.max(...calls),
        bytes,
      }),
    );
    const legacy = (await get(`/sporting/players/${playerIds[0]}`).expect(200))
      .body;
    expect(legacy.assignments).toHaveLength(603);
    expect(legacy).not.toHaveProperty('assignmentPage');
    await prisma.roleCapability.deleteMany({
      where: {
        roleDefinitionId: grant.roleDefinitionId,
        capability: 'PLAYER_HISTORY_VIEW',
      },
    });
    expect(
      (await get(playerPath).expect(200)).body.assignmentPage,
    ).toMatchObject({ total: 3, activeCount: 3, historyVisible: false });
    expect(
      (await get(playerPath, {}, playerToken).expect(200)).body.assignmentPage
        .total,
    ).toBe(603);
    await prisma.sportingAssignment.update({
      where: { id: coachGrantId },
      data: { validTo: new Date() },
    });
    await get(rosterPath, { asOf: '2026-01-02T00:00:00Z' }).expect(403);
    await get(playerPath, { asOf: '2026-01-02T00:00:00Z' }).expect(403);
    // Restore only this isolated fixture for the existing player-directory case.
    await prisma.sportingAssignment.update({
      where: { id: coachGrantId },
      data: { validTo: null },
    });
    await prisma.sportingAssignment.deleteMany({
      where: { id: { in: [...historyIds, future.id] } },
    });
  }, 60000);

  it('walks bounded pages, searches all matching data, isolates tenants and rechecks revocation', async () => {
    const read = (query: Record<string, string>, token = coachToken) =>
      request(app.getHttpServer())
        .get('/sporting/players/page')
        .set('Authorization', `Bearer ${token}`)
        .query({ teamId, ...query });
    await request(app.getHttpServer())
      .get('/sporting/players/page')
      .query({ teamId })
      .expect(401);
    await read({ limit: '101' }).expect(400);
    await read({ teamId: foreignTeamId }).expect(403);
    await read({ teamId: hiddenTeamId }).expect(403);
    await read({ clubId: foreignClubId }).expect(403);
    const visited: string[] = [];
    let cursor: string | undefined;
    do {
      const response = await read({
        limit: '100',
        ...(cursor ? { after: cursor } : {}),
      }).expect(200);
      expect(response.body.items.length).toBeLessThanOrEqual(100);
      expect(
        response.body.items.every(
          (item: any) =>
            item.clubId === clubId &&
            item.assignments.length === 1 &&
            item.assignments[0].team.id === teamId,
        ),
      ).toBe(true);
      visited.push(...response.body.items.map((item: any) => item.id));
      cursor = response.body.nextCursor;
    } while (cursor);
    expect(visited).toEqual(playerIds);
    expect(new Set(visited).size).toBe(1000);
    const found = await read({ q: 'remote NEEDLE' }).expect(200);
    expect(found.body.items.map((item: any) => item.id)).toEqual([
      playerIds[999],
    ]);
    expect((await read({ q: '%' }).expect(200)).body.items).toEqual([]);
    const defenders = await read({
      position: 'DEFANS',
      sort: 'NAME_ASC',
    }).expect(200);
    expect(defenders.body).toMatchObject({
      total: 10,
      summary: {
        total: 1000,
        positions: { DEFANS: 10, UNASSIGNED: 990 },
      },
    });
    expect(
      defenders.body.items.every(
        (item: any) => item.playerProfile.primaryPosition === 'DEFANS',
      ),
    ).toBe(true);
    await read({ sort: 'NAME_ASC', after: 'not-an-opaque-cursor' }).expect(400);
    const sortedVisited: string[] = [];
    cursor = undefined;
    do {
      const sortedQuery: Record<string, string> = {
        limit: '100',
        sort: 'NAME_ASC',
      };
      if (cursor) sortedQuery.after = cursor;
      const response = await read(sortedQuery).expect(200);
      sortedVisited.push(...response.body.items.map((item: any) => item.id));
      cursor = response.body.nextCursor;
    } while (cursor);
    expect(sortedVisited).toHaveLength(1000);
    expect(new Set(sortedVisited).size).toBe(1000);
    const self = await read({}, playerToken).expect(200);
    expect(self.body.items.map((item: any) => item.id)).toEqual([playerIds[0]]);
    expect(self.body.summary.total).toBe(1);
    const pastSelf = await read({ after: playerIds[0] }, playerToken).expect(
      200,
    );
    expect(pastSelf.body.items).toEqual([]);
    // Cursor is an ID boundary, not a lookup or authorisation credential.
    expect(
      (await read({ after: 'zz-foreign-or-deleted-id' }).expect(200)).body
        .items,
    ).toEqual([]);
    const legacy = await request(app.getHttpServer())
      .get('/sporting/players')
      .set('Authorization', `Bearer ${coachToken}`)
      .query({ teamId })
      .expect(200);
    expect(Array.isArray(legacy.body)).toBe(true);
    expect(legacy.body).toHaveLength(1000);
    const durations: number[] = [];
    const queryCounts: number[] = [];
    let bytes = 0;
    for (let i = 0; i < 21; i += 1) {
      queries = 0;
      const start = performance.now();
      const response = await read({}).expect(200);
      durations.push(performance.now() - start);
      queryCounts.push(queries);
      bytes = Buffer.byteLength(JSON.stringify(response.body));
      expect(response.body.items).toHaveLength(25);
    }
    expect(Math.max(...queryCounts)).toBeLessThanOrEqual(10);
    const warm = durations.slice(1).sort((a, b) => a - b);
    console.info(
      'BL043_PLAYER_PAGE_MEASUREMENT',
      JSON.stringify({
        fixturePlayers: 1000,
        fixtureAssignments: 3000,
        samples: 20,
        firstMs: +durations[0].toFixed(2),
        p50Ms: +warm[9].toFixed(2),
        p95Ms: +warm[18].toFixed(2),
        maxQueries: Math.max(...queryCounts),
        pageBytes: bytes,
        legacyBytes: Buffer.byteLength(JSON.stringify(legacy.body)),
      }),
    );
    await prisma.sportingAssignment.update({
      where: { id: coachGrantId },
      data: { validTo: new Date() },
    });
    await read({ after: playerIds[24] }).expect(403);
  }, 60000);
});
