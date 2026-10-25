import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Prisma, PrismaClient, UserRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { validateTacticalBoardDocument } from '../src/tactics/tactical-board';
import { performance } from 'node:perf_hooks';

const canonicalBoard = {
  schemaVersion: 1,
  kind: 'tactical-board',
  pitch: { type: 'full', width: 1200, height: 800 },
  elements: [],
};

describe('Training editor additive reads (disposable PostgreSQL)', () => {
  let app: INestApplication;
  const client = (url: string) =>
    new PrismaClient({
      datasourceUrl: url,
      log: [{ emit: 'event', level: 'query' }],
      omit: { user: { passwordHash: true } },
    });
  let prisma: ReturnType<typeof client>;
  const prefix = `editor-${randomUUID()}`;
  const id = (label: string) => `${prefix}-${label}`;
  const clubIds = [id('club'), id('foreign')];
  const planIds = [
    id('plan'),
    id('other-plan'),
    id('hidden-plan'),
    id('foreign-plan'),
  ];
  const groupIds = [id('group'), id('hidden'), id('foreign-group')];
  const sourceId = id('source');
  const otherSourceId = id('other-source');
  const phaseId = id('phase');
  const snapshot = {
    ...canonicalBoard,
    elements: [{ id: 'ball', type: 'ball', x: 10, y: 20 }],
  };
  const tokens: Partial<Record<UserRole, string>> = {};
  let capture = false;
  const queries: string[] = [];

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
    process.env.JWT_SECRET = 'editor-e2e-only-secret-at-least-32-characters';
    process.env.PERSISTENT_SESSIONS_ENABLED = 'false';
    prisma = client(url);
    const module = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();
    app = module.createNestApplication();
    await app.listen(0, '127.0.0.1');
    prisma.$on('query', (event) => {
      if (capture) queries.push(event.query);
    });
    await prisma.club.createMany({
      data: clubIds.map((clubId) => ({
        id: clubId,
        name: 'Synthetic editor club',
      })),
    });
    for (const role of [
      'COACH',
      'PLAYER',
      'CLUB_ADMIN',
      'SYSTEM_ADMIN',
    ] as const) {
      const user = await prisma.user.create({
        data: {
          id: id(role),
          name: `Synthetic ${role}`,
          email: `${id(role)}@example.test`,
          role,
          clubId: role === 'SYSTEM_ADMIN' ? null : clubIds[0],
          passwordHash: 'not-a-login-credential',
        },
      });
      tokens[role] = app
        .get(JwtService)
        .sign({ sub: user.id, ver: user.authVersion });
    }
    await prisma.playerGroup.createMany({
      data: groupIds.map((groupId, index) => ({
        id: groupId,
        clubId: index === 2 ? clubIds[1] : clubIds[0],
        name: 'Synthetic group',
        ageGroup: 'U18',
      })),
    });
    await prisma.groupMember.createMany({
      data: ['COACH', 'PLAYER'].map((role) => ({
        groupId: groupIds[0],
        userId: id(role),
      })),
    });
    await prisma.trainingPlan.createMany({
      data: planIds.map((planId, index) => ({
        id: planId,
        clubId: index === 3 ? clubIds[1] : clubIds[0],
        groupId: index < 2 ? groupIds[0] : groupIds[index - 1],
        coachId: id('COACH'),
        title: 'Synthetic editor plan',
        notes: 'Keep this note',
      })),
    });
    await prisma.drill.createMany({
      data: [sourceId, otherSourceId].map((drillId) => ({
        id: drillId,
        title: 'Synthetic board',
        category: 'TACTICAL',
        ageGroup: 'U18',
        durationMin: 10,
        difficulty: 'EASY',
        jsonData: canonicalBoard,
      })),
    });
    // Intentionally shuffled orders; repeated source IDs must remain distinct phases.
    await prisma.planDrill.createMany({
      data: [
        {
          id: phaseId,
          trainingPlanId: planIds[0],
          drillId: sourceId,
          phase: 'TACTICAL',
          order: 9,
          boardSnapshot: snapshot,
        },
        {
          id: id('warm-b'),
          trainingPlanId: planIds[0],
          drillId: sourceId,
          phase: 'WARM_UP',
          order: 2,
        },
        {
          id: id('warm-a'),
          trainingPlanId: planIds[0],
          drillId: otherSourceId,
          phase: 'WARM_UP',
          order: 2,
        },
        {
          id: id('technical'),
          trainingPlanId: planIds[0],
          drillId: sourceId,
          phase: 'TECHNICAL',
          order: 1,
        },
        {
          id: id('cool'),
          trainingPlanId: planIds[0],
          drillId: sourceId,
          phase: 'COOL_DOWN',
          order: 0,
        },
        {
          id: id('other-phase'),
          trainingPlanId: planIds[1],
          drillId: sourceId,
          phase: 'TACTICAL',
          order: 0,
        },
        {
          id: id("quote'--"),
          trainingPlanId: planIds[1],
          drillId: sourceId,
          phase: 'TACTICAL',
          order: 1,
        },
      ],
    });
  });

  afterAll(async () => {
    capture = false;
    if (prisma) {
      await prisma.planDrill.deleteMany({
        where: { trainingPlanId: { in: planIds } },
      });
      await prisma.trainingPlan.deleteMany({ where: { id: { in: planIds } } });
      await prisma.drill.deleteMany({
        where: { id: { in: [sourceId, otherSourceId] } },
      });
      await prisma.groupMember.deleteMany({
        where: { groupId: { in: groupIds } },
      });
      await prisma.playerGroup.deleteMany({ where: { id: { in: groupIds } } });
      await prisma.user.deleteMany({
        where: {
          id: { in: ['COACH', 'PLAYER', 'CLUB_ADMIN', 'SYSTEM_ADMIN'].map(id) },
        },
      });
      await prisma.club.deleteMany({ where: { id: { in: clubIds } } });
    }
    await app?.close();
    await prisma?.$disconnect();
  });

  const metadataPath = (planId = planIds[0]) =>
    `/training-plans/${encodeURIComponent(planId)}/editor-metadata`;
  const boardPath = (planId = planIds[0], pdId = phaseId) =>
    `/training-plans/${encodeURIComponent(planId)}/drills/${encodeURIComponent(pdId)}/board`;
  const get = (path: string, role: UserRole = 'COACH') =>
    request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${tokens[role]}`);

  it('returns complete ordered scalar metadata and supports all existing view roles', async () => {
    queries.length = 0;
    capture = true;
    const response = await get(metadataPath()).expect(200);
    capture = false;
    expect(Object.keys(response.body).sort()).toEqual(
      [
        'id',
        'title',
        'groupId',
        'date',
        'notes',
        'totalDuration',
        'drills',
      ].sort(),
    );
    expect(
      response.body.drills.map((phase: { id: string }) => phase.id),
    ).toEqual([
      id('warm-a'),
      id('warm-b'),
      id('technical'),
      phaseId,
      id('cool'),
    ]);
    for (const phase of response.body.drills) {
      expect(Object.keys(phase).sort()).toEqual(
        ['id', 'drillId', 'phase', 'order', 'notes', 'drill'].sort(),
      );
      expect(Object.keys(phase.drill).sort()).toEqual(
        ['id', 'title', 'durationMin'].sort(),
      );
    }
    expect(queries.join('\n')).not.toMatch(/boardSnapshot|jsonData|Attendance/);
    for (const role of ['SYSTEM_ADMIN', 'CLUB_ADMIN', 'PLAYER'] as const) {
      await get(metadataPath(), role).expect(200);
      const selected = await get(boardPath(), role).expect(200);
      expect(selected.body).toEqual({
        planId: planIds[0],
        planDrillId: phaseId,
        drillId: sourceId,
        status: 'ready',
        origin: 'snapshot',
        document: snapshot,
      });
    }
    await get(metadataPath(planIds[1])).expect(200);
  });

  it('rejects unauthenticated, unknown query, other club/group and mismatched phase requests', async () => {
    await request(app.getHttpServer()).get(metadataPath()).expect(401);
    await request(app.getHttpServer()).get(boardPath()).expect(401);
    await get(`${metadataPath()}?include=drills`).expect(400);
    await get(`${boardPath()}?clubId=${clubIds[1]}`).expect(400);
    await get(metadataPath('x'.repeat(161))).expect(400);
    await get(boardPath(planIds[0], ' bad')).expect(400);
    queries.length = 0;
    capture = true;
    for (const planId of [planIds[2], planIds[3]]) {
      await get(metadataPath(planId)).expect(403);
      await get(boardPath(planId)).expect(403);
    }
    await get(boardPath(planIds[0], id('other-phase'))).expect(404);
    capture = false;
    expect(queries.join('\n')).not.toMatch(/boardSnapshot|jsonData/);
    await get(metadataPath(id('missing'))).expect(404);
    // Quotes are data, not SQL syntax. The correctly bound existing ID still works.
    await get(boardPath(planIds[1], id("quote'--"))).expect(200);
  });

  it('retains snapshot priority; SQL/JSON null fall back, invalid non-null does not', async () => {
    const source = {
      ...canonicalBoard,
      elements: [{ id: 'new', type: 'ball', x: 30, y: 40 }],
    };
    await prisma.drill.update({
      where: { id: sourceId },
      data: { jsonData: source },
    });
    expect((await get(boardPath()).expect(200)).body.document).toEqual(
      snapshot,
    );
    for (const value of [Prisma.DbNull, Prisma.JsonNull]) {
      await prisma.planDrill.update({
        where: { id: phaseId },
        data: { boardSnapshot: value },
      });
      expect((await get(boardPath()).expect(200)).body).toMatchObject({
        origin: 'drill',
        status: 'ready',
        document: source,
      });
    }
    for (const value of [
      false,
      0,
      '',
      { legacy: 'not-to-be-returned' },
      { ...canonicalBoard, extra: true },
    ]) {
      await prisma.planDrill.update({
        where: { id: phaseId },
        data: { boardSnapshot: value },
      });
      expect((await get(boardPath()).expect(200)).body).toEqual({
        planId: planIds[0],
        planDrillId: phaseId,
        drillId: sourceId,
        origin: 'snapshot',
        status: 'invalid',
        document: null,
      });
    }
    await prisma.planDrill.update({
      where: { id: phaseId },
      data: { boardSnapshot: Prisma.DbNull },
    });
    await prisma.drill.update({
      where: { id: sourceId },
      data: { jsonData: Prisma.JsonNull },
    });
    expect((await get(boardPath()).expect(200)).body).toMatchObject({
      origin: null,
      status: 'absent',
      document: null,
    });
    await prisma.drill.update({
      where: { id: sourceId },
      data: { jsonData: { legacy: true } },
    });
    expect((await get(boardPath()).expect(200)).body).toMatchObject({
      origin: 'drill',
      status: 'invalid',
      document: null,
    });
    await prisma.drill.update({
      where: { id: sourceId },
      data: { jsonData: canonicalBoard },
    });
    await prisma.planDrill.update({
      where: { id: phaseId },
      data: { boardSnapshot: snapshot },
    });
  });

  it('enforces exact byte and element boundaries on stored selected boards', async () => {
    const sized = {
      ...canonicalBoard,
      elements: Array.from({ length: 200 }, (_, i) => ({
        id: `t${i}`,
        type: 'text',
        x: 1,
        y: 1,
        fontSize: 12,
        text: '',
      })),
    };
    let remaining = 100_000 - Buffer.byteLength(JSON.stringify(sized));
    for (const element of sized.elements) {
      const size = Math.min(500, remaining);
      element.text = 'x'.repeat(size);
      remaining -= size;
    }
    expect(remaining).toBe(0);
    expect(Buffer.byteLength(JSON.stringify(sized))).toBe(100_000);
    await prisma.planDrill.update({
      where: { id: phaseId },
      data: { boardSnapshot: sized },
    });
    expect((await get(boardPath()).expect(200)).body.status).toBe('ready');
    sized.elements[sized.elements.length - 1].text += 'x';
    expect(Buffer.byteLength(JSON.stringify(sized))).toBe(100_001);
    await prisma.planDrill.update({
      where: { id: phaseId },
      data: { boardSnapshot: sized },
    });
    expect((await get(boardPath()).expect(200)).body).toMatchObject({
      status: 'invalid',
      document: null,
    });
    for (const count of [250, 251]) {
      await prisma.planDrill.update({
        where: { id: phaseId },
        data: {
          boardSnapshot: {
            ...canonicalBoard,
            elements: Array.from({ length: count }, (_, i) => ({
              id: `b${i}`,
              type: 'ball',
              x: 1,
              y: 1,
            })),
          },
        },
      });
      expect((await get(boardPath()).expect(200)).body.status).toBe(
        count === 250 ? 'ready' : 'invalid',
      );
    }
    await prisma.planDrill.update({
      where: { id: phaseId },
      data: { boardSnapshot: snapshot },
    });
  });

  it('ignores unselected JSON size and makes exactly one effective content projection', async () => {
    const before = (await get(metadataPath()).expect(200)).body;
    await prisma.drill.update({
      where: { id: otherSourceId },
      data: { jsonData: { largeLegacy: 'x'.repeat(200_000) } },
    });
    expect((await get(metadataPath()).expect(200)).body).toEqual(before);
    queries.length = 0;
    capture = true;
    const result = await get(boardPath()).expect(200);
    capture = false;
    expect(result.body.document).toEqual(snapshot);
    const contentQueries = queries.filter((query) =>
      /boardSnapshot|jsonData/.test(query),
    );
    expect(contentQueries).toHaveLength(1);
    expect(contentQueries[0]).toContain('COALESCE(');
    expect(Object.keys(result.body).sort()).toEqual(
      [
        'planId',
        'planDrillId',
        'drillId',
        'origin',
        'status',
        'document',
      ].sort(),
    );
  });

  it('preserves existing writes, other snapshot IDs and old full editor contracts', async () => {
    await prisma.planDrill.update({
      where: { id: phaseId },
      data: { boardSnapshot: Prisma.DbNull },
    });
    const saved = await request(app.getHttpServer())
      .put(boardPath())
      .set('Authorization', `Bearer ${tokens.COACH}`)
      .send({ boardSnapshot: snapshot })
      .expect(200);
    expect(saved.body.boardSnapshot).toEqual(snapshot);
    expect(saved.body.drill.jsonData).toEqual(canonicalBoard);
    await request(app.getHttpServer())
      .put(boardPath())
      .set('Authorization', `Bearer ${tokens.PLAYER}`)
      .send({ boardSnapshot: snapshot })
      .expect(403);
    await request(app.getHttpServer())
      .post(`/training-plans/${planIds[0]}/drills`)
      .set('Authorization', `Bearer ${tokens.PLAYER}`)
      .send({ drillId: sourceId, phase: 'TACTICAL', order: 10 })
      .expect(403);
    const added = await request(app.getHttpServer())
      .post(`/training-plans/${planIds[0]}/drills`)
      .set('Authorization', `Bearer ${tokens.COACH}`)
      .send({ drillId: sourceId, phase: 'TACTICAL', order: 10 })
      .expect(201);
    expect(added.body.id).toBeTruthy();
    const plan = (await get(metadataPath()).expect(200)).body;
    expect(plan.drills).toHaveLength(6);
    expect(plan.totalDuration).toBe(60);
    expect((await get(boardPath()).expect(200)).body.document).toEqual(
      snapshot,
    );
    for (const suffix of ['', '/editor']) {
      const legacy = await get(`/training-plans/${planIds[0]}${suffix}`).expect(
        200,
      );
      const phase = legacy.body.drills.find(
        (entry: { id: string }) => entry.id === phaseId,
      );
      expect(phase.boardSnapshot).toEqual(snapshot);
      expect(phase.drill.jsonData).toEqual(canonicalBoard);
    }
  });

  it('checks current source access even for a saved snapshot, without changing legacy GET', async () => {
    // Deliberately corrupt a legacy link in this disposable fixture only.
    await prisma.drill.update({
      where: { id: sourceId },
      data: {
        scope: 'CLUB',
        clubId: clubIds[0],
        groupId: groupIds[1],
        createdById: id('COACH'),
      },
    });
    queries.length = 0;
    capture = true;
    await get(boardPath()).expect(403);
    await get(boardPath(), 'PLAYER').expect(403);
    capture = false;
    expect(queries.join('\n')).not.toMatch(/boardSnapshot|jsonData/);
    await get(boardPath(), 'CLUB_ADMIN').expect(200);
    await get(`/training-plans/${planIds[0]}/editor`).expect(200);
    await prisma.drill.update({
      where: { id: sourceId },
      data: { clubId: clubIds[1], groupId: groupIds[2] },
    });
    await get(boardPath(), 'CLUB_ADMIN').expect(403);
    await get(boardPath(), 'SYSTEM_ADMIN').expect(200);
    await prisma.drill.update({
      where: { id: sourceId },
      data: { scope: 'GLOBAL', clubId: null, groupId: null, createdById: null },
    });
  });

  it('denies revoked group membership with the same previously valid token', async () => {
    await prisma.groupMember.deleteMany({
      where: { groupId: groupIds[0], userId: id('COACH') },
    });
    await get(metadataPath()).expect(403);
    await get(boardPath()).expect(403);
    await get(metadataPath(), 'CLUB_ADMIN').expect(200);
  });

  // Run alone: query events/latencies must not overlap other suites or workload.
  (process.env.NGCS_EDITOR_BENCH === 'true' ? it : it.skip)(
    'measures matched valid-board reads at 2 and 50 phases',
    async () => {
      const membership = { groupId: groupIds[0], userId: id('COACH') };
      if (!(await prisma.groupMember.findFirst({ where: membership })))
        await prisma.groupMember.create({ data: membership });
      const board = (label: string) => ({
        ...canonicalBoard,
        elements: Array.from({ length: 40 }, (_, index) => ({
          id: `text-${index}`,
          type: 'text',
          x: 20,
          y: 20,
          fontSize: 12,
          text: `${label}-${String(index).padStart(2, '0')}-${'x'.repeat(160)}`,
        })),
      });
      const source = board('source');
      const selected = board('snap00');
      validateTacticalBoardDocument(source);
      validateTacticalBoardDocument(selected);
      await prisma.drill.update({
        where: { id: sourceId },
        data: {
          scope: 'GLOBAL',
          clubId: null,
          groupId: null,
          createdById: null,
          jsonData: source,
        },
      });
      const bytes = (value: unknown) =>
        Buffer.byteLength(JSON.stringify(value));
      const round = (value: number) => Number(value.toFixed(2));
      const results: Array<{
        phases: number;
        reads: Record<
          string,
          {
            bytes: number;
            queries: number;
            contentQueries: number;
            p50Ms: number;
            p95Ms: number;
          }
        >;
      }> = [];
      let smallSelectedBody: unknown;
      for (const count of [2, 50]) {
        await prisma.planDrill.deleteMany({
          where: { trainingPlanId: planIds[0] },
        });
        await prisma.planDrill.createMany({
          data: Array.from({ length: count }, (_, index) => {
            const document = board(`snap${String(index).padStart(2, '0')}`);
            validateTacticalBoardDocument(document);
            return {
              id: index === 0 ? phaseId : id(`bench-${index}`),
              trainingPlanId: planIds[0],
              drillId: sourceId,
              phase: 'TACTICAL' as const,
              order: index,
              notes: null,
              boardSnapshot: document,
            };
          }),
        });
        // Statistics updates are restricted to this guarded disposable database.
        await prisma.$executeRaw`ANALYZE "PlanDrill", "Drill", "TrainingPlan"`;
        const paths = {
          legacy: `/training-plans/${planIds[0]}/editor`,
          metadata: metadataPath(),
          selected: boardPath(),
        };
        const samples: Record<string, number[]> = {
          legacy: [],
          metadata: [],
          selected: [],
        };
        const measurements: (typeof results)[number]['reads'] = {};
        const bodies: Record<string, unknown> = {};
        for (const path of Object.values(paths)) await get(path).expect(200);
        // Rotate endpoint order to avoid always giving one path the warmest cache.
        for (let sample = 0; sample < 12; sample++) {
          const names = Object.keys(paths) as Array<keyof typeof paths>;
          const rotation = sample % names.length;
          for (const name of [
            ...names.slice(rotation),
            ...names.slice(0, rotation),
          ]) {
            queries.length = 0;
            capture = true;
            const start = performance.now();
            let response: Awaited<ReturnType<typeof get>>;
            try {
              response = await get(paths[name]).expect(200);
            } finally {
              capture = false;
            }
            samples[name].push(performance.now() - start);
            const contentCount = queries.filter((query) =>
              /boardSnapshot|jsonData/.test(query),
            ).length;
            if (name === 'metadata') {
              expect(queries.join('\n')).not.toMatch(
                /boardSnapshot|jsonData|Attendance/,
              );
              expect(response.body.drills).toHaveLength(count);
              for (const phase of response.body.drills) {
                expect(Object.keys(phase).sort()).toEqual(
                  ['id', 'drillId', 'phase', 'order', 'notes', 'drill'].sort(),
                );
                expect(Object.keys(phase.drill).sort()).toEqual(
                  ['id', 'title', 'durationMin'].sort(),
                );
              }
            } else if (name === 'selected') {
              expect(contentCount).toBe(1);
              expect(
                queries.find((query) => /boardSnapshot|jsonData/.test(query)),
              ).toContain('COALESCE(');
              expect(response.body).toEqual({
                planId: planIds[0],
                planDrillId: phaseId,
                drillId: sourceId,
                origin: 'snapshot',
                status: 'ready',
                document: selected,
              });
            } else {
              expect(response.body.drills).toHaveLength(count);
              for (const phase of response.body.drills) {
                expect(phase.drill.jsonData).toEqual(source);
                expect(phase.boardSnapshot).toEqual(
                  board(`snap${String(phase.order).padStart(2, '0')}`),
                );
              }
            }
            const previous = measurements[name];
            if (previous) {
              expect(bytes(response.body)).toBe(previous.bytes);
              expect(queries.length).toBe(previous.queries);
              expect(contentCount).toBe(previous.contentQueries);
            }
            measurements[name] = {
              bytes: bytes(response.body),
              queries: queries.length,
              contentQueries: contentCount,
              p50Ms: 0,
              p95Ms: 0,
            };
            bodies[name] = response.body;
          }
        }
        for (const name of Object.keys(samples)) {
          const times = samples[name].sort((a, b) => a - b);
          measurements[name].p50Ms = round(
            times[Math.ceil(times.length * 0.5) - 1],
          );
          measurements[name].p95Ms = round(
            times[Math.ceil(times.length * 0.95) - 1],
          );
        }
        results.push({ phases: count, reads: measurements });
        if (count === 2) smallSelectedBody = bodies.selected;
        else {
          expect(bodies.selected).toEqual(smallSelectedBody);
          expect(
            measurements.metadata.bytes + measurements.selected.bytes,
          ).toBeLessThan(measurements.legacy.bytes);
          // Only unselected blobs change. Neither scalar metadata nor active board may grow.
          await prisma.planDrill.updateMany({
            where: { trainingPlanId: planIds[0], id: { not: phaseId } },
            data: { boardSnapshot: { legacy: 'x'.repeat(200_000) } },
          });
          expect((await get(metadataPath()).expect(200)).body).toEqual(
            bodies.metadata,
          );
          expect((await get(boardPath()).expect(200)).body).toEqual(
            bodies.selected,
          );
        }
      }
      for (const name of ['metadata', 'selected', 'legacy'])
        expect(results[1].reads[name].queries).toBe(
          results[0].reads[name].queries,
        );
      // Selected SQL/JSON null and invalid branches: correctness, not valid-board latency samples.
      for (const value of [
        Prisma.DbNull,
        Prisma.JsonNull,
        false,
        { legacy: true },
      ]) {
        await prisma.planDrill.update({
          where: { id: phaseId },
          data: { boardSnapshot: value },
        });
        const valueIsNull =
          value === Prisma.DbNull || value === Prisma.JsonNull;
        expect((await get(boardPath()).expect(200)).body).toMatchObject({
          origin: valueIsNull ? 'drill' : 'snapshot',
          status: valueIsNull ? 'ready' : 'invalid',
          document: valueIsNull ? source : null,
        });
      }
      await prisma.planDrill.update({
        where: { id: phaseId },
        data: { boardSnapshot: Prisma.DbNull },
      });
      await prisma.drill.update({
        where: { id: sourceId },
        data: { jsonData: Prisma.JsonNull },
      });
      expect((await get(boardPath()).expect(200)).body).toMatchObject({
        origin: null,
        status: 'absent',
        document: null,
      });
      console.info(
        'BL046_MATCHED_EDITOR_MEASUREMENT',
        JSON.stringify({
          samples: 12,
          warmupsPerEndpoint: 1,
          elementsPerBoard: 40,
          sourceDocumentBytes: bytes(source),
          snapshotDocumentBytes: bytes(selected),
          results,
        }),
      );
    },
    30_000,
  );
});
