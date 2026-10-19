import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import type { INestApplication } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
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
      (await get(`/drills/catalog/page?groupId=${groupId}&source=NGCS`)).body
        .total,
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
      await db.drillVersion.count({ where: { status: 'PUBLISHED' } }),
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
      await db.drillVersion.count({ where: { status: 'PUBLISHED' } }),
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
      await db.drillVersion.count({ where: { status: 'PUBLISHED' } }),
    ).toBe(120);
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
