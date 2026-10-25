import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import type { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { configureBodyParsers } from '../src/tactics/tactical-body-parser';
import { starterDrillIds } from '../src/drills/drill-starter-pack';

describe('ready drill planning (dedicated PostgreSQL)', () => {
  let app: INestApplication;
  let db: PrismaService;
  let groupId: string;
  let otherGroupId: string;
  let planId: string;
  let otherPlanId: string;
  let versionId: string;
  let drillId: string;
  let adminToken: string;
  let foreignToken: string;
  let playerToken: string;
  let reviewerId: string;
  const prefix = `ready-${randomUUID()}`;
  const post = (path: string, body: object = {}, token = adminToken) =>
    request(app.getHttpServer())
      .post(path)
      .set('Authorization', `Bearer ${token}`)
      .send(body);
  const get = (path: string, token = adminToken) =>
    request(app.getHttpServer())
      .get(path)
      .set('Authorization', `Bearer ${token}`);

  beforeAll(async () => {
    const url = process.env.TEST_DATABASE_URL;
    if (
      !url ||
      new URL(url).pathname !== '/ngcs_ready_drills_test' ||
      !['127.0.0.1', 'localhost'].includes(new URL(url).hostname) ||
      process.env.NGCS_READY_DRILLS_TEST !== 'true'
    )
      throw new Error(
        'Exact dedicated ready-drill database and opt-in required',
      );
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
    const club = await db.club.create({
      data: { name: 'TEST • Hazır egzersiz doğrulaması' },
    });
    const other = await db.club.create({ data: { name: `${prefix}-foreign` } });
    groupId = (
      await db.playerGroup.create({
        data: { name: 'TEST U14', ageGroup: 'U14', clubId: club.id },
      })
    ).id;
    otherGroupId = (
      await db.playerGroup.create({
        data: { name: 'TEST U13', ageGroup: 'U13', clubId: club.id },
      })
    ).id;
    const admin = await db.user.findUniqueOrThrow({
      where: { email: 'ready-importer@example.test' },
    });
    await db.drillVersion.updateMany({
      where: { drillId: { in: starterDrillIds } },
      data: {
        status: 'DRAFT',
        reviewedById: null,
        publishedAt: null,
        publishedById: null,
      },
    });
    const reviewer = await db.user.create({
      data: {
        email: `${prefix}-reviewer@example.test`,
        name: 'SENTETİK TEST UZMANI',
        passwordHash: randomUUID(),
        role: 'SYSTEM_ADMIN',
        clubId: null,
      },
    });
    reviewerId = reviewer.id;
    const foreign = await db.user.create({
      data: {
        email: `${prefix}-foreign@example.test`,
        name: 'TEST admin',
        passwordHash: randomUUID(),
        role: 'CLUB_ADMIN',
        clubId: other.id,
      },
    });
    const player = await db.user.create({
      data: {
        email: `${prefix}-player@example.test`,
        name: 'TEST player',
        passwordHash: randomUUID(),
        role: 'PLAYER',
        clubId: club.id,
      },
    });
    const token = (user: typeof admin) =>
      app.get(JwtService).sign({
        sub: user.id,
        email: user.email,
        role: user.role,
        clubId: user.clubId,
        ver: user.authVersion,
      });
    adminToken = token(admin);
    foreignToken = token(foreign);
    playerToken = token(player);
    planId = (
      await db.trainingPlan.create({
        data: {
          title: 'TEST Hazır çalışmalar',
          clubId: club.id,
          groupId,
          coachId: admin.id,
          date: new Date('2026-10-20T15:00:00Z'),
        },
      })
    ).id;
    const season = await db.season.create({
      data: {
        name: 'TEST 2026',
        clubId: club.id,
        groupId,
        userId: admin.id,
        startDate: new Date('2026-07-01'),
        endDate: new Date('2027-06-30'),
      },
    });
    const week = await db.weekPlan.create({
      data: {
        seasonId: season.id,
        weekNumber: 1,
        startDate: new Date('2026-10-19'),
        endDate: new Date('2026-10-25'),
      },
    });
    await db.dayPlan.create({
      data: {
        weekId: week.id,
        dayOfWeek: 2,
        date: new Date('2026-10-20T15:00:00Z'),
        trainingPlanId: planId,
        duration: 0,
      },
    });
    otherPlanId = (
      await db.trainingPlan.create({
        data: {
          title: 'TEST U13 planı',
          clubId: club.id,
          groupId: otherGroupId,
          coachId: admin.id,
        },
      })
    ).id;
    drillId = starterDrillIds.find((id) => id.includes('u14-13'))!;
    versionId = (await db.drillVersion.findFirstOrThrow({ where: { drillId } }))
      .id;
  });
  afterAll(async () => {
    await app?.close();
  });

  it('does not expose or attach drafts by direct ID, including through replace', async () => {
    expect(
      (
        await get(
          `/drills/catalog/page?groupId=${groupId}&collection=ngcs-starter-v1`,
        )
      ).body.total,
    ).toBe(0);
    await get(`/drills/${drillId}/content?ageGroup=U14`).expect(404);
    await post(`/training-plans/${planId}/drills`, {
      drillId,
      phase: 'TACTICAL',
      order: 0,
    }).expect(400);
    await request(app.getHttpServer())
      .put(`/training-plans/${planId}/drills`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ drills: [{ drillId, phase: 'TACTICAL', order: 0 }] })
      .expect(400);
    expect(
      await db.planDrill.count({ where: { trainingPlanId: planId } }),
    ).toBe(0);
  });
  it('blocks self review, partial starter publication and non-admin package release', async () => {
    await post(`/drills/content/${versionId}/submit`).expect(201);
    await post(`/drills/content/${versionId}/approve`).expect(403);
    await post('/drills/content/starter-pack/publish').expect(400);
    await post('/drills/content/starter-pack/publish', {}, foreignToken).expect(
      403,
    );
    expect(
      await db.drillVersion.count({
        where: { status: 'PUBLISHED', drillId: { in: starterDrillIds } },
      }),
    ).toBe(0);
  });
  it('publishes all 120 together only with simulated independent approval (test fixture)', async () => {
    // This is synthetic test evidence, never real expert review or retained content.
    await db.drillVersion.updateMany({
      where: { drillId: { in: starterDrillIds } },
      data: {
        status: 'APPROVED',
        reviewedById: reviewerId,
        approvedAt: new Date(),
      },
    });
    await post(`/drills/content/${versionId}/publish`).expect(400);
    const auditCount = await db.securityAuditEvent.count({
      where: { action: 'DRILL_CONTENT_PUBLISHED' },
    });
    const original = db.$transaction.bind(db);
    const failure = jest.spyOn(db, '$transaction').mockImplementationOnce(((
      operation,
      options,
    ) =>
      original(async (tx) => {
        await operation(tx);
        throw new Error('Synthetic publication rollback');
      }, options)) as never);
    try {
      await post('/drills/content/starter-pack/publish').expect(500);
    } finally {
      failure.mockRestore();
    }
    expect(
      await db.drillVersion.count({
        where: { status: 'PUBLISHED', drillId: { in: starterDrillIds } },
      }),
    ).toBe(0);
    expect(
      await db.securityAuditEvent.count({
        where: { action: 'DRILL_CONTENT_PUBLISHED' },
      }),
    ).toBe(auditCount);
    const result = await post('/drills/content/starter-pack/publish').expect(
      201,
    );
    expect(result.body.published).toBe(120);
    expect(
      await db.drillVersion.count({
        where: { status: 'PUBLISHED', drillId: { in: starterDrillIds } },
      }),
    ).toBe(120);
  });
  it('pages only the 120 ready identities across all ages, excluding seasonal and other NGCS content', async () => {
    const original = await db.drill.findUniqueOrThrow({
      where: { id: drillId },
    });
    await db.drill.create({
      data: {
        ...original,
        jsonData: original.jsonData ?? Prisma.JsonNull,
        id: randomUUID(),
        title: 'TEST seasonal exercise',
        createdById: reviewerId,
        scope: 'CLUB',
        clubId: (
          await db.playerGroup.findUniqueOrThrow({ where: { id: groupId } })
        ).clubId,
        groupId,
      },
    });
    const extra = await db.drill.create({
      data: {
        ...original,
        jsonData: original.jsonData ?? Prisma.JsonNull,
        id: randomUUID(),
        title: 'TEST other NGCS exercise',
      },
    });
    const originalVersion = await db.drillVersion.findUniqueOrThrow({
      where: { id: versionId },
    });
    await db.drillVersion.create({
      data: {
        ...originalVersion,
        steps: originalVersion.steps as Prisma.InputJsonValue,
        coachingPoints: originalVersion.coachingPoints as Prisma.InputJsonValue,
        progressions: originalVersion.progressions as Prisma.InputJsonValue,
        regressions: originalVersion.regressions as Prisma.InputJsonValue,
        constraints: originalVersion.constraints as Prisma.InputJsonValue,
        boardDocument: originalVersion.boardDocument ?? Prisma.DbNull,
        id: randomUUID(),
        drillId: extra.id,
        ageVariants: {
          create: {
            ageGroup: 'U14',
            durationMin: 10,
            rules: [],
            coachingPoints: [],
          },
        },
      },
    });
    const ids: string[] = [];
    let after: string | undefined;
    do {
      const query = new URLSearchParams({
        groupId,
        collection: 'ngcs-starter-v1',
      });
      if (after) query.set('after', after);
      const page = (await get(`/drills/catalog/page?${query}`).expect(200))
        .body;
      expect(page.total).toBe(120);
      expect(page.items.length).toBeLessThanOrEqual(25);
      expect(JSON.stringify(page)).not.toContain('boardDocument');
      ids.push(...page.items.map((item: { id: string }) => item.id));
      after = page.nextCursor ?? undefined;
    } while (after);
    expect(ids).toHaveLength(120);
    expect(new Set(ids).size).toBe(120);
    expect([...ids].sort()).toEqual([...starterDrillIds].sort());
    const age = (
      await get(
        `/drills/catalog/page?groupId=${groupId}&collection=ngcs-starter-v1&ageGroup=SENIOR`,
      ).expect(200)
    ).body;
    expect(age.total).toBe(48);
    expect(age.ageGroup).toBe('SENIOR');
    expect(
      age.items.every(
        (item: { ageGroup: string }) => item.ageGroup === 'SENIOR',
      ),
    ).toBe(true);
    const unsupported = (
      await get(
        `/drills/catalog/page?groupId=${otherGroupId}&collection=ngcs-starter-v1`,
      ).expect(200)
    ).body;
    expect(unsupported.total).toBe(120);
    const exact = (
      await get(
        `/drills/catalog/page?groupId=${otherGroupId}&collection=ngcs-starter-v1&ageGroup=U13`,
      ).expect(200)
    ).body;
    expect(exact.total).toBe(0);
    const team = (
      await get(
        `/drills/catalog/page?groupId=${groupId}&collection=ngcs-starter-v1&ageScope=TEAM`,
      ).expect(200)
    ).body;
    expect(team.total).toBe(72);
    expect(team.ageGroup).toBe('U14');
    expect(
      team.items.every(
        (item: { id: string; ageGroup: string }) =>
          starterDrillIds.includes(item.id) && item.ageGroup === 'U14',
      ),
    ).toBe(true);
    const teamPhase = (
      await get(
        `/drills/catalog/page?groupId=${groupId}&collection=ngcs-starter-v1&ageScope=TEAM&category=WARM_UP`,
      ).expect(200)
    ).body;
    expect(teamPhase.total).toBe(12);
    expect(
      teamPhase.items.every(
        (item: { category: string }) => item.category === 'WARM_UP',
      ),
    ).toBe(true);
    const unsupportedTeam = (
      await get(
        `/drills/catalog/page?groupId=${otherGroupId}&collection=ngcs-starter-v1&ageScope=TEAM`,
      ).expect(200)
    ).body;
    expect(unsupportedTeam.total).toBe(0);
    expect(unsupportedTeam.ageGroup).toBe('U13');
  });
  it('filters scalar catalog and never maps an unsupported age', async () => {
    const page = await get(
      `/drills/catalog/page?groupId=${groupId}&category=TACTICAL&minDuration=1&maxDuration=99&minPlayers=1&maxPlayers=60&equipment=koni`,
    ).expect(200);
    expect(page.body.items.length).toBeGreaterThan(0);
    expect(page.body.items[0].contentVersionId).toBeTruthy();
    expect(JSON.stringify(page.body)).not.toContain('boardDocument');
    const empty = await get(
      `/drills/catalog/page?groupId=${otherGroupId}`,
    ).expect(200);
    expect(empty.body.total).toBe(0);
    const detail = await get(`/drills/${drillId}/content?ageGroup=U13`).expect(
      200,
    );
    expect(detail.body.variant).toBeNull();
    await post(`/training-plans/${otherPlanId}/drills`, {
      drillId,
      expectedVersionId: versionId,
      phase: 'TACTICAL',
      order: 0,
    }).expect(400);
  });
  it('rejects stale versions, foreign clubs and players without attaching', async () => {
    const body = {
      drillId,
      expectedVersionId: 'stale-version',
      phase: 'TACTICAL',
      order: 0,
    };
    await post(`/training-plans/${planId}/drills`, body).expect(409);
    await post(
      `/training-plans/${planId}/drills`,
      { ...body, expectedVersionId: versionId },
      foreignToken,
    ).expect(403);
    await post(
      `/training-plans/${planId}/drills`,
      { ...body, expectedVersionId: versionId },
      playerToken,
    ).expect(403);
    expect(
      await db.planDrill.count({ where: { trainingPlanId: planId } }),
    ).toBe(0);
  });
  it('preserves snapshot instructions, board and totals across source edits and append', async () => {
    const detail = (
      await get(`/drills/${drillId}/content?ageGroup=U14`).expect(200)
    ).body;
    const attached = (
      await post(`/training-plans/${planId}/drills`, {
        drillId,
        expectedVersionId: versionId,
        phase: 'TACTICAL',
        order: 0,
      }).expect(201)
    ).body;
    expect(attached.contentSnapshot.durationMin).toBe(
      detail.variant.durationMin,
    );
    expect(attached.boardSnapshot).toEqual(detail.version.boardDocument);
    await db.drill.update({
      where: { id: drillId },
      data: {
        title: 'Changed source',
        durationMin: 999,
        jsonData: { ...detail.version.boardDocument, elements: [] },
      },
    });
    await post(`/training-plans/${planId}/drills`, {
      drillId,
      expectedVersionId: versionId,
      phase: 'TACTICAL',
      order: 0,
    }).expect(409);
    const nextId = starterDrillIds.find((id) => id.includes('u14-14'))!;
    await post(`/training-plans/${planId}/drills`, {
      drillId: nextId,
      phase: 'TACTICAL',
      order: 0,
    }).expect(201);
    const editor = (
      await get(`/training-plans/${planId}/editor-metadata`).expect(200)
    ).body;
    expect(editor.drills[0].drill.title).toBe(detail.version.title);
    expect(editor.drills[0].contentSnapshot.organization).toBe(
      detail.version.organization,
    );
    expect(editor.totalDuration).toBe(
      editor.drills.reduce((sum, row) => sum + row.drill.durationMin, 0),
    );
    expect(
      (await db.dayPlan.findFirstOrThrow({ where: { trainingPlanId: planId } }))
        .duration,
    ).toBe(editor.totalDuration);
    expect(JSON.stringify(editor)).not.toContain('boardSnapshot');
    const stored = await db.planDrill.findUniqueOrThrow({
      where: { id: attached.id },
    });
    expect(stored.boardSnapshot).toEqual(detail.version.boardDocument);
  });
  it('rolls back an attachment and both duration projections after a late transaction failure', async () => {
    const before = await db.trainingPlan.findUniqueOrThrow({
      where: { id: planId },
      include: { drills: true, dayPlans: true },
    });
    const original = db.$transaction.bind(db);
    const failure = jest.spyOn(db, '$transaction').mockImplementationOnce(((
      operation,
      options,
    ) =>
      original(async (tx) => {
        await operation(tx);
        throw new Error('Synthetic rollback after all writes');
      }, options)) as never);
    try {
      await post(`/training-plans/${planId}/drills`, {
        drillId: starterDrillIds.find((id) => id.includes('u14-15')),
        phase: 'TACTICAL',
        order: 0,
      }).expect(500);
    } finally {
      failure.mockRestore();
    }
    const after = await db.trainingPlan.findUniqueOrThrow({
      where: { id: planId },
      include: { drills: true, dayPlans: true },
    });
    expect(after).toEqual(before);
  });
  it('retains nullable legacy phases without a synthetic backfill', async () => {
    const legacy = await db.drill.create({
      data: {
        title: 'TEST Legacy',
        category: 'WARM_UP',
        ageGroup: 'U14',
        durationMin: 5,
        difficulty: 'EASY',
        scope: 'GLOBAL',
        jsonData: {},
      },
    });
    const attached = (
      await post(`/training-plans/${planId}/drills`, {
        drillId: legacy.id,
        phase: 'WARM_UP',
        order: 0,
      }).expect(201)
    ).body;
    expect(attached.contentSnapshot).toBeNull();
  });
  it('attaches a migrated boardless legacy version through add and replace with frozen content', async () => {
    const legacy = await db.drill.create({
      data: {
        title: 'TEST Migrated boardless legacy',
        jsonData: Prisma.JsonNull,
        category: 'WARM_UP',
        ageGroup: 'U14',
        durationMin: 5,
        difficulty: 'EASY',
        scope: 'GLOBAL',
      },
    });
    // Same nullable-board/source/exact-age shape as the professional-library backfill.
    const version = await db.drillVersion.create({
      data: {
        drillId: legacy.id,
        version: 1,
        status: 'PUBLISHED',
        title: legacy.title,
        summary: 'Mevcut kayıt; içerik kaynağı ve uzman onayı doğrulanmadı.',
        category: 'WARM_UP',
        difficulty: 'EASY',
        objectiveKey: 'legacy-unverified',
        objectiveLabel: 'Kaynağı doğrulanmamış egzersiz',
        themes: [],
        durationMin: 5,
        equipmentItems: [],
        organization: '',
        steps: [],
        coachingPoints: [],
        progressions: [],
        regressions: [],
        constraints: [],
        searchText: legacy.title,
        sourceId: 'ngcs-legacy-unverified',
        ageVariants: {
          create: {
            ageGroup: 'U14',
            durationMin: 5,
            rules: [],
            coachingPoints: [],
          },
        },
      },
    });
    expect(version.boardDocument).toBeNull();
    const body = {
      drillId: legacy.id,
      phase: 'WARM_UP',
      order: 0,
      expectedVersionId: version.id,
    };
    const before = await db.trainingPlan.findUniqueOrThrow({
      where: { id: planId },
      include: { drills: true },
    });
    const attached = (
      await post(`/training-plans/${planId}/drills`, body).expect(201)
    ).body;
    expect(attached.boardSnapshot).toBeNull();
    expect(attached.contentSnapshot).toMatchObject({
      sourceVersionId: version.id,
      ageGroup: 'U14',
      durationMin: 5,
      steps: [],
    });
    const stored = await db.trainingPlan.findUniqueOrThrow({
      where: { id: planId },
      include: { drills: true, dayPlans: true },
    });
    expect(stored.totalDuration).toBe(before.totalDuration + 5);
    expect(stored.dayPlans[0].duration).toBe(stored.totalDuration);
    for (const row of before.drills) expect(stored.drills).toContainEqual(row);
    await post(`/training-plans/${otherPlanId}/drills`, body).expect(400);
    const replacement = await db.trainingPlan.create({
      data: {
        title: 'TEST Migrated legacy replacement',
        clubId: before.clubId,
        groupId,
        coachId: before.coachId,
      },
    });
    const replaced = await request(app.getHttpServer())
      .put(`/training-plans/${replacement.id}/drills`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ drills: [body] })
      .expect(200);
    expect(replaced.body.totalDuration).toBe(5);
    expect(replaced.body.drills[0].boardSnapshot).toBeNull();
    expect(replaced.body.drills[0].contentSnapshot.sourceVersionId).toBe(
      version.id,
    );
    const phases = [
      { plan: planId, phase: attached.id },
      { plan: replacement.id, phase: replaced.body.drills[0].id },
    ];
    const readPhase = async (entry: (typeof phases)[number]) => ({
      legacy: (
        await get(
          `/training-plans/${entry.plan}/drills/${entry.phase}/board`,
        ).expect(200)
      ).body,
      versioned: (
        await get(
          `/training-plans/${entry.plan}/drills/${entry.phase}/tactical-document`,
        ).expect(200)
      ).body,
    });
    const beforePublication = await Promise.all(phases.map(readPhase));
    for (const result of beforePublication) {
      expect(result.legacy).toMatchObject({
        status: 'absent',
        origin: null,
        document: null,
      });
      expect(result.versioned.document).toBeNull();
    }
    const template = await db.drillVersion.findUniqueOrThrow({
      where: { id: versionId },
    });
    const { id: _id, drillId: _drillId, version: _version, ...copy } = template;
    const next = await db.drillVersion.create({
      data: {
        ...copy,
        steps: copy.steps as Prisma.InputJsonValue,
        coachingPoints: copy.coachingPoints as Prisma.InputJsonValue,
        progressions: copy.progressions as Prisma.InputJsonValue,
        regressions: copy.regressions as Prisma.InputJsonValue,
        constraints: copy.constraints as Prisma.InputJsonValue,
        boardDocument: copy.boardDocument as Prisma.InputJsonValue,
        drillId: legacy.id,
        version: 2,
        status: 'APPROVED',
        reviewedById: reviewerId,
        publishedAt: null,
        publishedById: null,
        archivedAt: null,
        ageVariants: {
          create: {
            ageGroup: 'U14',
            durationMin: 9,
            rules: [],
            coachingPoints: [],
          },
        },
      },
    });
    await post(`/drills/content/${next.id}/publish`).expect(201);
    for (let i = 0; i < phases.length; i++) {
      expect(await readPhase(phases[i])).toEqual(beforePublication[i]);
      const saved = await db.planDrill.findUniqueOrThrow({
        where: { id: phases[i].phase },
      });
      expect(saved.contentSnapshot).toMatchObject({
        sourceVersionId: version.id,
        durationMin: 5,
      });
      expect(saved.boardSnapshot).toBeNull();
      const full = (await get(`/training-plans/${phases[i].plan}`).expect(200))
        .body;
      expect(
        full.drills.find((row: { id: string }) => row.id === phases[i].phase)
          .drill.jsonData,
      ).toBeNull();
    }
    const reordered = (
      await request(app.getHttpServer())
        .put(`/training-plans/${replacement.id}/drills`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          drills: [{ ...body, order: 1, notes: 'Frozen phase retained' }],
        })
        .expect(200)
    ).body;
    expect(reordered.totalDuration).toBe(5);
    expect(reordered.drills[0].notes).toBe('Frozen phase retained');
    expect(reordered.drills[0].contentSnapshot.sourceVersionId).toBe(
      version.id,
    );
    expect(reordered.drills[0].boardSnapshot).toBeNull();
    const retained = await readPhase({
      plan: replacement.id,
      phase: reordered.drills[0].id,
    });
    expect(retained.legacy.status).toBe('absent');
    expect(retained.versioned.document).toBeNull();
    const oldPlan = await db.trainingPlan.create({
      data: {
        title: 'TEST old nullable row',
        clubId: before.clubId,
        groupId,
        coachId: before.coachId,
      },
    });
    const oldPhase = await db.planDrill.create({
      data: {
        trainingPlanId: oldPlan.id,
        drillId: legacy.id,
        phase: 'WARM_UP',
        order: 0,
      },
    });
    const old = { plan: oldPlan.id, phase: oldPhase.id };
    for (const nullKind of [Prisma.DbNull, Prisma.JsonNull]) {
      await db.planDrill.update({
        where: { id: oldPhase.id },
        data: { contentSnapshot: nullKind, boardSnapshot: nullKind },
      });
      const result = await readPhase(old);
      expect(result.legacy).toMatchObject({
        origin: 'drill',
        status: 'ready',
        document: copy.boardDocument,
      });
      expect(result.versioned.document).toEqual(copy.boardDocument);
    }
    await request(app.getHttpServer())
      .put(
        `/training-plans/${replacement.id}/drills/${reordered.drills[0].id}/tactical-document`,
      )
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        document: copy.boardDocument,
        expectedWriteToken: retained.versioned.writeToken,
      })
      .expect(200);
    expect(
      (await readPhase({ plan: replacement.id, phase: reordered.drills[0].id }))
        .legacy.origin,
    ).toBe('snapshot');
  });
  it('keeps saved plan content readable after the source is archived while rejecting new attachments', async () => {
    await post(`/drills/content/${versionId}/archive`).expect(201);
    await post(`/training-plans/${planId}/drills`, {
      drillId,
      phase: 'TACTICAL',
      order: 0,
    }).expect(400);
    const editor = (
      await get(`/training-plans/${planId}/editor-metadata`).expect(200)
    ).body;
    expect(
      editor.drills.find((row) => row.drillId === drillId).contentSnapshot
        .sourceVersionId,
    ).toBe(versionId);
  });
});
