import { SeasonsService } from './seasons.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SeasonsController } from './seasons.controller';
import { AuthorizationService } from '../auth/authorization.service';
import type { AuthPrincipal } from '../auth/auth-principal';
import {
  parseCreateSeasonBody,
  parseCreateWeekBody,
  parseUpdateWeekBody,
  parseCreateDayBody,
  parseCreateMatchBody,
  parseUpdateMatchBody,
} from './dto/season.dto';

const cases = [
  [
    'season',
    parseCreateSeasonBody,
    {
      name: '',
      clubId: 'club-a',
      groupId: 'group-a',
      startDate: '2026-09-05',
      endDate: '2026-09-06',
    },
    [
      { name: null },
      { clubId: '' },
      { groupId: {} },
      { startDate: '2026-02-30' },
      { endDate: true },
    ],
  ],
  [
    'week',
    parseCreateWeekBody,
    {
      weekNumber: 1,
      startDate: '2026-09-05',
      endDate: '2026-09-06',
      notes: null,
    },
    [{ weekNumber: '1' }, { startDate: null }, { notes: [] }],
  ],
  [
    'week patch',
    parseUpdateWeekBody,
    { totalLoad: 0, notes: null },
    [{ totalLoad: null }, { totalLoad: { increment: 1 } }, { notes: 1 }],
  ],
  [
    'day',
    parseCreateDayBody,
    {
      dayOfWeek: 1,
      date: '2026-09-05',
      type: 'TRAINING',
      duration: null,
      intensity: null,
      notes: null,
    },
    [
      { dayOfWeek: 1.5 },
      { date: 'invalid' },
      { type: 'UNKNOWN' },
      { type: null },
      { drillIds: ['a', {}] },
      { trainingPlanId: {} },
      { duration: '5' },
      { intensity: 2147483648 },
    ],
  ],
  [
    'match',
    parseCreateMatchBody,
    { date: '2026-09-05', opponent: '', location: '', competition: null },
    [{ date: {} }, { opponent: null }, { location: [] }, { groupId: 1 }],
  ],
  [
    'match patch',
    parseUpdateMatchBody,
    {
      notes: null,
      opponentAnalysis: { summary: 'Demo' },
      videoLinks: ['video-reference'],
    },
    [
      { date: false },
      { date: '2026-02-30' },
      { opponent: { set: 'x' } },
      { location: null },
      { opponentAnalysis: NaN },
      { videoLinks: () => undefined },
    ],
  ],
] as const;

describe('Season resource DTOs', () => {
  it.each(cases)('%s rejects malformed bodies', (_name, parse) => {
    for (const input of [undefined, null, [], 'invalid', 5])
      expect(() => parse(input)).toThrow(BadRequestException);
  });
  it.each(cases)(
    '%s rejects malformed fields',
    (_name, parse, valid, invalid) => {
      for (const patch of invalid)
        expect(() => parse({ ...valid, ...patch })).toThrow(
          BadRequestException,
        );
    },
  );
  it.each(cases)(
    '%s projects documented fields only',
    (_name, parse, valid) => {
      const result = parse({
        ...valid,
        id: 'other',
        seasonId: 'other',
        userId: 'other',
        days: { deleteMany: {} },
        tacticalBoard: { invalid: true },
        createdAt: 'invalid',
      });
      for (const field of [
        'id',
        'seasonId',
        'userId',
        'days',
        'tacticalBoard',
        'createdAt',
      ])
        expect(result).not.toHaveProperty(field);
    },
  );
  it('preserves date-only, local ISO and offset Date conversions', () => {
    for (const date of [
      '2026-09-05',
      '2026-09-05T12:00:00',
      '2026-09-05T12:00:00+03:00',
      new Date('2026-09-05'),
    ]) {
      expect(
        parseCreateMatchBody({ date, opponent: '', location: '' }).date,
      ).toEqual(new Date(date));
    }
    for (const date of [undefined, null, ''])
      expect(parseUpdateMatchBody({ date }).date).toBeUndefined();
  });
  it('preserves day defaults, nullables and Int rather than new business bounds', () => {
    const day = parseCreateDayBody({
      dayOfWeek: -1,
      date: '2026-09-05',
      drillIds: null,
      trainingPlanId: null,
      duration: null,
    });
    expect(day).toMatchObject({
      type: undefined,
      dayOfWeek: -1,
      drillIds: null,
      trainingPlanId: null,
      duration: null,
    });
    expect(parseUpdateWeekBody({ totalLoad: -2147483648 }).totalLoad).toBe(
      -2147483648,
    );
    expect(parseUpdateWeekBody({})).toEqual({
      notes: undefined,
      totalLoad: undefined,
    });
  });
  it('preserves JSON shapes and rejects unrepresentable internal values', () => {
    for (const value of [
      null,
      'text',
      1,
      false,
      [],
      { summary: '', nested: [null, true] },
    ])
      expect(
        parseUpdateMatchBody({ opponentAnalysis: value, videoLinks: value }),
      ).toMatchObject({ opponentAnalysis: value, videoLinks: value });
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    for (const value of [cyclic, new Date(), { nested: undefined }, Infinity])
      expect(() => parseUpdateMatchBody({ opponentAnalysis: value })).toThrow(
        BadRequestException,
      );
  });
});

