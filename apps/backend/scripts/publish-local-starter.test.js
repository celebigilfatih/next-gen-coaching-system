/* eslint-disable @typescript-eslint/no-require-imports -- Tests use the standalone CommonJS maintenance CLI. */
const { test: nodeTest } = require('node:test');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { PrismaClient } = require('@prisma/client');
const {
  validateTarget,
  loadManifest,
  publishLocalStarter,
  TEST_DATABASE,
} = require('./publish-local-starter');

nodeTest(
  'target guard accepts only the exact loopback target and separate test database',
  () => {
    const base = 'postgresql://fixture:fixture@127.0.0.1:5433/';
    assert.equal(
      validateTarget(base + 'ngcs_local_session_dev?schema=public'),
      'ngcs_local_session_dev',
    );
    assert.equal(validateTarget(base + TEST_DATABASE, true), TEST_DATABASE);
    for (const url of [
      base + 'production',
      base + TEST_DATABASE,
      base + 'ngcs_local_session_dev?host=external.example',
      base.replace('127.0.0.1', 'external.example') + 'ngcs_local_session_dev',
      base.replace('5433', '5432') + 'ngcs_local_session_dev',
    ])
      assert.throws(() => validateTarget(url));
    assert.throws(() => validateTarget(base + 'ngcs_local_session_dev', true));
  },
);

nodeTest('approved manifest is pinned to 120 original exercises', () => {
  const manifest = loadManifest();
  assert.equal(manifest.items.length, 120);
  assert.equal(new Set(manifest.items.map((i) => i.drillId)).size, 120);
});

