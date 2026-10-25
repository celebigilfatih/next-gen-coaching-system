/* Local season rollout: preflight everything, then commit/resume one week at a time. */
require('reflect-metadata');
const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const {
  PrismaService,
} = require('../node_modules/.cache/ngcs-quality-build/prisma/prisma.service');
const {
  PlanningService,
} = require('../node_modules/.cache/ngcs-quality-build/planning/planning.service');
const {
  DAY,
  dayKey,
  midnight,
} = require('../node_modules/.cache/ngcs-quality-build/planning/planning-input');
const {
  physical,
} = require('../node_modules/.cache/ngcs-quality-build/planning/weekly-template');

const TEST_DATABASE = 'ngcs_season_program_restore_test';
const hash = (value) =>
  createHash('sha256').update(JSON.stringify(value)).digest('hex');
function validateTarget(
  value,
  production = process.env.NODE_ENV === 'production',
) {
  const url = new URL(value);
  assert(!production, 'Production excluded');
  assert(['postgresql:', 'postgres:'].includes(url.protocol));
  assert(['localhost', '127.0.0.1'].includes(url.hostname));
  assert.equal(url.port, '5433');
  assert(!url.search && !url.hash, 'Connection overrides excluded');
  assert(
    ['/ngcs_local_session_dev', `/${TEST_DATABASE}`].includes(url.pathname),
  );
  return url.pathname.slice(1);
}
function calendarWeeks(start, end) {
  const first = midnight(dayKey(start));
  const weekday = new Date(first.getTime() + 3 * 3_600_000).getUTCDay() || 7;
  first.setTime(first.getTime() - (weekday - 1) * DAY);
  const weeks = [];
  for (
    let stamp = first.getTime();
    stamp <= midnight(dayKey(end)).getTime();
    stamp += 7 * DAY
  ) {
    assert(weeks.length < 81, 'Season length exceeded');
    weeks.push(dayKey(new Date(stamp)));
  }
  assert(weeks.length > 0);
  return weeks;
}
function requestFor(weekStart, seasonIds) {
  const hex = hash([
    'SPOR_MANAGE_SEASON_2026_2027_V1',
    weekStart,
    [...seasonIds].sort(),
  ]);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}
