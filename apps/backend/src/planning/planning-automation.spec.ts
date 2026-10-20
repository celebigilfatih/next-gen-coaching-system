import {
  calendarMonday,
  fingerprint,
  shouldProtect,
} from './planning-automation';
import type { AutomationDay } from './planning-automation';

describe('automation ownership protection', () => {
  it('canonicalizes property order and Date values', () => {
    expect(fingerprint({ b: 1, a: new Date('2026-10-25T13:00:00Z') })).toBe(
      fingerprint({ a: '2026-10-25T13:00:00.000Z', b: 1 }),
    );
  });
  it('protects manual edits, deletions, completion, attendance, extra links and history', () => {
    const row = {
      id: 'day',
      completed: false,
      date: new Date('2200-10-25T13:00:00Z'),
      trainingPlan: { _count: { attendance: 0, dayPlans: 1 } },
    } as AutomationDay;
    const entry = { key: 'key', fingerprint: fingerprint(row) };
    expect(shouldProtect(entry, row, '2026-10-19')).toBe(false);
    for (const changed of [
      null,
      { ...row, completed: true },
      { ...row, title: 'Manual' },
      { ...row, date: new Date('2000-01-01') },
      { ...row, trainingPlan: { _count: { attendance: 1, dayPlans: 1 } } },
      { ...row, trainingPlan: { _count: { attendance: 0, dayPlans: 2 } } },
    ])
      expect(
        shouldProtect(entry, changed as AutomationDay | null, '2026-10-19'),
      ).toBe(true);
    expect(
      shouldProtect({ ...entry, protected: true }, row, '2026-10-19'),
    ).toBe(true);
  });
  it('uses Turkish local Mondays across Sunday UTC boundaries', () => {
    expect(calendarMonday(new Date('2026-10-25T22:00:00Z'))).toBe('2026-10-26');
    expect(calendarMonday(new Date('2026-10-25T13:00:00Z'))).toBe('2026-10-19');
  });
});
