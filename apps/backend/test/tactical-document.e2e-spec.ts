import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Prisma, type UserRole } from '@prisma/client';
import { gzipSync } from 'node:zlib';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { configureBodyParsers } from '../src/tactics/tactical-body-parser';

const v1 = {
  schemaVersion: 1,
  kind: 'tactical-board',
  pitch: { type: 'full', width: 1200, height: 800 },
  elements: [],
};
const v2 = {
  schemaVersion: 2,
  kind: 'tactical-board',
  scenes: [
    {
      id: 'one',
      title: 'First',
      holdMs: 1000,
      transition: 'cut',
      transitionMs: 0,
      board: v1,
    },
  ],
};

describe('Tactical document HTTP / PostgreSQL serializable gate', () => {
  let app: INestApplication<App>;
  let db: PrismaService;
  let clubId: string;
  let groupId: string;
  let otherGroupId: string;
  let coachId: string;
  let seasonId: string;
  const tokens: Record<string, string> = {};
  const oldFlag = process.env.TACTICAL_V2_WRITES_ENABLED;

  beforeAll(async () => {
    const url = process.env.TEST_DATABASE_URL;
    if (!url || process.env.TACTICAL_DISPOSABLE_TEST !== 'true')
      throw new Error('Dedicated tactical disposable database required');
    const target = new URL(url);
    if (
      !['127.0.0.1', 'localhost'].includes(target.hostname) ||
      target.port !== '55439' ||
      target.pathname !== '/ngcs_tactical_test'
    )
      throw new Error('Refusing non-disposable database');
    process.env.DATABASE_URL = url;
    process.env.JWT_SECRET = 'tactical-disposable-test-secret-32-characters';
    process.env.TACTICAL_V2_WRITES_ENABLED = 'true';
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication({ bodyParser: false });
    configureBodyParsers(app);
    await app.init();
    db = app.get(PrismaService);
    clubId = (
      await db.club.create({ data: { name: 'Synthetic tactical club' } })
    ).id;
    const otherClub = await db.club.create({
      data: { name: 'Synthetic other club' },
    });
    groupId = (
      await db.playerGroup.create({
        data: { clubId, name: 'U18 test', ageGroup: 'U18' },
      })
    ).id;
    otherGroupId = (
      await db.playerGroup.create({
        data: { clubId: otherClub.id, name: 'Other test', ageGroup: 'U18' },
      })
    ).id;
    const jwt = app.get(JwtService);
    for (const [name, role, club] of [
      ['coach', 'COACH', clubId],
      ['peer', 'COACH', clubId],
      ['player', 'PLAYER', clubId],
      ['admin', 'CLUB_ADMIN', clubId],
      ['system', 'SYSTEM_ADMIN', null],
      ['foreign', 'CLUB_ADMIN', otherClub.id],
    ] as [string, UserRole, string | null][]) {
      const user = await db.user.create({
        data: {
          name,
          email: `${name}-${groupId}@example.test`,
          passwordHash: 'not-a-login-credential',
          role,
          clubId: club,
        },
      });
      if (name === 'coach') coachId = user.id;
      if (['coach', 'peer', 'player'].includes(name))
        await db.groupMember.create({ data: { userId: user.id, groupId } });
      tokens[name] = jwt.sign({ sub: user.id, ver: 0 });
    }
    seasonId = (
      await db.season.create({
        data: {
          clubId,
          groupId,
          userId: coachId,
          name: 'Synthetic season',
          startDate: new Date('2026-08-01'),
          endDate: new Date('2027-07-01'),
        },
      })
    ).id;
  }, 30_000);

  afterAll(async () => {
    if (oldFlag === undefined) delete process.env.TACTICAL_V2_WRITES_ENABLED;
    else process.env.TACTICAL_V2_WRITES_ENABLED = oldFlag;
    await app?.close();
    // No reset/truncate/delete: the dedicated container is disposable and removed outside this suite.
  });

  async function fixture() {
    const drill = await db.drill.create({
      data: {
        scope: 'CLUB',
        clubId,
        groupId,
        createdById: coachId,
        title: 'Synthetic board',
        category: 'TACTICAL',
        ageGroup: 'U18',
        durationMin: 10,
        difficulty: 'MEDIUM',
        jsonData: v1,
      },
    });
    const plan = await db.trainingPlan.create({
      data: {
        clubId,
        groupId,
        coachId,
        title: 'Synthetic plan',
        drills: { create: { drillId: drill.id, phase: 'TACTICAL' } },
      },
      include: { drills: true },
    });
    const match = await db.match.create({
      data: {
        seasonId,
        groupId,
        date: new Date(),
        opponent: 'Synthetic opponent',
        location: 'Synthetic field',
      },
    });
    return {
      drill,
      plan,
      match,
      paths: [
        `/drills/${drill.id}/tactical-document`,
        `/training-plans/${plan.id}/drills/${plan.drills[0].id}/tactical-document`,
        `/seasons/matches/${match.id}/tactical-document`,
      ],
    };
  }
  const get = (path: string, actor = 'coach') =>
    request(app.getHttpServer())
      .get(path)
      .auth(tokens[actor], { type: 'bearer' });
  const put = (path: string, body: unknown, actor = 'coach') =>
    request(app.getHttpServer())
      .put(path)
      .auth(tokens[actor], { type: 'bearer' })
      .send(body as object);

  const post = (body: unknown, actor = 'coach', suffix = '') =>
    request(app.getHttpServer())
      .post(`/drills/tactical-editor${suffix}`)
      .auth(tokens[actor], { type: 'bearer' })
      .send(body as object);
  const metadata = {
    title: 'Synthetic editor',
    category: 'TACTICAL',
    durationMin: 20,
    difficulty: 'MEDIUM',
    equipment: 'Balls',
  };

  it('attaches a full sequence to a training phase and explicitly saves an isolated snapshot without changing duration', async () => {
    const { plan } = await fixture();
    const document = {
      ...v2,
      scenes: [...v2.scenes, { ...v2.scenes[0], id: 'two', title: 'Second' }],
    };
    const created = (await post({ groupId, metadata, document }).expect(201))
      .body;
    const attached = (
      await request(app.getHttpServer())
        .post(`/training-plans/${plan.id}/drills`)
        .auth(tokens.coach, { type: 'bearer' })
        .send({ drillId: created.drill.id, phase: 'TACTICAL', order: 1 })
        .expect(201)
    ).body;
    const path = `/training-plans/${plan.id}/drills/${attached.id}/tactical-document`;
    const meta = (
      await get(`/training-plans/${plan.id}/editor-metadata`).expect(200)
    ).body;
    expect(meta.drills).toHaveLength(2);
    expect(JSON.stringify(meta)).not.toMatch(
      /boardSnapshot|jsonData|schemaVersion/,
    );
    expect(meta.totalDuration).toBe(30);
    const source = (await get(path).expect(200)).body;
    expect(source.phase).toEqual({
      planId: plan.id,
      planDrillId: attached.id,
      drillId: created.drill.id,
      origin: 'drill',
    });
    expect(source.document).toEqual(document);
    expect(
      (await db.planDrill.findUniqueOrThrow({ where: { id: attached.id } }))
        .boardSnapshot,
    ).toBeNull();
    const saved = (
      await put(path, {
        document,
        expectedWriteToken: source.writeToken,
      }).expect(200)
    ).body;
    expect(saved.phase.origin).toBe('snapshot');
    expect(saved.writeToken).not.toBe(source.writeToken);
    const changedSource = {
      ...document,
      scenes: [{ ...document.scenes[0], title: 'Changed source' }],
    };
    await put(`/drills/${created.drill.id}/tactical-document`, {
      document: changedSource,
      expectedWriteToken: created.writeToken,
    }).expect(200);
    expect((await get(path).expect(200)).body).toEqual(saved);
    expect((await get(path, 'player').expect(200)).body).toEqual(saved);
    await put(
      path,
      { document, expectedWriteToken: saved.writeToken },
      'player',
    ).expect(403);
    await get(`/training-plans/${plan.id}/drills/${attached.id}/board`).expect(
      409,
    );
    expect(
      (await get(`/training-plans/${plan.id}/editor-metadata`)).body
        .totalDuration,
    ).toBe(30);
  });

  it('never materializes a phase snapshot with a stale source token and rechecks revoked source access on writes', async () => {
    const { paths, drill, plan } = await fixture();
    const phase = (await get(paths[1])).body;
    const source = (await get(paths[0])).body;
    await put(paths[0], {
      document: v2,
      expectedWriteToken: source.writeToken,
    }).expect(200);
    await put(paths[1], {
      document: v2,
      expectedWriteToken: phase.writeToken,
    }).expect(409);
    expect(
      (
        await db.planDrill.findUniqueOrThrow({
          where: { id: plan.drills[0].id },
        })
      ).boardSnapshot,
    ).toBeNull();
    const fresh = (await get(paths[1])).body;
    const saved = (
      await put(paths[1], {
        document: v2,
        expectedWriteToken: fresh.writeToken,
      }).expect(200)
    ).body;
    await db.drill.update({
      where: { id: drill.id },
      data: { groupId: otherGroupId },
    });
    await get(paths[1]).expect(403);
    await put(paths[1], {
      document: v2,
      expectedWriteToken: saved.writeToken,
    }).expect(403);
    expect(
      (
        await db.planDrill.findUniqueOrThrow({
          where: { id: plan.drills[0].id },
        })
      ).boardSnapshot,
    ).toEqual(v2);
  });

  it('creates V1/V2 club drills, reads board-free metadata, atomically saves and copies full scenes', async () => {
    for (const document of [v1, v2]) {
      const created = (await post({ groupId, metadata, document }).expect(201))
        .body;
      const id = created.drill.id;
      expect(created.drill).toMatchObject({
        scope: 'CLUB',
        clubId,
        groupId,
        createdById: coachId,
        ageGroup: 'U18',
      });
      expect(created.drill).not.toHaveProperty('jsonData');
      const metaPath = `/drills/${id}/tactical-editor`;
      expect((await get(metaPath).expect(200)).body).toEqual(created.drill);
      const edited = {
        ...v2,
        scenes: [...v2.scenes, { ...v2.scenes[0], id: 'two', title: 'Second' }],
      };
      const saved = (
        await put(metaPath, {
          metadata: { ...metadata, title: 'Edited atomically' },
          document: edited,
          expectedWriteToken: created.writeToken,
        }).expect(200)
      ).body;
      expect(saved.document.scenes).toHaveLength(2);
      expect(saved.drill.title).toBe('Edited atomically');
      await put(metaPath, {
        metadata,
        document: v1,
        expectedWriteToken: created.writeToken,
      }).expect(409);
      expect((await get(metaPath)).body.title).toBe('Edited atomically');
      const copy = (
        await post({
          groupId,
          metadata,
          document: edited,
          sourceId: id,
          expectedSourceToken: saved.writeToken,
        }).expect(201)
      ).body;
      expect(copy.drill.id).not.toBe(id);
      expect(copy.document).toEqual(edited);
      expect((await get(`/drills/${id}/tactical-document`)).body).toEqual({
        document: saved.document,
        writeToken: saved.writeToken,
      });
      await get(`/drills/${id}`).expect(409);
    }
  });

  it('denies forged owners, invalid metadata/query, foreign/revoked sources and player writes without creating records', async () => {
    const { drill, paths } = await fixture();
    const token = (await get(paths[0])).body.writeToken;
    const input = {
      groupId,
      metadata,
      document: v1,
      sourceId: drill.id,
      expectedSourceToken: token,
    };
    const count = await db.drill.count();
    await post(input, 'player').expect(403);
    await post(input, 'foreign').expect(403);
    await post({ ...input, groupId: otherGroupId }).expect(403);
    await post({ ...input, clubId: clubId }).expect(400);
    await post({
      ...input,
      metadata: { ...metadata, authorId: coachId },
    }).expect(400);
    await post({ ...input, expectedSourceToken: 'stale' }).expect(409);
    await post(input, 'coach', '?rogue=1').expect(400);
    const path = `/drills/${drill.id}/tactical-editor`;
    await get(path + '?rogue=1').expect(400);
    await get(path, 'foreign').expect(403);
    await put(
      path,
      { metadata, document: v1, expectedWriteToken: token },
      'peer',
    ).expect(403);
    await put(
      path,
      { metadata, document: v1, expectedWriteToken: token },
      'player',
    ).expect(403);
    await db.drill.update({
      where: { id: drill.id },
      data: {
        clubId: (
          await db.playerGroup.findUniqueOrThrow({
            where: { id: otherGroupId },
          })
        ).clubId,
        groupId: otherGroupId,
      },
    });
    await post(input).expect(403);
    expect(await db.drill.count()).toBe(count);
  });

  it('keeps global review immutable and default-off writes closed while V2 reads remain available', async () => {
    const { drill } = await fixture();
    await db.drill.update({
      where: { id: drill.id },
      data: { scope: 'GLOBAL', clubId: null, groupId: null, createdById: null },
    });
    const before = (await get(`/drills/${drill.id}/tactical-document`)).body;
    await put(
      `/drills/${drill.id}/tactical-editor`,
      { metadata, document: v1, expectedWriteToken: before.writeToken },
      'system',
    ).expect(403);
    const copy = (
      await post({
        groupId,
        metadata,
        document: v2,
        sourceId: drill.id,
        expectedSourceToken: before.writeToken,
      }).expect(201)
    ).body;
    delete process.env.TACTICAL_V2_WRITES_ENABLED;
    try {
      await get(`/drills/${copy.drill.id}/tactical-document`).expect(200);
      await post({ groupId, metadata, document: v2 }).expect(403);
      await put(`/drills/${copy.drill.id}/tactical-editor`, {
        metadata,
        document: v2,
        expectedWriteToken: copy.writeToken,
      }).expect(403);
      await post({ groupId, metadata, document: v1 }).expect(201);
    } finally {
      process.env.TACTICAL_V2_WRITES_ENABLED = 'true';
    }
  });

  it('rolls back the board when a later metadata persistence step fails', async () => {
    const { drill, paths } = await fixture();
    const before = (await get(paths[0])).body;
    // Fault injection exists only in the guarded disposable database.
    await db.$executeRawUnsafe(
      `CREATE FUNCTION tactical_test_failure() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.title = 'TRIPWIRE' THEN RAISE EXCEPTION 'synthetic persistence fault'; END IF; RETURN NEW; END; $$`,
    );
    await db.$executeRawUnsafe(
      `CREATE TRIGGER tactical_test_failure BEFORE UPDATE ON "Drill" FOR EACH ROW EXECUTE FUNCTION tactical_test_failure()`,
    );
    try {
      const response = await put(`/drills/${drill.id}/tactical-editor`, {
        metadata: { ...metadata, title: 'TRIPWIRE' },
        document: v2,
        expectedWriteToken: before.writeToken,
      }).expect(500);
      expect(JSON.stringify(response.body)).not.toContain(
        'synthetic persistence fault',
      );
      expect((await get(paths[0])).body).toEqual(before);
      expect(
        (await db.drill.findUniqueOrThrow({ where: { id: drill.id } })).title,
      ).toBe(drill.title);
    } finally {
      await db.$executeRawUnsafe(
        `DROP TRIGGER tactical_test_failure ON "Drill"`,
      );
      await db.$executeRawUnsafe('DROP FUNCTION tactical_test_failure()');
    }
  });

  it('round-trips club V2, source snapshot isolation, match V2 and unchanged plan duration', async () => {
    const { paths, plan } = await fixture();
    for (const path of paths) {
      const before = await get(path).expect(200);
      const saved = await put(path, {
        document: v2,
        expectedWriteToken: before.body.writeToken,
      }).expect(200);
      expect(saved.body.document).toEqual(v2);
      expect((await get(path).expect(200)).body).toEqual(saved.body);
    }
    const snapshot = (await get(paths[1])).body;
    const source = (await get(paths[0])).body;
    await put(paths[0], {
      document: { ...v2, scenes: [{ ...v2.scenes[0], title: 'Changed' }] },
      expectedWriteToken: source.writeToken,
    }).expect(200);
    expect((await get(paths[1])).body).toEqual(snapshot);
    expect(
      (await db.trainingPlan.findUniqueOrThrow({ where: { id: plan.id } }))
        .totalDuration,
    ).toBe(0);
  });

  it.each([
    v1,
    {
      ...v2,
      scenes: [
        ...v2.scenes,
        { ...v2.scenes[0], id: 'two', title: 'İkinci sahne' },
      ],
    },
  ])(
    'preserves the imported document through club copy, phase snapshot and match with independent tokens: V$schemaVersion',
    async (document) => {
      const { plan, match, paths } = await fixture();
      // JSON is the interchange boundary; it carries all scenes, never server tokens.
      const imported = JSON.parse(JSON.stringify(document));
      const source = (
        await post({ groupId, metadata, document: imported }).expect(201)
      ).body;
      const copy = (
        await post({
          groupId,
          metadata: { ...metadata, title: 'Independent club copy' },
          document: imported,
          sourceId: source.drill.id,
          expectedSourceToken: source.writeToken,
        }).expect(201)
      ).body;
      const attached = (
        await request(app.getHttpServer())
          .post(`/training-plans/${plan.id}/drills`)
          .auth(tokens.coach, { type: 'bearer' })
          .send({ drillId: copy.drill.id, phase: 'TACTICAL', order: 1 })
          .expect(201)
      ).body;
      const phasePath = `/training-plans/${plan.id}/drills/${attached.id}/tactical-document`;
      const phase = (await get(phasePath)).body;
      expect(phase.document).toEqual(imported);
      expect(phase.writeToken).not.toBe(copy.writeToken);
      await put(phasePath, {
        document: imported,
        expectedWriteToken: copy.writeToken,
      }).expect(409);
      const snapshot = (
        await put(phasePath, {
          document: imported,
          expectedWriteToken: phase.writeToken,
        }).expect(200)
      ).body;
      const matchBefore = (await get(paths[2])).body;
      await put(paths[2], {
        document: JSON.parse(JSON.stringify(snapshot.document)),
        expectedWriteToken: snapshot.writeToken,
      }).expect(409);
      const savedMatch = (
        await put(paths[2], {
          document: JSON.parse(JSON.stringify(snapshot.document)),
          expectedWriteToken: matchBefore.writeToken,
        }).expect(200)
      ).body;
      const changed =
        imported.schemaVersion === 1
          ? {
              ...imported,
              elements: [{ id: 'new-ball', type: 'ball', x: 400, y: 300 }],
            }
          : {
              ...imported,
              scenes: [{ ...imported.scenes[0], title: 'Changed source' }],
            };
      await put(`/drills/${source.drill.id}/tactical-document`, {
        document: changed,
        expectedWriteToken: source.writeToken,
      }).expect(200);
      await put(`/drills/${copy.drill.id}/tactical-document`, {
        document: changed,
        expectedWriteToken: copy.writeToken,
      }).expect(200);
      expect((await get(phasePath)).body).toEqual(snapshot);
      expect((await get(paths[2])).body).toEqual(savedMatch);
      expect(
        (await get(`/training-plans/${plan.id}/editor-metadata`)).body
          .totalDuration,
      ).toBe(30);
      expect(
        (await get(`/matches/catalog/metadata/${match.id}?groupId=${groupId}`))
          .body.hasBoard,
      ).toBe(true);
      delete process.env.TACTICAL_V2_WRITES_ENABLED;
      try {
        expect((await get(phasePath)).body.document).toEqual(imported);
        expect((await get(paths[2])).body.document).toEqual(imported);
        await put(paths[2], {
          document: v2,
          expectedWriteToken: savedMatch.writeToken,
        }).expect(403);
        if (imported.schemaVersion === 2) {
          await put(`/training-plans/${plan.id}/drills/${attached.id}/board`, {
            boardSnapshot: v1,
          }).expect(409);
          await put(`/seasons/matches/${match.id}/tactical-board`, {
            tacticalBoard: v1,
          }).expect(409);
        }
      } finally {
        process.env.TACTICAL_V2_WRITES_ENABLED = 'true';
      }
    },
  );

  it('serves authorized board-free match metadata before and after V2 saves while legacy detail stays guarded', async () => {
    const { match, paths } = await fixture();
    const path = `/matches/catalog/metadata/${match.id}?groupId=${groupId}&seasonId=${seasonId}`;
    const empty = await get(path).expect(200);
    expect(empty.body.hasBoard).toBe(false);
    expect(empty.body).not.toHaveProperty('tacticalBoard');
    const before = (await get(paths[2]).expect(200)).body;
    await put(paths[2], {
      document: v2,
      expectedWriteToken: before.writeToken,
    }).expect(200);
    const metadata = await get(path).expect(200);
    expect(metadata.body.hasBoard).toBe(true);
    expect(metadata.body.id).toBe(match.id);
    expect(metadata.body).not.toHaveProperty('tacticalBoard');
    await get(`/matches/catalog/detail/${match.id}?groupId=${groupId}`).expect(
      409,
    );
    await get(`${path}&extra=true`).expect(400);
    await get(path, 'foreign').expect(403);
    await get(
      `/matches/catalog/metadata/${match.id}?groupId=${otherGroupId}`,
      'foreign',
    ).expect(404);
    await get(path, 'player').expect(200);
    const current = (await get(paths[2])).body;
    await put(
      paths[2],
      { document: v2, expectedWriteToken: current.writeToken },
      'player',
    ).expect(403);
    await put(`/seasons/matches/${match.id}`, {
      notes: 'Analysis separate from board',
    }).expect(200);
    expect((await get(paths[2])).body).toEqual(current);
    expect((await get(path)).body.notes).toBe('Analysis separate from board');
  });

  it('has one winner for simultaneous edits with the same token on all three resource types', async () => {
    const { paths } = await fixture();
    for (const path of paths) {
      const before = (await get(path)).body;
      const changes = ['A', 'B'].map((title) => ({
        ...v2,
        scenes: [{ ...v2.scenes[0], title }],
      }));
      const responses = await Promise.all(
        changes.map((document) =>
          put(path, { document, expectedWriteToken: before.writeToken }),
        ),
      );
      expect(responses.map((response) => response.status).sort()).toEqual([
        200, 409,
      ]);
      const winner = responses.find((response) => response.status === 200)!;
      expect((await get(path)).body).toEqual(winner.body);
    }
  });

  it('rejects cross-club / PLAYER writes, other-coach ownership, unknown fields and stale provenance', async () => {
    const { paths, drill } = await fixture();
    for (const path of paths) {
      await request(app.getHttpServer()).get(path).expect(401);
      await get(path, 'foreign').expect(403);
      await put(path, {}, 'player').expect(403);
      const before = (await get(path)).body;
      await put(path, { document: v2 }).expect(400);
      await put(path, {
        document: v2,
        expectedWriteToken: before.writeToken,
        clubId,
      }).expect(400);
      await get(`${path}?rogue=true`).expect(400);
    }
    await put(paths[0], {}, 'peer').expect(403);
    const beforeSourceChange = (await get(paths[1])).body;
    const source = (await get(paths[0])).body;
    await put(
      paths[0],
      { document: v2, expectedWriteToken: source.writeToken },
      'admin',
    ).expect(200);
    await put(paths[1], {
      document: v2,
      expectedWriteToken: beforeSourceChange.writeToken,
    }).expect(409);
    // Source authorization is checked even when the snapshot is present.
    await db.planDrill.updateMany({
      where: { drillId: drill.id },
      data: { boardSnapshot: v2 },
    });
    await db.drill.update({
      where: { id: drill.id },
      data: { groupId: otherGroupId },
    });
    await get(paths[1]).expect(403);
  });

  it('protects every legacy writer, blocks old readers, preserves metadata and guards bulk replacement', async () => {
    const { paths, drill, plan, match } = await fixture();
    for (const path of paths) {
      const before = (await get(path)).body;
      await put(path, {
        document: v2,
        expectedWriteToken: before.writeToken,
      }).expect(200);
    }
    await put(`/drills/${drill.id}`, { jsonData: v1 }).expect(409);
    await put(`/drills/${drill.id}`, { jsonData: null }).expect(409);
    await put(`/drills/${drill.id}`, { title: 'Metadata only' }).expect(200);
    await put(`/training-plans/${plan.id}/drills/${plan.drills[0].id}/board`, {
      boardSnapshot: v1,
    }).expect(409);
    await put(`/training-plans/${plan.id}/drills`, { drills: [] }).expect(409);
    await put(`/seasons/matches/${match.id}/tactical-board`, {
      tacticalBoard: v1,
    }).expect(409);
    await put(`/seasons/matches/${match.id}`, {
      notes: 'Metadata only',
    }).expect(200);
    await get(`/drills/${drill.id}`).expect(409);
    await get(
      `/training-plans/${plan.id}/drills/${plan.drills[0].id}/board`,
    ).expect(409);
    await get(`/matches/catalog/detail/${match.id}?groupId=${groupId}`).expect(
      409,
    );
    expect(
      await db.planDrill.count({ where: { trainingPlanId: plan.id } }),
    ).toBe(1);
    for (const path of paths)
      expect((await get(path)).body.document).toEqual(v2);
  });

  it('keeps V1 writers working and default-off gate independent of read/downgrade protection', async () => {
    const { paths, drill, match, plan } = await fixture();
    await put(`/drills/${drill.id}`, { jsonData: v1 }).expect(200);
    await put(`/seasons/matches/${match.id}/tactical-board`, {
      tacticalBoard: v1,
    }).expect(200);
    await put(`/training-plans/${plan.id}/drills/${plan.drills[0].id}/board`, {
      boardSnapshot: v1,
    }).expect(200);
    const before = (await get(paths[0])).body;
    delete process.env.TACTICAL_V2_WRITES_ENABLED;
    try {
      await put(paths[0], {
        document: v2,
        expectedWriteToken: before.writeToken,
      }).expect(403);
    } finally {
      process.env.TACTICAL_V2_WRITES_ENABLED = 'true';
    }
    const saved = (
      await put(paths[0], {
        document: v2,
        expectedWriteToken: before.writeToken,
      }).expect(200)
    ).body;
    delete process.env.TACTICAL_V2_WRITES_ENABLED;
    try {
      expect((await get(paths[0])).body.document).toEqual(v2);
      await put(paths[0], {
        document: v1,
        expectedWriteToken: saved.writeToken,
      }).expect(409);
      await put(`/drills/${drill.id}`, { jsonData: v1 }).expect(409);
    } finally {
      process.env.TACTICAL_V2_WRITES_ENABLED = 'true';
    }
  });

  it('rejects global document writes and malformed snapshots without fallback', async () => {
    const { paths, plan } = await fixture();
    const global = await db.drill.create({
      data: {
        title: 'Synthetic global',
        category: 'TACTICAL',
        ageGroup: 'U18',
        durationMin: 10,
        difficulty: 'MEDIUM',
        jsonData: v1,
      },
    });
    await put(`/drills/${global.id}/tactical-document`, {}, 'system').expect(
      403,
    );
    await db.planDrill.update({
      where: { id: plan.drills[0].id },
      data: { boardSnapshot: { invalid: true } },
    });
    await get(paths[1]).expect(400);
    await db.planDrill.update({
      where: { id: plan.drills[0].id },
      data: { boardSnapshot: Prisma.JsonNull },
    });
    expect((await get(paths[1])).body.document).toEqual(v1);
  });

  it('enforces the 500 KB domain document limit independently of the 600 KB HTTP envelope', async () => {
    const { paths } = await fixture();
    const initial = (await get(paths[0])).body;
    const document = structuredClone(v2);
    document.scenes[0].title += ' '.repeat(
      500_000 - Buffer.byteLength(JSON.stringify(document)),
    );
    const saved = await put(paths[0], {
      document,
      expectedWriteToken: initial.writeToken,
    }).expect(200);
    expect(saved.body.document).toEqual(v2);
    document.scenes[0].title += ' ';
    await put(paths[0], {
      document,
      expectedWriteToken: saved.body.writeToken,
    }).expect(400);
    expect((await get(paths[0])).body).toEqual(saved.body);
  });

  it('enforces route-scoped byte limits including inflated gzip, JSON errors and the default 100 KB', async () => {
    const { paths, drill } = await fixture();
    const body = JSON.stringify({
      document: v1,
      expectedWriteToken: (await get(paths[0])).body.writeToken,
    });
    const exact = body + ' '.repeat(600_000 - Buffer.byteLength(body));
    await request(app.getHttpServer())
      .put(paths[0])
      .auth(tokens.coach, { type: 'bearer' })
      .set('Content-Type', 'application/json')
      .send(exact)
      .expect(200);
    const tooLarge = exact + ' ';
    for (const path of paths) {
      await request(app.getHttpServer())
        .put(path)
        .auth(tokens.coach, { type: 'bearer' })
        .set('Content-Type', 'application/json')
        .send(tooLarge)
        .expect(413);
    }
    await request(app.getHttpServer())
      .put(paths[0])
      .set('Content-Type', 'application/json')
      .set('Content-Encoding', 'gzip')
      .serialize((data) => data)
      .send(gzipSync(tooLarge))
      .expect(413);
    await request(app.getHttpServer())
      .put(`/drills/${drill.id}`)
      .set('Content-Type', 'application/json')
      .send(exact)
      .expect(413);
    await request(app.getHttpServer())
      .put(paths[0])
      .set('Content-Type', 'application/json')
      .send('{broken private text')
      .expect(400)
      .expect(({ body }) => {
        expect(JSON.stringify(body)).not.toContain('private');
      });
  });

  it('allows exactly 600000 HTTP bytes only on the new editor POST/PUT and bounds inflated gzip', async () => {
    const body = JSON.stringify({ groupId, metadata, document: v1 });
    const exact = body + ' '.repeat(600_000 - Buffer.byteLength(body));
    const created = await request(app.getHttpServer())
      .post('/drills/tactical-editor')
      .auth(tokens.coach, { type: 'bearer' })
      .set('Content-Type', 'application/json')
      .send(exact)
      .expect(201);
    const path = `/drills/${created.body.drill.id}/tactical-editor`;
    const edit = JSON.stringify({
      metadata,
      document: v1,
      expectedWriteToken: created.body.writeToken,
    });
    const editExact = edit + ' '.repeat(600_000 - Buffer.byteLength(edit));
    await request(app.getHttpServer())
      .put(path)
      .auth(tokens.coach, { type: 'bearer' })
      .set('Content-Type', 'application/json')
      .send(editExact)
      .expect(200);
    await request(app.getHttpServer())
      .put(path)
      .set('Content-Type', 'application/json')
      .send(editExact + ' ')
      .expect(413);
    await request(app.getHttpServer())
      .post('/drills/tactical-editor')
      .set('Content-Type', 'application/json')
      .send(exact + ' ')
      .expect(413);
    await request(app.getHttpServer())
      .post('/drills/tactical-editor')
      .set('Content-Type', 'application/json')
      .set('Content-Encoding', 'gzip')
      .serialize((data) => data)
      .send(gzipSync(exact + ' '))
      .expect(413);
    await request(app.getHttpServer())
      .post('/drills')
      .set('Content-Type', 'application/json')
      .send(exact)
      .expect(413);
  });
});
