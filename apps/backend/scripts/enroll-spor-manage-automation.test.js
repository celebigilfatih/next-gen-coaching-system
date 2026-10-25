const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateTarget,
  TEST_DATABASE,
} = require('./enroll-spor-manage-automation');
test('enrollment allows only exact named local targets and no connection overrides', () => {
  const base = 'postgresql://test:test@localhost:5433/';
  validateTarget(base + TEST_DATABASE, false);
  validateTarget(base + 'ngcs_local_session_dev', false);
  for (const value of [
    base + 'production',
    base + TEST_DATABASE + '?host=external',
    base.replace('5433', '5432') + TEST_DATABASE,
    base.replace('localhost', 'external') + TEST_DATABASE,
  ])
    assert.throws(() => validateTarget(value, false));
  assert.throws(() => validateTarget(base + TEST_DATABASE, true));
});