function slotFor(seasonId, weekStart) {
  return `planning_slot_${hash([seasonId, weekStart])}`;
}
async function snapshot(db) {
  const names =
    await db.$queryRaw`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`;
  const result = new Map();
  for (const { tablename } of names) {
    assert(/^[A-Za-z_][A-Za-z0-9_]*$/.test(tablename));
    const rows = await db.$queryRawUnsafe(
      `SELECT to_jsonb(t) AS row FROM "${tablename}" t`,
    );
    result.set(tablename, new Set(rows.map((r) => hash(r.row))));
  }
  return result;
}
function verifyPreserved(before, after) {
  const additions = new Set([
    'TrainingPlan',
    'PlanDrill',
    'Drill',
    'WeekPlan',
    'DayPlan',
    'SecurityAuditEvent',
  ]);
  assert.deepEqual([...after.keys()], [...before.keys()]);
  let preserved = 0;
  for (const [name, rows] of before) {
    const current = after.get(name);
    for (const row of rows)
      assert(current.has(row), `Existing row changed: ${name}`);
    if (!additions.has(name))
      assert.equal(current.size, rows.size, `Unexpected write: ${name}`);
    preserved += rows.size;
  }
  return { tables: before.size, rows: preserved };
}
function counts(previews) {
  const events = previews.flatMap((p) => p.teams.flatMap((t) => t.events));
  return {
    teamWeeks: previews.reduce((sum, p) => sum + p.teams.length, 0),
    events: events.length,
    training: events.filter((e) => physical(e.kind)).length,
    meetings: events.filter((e) => e.kind === 'TOPLANTI').length,
    rest: events.filter((e) => e.kind === 'REST').length,
  };
}
async function run(db, email, apply) {
  const user = await db.user.findUniqueOrThrow({
    where: { email },
    select: { id: true, email: true, role: true, status: true, clubId: true },
  });
  assert.equal(user.role, 'SYSTEM_ADMIN');
  assert.equal(user.status, 'ACTIVE');
  const actor = { ...user, userId: user.id };
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
  assert.deepEqual(
    seasons.map((s) => s.group.ageGroup).sort(),
    [
      'SENIOR',
      'U8',
      'U9',
      'U10',
      'U11',
      'U12',
      'U13',
      'U14',
      'U15',
      'U16',
    ].sort(),
  );
  for (const s of seasons) {
    assert.equal(dayKey(s.startDate), '2026-08-14');
    assert.equal(dayKey(s.endDate), '2027-05-23');
  }
  const fixtures = await db.match.findMany({
    where: { season: { clubId } },
    orderBy: { id: 'asc' },
  });
  assert.equal(fixtures.length, 36);
  assert(
    fixtures.every(
      (m) =>
        m.seasonId === seasons.find((s) => s.group.ageGroup === 'SENIOR').id,
    ),
  );
  const before = await snapshot(db);
  const service = new PlanningService(db);
  const weeks = calendarWeeks(seasons[0].startDate, seasons[0].endDate);
  const previews = [];
  let skipped = 0;
  // All weeks must pass before the first business write. Existing slot markers are authoritative.
  for (const weekStart of weeks) {
    const slots = new Set(
      (
        await db.securityAuditEvent.findMany({
          where: {
            id: { in: seasons.map((s) => slotFor(s.id, weekStart)) },
            action: 'WEEK_PLANNING_APPLIED',
          },
          select: { id: true },
        })
      ).map((s) => s.id),
    );
    const seasonIds = seasons
      .filter((s) => !slots.has(slotFor(s.id, weekStart)))
      .map((s) => s.id);
    skipped += seasons.length - seasonIds.length;
    if (!seasonIds.length) continue;
    const input = { weekStart, seasonIds };
    const preview = await service.preview(actor, input);
    assert.deepEqual(preview.conflicts, [], `Week conflicts: ${weekStart}`);
    assert(preview.teams.every((t) => t.events.length > 0));
    previews.push(preview);
  }
  const planned = counts(previews);
  if (!apply) {
    const after = await snapshot(db);
    const preservation = verifyPreserved(before, after);
    for (const [name, rows] of before)
      assert.equal(
        after.get(name).size,
        rows.size,
        `Dry-run wrote rows: ${name}`,
      );
    console.log(
      JSON.stringify({
        state: 'dry-run',
        from: '2026-08-14',
        until: '2027-05-23',
        weeks: weeks.length,
        skippedTeamWeeks: skipped,
        ...planned,
        preservation,
      }),
    );
    return;
  }
  for (const original of previews) {
    const preview = await service.preview(actor, original.input);
    assert.equal(
      preview.token,
      original.token,
      'Calendar changed after season preflight',
    );
    assert.deepEqual(preview.conflicts, []);
    const result = await service.apply(actor, {
      requestId: requestFor(preview.input.weekStart, preview.input.seasonIds),
      previewToken: preview.token,
      program: preview.input,
    });
    assert.equal(result.eventCount, counts([preview]).events);
    console.log(
      JSON.stringify({
        state: 'week-completed',
        week: preview.input.weekStart,
        teams: result.teamCount,
        events: result.eventCount,
      }),
    );
  }
  assert.deepEqual(
    await db.match.findMany({
      where: { season: { clubId } },
      orderBy: { id: 'asc' },
    }),
    fixtures,
  );
  const plans = await db.trainingPlan.findMany({
    where: { clubId },
    include: { drills: { include: { drill: true } }, dayPlans: true },
  });
  // Validate this operator's plans, including completed batches on a resumed run.
  // Existing user-edited plans may legitimately have a different phase count.
  const operatorPlanIds = new Set();
  const requests = await db.securityAuditEvent.findMany({
    where: {
      actorId: actor.id,
      action: 'WEEK_PLANNING_APPLIED',
      metadata: { path: ['operation'], equals: 'PLANNING_REQUEST_V1' },
    },
    select: { metadata: true },
  });
  for (const { metadata } of requests) {
    if (
      metadata.seasonIds?.length &&
      metadata.result &&
      weeks.some(
        (week) =>
          requestFor(week, metadata.seasonIds) === metadata.result.requestId,
      )
    )
      for (const id of metadata.result.planIds) operatorPlanIds.add(id);
  }
  const totals = {};
  for (const season of seasons) {
    const teamPlans = plans.filter((p) => p.groupId === season.groupId);
    totals[season.group.ageGroup] = {
      training: teamPlans.length,
      minutes: teamPlans.reduce((sum, p) => sum + p.totalDuration, 0),
    };
    for (const plan of teamPlans) {
      if (!operatorPlanIds.has(plan.id)) continue;
      assert(
        plan.date >= season.startDate &&
          dayKey(plan.date) <= dayKey(season.endDate),
      );
      assert.equal(plan.drills.length, 4);
      assert.equal(
        plan.drills.reduce((sum, p) => sum + p.drill.durationMin, 0),
        plan.totalDuration,
      );
      assert.equal(plan.dayPlans.length, 1);
      assert(
        plan.drills.every(
          (p) =>
            p.drill.scope === 'CLUB' &&
            p.drill.ageGroup === season.group.ageGroup,
        ),
      );
      if (season.group.ageGroup !== 'SENIOR') {
        const local = new Date(plan.date.getTime() + 3 * 3_600_000);
        if (local.getUTCDay() !== 6)
          assert(local.getUTCHours() >= 17, 'School-hour conflict');
      }
    }
    const markers = await db.securityAuditEvent.count({
      where: {
        action: 'WEEK_PLANNING_APPLIED',
        id: { in: weeks.map((w) => slotFor(season.id, w)) },
      },
    });
    assert.equal(markers, weeks.length);
  }
  const preservation = verifyPreserved(before, await snapshot(db));
  console.log(
    JSON.stringify({
      state: previews.length ? 'completed' : 'unchanged-replay',
      weeks: weeks.length,
      skippedTeamWeeks: skipped,
      added: planned,
      preservedMatches: fixtures.length,
      preservation,
      totals,
    }),
  );
}
async function main() {
  validateTarget(process.env.DATABASE_URL || 'http://invalid');
  const apply = process.argv.includes('--apply');
  assert(
    process.argv.slice(2).every((arg) => arg === '--apply'),
    'Unknown argument',
  );
  if (apply) assert.equal(process.env.NGCS_APPLY_SEASON_PROGRAM, 'true');
  assert(process.env.NGCS_WEEK_ACTOR_EMAIL, 'Explicit existing actor required');
  const db = new PrismaService();
  try {
    await run(db, process.env.NGCS_WEEK_ACTOR_EMAIL, apply);
  } finally {
    await db.$disconnect();
  }
}
module.exports = {
  validateTarget,
  calendarWeeks,
  requestFor,
  verifyPreserved,
  snapshot,
  TEST_DATABASE,
};
if (require.main === module)
  main().catch((error) => {
    // Assertion messages contain only fixed diagnostics/dates, never connection/actor data.
    console.error(
      'LOCAL_SEASON_PROGRAM_FAILED',
      error instanceof assert.AssertionError
        ? error.message
        : 'Check the last completed week and rerun after resolving the failure',
    );
    process.exitCode = 1;
  });
