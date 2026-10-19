import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Bounded workspace catalogs (e2e)', () => {
  let app: INestApplication;
  const client = (url: string) =>
    new PrismaClient({
      datasourceUrl: url,
      log: [{ emit: 'event', level: 'query' }],
      omit: { user: { passwordHash: true } },
    });
  let prisma: ReturnType<typeof client>;
  const prefix = `catalog-${randomUUID()}`;
  const clubIds = Array.from(
    { length: 30 },
    (_, i) => `${prefix}-club-${String(i).padStart(3, '0')}`,
  );
  const clubId = clubIds[29];
  const teamIds = Array.from(
    { length: 120 },
    (_, i) => `${prefix}-team-${String(i).padStart(3, '0')}`,
  );
  const seasonIds = Array.from(
    { length: 40 },
    (_, i) => `${prefix}-season-${String(i).padStart(3, '0')}`,
  );
  let coachToken: string;
  let systemToken: string;
  let personId: string;
  let coachId: string;
  let roleId: string;
  let queries = 0;
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
      throw new Error('Loopback disposable test DB required');
    process.env.DATABASE_URL = url;
    process.env.JWT_SECRET = 'catalog-e2e-only-secret-at-least-32-characters';
    process.env.PERSISTENT_SESSIONS_ENABLED = 'false';
    prisma = client(url);
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication();
    await app.init();
    prisma.$on('query', () => {
      queries++;
    });
    await prisma.club.createMany({
      data: clubIds.map((id, i) => ({ id, name: `Catalog club ${i}` })),
    });
    await prisma.team.createMany({
      data: [
        ...teamIds.map((id, i) => ({
          id,
          clubId,
          name: `Catalog team ${String(i).padStart(3, '0')}`,
          categoryKey: 'ACADEMY',
          categoryLabel: 'Academy',
        })),
        ...clubIds.slice(0, 29).map((id) => ({
          id: `${id}-team`,
          clubId: id,
          name: 'Other club team',
          categoryKey: 'ACADEMY',
          categoryLabel: 'Academy',
        })),
      ],
    });
    await prisma.clubSeason.createMany({
      data: seasonIds.map((id, i) => ({
        id,
        clubId,
        name: `Catalog season ${i}`,
        startDate: new Date(i === 39 ? '2026-02-01' : '2026-01-01'),
        endDate: new Date('2026-12-31'),
      })),
    });
    await prisma.teamSeason.createMany({
      data: teamIds.flatMap((teamId) =>
        seasonIds.map((clubSeasonId) => ({ clubId, teamId, clubSeasonId })),
      ),
    });
    roleId = (
      await prisma.functionalRole.create({
        data: {
          clubId,
          key: 'CATALOG_TEST',
          name: 'Catalog test',
          capabilities: { create: { capability: 'TEAM_VIEW' } },
        },
      })
    ).id;
    personId = (
      await prisma.person.create({
        data: { clubId, displayName: 'Synthetic coach' },
      })
    ).id;
    const coach = await prisma.user.create({
      data: {
        clubId,
        personId,
        name: 'Synthetic coach',
        email: `${prefix}@example.test`,
        role: 'COACH',
        passwordHash: 'not-a-login-credential',
      },
    });
    const admin = await prisma.user.create({
      data: {
        name: 'Synthetic admin',
        email: `${prefix}-system@example.test`,
        role: 'SYSTEM_ADMIN',
        passwordHash: 'not-a-login-credential',
      },
    });
    coachId = coach.id;
    await prisma.sportingAssignment.createMany({
      data: teamIds.slice(0, 119).map((teamId) => ({
        clubId,
        personId,
        teamId,
        roleDefinitionId: roleId,
        assignmentType: 'STAFF',
        validFrom: new Date('2026-01-01'),
      })),
    });
    const jwt = app.get(JwtService);
    coachToken = jwt.sign({ sub: coach.id, ver: coach.authVersion });
    systemToken = jwt.sign({ sub: admin.id, ver: admin.authVersion });
  }, 60000);
  afterAll(async () => {
    if (prisma) {
      await prisma.match.deleteMany({ where: { season: { clubId } } });
      await prisma.season.deleteMany({ where: { clubId } });
      await prisma.groupMember.deleteMany({ where: { group: { clubId } } });
      await prisma.team.updateMany({
        where: { clubId },
        data: { legacyGroupId: null },
      });
      await prisma.playerGroup.deleteMany({ where: { clubId } });
      await prisma.sportingAssignment.deleteMany({
        where: { clubId: { in: clubIds } },
      });
      await prisma.user.deleteMany({ where: { clubId: { in: clubIds } } });
      await prisma.user.deleteMany({
        where: { email: `${prefix}-system@example.test` },
      });
      await prisma.club.deleteMany({ where: { id: { in: clubIds } } });
    }
    await app?.close();
    await prisma?.$disconnect();
  });
  it('keeps off-page selections, filters every page and never loads whole nested catalogs', async () => {
    const get = (
      path: string,
      query: Record<string, string> = {},
      token = coachToken,
    ) =>
      request(app.getHttpServer())
        .get(`/sporting/${path}`)
        .set('Authorization', `Bearer ${token}`)
        .query(query);
    await request(app.getHttpServer())
      .get('/sporting/workspace/selection')
      .expect(401);
    await get('teams/page', { clubId: clubIds[0] }).expect(403);
    await get('teams/page', { clubId, limit: '101' }).expect(400);
    await get('workspace/selection', { limit: '100' }).expect(400);
    const desired = {
      clubId,
      clubSeasonId: seasonIds[39],
      teamId: teamIds[118],
    };
    const selected = (await get('workspace/selection', desired).expect(200))
      .body;
    expect(selected.scope).toEqual(desired);
    expect(selected.teams.items).toHaveLength(25);
    expect(selected.seasons.items).toHaveLength(25);
    expect(selected.teams.items.some((t: any) => t.id === desired.teamId)).toBe(
      false,
    );
    expect(
      selected.seasons.items.some((s: any) => s.id === desired.clubSeasonId),
    ).toBe(false);
    expect(selected.team.teamSeasons).toHaveLength(1);
    expect(selected.teamSeason.clubSeason.id).toBe(desired.clubSeasonId);
    const system = (
      await get('workspace/selection', desired, systemToken).expect(200)
    ).body;
    expect(system.scope).toEqual(desired);
    expect(system.clubs.items.length).toBeLessThanOrEqual(25);
    expect(system.clubs.items.some((c: any) => c.id === clubId)).toBe(false);
    const ids: string[] = [];
    let after: string | undefined;
    do {
      const page = (
        await get('teams/page', {
          clubId,
          clubSeasonId: seasonIds[39],
          ...(after ? { after } : {}),
        }).expect(200)
      ).body;
      expect(page.items.length).toBeLessThanOrEqual(25);
      expect(
        page.items.every(
          (t: any) =>
            t.teamSeasons.length === 1 &&
            t.teamSeasons[0].clubSeason.id === seasonIds[39],
        ),
      ).toBe(true);
      ids.push(...page.items.map((t: any) => t.id));
      after = page.nextCursor;
    } while (after);
    expect(ids).toEqual(teamIds.slice(0, 119));
    const seasons = (
      await get('catalog/seasons', { clubId, after: seasonIds[24] }).expect(200)
    ).body;
    expect(seasons.items).toHaveLength(15);
    const clubs = (
      await get('catalog/clubs', { after: clubIds[24] }, systemToken).expect(
        200,
      )
    ).body;
    expect(clubs.items.filter((c: any) => clubIds.includes(c.id))).toHaveLength(
      5,
    );
    expect(
      (
        await get('teams/page', { clubId, q: 'team 118' }).expect(200)
      ).body.items.map((t: any) => t.id),
    ).toEqual([teamIds[118]]);
    expect(
      (await get('teams/page', { clubId, q: '%' }).expect(200)).body.items,
    ).toEqual([]);
    const hidden = (
      await get('workspace/selection', { clubId, teamId: teamIds[119] }).expect(
        200,
      )
    ).body;
    expect(hidden.scope.teamId).toBe(teamIds[0]);
    const foreign = (
      await get('workspace/selection', { clubId: clubIds[0] }).expect(200)
    ).body;
    expect(foreign.scope.clubId).toBe(clubId);
    const elapsed: number[] = [];
    const counts: number[] = [];
    let bytes = 0;
    for (let i = 0; i < 20; i++) {
      queries = 0;
      const start = performance.now();
      const response = await get('workspace/selection', desired).expect(200);
      elapsed.push(performance.now() - start);
      counts.push(queries);
      bytes = Buffer.byteLength(JSON.stringify(response.body));
    }
    expect(Math.max(...counts)).toBeLessThanOrEqual(20);
    elapsed.sort((a, b) => a - b);
    console.info(
      'BL043_CATALOG_MEASUREMENT',
      JSON.stringify({
        clubs: 30,
        teams: 149,
        seasons: 40,
        teamSeasons: 4800,
        samples: 20,
        p50Ms: +elapsed[9].toFixed(2),
        p95Ms: +elapsed[18].toFixed(2),
        maxQueries: Math.max(...counts),
        selectionBytes: bytes,
      }),
    );
    await prisma.sportingAssignment.updateMany({
      where: { clubId, personId, teamId: teamIds[118] },
      data: { validTo: new Date() },
    });
    expect(
      (await get('workspace/selection', desired).expect(200)).body.scope.teamId,
    ).not.toBe(teamIds[118]);
    expect(
      (await get('teams/page', { clubId, after: teamIds[117] }).expect(200))
        .body.items,
    ).toEqual([]);
    await prisma.sportingAssignment.create({
      data: {
        clubId,
        personId,
        roleDefinitionId: roleId,
        assignmentType: 'STAFF',
        validFrom: new Date('2026-01-01'),
      },
    });
    expect(
      (
        await get('teams/page', { clubId, after: teamIds[118] }).expect(200)
      ).body.items.map((t: any) => t.id),
    ).toEqual([teamIds[119]]);
    const seasonless = await prisma.team.create({
      data: {
        clubId,
        name: 'Seasonless',
        categoryKey: 'OTHER',
        categoryLabel: 'Other',
      },
    });
    const all = (
      await get('workspace/selection', {
        clubId,
        clubSeasonId: '*',
        teamId: seasonless.id,
      }).expect(200)
    ).body;
    expect(all.scope.teamId).toBe(seasonless.id);
    expect(all.teamSeason).toBeNull();
  }, 60000);

  it('resolves exact legacy metadata, preserves all matches and pages assignment roles without expanding authority', async () => {
    const get = (
      path: string,
      query: Record<string, string>,
      token = coachToken,
    ) =>
      request(app.getHttpServer())
        .get(`/sporting/${path}`)
        .set('Authorization', `Bearer ${token}`)
        .query(query);
    const group = await prisma.playerGroup.create({
      data: {
        clubId,
        name: 'Synthetic legacy group',
        ageGroup: 'U18',
        members: { create: { userId: coachId } },
      },
    });
    await prisma.team.update({
      where: { id: teamIds[117] },
      data: { legacyGroupId: group.id },
    });
    const teamSeasons = await prisma.teamSeason.findMany({
      where: { teamId: teamIds[117] },
    });
    await prisma.season.createMany({
      data: seasonIds.map((id, i) => ({
        id: `${prefix}-legacy-${i}`,
        clubId,
        groupId: group.id,
        userId: coachId,
        name: `Legacy ${i}`,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        teamSeasonId: teamSeasons.find((t) => t.clubSeasonId === id)!.id,
      })),
    });
    await prisma.match.createMany({
      data: seasonIds.map((_, i) => ({
        id: `${prefix}-match-${i}`,
        seasonId: `${prefix}-legacy-${i}`,
        date: new Date('2026-09-06'),
        opponent: `Opponent ${i}`,
        location: 'Test',
      })),
    });
    // Duplicate compatibility mappings keep the former newest-season selection.
    await prisma.season.create({
      data: {
        id: `${prefix}-duplicate`,
        clubId,
        groupId: group.id,
        userId: coachId,
        name: 'Newest duplicate',
        createdAt: new Date('2030-01-01'),
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        teamSeasonId: teamSeasons.find((t) => t.clubSeasonId === seasonIds[39])!
          .id,
      },
    });
    await prisma.match.create({
      data: {
        id: `${prefix}-duplicate-match`,
        seasonId: `${prefix}-duplicate`,
        date: new Date('2026-09-06'),
        opponent: 'Latest',
        location: 'Test',
      },
    });
    const scope = { clubId, teamId: teamIds[117], clubSeasonId: seasonIds[39] };
    await request(app.getHttpServer())
      .get('/sporting/workspace/legacy-context')
      .query(scope)
      .expect(401);
    const selected = (await get('workspace/legacy-context', scope).expect(200))
      .body;
    const metadata = (await get('workspace/legacy-metadata', scope).expect(200))
      .body;
    expect(metadata).toEqual({
      group: selected.group,
      season: selected.season,
    });
    const allMetadata = (
      await get('workspace/legacy-metadata', {
        ...scope,
        clubSeasonId: '*',
      }).expect(200)
    ).body;
    expect(allMetadata).toEqual({ group: selected.group, season: null });
    await request(app.getHttpServer())
      .get('/sporting/workspace/legacy-metadata')
      .query(scope)
      .expect(401);
    await get('workspace/legacy-metadata', {
      ...scope,
      clubId: clubIds[0],
    }).expect(403);
    expect(selected.group.id).toBe(group.id);
    expect(selected.group.members).toBeUndefined();
    expect(selected.season.id).toBe(`${prefix}-duplicate`);
    expect(selected.matches.map((m: any) => m.id)).toEqual([
      `${prefix}-duplicate-match`,
    ]);
    const all = (
      await get('workspace/legacy-context', {
        ...scope,
        clubSeasonId: '*',
      }).expect(200)
    ).body;
    expect(all.season).toBeNull();
    expect(all.matches).toHaveLength(41);
    const oldMatches = await prisma.match.findMany({
      where: { season: { groupId: group.id } },
      orderBy: [{ date: 'asc' }, { id: 'asc' }],
    });
    expect(all.matches.map((m: any) => m.id)).toEqual(
      oldMatches.map((m) => m.id),
    );
    expect(
      (
        await get('workspace/legacy-context', {
          ...scope,
          teamId: teamIds[116],
        }).expect(200)
      ).body.group,
    ).toBeNull();
    await get('workspace/legacy-context', {
      ...scope,
      clubId: clubIds[0],
    }).expect(403);
    await get('workspace/legacy-context', {
      ...scope,
      teamId: `${clubIds[0]}-team`,
      clubId: clubIds[0],
    }).expect(403);
    const roleIds = Array.from(
      { length: 31 },
      (_, i) => `${prefix}-player-role-${String(i).padStart(3, '0')}`,
    );
    await prisma.functionalRole.createMany({
      data: roleIds.map((id, i) => ({
        id,
        clubId,
        key: `PLAYER_OPTION_${i}`,
        name: `Player option ${i}`,
        systemKey: 'PLAYER',
      })),
    });
    await request(app.getHttpServer())
      .get('/sporting/roles/page')
      .query({ clubId })
      .expect(401);
    const first = (await get('roles/page', { clubId }).expect(200)).body;
    const second = (
      await get('roles/page', { clubId, after: first.nextCursor }).expect(200)
    ).body;
    expect(first.items).toHaveLength(25);
    expect(second.items).toHaveLength(6);
    expect([...first.items, ...second.items].map((r: any) => r.id)).toEqual(
      roleIds,
    );
    expect(
      first.items.every(
        (r: any) => r.capabilities === undefined && r.systemKey === 'PLAYER',
      ),
    ).toBe(true);
    expect(second.nextCursor).toBeNull();
    await get('roles/page', { clubId: clubIds[0] }).expect(403);
    await get('roles/page', { clubId, limit: '101' }).expect(400);
    await get('roles/page', { clubId, scope: 'ALL' }).expect(400);
    await prisma.groupMember.deleteMany({ where: { groupId: group.id } });
    expect(
      (await get('workspace/legacy-context', scope).expect(200)).body,
    ).toEqual({ group: null, season: null, matches: [] });
    expect(
      (await get('workspace/legacy-context', scope, systemToken).expect(200))
        .body.group.id,
    ).toBe(group.id);
    await prisma.sportingAssignment.updateMany({
      where: { clubId, personId },
      data: { validTo: new Date() },
    });
    await get('workspace/legacy-context', scope).expect(403);
    await get('workspace/legacy-metadata', scope).expect(403);
  }, 60000);
});
