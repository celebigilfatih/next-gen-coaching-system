import { describe, expect, it } from 'vitest';
import { addDays, parseWeekStart, toLocalDateKey, weekDays } from '../lib/week';

describe('week calendar', () => {
  it('starts on Monday and spans seven days across a month boundary', () => {
    const start = parseWeekStart('2026-09-01');
    const days = weekDays(start);
    expect(toLocalDateKey(days[0])).toBe('2026-08-31');
    expect(toLocalDateKey(days[6])).toBe('2026-09-06');
  });

  it('moves correctly across year boundaries', () => {
    const start = parseWeekStart('2026-12-31');
    expect(toLocalDateKey(addDays(start, 7))).toBe('2027-01-04');
  });
});
