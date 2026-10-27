/* eslint-disable @typescript-eslint/no-require-imports -- Standalone maintenance tests. */
const { test: nodeTest } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { PrismaClient } = require('@prisma/client');
const {
  validateTarget,
  loadRelease,
  publishLocalDiagramRevision,
  TEST_DATABASE,
  RESTORE_DATABASE,
  APPROVAL,
} = require('./publish-local-diagram-revision');

nodeTest(
  'exact local targets reject external hosts, overrides, other DBs and test-mode retained target',
  () => {
    const base = 'postgresql://fixture:fixture@127.0.0.1:5433/';
    assert.equal(
      validateTarget(base + 'ngcs_local_session_dev?schema=public'),
      'ngcs_local_session_dev',
    );
    for (const db of [TEST_DATABASE, RESTORE_DATABASE])
      assert.equal(validateTarget(base + db, true), db);
    for (const value of [
      base + 'production',
      base + TEST_DATABASE,
      base + 'ngcs_local_session_dev?host=evil.test',
      base.replace('127.0.0.1', 'evil.test') + 'ngcs_local_session_dev',
      base.replace('5433', '5432') + 'ngcs_local_session_dev',
    ])
      assert.throws(() => validateTarget(value));
    assert.throws(() => validateTarget(base + 'ngcs_local_session_dev', true));
  },
);
nodeTest('approved v2 is pinned and preserves the120 v1 identities', () => {
  const { previous, manifest } = loadRelease();
  assert.equal(manifest.packId, 'ngcs-starter-diagrams-v2');
  assert.equal(manifest.publicationStatus, 'DRAFT');
  assert.equal(manifest.reviewer, 'TBD');
  assert.equal(manifest.items.length, 120);
  assert.deepEqual(
    manifest.items.map((item) => item.drillId),
    previous.items.map((item) => item.drillId),
  );
});
nodeTest(
  'atomic PostgreSQL revision publication, rollback and unchanged plan copies',
  {
    skip: !process.env.NGCS_DIAGRAM_PUBLICATION_TEST_URL,
  },
  async (t) => {
    const url = process.env.NGCS_DIAGRAM_PUBLICATION_TEST_URL;
    validateTarget(url, true);
    const prisma = new PrismaClient({ datasourceUrl: url });
    const actorEmail = 'diagram-publication-test@example.test';
    const release = loadRelease();
    const options = {
      database: TEST_DATABASE,
      actorEmail,
      ...release,
      apply: true,
    };
    try {
      assert.equal(
        await prisma.user.count(),
        0,
        'Refuse to reuse/reset existing fixture',
      );
      assert.equal(await prisma.drill.count(), 0);
      const actor = await prisma.user.create({
        data: {
          name: 'Synthetic operator only',
          email: actorEmail,
          passwordHash: '!disabled-test-fixture',
          role: 'SYSTEM_ADMIN',
        },
      });
      const imported = spawnSync(
        process.execPath,
        [
          'scripts/import-drill-content.js',
          '--apply',
          '--actor-email',
          actorEmail,
        ],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            DATABASE_URL: url,
            NGCS_ALLOW_CONTENT_IMPORT: 'true',
          },
        },
      );
      assert.equal(imported.status, 0, imported.stderr);
      // Explicit synthetic baseline, not a real human approval record.
      // validateTarget(url,true) prevents this fixture from reaching retained DB.
      await prisma.drillVersion.updateMany({
        data: {
          status: 'PUBLISHED',
          reviewedById: actor.id,
          publishedById: actor.id,
          submittedAt: new Date(),
          approvedAt: new Date(),
          publishedAt: new Date(),
        },
      });
      await prisma.drillSource.updateMany({
        data: { verifiedById: actor.id, licenseVerifiedAt: new Date() },
      });
      const club = await prisma.club.create({
        data: { name: 'Synthetic frozen plan club' },
      });
      const original = release.previous.items.find(
        (item) =>
          item.drillId.includes('-senior-') &&
          item.objectiveKey === 'son-bolge',
      );
      const plan = await prisma.trainingPlan.create({
        data: {
          title: 'Frozen fixture',
          clubId: club.id,
          coachId: actor.id,
          totalDuration: 32,
          drills: {
            create: {
              drillId: original.drillId,
              phase: 'TACTICAL',
              notes: 'Preserve this note',
              boardSnapshot: original.boardDocument,
              contentSnapshot: {
                schemaVersion: 1,
                title: original.title,
                durationMin: 32,
              },
            },
          },
        },
        include: { drills: true },
      });
      const old = await prisma.drillVersion.findMany({
        orderBy: { id: 'asc' },
        include: { source: true, ageVariants: { orderBy: { id: 'asc' } } },
      });
      const beforeAudits = await prisma.securityAuditEvent.count();
      const beforeSources = await prisma.drillSource.count();
      const first = old[0];
      await t.test('default dry-run writes nothing', async () => {
        const result = await publishLocalDiagramRevision(prisma, {
          ...options,
          apply: false,
        });
        assert.equal(result.ready, 120);
        assert.equal(result.published, 0);
        assert.equal(result.dryRun, true);
        assert.equal(await prisma.drillVersion.count(), 120);
        assert.equal(await prisma.securityAuditEvent.count(), beforeAudits);
      });
      await t.test(
        'altered package, wrong actor and changed baseline rejected before writing',
        async () => {
          const modified = JSON.parse(JSON.stringify(release.manifest));
          modified.items[0].summary += ' changed';
          await assert.rejects(
            () =>
              publishLocalDiagramRevision(prisma, {
                ...options,
                manifest: modified,
              }),
            /Manifest differs/,
          );
          await assert.rejects(
            () =>
              publishLocalDiagramRevision(prisma, {
                ...options,
                actorEmail: 'absent@example.test',
              }),
            /active SystemAdmin/,
          );
          await prisma.drillVersion.update({
            where: { id: first.id },
            data: { summary: 'changed' },
          });
          await assert.rejects(
            () => publishLocalDiagramRevision(prisma, options),
            /Content changed/,
          );
          await prisma.drillVersion.update({
            where: { id: first.id },
            data: { summary: first.summary },
          });
          assert.equal(await prisma.drillVersion.count(), 120);
        },
      );
      await t.test(
        'mixed and pre-existing v2 draft states require inspection instead of automatic adoption',
        async () => {
          await prisma.drillVersion.update({
            where: { id: first.id },
            data: { status: 'DRAFT' },
          });
          await assert.rejects(
            () => publishLocalDiagramRevision(prisma, options),
            /Mixed or changed/,
          );
          await prisma.drillVersion.update({
            where: { id: first.id },
            data: { status: 'PUBLISHED' },
          });
          await assert.rejects(
            () =>
              prisma.$transaction(async (tx) => {
                const { source, ageVariants, ...data } =
                  release.manifest.items[0];
                const insertedSource = await tx.drillSource.create({
                  data: source,
                });
                await tx.drillVersion.create({
                  data: {
                    ...data,
                    version: 2,
                    createdById: actor.id,
                    sourceId: insertedSource.id,
                    searchText: 'Synthetic partial fixture',
                    ageVariants: { create: ageVariants },
                  },
                });
                const inside = { $transaction: (callback) => callback(tx) };
                await assert.rejects(
                  () => publishLocalDiagramRevision(inside, options),
                  /Mixed or changed/,
                );
                throw Error('rollback synthetic partial fixture');
              }),
            /rollback synthetic partial fixture/,
          );
          assert.equal(await prisma.drillVersion.count(), 120);
        },
      );
      await t.test(
        'unfrozen legacy plan references block publication without inventing a historical snapshot',
        async () => {
          await assert.rejects(
            () =>
              prisma.$transaction(async (tx) => {
                await tx.planDrill.create({
                  data: {
                    trainingPlanId: plan.id,
                    drillId: original.drillId,
                    phase: 'TACTICAL',
                  },
                });
                const inside = { $transaction: (callback) => callback(tx) };
                await assert.rejects(
                  () => publishLocalDiagramRevision(inside, options),
                  /Unfrozen plan reference/,
                );
                throw Error('rollback unfrozen fixture');
              }),
            /rollback unfrozen fixture/,
          );
          assert.equal(await prisma.planDrill.count(), 1);
        },
      );
      await t.test(
        'late audit failure rolls back imported sources, versions, projections and archives',
        async () => {
          const beforeDrills = await prisma.drill.findMany({
            orderBy: { id: 'asc' },
          });
          const beforeVersions = await prisma.drillVersion.findMany({
            orderBy: { id: 'asc' },
            include: { source: true, ageVariants: { orderBy: { id: 'asc' } } },
          });
          let writes = 0;
          const failing = {
            $transaction: (callback, config) =>
              prisma.$transaction(
                (tx) =>
                  callback(
                    new Proxy(tx, {
                      get(target, key) {
                        if (key === 'securityAuditEvent')
                          return {
                            ...target.securityAuditEvent,
                            create: async (args) => {
                              if (++writes === 79)
                                throw Error('injected late audit failure');
                              return target.securityAuditEvent.create(args);
                            },
                          };
                        const value = target[key];
                        return typeof value === 'function'
                          ? value.bind(target)
                          : value;
                      },
                    }),
                  ),
                config,
              ),
          };
          await assert.rejects(
            () => publishLocalDiagramRevision(failing, options),
            /injected late audit failure/,
          );
          assert.equal(await prisma.drillVersion.count(), 120);
          assert.equal(await prisma.drillSource.count(), beforeSources);
          assert.equal(await prisma.securityAuditEvent.count(), beforeAudits);
          assert.deepEqual(
            await prisma.drill.findMany({ orderBy: { id: 'asc' } }),
            beforeDrills,
          );
          assert.deepEqual(
            await prisma.drillVersion.findMany({
              orderBy: { id: 'asc' },
              include: {
                source: true,
                ageVariants: { orderBy: { id: 'asc' } },
              },
            }),
            beforeVersions,
          );
        },
      );
      await t.test(
        'concurrent requests publish exactly120 revisions with600 truthful audits',
        async () => {
          const results = await Promise.allSettled([
            publishLocalDiagramRevision(prisma, options),
            publishLocalDiagramRevision(prisma, options),
          ]);
          assert.equal(
            results
              .filter((row) => row.status === 'fulfilled')
              .reduce((sum, row) => sum + row.value.published, 0),
            120,
          );
          assert.equal(
            await prisma.drillVersion.count({
              where: { status: 'PUBLISHED', version: 2 },
            }),
            120,
          );
          assert.equal(
            await prisma.drillVersion.count({
              where: { status: 'ARCHIVED', version: 1 },
            }),
            120,
          );
          assert.equal(
            await prisma.securityAuditEvent.count(),
            beforeAudits + 600,
          );
          const published = await prisma.drillVersion.findFirstOrThrow({
            where: { version: 2 },
          });
          assert.equal(published.createdById, actor.id);
          assert.equal(published.reviewedById, actor.id);
          assert.equal(published.publishedById, actor.id);
          assert.match(published.reviewComment, /independentReview=false/);
          assert.deepEqual(
            await prisma.trainingPlan.findUniqueOrThrow({
              where: { id: plan.id },
              include: { drills: true },
            }),
            plan,
          );
          const archived = await prisma.drillVersion.findMany({
            where: { version: 1 },
            orderBy: { id: 'asc' },
            include: { source: true, ageVariants: { orderBy: { id: 'asc' } } },
          });
          for (let i = 0; i < old.length; i++) {
            const { status, archivedAt, updatedAt, ...expected } = old[i];
            void status;
            void archivedAt;
            void updatedAt;
            const {
              status: actualStatus,
              archivedAt: actualArchived,
              updatedAt: actualUpdated,
              ...actual
            } = archived[i];
            void actualArchived;
            void actualUpdated;
            assert.equal(actualStatus, 'ARCHIVED');
            assert.deepEqual(actual, expected);
          }
        },
      );
      await t.test(
        'replay is zero-write and refuses tampered release audit',
        async () => {
          const auditCount = await prisma.securityAuditEvent.count();
          const result = await publishLocalDiagramRevision(prisma, options);
          assert.equal(result.published, 0);
          assert.equal(result.alreadyPublished, 120);
          assert.equal(await prisma.securityAuditEvent.count(), auditCount);
          const audit = await prisma.securityAuditEvent.findFirstOrThrow({
            where: {
              metadata: { path: ['approvalReference'], equals: APPROVAL },
            },
          });
          await prisma.securityAuditEvent.update({
            where: { id: audit.id },
            data: { metadata: { ...audit.metadata, independentReview: true } },
          });
          await assert.rejects(
            () => publishLocalDiagramRevision(prisma, options),
            /audit does not match/,
          );
          await prisma.securityAuditEvent.update({
            where: { id: audit.id },
            data: { metadata: audit.metadata },
          });
        },
      );
      await t.test(
        'CLI rejects absent opt-in, wrong approval, production and unknown flags',
        async () => {
          for (const [overrides, extra, reference] of [
            [{ NGCS_ALLOW_LOCAL_DIAGRAM_PUBLICATION: '' }, [], APPROVAL],
            [{ NODE_ENV: 'production' }, [], APPROVAL],
            [{}, ['--unexpected'], APPROVAL],
            [{}, [], 'wrong'],
            [{}, ['--approval-reference', APPROVAL], APPROVAL],
          ]) {
            const denied = spawnSync(
              process.execPath,
              [
                'scripts/publish-local-diagram-revision.js',
                '--apply',
                '--actor-email',
                actorEmail,
                '--approval-reference',
                reference,
                ...extra,
              ],
              {
                encoding: 'utf8',
                env: {
                  ...process.env,
                  DATABASE_URL: url,
                  NGCS_DIAGRAM_PUBLICATION_TEST: 'true',
                  NGCS_ALLOW_LOCAL_DIAGRAM_PUBLICATION: 'true',
                  ...overrides,
                },
              },
            );
            assert.equal(denied.status, 1);
          }
        },
      );
    } finally {
      await prisma.$disconnect();
    }
  },
);
