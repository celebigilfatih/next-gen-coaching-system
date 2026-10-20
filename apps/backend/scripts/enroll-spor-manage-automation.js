/* Adopt only the known, reproducible local rollout; dry-run by default. */
require('reflect-metadata');
const assert = require('node:assert/strict');
const {
  PrismaService,
} = require('../node_modules/.cache/ngcs-quality-build/prisma/prisma.service');
const {
  legacyWrite,
} = require('../node_modules/.cache/ngcs-quality-build/sporting/legacy-compatibility');
const {
  AuthorizationService,
} = require('../node_modules/.cache/ngcs-quality-build/auth/authorization.service');
const {
  appendAutomation,
  captureEntry,
  loadAutomation,
  matchesOriginal,
  readAutomationDay,
  fingerprint,
} = require('../node_modules/.cache/ngcs-quality-build/planning/planning-automation');
const {
  templateEvents,
} = require('../node_modules/.cache/ngcs-quality-build/planning/weekly-template');
const {
  dayKey,
} = require('../node_modules/.cache/ngcs-quality-build/planning/planning-input');
const {
  calendarWeeks,
  requestFor,
  snapshot,
  verifyPreserved,
} = require('./apply-spor-manage-season');
const { fixture } = require('./setup-spor-manage-local');
const TEST_DATABASE = 'ngcs_fixture_sync_restore_test';
function validateTarget(
  value,
  production = process.env.NODE_ENV === 'production',
) {
  const url = new URL(value);
  assert(!production);
  assert(['postgres:', 'postgresql:'].includes(url.protocol));
  assert(['localhost', '127.0.0.1'].includes(url.hostname));
  assert.equal(url.port, '5433');
  assert(!url.search && !url.hash);
  assert(
    ['/ngcs_local_session_dev', `/${TEST_DATABASE}`].includes(url.pathname),
  );
}
async function main() {
  validateTarget(process.env.DATABASE_URL || 'http://invalid');
  const apply = process.argv.includes('--apply');
  assert(process.argv.slice(2).every((arg) => arg === '--apply'));
  if (apply) assert.equal(process.env.NGCS_ENROLL_FIXTURE_SYNC, 'true');
  assert(process.env.NGCS_WEEK_ACTOR_EMAIL);
  const db = new PrismaService();
  try {
    const actor = await db.user.findUniqueOrThrow({
      where: { email: process.env.NGCS_WEEK_ACTOR_EMAIL },
      select: { id: true, role: true, status: true, email: true, clubId: true },
    });
    assert.equal(actor.role, 'SYSTEM_ADMIN');
    assert.equal(actor.status, 'ACTIVE');
    actor.userId = actor.id;
    const clubs = await db.club.findMany({
      where: { name: 'Spor Manage' },
      select: { id: true },
    });
    assert.equal(clubs.length, 1);
    const clubId = clubs[0].id;
    const seasons = await db.season.findMany({
      where: { clubId, name: '2026-2027' },
      include: { group: true },
      orderBy: { id: 'asc' },
    });
    assert.equal(seasons.length, 10);
    const senior = seasons.find((s) => s.group.ageGroup === 'SENIOR');
    assert(senior);
    assert.equal(dayKey(senior.startDate), '2026-08-14');
    assert.equal(dayKey(senior.endDate), '2027-05-23');
    const weeks = calendarWeeks(senior.startDate, senior.endDate);
    const existing = await loadAutomation(db, senior.id, clubId);
    if (weeks.every((week) => existing.has(week))) {
      const before = await snapshot(db),
        after = await snapshot(db);
      const preservation = verifyPreserved(before, after);
      for (const [name, rows] of before)
        assert.equal(after.get(name).size, rows.size);
      console.log(
        JSON.stringify({
          state: 'unchanged-replay',
          weeks: weeks.length,
          alreadyEnrolled: weeks.length,
          adopted: 0,
          protected: 0,
          preservation,
        }),
      );
      return;
    }
    const matches = await db.match.findMany({
      where: { season: { clubId } },
      orderBy: { id: 'asc' },
    });
    const project = (rows) =>
      rows
        .map((m) => ({
          id: m.id,
          date: m.date.toISOString(),
          opponent: m.opponent,
        }))
        .sort((a, b) => a.id.localeCompare(b.id));
    assert.deepEqual(
      project(matches),
      project(fixture()),
      'Original fixture identity/date/opponent required for safe adoption',
    );
    const roots = await db.securityAuditEvent.findMany({
      where: {
        clubId,
        action: 'WEEK_PLANNING_APPLIED',
        metadata: { path: ['operation'], equals: 'PLANNING_REQUEST_V1' },
      },
    });
    const before = await snapshot(db);
    let adopted = 0,
      protectedRows = 0,
      alreadyEnrolled = 0;
    for (const weekStart of weeks) {
      const root = roots.find((row) => {
        const m = row.metadata;
        return (
          m?.seasonIds?.includes(senior.id) &&
          m.result &&
          m.result.requestId ===
            (weekStart === '2026-10-19'
              ? 'd2086f60-27b0-4fc3-8f45-bc1020261019'
              : requestFor(weekStart, m.seasonIds))
        );
      });
      assert(root, 'Known original rollout request required');
      const source = root.metadata;
      const original = source.seasonIds.flatMap((id) => {
        const s = seasons.find((value) => value.id === id);
        assert(s);
        return templateEvents(
          id,
          s.group.ageGroup,
          weekStart,
          matches.filter((m) => m.seasonId === id),
        ).filter(
          (e) =>
            dayKey(e.startsAt) >= dayKey(s.startDate) &&
            dayKey(e.startsAt) <= dayKey(s.endDate),
        );
      });
      assert.equal(original.length, source.result.eventIds.length);
      await legacyWrite(db, async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtextextended(${`planning_events:${senior.id}`},0))`;
        const current = await tx.user.findUniqueOrThrow({
          where: { id: actor.id },
          select: { status: true, role: true },
        });
        assert.equal(current.role, 'SYSTEM_ADMIN');
        assert.equal(current.status, 'ACTIVE');
        await new AuthorizationService(tx).assertSeasonManage(actor, senior.id);
        assert.equal(
          fingerprint(
            await tx.match.findMany({
              where: { season: { clubId } },
              orderBy: { id: 'asc' },
            }),
          ),
          fingerprint(matches),
          'Fixture changed during adoption',
        );
        if ((await loadAutomation(tx, senior.id, clubId)).has(weekStart)) {
          alreadyEnrolled++;
          return;
        }
        const entries = [];
        for (let index = 0; index < original.length; index++) {
          const event = original[index];
          if (event.seasonId !== senior.id) continue;
          const id = source.result.eventIds[index],
            row = await readAutomationDay(tx, id);
          const clean = matchesOriginal(
            row,
            event,
            root.actorId,
            clubId,
            senior.groupId,
          );
          const entry = row
            ? await captureEntry(tx, event, id)
            : { key: event.key, event, dayId: id };
          if (!clean) {
            entry.protected = true;
            protectedRows++;
          } else adopted++;
          entries.push(entry);
        }
        if (apply)
          await appendAutomation(tx, actor, clubId, {
            seasonId: senior.id,
            weekStart,
            revision: 1,
            entries,
          });
      });
    }
    const after = await snapshot(db),
      preservation = verifyPreserved(before, after);
    for (const [name, rows] of before)
      if (!apply || name !== 'SecurityAuditEvent')
        assert.equal(
          after.get(name).size,
          rows.size,
          'Enrollment may only append audit checkpoints',
        );
    console.log(
      JSON.stringify({
        state: apply
          ? alreadyEnrolled === 41
            ? 'unchanged-replay'
            : 'enrolled'
          : 'dry-run',
        weeks: 41,
        alreadyEnrolled,
        adopted,
        protected: protectedRows,
        preservation,
      }),
    );
  } finally {
    await db.$disconnect();
  }
}
module.exports = { validateTarget, TEST_DATABASE };
if (require.main === module)
  main().catch(() => {
    console.error('FIXTURE_AUTOMATION_ENROLLMENT_FAILED');
    process.exitCode = 1;
  });
