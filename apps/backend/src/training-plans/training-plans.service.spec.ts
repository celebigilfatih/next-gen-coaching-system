import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TrainingPlansService } from './training-plans.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TrainingPlansService optional season-link logging', () => {
  const input = {
    title: 'Private plan title',
    clubId: 'private-club',
    coachId: 'private-coach',
    groupId: 'private-group',
    date: new Date(2026, 8, 7, 12).toISOString(),
    notes: 'Private notes',
  };
  const plan = {
    id: 'private-plan',
    ...input,
    totalDuration: 75,
    drills: [{ id: 'private-drill' }],
  };
  let prisma: ReturnType<typeof fixture>;
  let service: TrainingPlansService;
  let warn: jest.SpyInstance;
  let error: jest.SpyInstance;
  let log: jest.SpyInstance;
  const consoleSpies: jest.SpyInstance[] = [];

  function fixture() {
    return {
      trainingPlan: {
        create: jest.fn().mockResolvedValue(plan),
        findUnique: jest.fn().mockResolvedValue(plan),
      },
      season: {
        findMany: jest.fn().mockResolvedValue([
          {
            id: 'private-season',
            name: 'Private season',
            weeks: [{ id: 'private-week' }],
          },
        ]),
      },
      weekPlan: { findMany: jest.fn() },
      dayPlan: { create: jest.fn().mockResolvedValue({ id: 'private-day' }) },
    };
  }

  beforeEach(() => {
    prisma = fixture();
    service = new TrainingPlansService(prisma as unknown as PrismaService);
    warn = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    error = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    log = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    for (const method of ['log', 'warn', 'error'] as const) {
      consoleSpies.push(
        jest.spyOn(console, method).mockImplementation(() => undefined),
      );
    }
  });

  afterEach(() => {
    try {
      for (const spy of consoleSpies) expect(spy).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    } finally {
      consoleSpies.length = 0;
      jest.restoreAllMocks();
    }
  });

  it('preserves the scoped lookup and linked day without logging business data', async () => {
    await expect(service.create(input)).resolves.toEqual(plan);
    expect(prisma.season.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          clubId: input.clubId,
          groupId: input.groupId,
          startDate: { lte: new Date(input.date) },
          endDate: { gte: new Date(input.date) },
        },
      }),
    );
    expect(prisma.dayPlan.create).toHaveBeenCalledWith({
      data: {
        weekId: 'private-week',
        dayOfWeek: 1,
        date: new Date(input.date),
        type: 'TRAINING',
        title: input.title,
        trainingPlanId: plan.id,
        duration: 75,
        notes: input.notes,
      },
    });
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it.each([
    [[], 'PLAN_SEASON_LINK_SKIPPED_NO_SEASON'],
    [[{ id: 'private-season', weeks: [] }], 'PLAN_SEASON_LINK_SKIPPED_NO_WEEK'],
  ])(
    'reports only a static event for missing season/week (%s)',
    async (seasons, event) => {
      prisma.season.findMany.mockResolvedValue(seasons);
      await expect(service.create(input)).resolves.toEqual(plan);
      expect(warn.mock.calls).toEqual([[event]]);
      expect(error).not.toHaveBeenCalled();
      expect(prisma.season.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.weekPlan.findMany).not.toHaveBeenCalled();
      expect(prisma.dayPlan.create).not.toHaveBeenCalled();
    },
  );

  it('reports a missing linked plan without its identity', async () => {
    prisma.trainingPlan.findUnique.mockResolvedValue(null);
    await expect(service.create(input)).resolves.toEqual(plan);
    expect(error.mock.calls).toEqual([
      ['PLAN_SEASON_LINK_SKIPPED_PLAN_MISSING'],
    ]);
    expect(warn).not.toHaveBeenCalled();
    expect(prisma.dayPlan.create).not.toHaveBeenCalled();
  });

  it.each([
    new Error('synthetic-secret in driver error\nforged log entry'),
    {
      message: 'synthetic-secret',
      query: 'private SQL',
      meta: { notes: 'Private notes' },
    },
  ])(
    'does not forward a raw thrown value and preserves fail-soft linking',
    async (failure) => {
      prisma.dayPlan.create.mockRejectedValue(failure);
      await expect(service.create(input)).resolves.toEqual(plan);
      expect(error.mock.calls).toEqual([['PLAN_SEASON_LINK_FAILED']]);
      expect(warn).not.toHaveBeenCalled();
    },
  );

  it('keeps the date/group gate for optional linking', async () => {
    await service.create({ ...input, date: undefined });
    prisma.trainingPlan.create.mockResolvedValue({ ...plan, groupId: null });
    await service.create({ ...input, groupId: undefined });
    expect(prisma.season.findMany).not.toHaveBeenCalled();
    expect(prisma.dayPlan.create).not.toHaveBeenCalled();
    expect(warn).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('rejects an invalid date before creating the plan or querying seasons', async () => {
    await expect(
      service.create({ ...input, date: 'invalid' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.trainingPlan.create).not.toHaveBeenCalled();
    expect(prisma.season.findMany).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('contains the primary plan-create failure before fail-soft linking', async () => {
    const failure = new Error('primary create failure');
    prisma.trainingPlan.create.mockRejectedValue(failure);
    await expect(service.create(input)).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(prisma.season.findMany).not.toHaveBeenCalled();
    expect(error.mock.calls).toEqual([['TRAINING_PLAN_CREATE_FAILED']]);
  });

  it('preserves Sunday mapping and fallback notes', async () => {
    prisma.trainingPlan.findUnique.mockResolvedValue({ ...plan, notes: '' });
    const date = new Date(2026, 8, 6, 12);
    await service.create({ ...input, date });
    expect(prisma.dayPlan.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        dayOfWeek: 7,
        date,
        notes: 'Kayıtlı Antrenman: 1 drill',
      }),
    });
  });
});
