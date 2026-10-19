const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateTarget,
  calendarWeeks,
  requestFor,
  verifyPreserved,
  TEST_DATABASE,
} = require('./apply-spor-manage-season');
test('season operator accepts only exact local targets without connection overrides', () => {
  const base = 'postgresql://test:test@localhost:5433/';
  assert.equal(validateTarget(base + TEST_DATABASE, false), TEST_DATABASE);
  assert.equal(
    validateTarget(base + 'ngcs_local_session_dev', false),
    'ngcs_local_session_dev',
  );
  for (const url of [
    base + 'production',
    base + TEST_DATABASE + '?host=external',
    base.replace('localhost', 'external') + TEST_DATABASE,
    base.replace('5433', '5432') + TEST_DATABASE,
  ])
    assert.throws(() => validateTarget(url, false));
  assert.throws(() => validateTarget(base + TEST_DATABASE, true));
});
test('season covers partial opening week and inclusive closing Sunday in Turkey', () => {
  const weeks = calendarWeeks(
    new Date('2026-08-14T00:00:00+03:00'),
    new Date('2027-05-23T00:00:00+03:00'),
  );
  assert.equal(weeks[0], '2026-08-10');
  assert.equal(weeks.at(-1), '2027-05-17');
  assert.equal(weeks.length, 41);
  assert.equal(new Set(weeks).size, weeks.length);
});
test('request IDs are deterministic, selection-order independent and week-specific UUIDs', () => {
  const id = requestFor('2026-10-19', ['a', 'b']);
  assert.match(
    id,
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
  assert.equal(requestFor('2026-10-19', ['b', 'a']), id);
  assert.notEqual(requestFor('2026-10-26', ['a', 'b']), id);
  assert.notEqual(requestFor('2026-10-19', ['a']), id);
});
test('preservation catches changed old rows and writes outside planning tables', () => {
  const before = new Map([
    ['Match', new Set(['match'])],
    ['TrainingPlan', new Set(['old'])],
  ]);
  assert.equal(
    verifyPreserved(
      before,
      new Map([
        ['Match', new Set(['match'])],
        ['TrainingPlan', new Set(['old', 'new'])],
      ]),
    ).rows,
    2,
  );
  assert.throws(() =>
    verifyPreserved(
      before,
      new Map([
        ['Match', new Set(['changed'])],
        ['TrainingPlan', new Set(['old'])],
      ]),
    ),
  );
  assert.throws(() =>
    verifyPreserved(
      before,
      new Map([
        ['Match', new Set(['match', 'new'])],
        ['TrainingPlan', new Set(['old'])],
      ]),
    ),
  );
});
