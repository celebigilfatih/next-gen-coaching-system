const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { randomUUID } = require('node:crypto');
const { validateTarget } = require('./setup-spor-manage-local');

test('operator setup rejects remote and unrelated databases', () => {
  assert.throws(() =>
    validateTarget(
      'postgresql://user:pass@db.example.test/ngcs_local_session_dev',
    ),
  );
  assert.throws(() =>
    validateTarget('postgresql://user:pass@localhost/customer_data'),
  );
});

test(
  'dedicated PostgreSQL: dry run, complete setup, unchanged replay and atomic conflict',
  {
    skip: !process.env.NGCS_SETUP_TEST_DATABASE_URL,
  },
  async () => {
    const databaseUrl = process.env.NGCS_SETUP_TEST_DATABASE_URL;
    assert.equal(new URL(databaseUrl).pathname, '/ngcs_spor_manage_setup_test');
    validateTarget(databaseUrl);
    const { PrismaClient } = require('@prisma/client');
    const { legacyParityReport } = require('../dist/sporting/legacy-parity');
    const prisma = new PrismaClient({ datasourceUrl: databaseUrl });
    const actorEmail = 'setup.operator@example.test';
    const run = (apply) =>
      spawnSync(
        process.execPath,
        [path.join(__dirname, 'setup-spor-manage-local.js')],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            NODE_ENV: 'test',
            DATABASE_URL: databaseUrl,
            NGCS_SETUP_ACTOR_EMAIL: actorEmail,
            NGCS_ALLOW_LOCAL_CLUB_SETUP: String(apply),
          },
        },
      );
    const snapshot = async () =>
      JSON.stringify(
        await prisma.$transaction([
          prisma.club.findMany({ orderBy: { id: 'asc' } }),
          prisma.team.findMany({ orderBy: { id: 'asc' } }),
          prisma.playerGroup.findMany({ orderBy: { id: 'asc' } }),
          prisma.clubSeason.findMany({ orderBy: { id: 'asc' } }),
          prisma.teamSeason.findMany({ orderBy: { id: 'asc' } }),
          prisma.season.findMany({ orderBy: { id: 'asc' } }),
          prisma.person.findMany({ orderBy: { id: 'asc' } }),
          prisma.staffProfile.findMany({ orderBy: { personId: 'asc' } }),
          prisma.functionalRole.findMany({ orderBy: { id: 'asc' } }),
          prisma.sportingAssignment.findMany({ orderBy: { id: 'asc' } }),
          prisma.match.findMany({ orderBy: { id: 'asc' } }),
          prisma.securityAuditEvent.findMany({ orderBy: { id: 'asc' } }),
        ]),
      );
    try {
      assert.equal(
        await prisma.club.count(),
        0,
        'Verification database must be empty',
      );
      assert.equal(
        await prisma.user.count(),
        0,
        'Verification database must not contain retained accounts',
      );
      await prisma.user.create({
        data: {
          email: actorEmail,
          name: 'Disposable setup operator',
          passwordHash: randomUUID(),
          role: 'SYSTEM_ADMIN',
        },
      });
      const before = await snapshot();
      assert.equal(run(false).status, 0);
      assert.equal(await snapshot(), before, 'Dry run must not change rows');
      const first = run(true);
      assert.equal(first.status, 0, first.stderr);
      const club = await prisma.club.findFirstOrThrow();
      assert.equal(await prisma.club.count(), 1);
      assert.equal(await prisma.team.count(), 10);
      assert.equal(await prisma.playerGroup.count(), 10);
      assert.equal(await prisma.clubSeason.count(), 1);
      assert.equal(await prisma.teamSeason.count(), 10);
      assert.equal(await prisma.season.count(), 10);
      assert.equal(await prisma.staffProfile.count(), 30);
      assert.equal(
        await prisma.sportingAssignment.count({
          where: { assignmentType: 'STAFF' },
        }),
        30,
      );
      assert.equal(await prisma.match.count(), 36);
      assert.equal(await prisma.user.count(), 1, 'No staff login accounts');
      assert.equal(
        await prisma.roleCapability.count(),
        0,
        'No capability grants',
      );
      const parity = await legacyParityReport(prisma, club.id);
      assert.equal(parity.status, 'IN_SYNC');
      const baseline = await snapshot();
      const replay = run(true);
      assert.equal(replay.status, 0, replay.stderr);
      assert.deepEqual(JSON.parse(replay.stdout).created, {});
      assert.equal(
        await snapshot(),
        baseline,
        'Replay must preserve values and timestamps',
      );

      // Fault injection is confined to this newly created dedicated test DB.
      // The fixture would recreate the first team's missing match, then fail on
      // a later edited staff identity. The earlier create must roll back too.
      const firstMatch = await prisma.match.findFirstOrThrow({
        orderBy: { date: 'asc' },
      });
      await prisma.match.delete({ where: { id: firstMatch.id } });
      const lastPerson = await prisma.person.findFirstOrThrow({
        where: { staffProfile: { title: { startsWith: 'U16' } } },
      });
      await prisma.person.update({
        where: { id: lastPerson.id },
        data: { displayName: 'Preserve this operator edit' },
      });
      const conflictBaseline = await snapshot();
      assert.notEqual(run(true).status, 0);
      assert.equal(
        await snapshot(),
        conflictBaseline,
        'Conflicting replay must leave every row unchanged',
      );
    } finally {
      await prisma.$disconnect();
    }
  },
);