nodeTest(
  'PostgreSQL atomic local publication and replay',
  {
    skip: !process.env.NGCS_STARTER_PUBLICATION_TEST_URL,
  },
  async (t) => {
    const url = process.env.NGCS_STARTER_PUBLICATION_TEST_URL;
    validateTarget(url, true);
    const prisma = new PrismaClient({ datasourceUrl: url });
    const actorEmail = 'starter-publication-test@example.test';
    const manifest = loadManifest();
    const options = {
      database: TEST_DATABASE,
      actorEmail,
      manifest,
      apply: true,
    };
    try {
      // Refuse to reset or overwrite an existing fixture or any retained data.
      assert.equal(await prisma.user.count(), 0);
      assert.equal(await prisma.drill.count(), 0);
      await prisma.user.create({
        data: {
          name: 'TEST ONLY administrator',
          email: actorEmail,
          passwordHash: '!disabled-fixture-password',
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
      assert.equal(imported.status, 0, 'Fixture importer failed');
      assert.match(imported.stdout, /Imported 120 drafts/);
      const first = await prisma.drillVersion.findFirstOrThrow();

      await t.test('dry run writes nothing', async () => {
        const before = await prisma.securityAuditEvent.count();
        const result = await publishLocalStarter(prisma, {
          ...options,
          apply: false,
        });
        assert.equal(result.dryRun, true);
        assert.equal(result.published, 0);
        assert.equal(
          await prisma.drillVersion.count({ where: { status: 'DRAFT' } }),
          120,
        );
        assert.equal(await prisma.securityAuditEvent.count(), before);
      });

      await t.test(
        'rejects altered manifest, wrong actor and changed content',
        async () => {
          const modified = structuredClone(manifest);
          modified.items[0].title += ' changed';
          await assert.rejects(
            publishLocalStarter(prisma, { ...options, manifest: modified }),
            /Manifest differs/,
          );
          await assert.rejects(
            publishLocalStarter(prisma, {
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
            publishLocalStarter(prisma, options),
            /Content changed/,
          );
          await prisma.drillVersion.update({
            where: { id: first.id },
            data: { summary: first.summary },
          });
        },
      );

      await t.test(
        'late audit failure rolls back all statuses, source verification and audits',
        async () => {
          let writes = 0;
          const failing = {
            $transaction: (callback, txOptions) =>
              prisma.$transaction(
                (tx) =>
                  callback(
                    new Proxy(tx, {
                      get(target, key) {
                        if (key === 'securityAuditEvent')
                          return {
                            ...target.securityAuditEvent,
                            create: async (args) => {
                              if (++writes === 17)
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
                txOptions,
              ),
          };
          await assert.rejects(
            publishLocalStarter(failing, options),
            /injected late audit failure/,
          );
          assert.equal(
            await prisma.drillVersion.count({
              where: {
                status: 'DRAFT',
                reviewedById: null,
                publishedAt: null,
                submittedAt: null,
              },
            }),
            120,
          );
          assert.equal(
            await prisma.drillSource.count({
              where: {
                verifiedById: null,
                licenseVerifiedAt: null,
                versions: {
                  some: { drillId: { startsWith: 'ngcs-starter-v1-' } },
                },
              },
            }),
            120,
          );
          assert.equal(await prisma.securityAuditEvent.count(), 120);
        },
      );

      await t.test('mixed state is rejected before writes', async () => {
        await prisma.drillVersion.update({
          where: { id: first.id },
          data: { status: 'IN_REVIEW' },
        });
        await assert.rejects(
          publishLocalStarter(prisma, options),
          /Mixed or changed/,
        );
        assert.equal(await prisma.securityAuditEvent.count(), 120);
        await prisma.drillVersion.update({
          where: { id: first.id },
          data: { status: 'DRAFT' },
        });
      });

      await t.test(
        'all 120 publish with truthful same-account exception and 360 audit events',
        async () => {
          const results = await Promise.allSettled([
            publishLocalStarter(prisma, options),
            publishLocalStarter(prisma, options),
          ]);
          assert.equal(
            results
              .filter((r) => r.status === 'fulfilled')
              .reduce((sum, r) => sum + r.value.published, 0),
            120,
          );
          assert.equal(
            await prisma.drillVersion.count({ where: { status: 'PUBLISHED' } }),
            120,
          );
          assert.equal(await prisma.securityAuditEvent.count(), 480);
          const published = await prisma.drillVersion.findUniqueOrThrow({
            where: { id: first.id },
          });
          assert.equal(published.createdById, published.reviewedById);
          assert.equal(published.reviewedById, published.publishedById);
          assert.match(published.reviewComment, /independentReview=false/);
        },
      );

      await t.test(
        'replay writes zero and rejects corrupted audit evidence',
        async () => {
          const result = await publishLocalStarter(prisma, options);
          assert.equal(result.published, 0);
          assert.equal(result.alreadyPublished, 120);
          assert.equal(await prisma.securityAuditEvent.count(), 480);
          const audit = await prisma.securityAuditEvent.findFirstOrThrow({
            where: { action: 'DRILL_CONTENT_APPROVED' },
          });
          await prisma.securityAuditEvent.update({
            where: { id: audit.id },
            data: { metadata: { ...audit.metadata, independentReview: true } },
          });
          await assert.rejects(
            publishLocalStarter(prisma, options),
            /audit does not match/,
          );
          assert.equal(await prisma.securityAuditEvent.count(), 480);
          await prisma.securityAuditEvent.update({
            where: { id: audit.id },
            data: { metadata: audit.metadata },
          });
        },
      );
      await t.test(
        'CLI refuses missing apply opt-in, wrong approval and production mode',
        async () => {
          for (const envOverride of [
            { NGCS_ALLOW_LOCAL_STARTER_PUBLICATION: '' },
            { NODE_ENV: 'production' },
          ]) {
            const denied = spawnSync(
              process.execPath,
              [
                'scripts/publish-local-starter.js',
                '--apply',
                '--actor-email',
                actorEmail,
                '--approval-reference',
                'ADR-0041:user-local-120-exception:2026-10-19',
              ],
              {
                encoding: 'utf8',
                env: {
                  ...process.env,
                  DATABASE_URL: url,
                  NGCS_STARTER_PUBLICATION_TEST: 'true',
                  NGCS_ALLOW_LOCAL_STARTER_PUBLICATION: 'true',
                  ...envOverride,
                },
              },
            );
            assert.equal(denied.status, 1);
          }
          const denied = spawnSync(
            process.execPath,
            [
              'scripts/publish-local-starter.js',
              '--apply',
              '--actor-email',
              actorEmail,
              '--approval-reference',
              'wrong',
            ],
            {
              encoding: 'utf8',
              env: {
                ...process.env,
                DATABASE_URL: url,
                NGCS_STARTER_PUBLICATION_TEST: 'true',
                NGCS_ALLOW_LOCAL_STARTER_PUBLICATION: 'true',
              },
            },
          );
          assert.equal(denied.status, 1);
          assert.equal(await prisma.securityAuditEvent.count(), 480);
        },
      );
    } finally {
      await prisma.$disconnect();
    }
  },
);