describe('Season mutation field boundary', () => {
  it('does not forward alternate season or nested day writes through updateWeek', async () => {
    const update = jest.fn();
    const service = new SeasonsService({
      weekPlan: { update },
    } as unknown as PrismaService);
    await service.updateWeek('week-a', {
      notes: 'Allowed note',
      totalLoad: 0,
      seasonId: 'season-b',
      season: { connect: { id: 'season-b' } },
      days: { deleteMany: {} },
    } as Parameters<SeasonsService['updateWeek']>[1]);
    expect(update).toHaveBeenCalledWith({
      where: { id: 'week-a' },
      data: { notes: 'Allowed note', totalLoad: 0 },
      include: { days: true },
    });
  });

  it('does not forward nested creation through season/week/match services', async () => {
    const seasonCreate = jest.fn(),
      weekCreate = jest.fn(),
      matchCreate = jest.fn();
    const service = new SeasonsService({
      season: { create: seasonCreate },
      weekPlan: { create: weekCreate },
      match: { create: matchCreate },
    } as unknown as PrismaService);
    const date = new Date('2026-09-05');
    await service.createSeason('principal-a', {
      name: '',
      clubId: 'club-a',
      groupId: 'group-a',
      startDate: date,
      endDate: date,
      userId: 'other',
      weeks: { create: {} },
    } as Parameters<SeasonsService['createSeason']>[1]);
    await service.createWeek('season-a', {
      weekNumber: 1,
      startDate: date,
      endDate: date,
      days: { create: { trainingPlanId: 'plan-b' } },
    } as Parameters<SeasonsService['createWeek']>[1]);
    await service.createMatch('season-a', {
      date,
      opponent: '',
      location: '',
      tacticalBoard: { invalid: true },
      id: 'other',
    } as Parameters<SeasonsService['createMatch']>[1]);
    expect(seasonCreate.mock.calls[0][0].data).toMatchObject({
      userId: 'principal-a',
    });
    expect(seasonCreate.mock.calls[0][0].data).not.toHaveProperty('weeks');
    expect(weekCreate.mock.calls[0][0].data).not.toHaveProperty('days');
    expect(matchCreate.mock.calls[0][0].data).not.toHaveProperty(
      'tacticalBoard',
    );
    expect(matchCreate.mock.calls[0][0].data).not.toHaveProperty('id');
    expect(matchCreate.mock.calls[0][0].data.groupId).toBeNull();
  });

  it('keeps season ordering/work limits and validates direct callers before persistence', async () => {
    const service = new SeasonsService({} as PrismaService);
    const base = {
      name: '',
      clubId: 'club-a',
      groupId: 'group-a',
      startDate: new Date('2026-01-01'),
    };
    for (const endDate of [new Date('2025-01-01'), new Date('2030-01-01')])
      await expect(
        service.createSeason('principal-a', { ...base, endDate }),
      ).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.createWeek('s', {} as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.updateWeek('w', { totalLoad: NaN }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.createOrUpdateDay('w', {} as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(service.createMatch('s', {} as never)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    await expect(
      service.updateMatch('m', { notes: {} }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('preserves day create/defaults and the transaction group invariant', async () => {
    const create = jest.fn();
    const transaction = jest.fn().mockImplementation((callback) =>
      callback({
        weekPlan: {
          findUnique: jest.fn().mockResolvedValue({
            season: { clubId: 'club-a', groupId: 'group-a' },
          }),
        },
        trainingPlan: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ clubId: 'club-a', groupId: 'group-b' }),
        },
        dayPlan: { create },
      }),
    );
    const service = new SeasonsService({
      $transaction: transaction,
    } as unknown as PrismaService);
    const input = {
      dayOfWeek: 1,
      date: new Date('2026-09-05'),
      drillIds: null,
      notes: null,
    };
    await service.createOrUpdateDay('week-a', input);
    expect(create.mock.calls[0][0].data).toMatchObject({
      weekId: 'week-a',
      type: undefined,
      drillIds: [],
      notes: null,
    });
    await expect(
      service.createOrUpdateDay('week-a', {
        ...input,
        trainingPlanId: 'plan-b',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).toHaveBeenCalledTimes(1);
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
  });
});

describe('Season controller resource authorization', () => {
  const principal = {
    id: 'coach-a',
    role: 'COACH',
    clubId: 'club-a',
  } as AuthPrincipal;
  const authorization = {
    assertSeasonManage: jest.fn(),
    assertWeekManage: jest.fn(),
    assertMatchManage: jest.fn(),
    assertCoachGroupAssignment: jest.fn(),
    assertGroupView: jest.fn(),
    assertClubManage: jest.fn(),
    assertPlanManage: jest.fn(),
  };
  const seasons = {
    createSeason: jest.fn(),
    createWeek: jest.fn(),
    updateWeek: jest.fn(),
    createOrUpdateDay: jest.fn(),
    createMatch: jest.fn(),
    updateMatch: jest.fn(),
  };
  let controller: SeasonsController;
  beforeEach(() => {
    jest.resetAllMocks();
    for (const check of [
      'assertSeasonManage',
      'assertWeekManage',
      'assertCoachGroupAssignment',
      'assertGroupView',
      'assertPlanManage',
    ] as const)
      authorization[check].mockResolvedValue({
        clubId: 'club-a',
        groupId: 'group-a',
      });
    controller = new SeasonsController(
      seasons as unknown as SeasonsService,
      authorization as unknown as AuthorizationService,
    );
  });
  it.each(['COACH', 'CLUB_ADMIN', 'SYSTEM_ADMIN'] as const)(
    'preserves %s season identity derivation',
    async (role) => {
      const user = { ...principal, role };
      await controller.createSeason(
        { user },
        {
          name: '',
          groupId: 'group-a',
          clubId: role === 'SYSTEM_ADMIN' ? 'club-a' : { ignored: true },
          startDate: '2026-09-05',
          endDate: '2026-09-06',
          userId: 'other',
        },
      );
      expect(seasons.createSeason).toHaveBeenCalledWith('coach-a', {
        name: '',
        clubId: 'club-a',
        groupId: 'group-a',
        startDate: new Date('2026-09-05'),
        endDate: new Date('2026-09-06'),
      });
    },
  );
  it('keeps source authorization before parsing and no mutation on denial', async () => {
    authorization.assertWeekManage.mockRejectedValue(new ForbiddenException());
    await expect(
      controller.updateWeek({ user: principal }, 'week-b', null),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      controller.createOrUpdateDay({ user: principal }, 'week-b', null),
    ).rejects.toBeInstanceOf(ForbiddenException);
    authorization.assertSeasonManage.mockRejectedValue(
      new ForbiddenException(),
    );
    await expect(
      controller.createWeek({ user: principal }, 'season-b', null),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      controller.createMatch({ user: principal }, 'season-b', null),
    ).rejects.toBeInstanceOf(ForbiddenException);
    authorization.assertMatchManage.mockRejectedValue(new ForbiddenException());
    await expect(
      controller.updateMatch({ user: principal }, 'match-b', null),
    ).rejects.toBeInstanceOf(ForbiddenException);
    for (const mutation of Object.values(seasons))
      expect(mutation).not.toHaveBeenCalled();
  });
  it('preserves match group derivation and rejects different group', async () => {
    const input = { date: '2026-09-05', opponent: '', location: '' };
    await expect(
      controller.createMatch({ user: principal }, 'season-a', {
        ...input,
        groupId: 'group-b',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    await controller.createMatch({ user: principal }, 'season-a', input);
    expect(seasons.createMatch).toHaveBeenCalledWith(
      'season-a',
      expect.objectContaining({ groupId: 'group-a' }),
    );
  });
  it('preserves day-plan source and group checks', async () => {
    authorization.assertPlanManage.mockResolvedValue({
      clubId: 'club-a',
      groupId: 'group-b',
    });
    await expect(
      controller.createOrUpdateDay({ user: principal }, 'week-a', {
        dayOfWeek: 1,
        date: '2026-09-05',
        trainingPlanId: 'plan-b',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(seasons.createOrUpdateDay).not.toHaveBeenCalled();
  });
});
// Legacy API contract tests isolate the sporting projection. Real atomic parity
// and failures are exercised against PostgreSQL in the E2E suite.
jest.mock('../sporting/legacy-compatibility', () => ({
  legacyWrite: (prisma: unknown, work: (tx: unknown) => unknown) =>
    work(prisma),
  syncLegacyGroup: jest.fn(),
  syncLegacyMember: jest.fn(),
  syncLegacySeason: jest.fn(),
  syncLegacyPerson: jest.fn(),
  endLegacyMembers: jest.fn(),
  assertSportingAccountChange: jest.fn(),
}));
