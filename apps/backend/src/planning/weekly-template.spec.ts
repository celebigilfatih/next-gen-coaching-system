import { templateEvents, sessionPhases } from './weekly-template';
import { eventInput, instant, programInput, dayKey } from './planning-input';

describe('age-specific balanced weekly program', () => {
  const fixture = [
    { date: new Date('2026-10-18T16:00:00+03:00'), opponent: 'Önceki' },
    { date: new Date('2026-10-25T16:00:00+03:00'), opponent: 'Örnek rakip' },
  ];
  it('uses match recovery, double sessions and match-day activation without creating fixtures', () => {
    const events = templateEvents('s', 'SENIOR', '2026-10-19', fixture);
    expect(
      events.filter((e) => ['TRAINING', 'RECOVERY'].includes(e.kind)),
    ).toHaveLength(11);
    expect(events.filter((e) => e.kind === 'TOPLANTI')).toHaveLength(4);
    expect(
      events.filter(
        (e) => dayKey(e.startsAt) === '2026-10-20' && e.kind === 'TRAINING',
      ),
    ).toHaveLength(2);
    expect(events.find((e) => dayKey(e.startsAt) === '2026-10-19')?.kind).toBe(
      'RECOVERY',
    );
    expect(
      events.filter(
        (e) => dayKey(e.startsAt) === '2026-10-25' && e.kind === 'TRAINING',
      ),
    ).toHaveLength(1);
    expect(events.some((e) => (e.kind as string) === 'MATCH')).toBe(false);
  });
  it.each([
    ['U8', 3],
    ['U9', 3],
    ['U10', 4],
    ['U11', 4],
    ['U12', 4],
    ['U13', 5],
    ['U14', 5],
    ['U15', 6],
    ['U16', 6],
  ])(
    '%s has %i physical sessions at its own age/school hours',
    (age, count) => {
      const events = templateEvents('s', age, '2026-10-19', []);
      expect(events.filter((e) => e.kind === 'TRAINING')).toHaveLength(count);
      expect(events.some((e) => e.kind === 'TOPLANTI')).toBe(true);
      for (const e of events.filter((e) => e.kind === 'TRAINING')) {
        const local = new Date(Date.parse(e.startsAt) + 3 * 3_600_000);
        if (local.getUTCDay() !== 6)
          expect(local.getUTCHours()).toBeGreaterThanOrEqual(17);
      }
    },
  );
  it.each([20, 25, 30, 40, 45, 60, 75, 80, 90])(
    'phase totals are exactly %i with instructions',
    (duration) => {
      const phases = sessionPhases('U8', 'Topla oyun', duration);
      expect(phases.map((p) => p.phase)).toEqual([
        'WARM_UP',
        'TECHNICAL',
        'TACTICAL',
        'COOL_DOWN',
      ]);
      expect(phases.reduce((sum, p) => sum + p.duration, 0)).toBe(duration);
      expect(
        phases.every(
          (p) =>
            p.duration > 0 &&
            p.notes.includes('Organizasyon:') &&
            p.notes.includes('Koçluk:'),
        ),
      ).toBe(true);
    },
  );
  it('refuses unsupported ages and congested weeks', () => {
    expect(() => templateEvents('s', 'U7', '2026-10-19', [])).toThrow();
    expect(() =>
      templateEvents('s', 'U16', '2026-10-19', [
        ...fixture,
        { date: new Date('2026-10-21T16:00:00+03:00'), opponent: 'İkinci' },
      ]),
    ).toThrow();
  });
  it('uses development and rest in fixture-free breaks without invented opponent preparation', () => {
    const events = templateEvents('s', 'SENIOR', '2026-12-28', []);
    expect(events.some((e) => /Rakip|Rakibe|Maç planı/.test(e.title))).toBe(
      false,
    );
    expect(events.filter((e) => dayKey(e.startsAt) === '2027-01-02')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ kind: 'TRAINING', duration: 60 }),
        expect.objectContaining({ kind: 'TOPLANTI', duration: 20 }),
      ]),
    );
    expect(events.find((e) => dayKey(e.startsAt) === '2027-01-03')?.kind).toBe(
      'REST',
    );
  });
  it('adapts preparation to a changed fixture weekday and kickoff', () => {
    const events = templateEvents('s', 'SENIOR', '2026-10-19', [
      { date: new Date('2026-10-23T19:00:00+03:00'), opponent: 'Friday' },
    ]);
    expect(events.find((e) => e.title === 'Rakibe hazırlık')?.startsAt).toBe(
      '2026-10-21T07:00:00.000Z',
    );
    expect(
      events.find((e) => e.title === 'Maç günü hafif aktivasyon')?.startsAt,
    ).toBe('2026-10-23T10:00:00.000Z');
    expect(events.find((e) => e.kind === 'RECOVERY')?.startsAt).toBe(
      '2026-10-24T07:00:00.000Z',
    );
  });
  it('includes next-week Monday fixture in Sunday activation', () => {
    const events = templateEvents('s', 'SENIOR', '2026-10-19', [
      { date: new Date('2026-10-26T16:00:00+03:00'), opponent: 'Monday' },
    ]);
    expect(
      events.find((e) => e.title === 'Maç öncesi kısa aktivasyon')?.startsAt,
    ).toBe('2026-10-25T07:00:00.000Z');
  });
  it.each([
    ['2026-10-22', 48, 30],
    ['2026-10-23', 72, 30],
    ['2026-10-24', 96, 35],
    ['2026-10-25', 120, 40],
  ])(
    'adapts two fixtures ending %s at %i-hour intervals',
    (end, hours, recovery) => {
      const matches = [
        { date: new Date('2026-10-20T16:00:00+03:00'), opponent: 'First' },
        { date: new Date(`${end}T16:00:00+03:00`), opponent: 'Second' },
      ];
      const events = templateEvents(
        's',
        'SENIOR',
        '2026-10-19',
        matches.reverse(),
      );
      const between = events.filter(
        (e) => dayKey(e.startsAt) > '2026-10-20' && dayKey(e.startsAt) < end,
      );
      expect(between.find((e) => e.kind === 'RECOVERY')?.duration).toBe(
        recovery,
      );
      expect(
        between.every((e) => e.notes.includes(`Maç aralığı: ${hours} saat`)),
      ).toBe(true);
      for (const date of new Set(between.map((e) => dayKey(e.startsAt))))
        expect(
          between.filter(
            (e) =>
              dayKey(e.startsAt) === date &&
              ['TRAINING', 'RECOVERY'].includes(e.kind),
          ),
        ).toHaveLength(1);
      expect(events.filter((e) => e.title === 'Maç toplantısı')).toHaveLength(
        2,
      );
      const ranges = [
        ...events.map((e) => [Date.parse(e.startsAt), e.duration]),
        ...matches.map((m) => [m.date.getTime(), 120]),
      ].sort((a, b) => a[0] - b[0]);
      for (let i = 1; i < ranges.length; i++)
        expect(ranges[i][0]).toBeGreaterThanOrEqual(
          ranges[i - 1][0] + ranges[i - 1][1] * 60_000,
        );
      for (const e of events.filter((e) =>
        ['TRAINING', 'RECOVERY'].includes(e.kind),
      )) {
        const phases = sessionPhases('SENIOR', e.title, e.duration);
        expect(phases.every((p) => p.duration > 0)).toBe(true);
        expect(phases.reduce((sum, p) => sum + p.duration, 0)).toBe(e.duration);
      }
    },
  );
  it('uses kickoff hours rather than rounded calendar gaps and combines MD+1/MD-1', () => {
    const generate = (time: string) =>
      templateEvents('s', 'SENIOR', '2026-10-19', [
        { date: new Date('2026-10-20T16:00:00+03:00'), opponent: 'First' },
        { date: new Date(`2026-10-24T${time}:00+03:00`), opponent: 'Next' },
      ]).find(
        (e) => dayKey(e.startsAt) === '2026-10-21' && e.kind === 'RECOVERY',
      );
    expect(generate('16:00')?.duration).toBe(35);
    expect(generate('17:00')?.duration).toBe(40);
    const combined = templateEvents('s', 'SENIOR', '2026-10-19', [
      { date: new Date('2026-10-20T16:00:00+03:00'), opponent: 'First' },
      { date: new Date('2026-10-22T16:00:00+03:00'), opponent: 'Next' },
    ]).filter((e) => dayKey(e.startsAt) === '2026-10-21');
    expect(combined.map((e) => e.kind)).toEqual([
      'RECOVERY',
      'TOPLANTI',
      'REST',
    ]);
    expect(combined[1].topic).toContain('Next');
  });
  it('adapts tight intervals across Monday and keeps early kickoff preparation on its date', () => {
    const events = templateEvents('s', 'SENIOR', '2026-10-19', [
      { date: new Date('2026-10-18T20:00:00+03:00'), opponent: 'Previous' },
      { date: new Date('2026-10-21T16:00:00+03:00'), opponent: 'Next' },
    ]);
    expect(events[0].duration).toBe(30);
    expect(events[0].notes).toContain('68 saat');
    const early = templateEvents('s', 'SENIOR', '2026-10-19', [
      { date: new Date('2026-10-25T02:00:00+03:00'), opponent: 'Early' },
    ]).filter((e) => dayKey(e.startsAt) === '2026-10-25');
    expect(early.map((e) => e.startsAt)).toEqual([
      '2026-10-24T21:00:00.000Z',
      '2026-10-24T21:30:00.000Z',
    ]);
  });
  it.each([
    [
      ['19T16:00', '22T16:00', '25T16:00'],
      [30, 20, 30, 20],
    ],
    [
      ['19T16:00', '21T16:00', '25T16:00'],
      [30, 35, 35, 30],
    ],
    [
      ['19T16:00', '20T16:00', '25T16:00'],
      [40, 45, 45, 30],
    ],
    [
      ['19T16:00', '21T16:00', '23T16:00', '25T16:00'],
      [30, 30, 30],
    ],
    [
      ['19T16:00', '20T16:00', '21T16:00', '25T16:00'],
      [35, 35, 30],
    ],
    [
      ['19T16:00', '20T16:00', '23T16:00', '25T16:00'],
      [30, 20, 30],
    ],
    [
      ['19T16:00', '20T16:00', '21T16:00', '22T16:00', '25T16:00'],
      [30, 20],
    ],
    [
      ['19T16:00', '20T16:00', '21T16:00', '23T16:00', '25T16:00'],
      [30, 30],
    ],
    [
      ['19T01:00', '20T01:00', '21T01:00', '22T01:00', '25T23:00'],
      [35, 30],
    ],
  ])(
    'uses each consecutive interval in a congested week: %j',
    (dates, durations) => {
      const matches = dates.map((date, i) => ({
        date: new Date(`2026-10-${date}:00+03:00`),
        opponent: `Opponent ${i}`,
      }));
      const events = templateEvents('s', 'SENIOR', '2026-10-19', matches);
      const restDays = events.filter(
        (e) =>
          ['TRAINING', 'RECOVERY'].includes(e.kind) &&
          !matches.some((m) => dayKey(m.date) === dayKey(e.startsAt)),
      );
      expect(restDays.map((e) => e.duration)).toEqual(durations);
      expect(events.filter((e) => e.title === 'Maç toplantısı')).toHaveLength(
        dates.length,
      );
      expect(
        events.filter((e) => e.title === 'Maç günü hafif aktivasyon'),
      ).toHaveLength(dates.length);
      for (const date of new Set(events.map((e) => dayKey(e.startsAt))))
        expect(
          events.filter(
            (e) =>
              dayKey(e.startsAt) === date &&
              ['TRAINING', 'RECOVERY'].includes(e.kind),
          ),
        ).toHaveLength(1);
      for (const e of restDays) {
        expect(e.notes).toContain('Maç aralığı:');
        const phases = sessionPhases('SENIOR', e.title, e.duration);
        expect(phases.every((p) => p.duration > 0)).toBe(true);
        expect(phases.reduce((sum, p) => sum + p.duration, 0)).toBe(e.duration);
      }
      const ranges = [
        ...events.map((e) => [Date.parse(e.startsAt), e.duration]),
        ...matches.map((m) => [m.date.getTime(), 120]),
      ].sort((a, b) => a[0] - b[0]);
      for (let i = 1; i < ranges.length; i++)
        expect(ranges[i][0]).toBeGreaterThanOrEqual(
          ranges[i - 1][0] + ranges[i - 1][1] * 60_000,
        );
    },
  );
  it('uses adjacent-week fixtures around a three-match week and recovers after the final match', () => {
    const matches = [
      '18T16:00',
      '20T16:00',
      '22T16:00',
      '24T16:00',
      '27T16:00',
    ].map((d, i) => ({
      date: new Date(`2026-10-${d}:00+03:00`),
      opponent: `Opponent ${i}`,
    }));
    const events = templateEvents('s', 'SENIOR', '2026-10-19', matches);
    expect(
      events
        .filter((e) => e.kind === 'RECOVERY')
        .map((e) => [dayKey(e.startsAt), e.duration]),
    ).toEqual([
      ['2026-10-19', 30],
      ['2026-10-21', 30],
      ['2026-10-23', 30],
      ['2026-10-25', 30],
    ]);
    expect(
      events.find(
        (e) => dayKey(e.startsAt) === '2026-10-25' && e.kind === 'TOPLANTI',
      )?.topic,
    ).toContain('Opponent 4');
    const withoutNext = templateEvents(
      's',
      'SENIOR',
      '2026-10-19',
      matches.slice(0, -1),
    );
    expect(
      withoutNext.find(
        (e) => dayKey(e.startsAt) === '2026-10-25' && e.kind === 'RECOVERY',
      )?.duration,
    ).toBe(40);
  });
  it.each([4, 5])(
    'keeps every %i-match weekday combination collision-free with valid physical phases',
    (fixtureCount) => {
      const combinations: number[][] = [];
      function choose(from: number, days: number[]) {
        if (days.length === fixtureCount) {
          combinations.push(days);
          return;
        }
        for (let day = from; day < 7; day++) choose(day + 1, [...days, day]);
      }
      choose(0, []);
      expect(combinations).toHaveLength(fixtureCount === 4 ? 35 : 21);
      for (const days of combinations) {
        const matches = days.map((day) => ({
          date: new Date(Date.UTC(2026, 9, 19 + day, 13)),
          opponent: 'Example',
        }));
        const events = templateEvents('s', 'SENIOR', '2026-10-19', matches);
        const ranges = [
          ...events.map((e) => [Date.parse(e.startsAt), e.duration]),
          ...matches.map((m) => [m.date.getTime(), 120]),
        ].sort((a, b) => a[0] - b[0]);
        for (let i = 1; i < ranges.length; i++)
          expect(ranges[i][0]).toBeGreaterThanOrEqual(
            ranges[i - 1][0] + ranges[i - 1][1] * 60_000,
          );
        for (const event of events.filter((e) =>
          ['TRAINING', 'RECOVERY'].includes(e.kind),
        )) {
          const phases = sessionPhases('SENIOR', event.title, event.duration);
          expect(phases.every((p) => p.duration > 0)).toBe(true);
          expect(phases.reduce((sum, p) => sum + p.duration, 0)).toBe(
            event.duration,
          );
        }
        expect(events.filter((e) => e.title === 'Maç toplantısı')).toHaveLength(
          fixtureCount,
        );
      }
    },
  );
  it('uses neighboring weeks after four fixtures without adding a second physical session between matches', () => {
    const matches = [
      '18T16:00',
      '19T16:00',
      '20T16:00',
      '22T16:00',
      '24T16:00',
      '27T16:00',
    ].map((d) => ({
      date: new Date(`2026-10-${d}:00+03:00`),
      opponent: `Opponent ${d}`,
    }));
    const events = templateEvents('s', 'SENIOR', '2026-10-19', matches);
    expect(
      events
        .filter((e) => e.kind === 'RECOVERY')
        .map((e) => [dayKey(e.startsAt), e.duration]),
    ).toEqual([
      ['2026-10-21', 30],
      ['2026-10-23', 30],
      ['2026-10-25', 30],
    ]);
    expect(
      events.find(
        (e) => dayKey(e.startsAt) === '2026-10-25' && e.kind === 'TOPLANTI',
      )?.topic,
    ).toContain('Opponent 27T16:00');
    const next = templateEvents('s', 'SENIOR', '2026-10-26', matches);
    expect(
      next.find(
        (e) => dayKey(e.startsAt) === '2026-10-26' && e.kind === 'TRAINING',
      )?.duration,
    ).toBe(20);
  });
  it('handles adjacent-week context before and after five fixtures', () => {
    const matches = [
      '18T16:00',
      '19T16:00',
      '20T16:00',
      '21T16:00',
      '22T20:00',
      '24T20:00',
      '27T16:00',
    ].map((d) => ({
      date: new Date(`2026-10-${d}:00+03:00`),
      opponent: `Opponent ${d}`,
    }));
    const events = templateEvents('s', 'SENIOR', '2026-10-19', matches);
    expect(
      events
        .filter((e) => e.kind === 'RECOVERY')
        .map((e) => [dayKey(e.startsAt), e.duration]),
    ).toEqual([
      ['2026-10-23', 30],
      ['2026-10-25', 30],
    ]);
    const next = templateEvents('s', 'SENIOR', '2026-10-26', matches);
    expect(
      next.find(
        (e) => dayKey(e.startsAt) === '2026-10-26' && e.kind === 'TRAINING',
      )?.duration,
    ).toBe(20);
    expect(
      next.find(
        (e) => dayKey(e.startsAt) === '2026-10-26' && e.kind === 'TOPLANTI',
      )?.topic,
    ).toContain('Opponent 27T16:00');
  });
  it('refuses six fixtures, same-day fixtures and sub-24-hour turnarounds', () => {
    const match = (date: string) => ({
      date: new Date(date),
      opponent: 'Example',
    });
    for (const matches of [
      [
        '2026-10-19T16:00:00+03:00',
        '2026-10-21T16:00:00+03:00',
        '2026-10-22T16:00:00+03:00',
        '2026-10-23T16:00:00+03:00',
        '2026-10-24T16:00:00+03:00',
        '2026-10-25T16:00:00+03:00',
      ],
      ['2026-10-20T01:00:00+03:00', '2026-10-20T23:00:00+03:00'],
      ['2026-10-18T20:00:00+03:00', '2026-10-19T16:00:00+03:00'],
    ])
      expect(() =>
        templateEvents('s', 'SENIOR', '2026-10-19', matches.map(match)),
      ).toThrow();
  });
  it('strictly rejects invalid dates, duplicated selections, foreign fields and malformed overrides', () => {
    expect(() => instant('2026-02-30T17:00:00+03:00')).toThrow();
    expect(() =>
      programInput({ weekStart: '2026-10-20', seasonIds: ['s'] }),
    ).toThrow();
    expect(() =>
      programInput({ weekStart: '2026-10-19', seasonIds: ['s', 's'] }),
    ).toThrow();
    expect(() =>
      programInput({
        weekStart: '2026-10-19',
        seasonIds: ['s'],
        clubId: 'foreign',
      }),
    ).toThrow();
    expect(() =>
      programInput({
        weekStart: '2026-10-19',
        seasonIds: ['s'],
        overrides: [{ key: 'x', duration: 50 }],
      }),
    ).toThrow();
    expect(() => eventInput({ kind: 'GORUSME' })).toThrow();
  });
});
