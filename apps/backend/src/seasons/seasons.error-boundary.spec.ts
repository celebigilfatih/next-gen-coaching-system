import {
  ArgumentsHost,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { SeasonsService } from './seasons.service';

describe('SeasonsService mutation error boundary', () => {
  let log: jest.SpyInstance;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    log = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  async function expectContained(
    promise: Promise<unknown>,
    event: string,
  ): Promise<void> {
    const caught = await promise.catch((error: unknown) => error);
    expect(caught).toBeInstanceOf(InternalServerErrorException);
    expect(caught).not.toHaveProperty('cause');
    const reply = jest.fn();
    const response = {};
    new BaseExceptionFilter({
      isHeadersSent: () => false,
      reply,
    } as never).catch(caught, {
      getArgByIndex: () => response,
    } as unknown as ArgumentsHost);
    expect(reply).toHaveBeenCalledWith(
      response,
      { statusCode: 500, message: 'Internal server error' },
      500,
    );
    expect(log.mock.calls).toEqual([[event]]);
    expect(consoleError).not.toHaveBeenCalled();
  }

  function rejectedMutationService(model: string, method: string) {
    return new SeasonsService({
      async $transaction(work: (tx: unknown) => Promise<unknown>) {
        return work(this);
      },
      [model]: {
        findUnique: jest.fn().mockResolvedValue({ tacticalBoard: null }),
        [method]: jest
          .fn()
          .mockRejectedValue(new Error(`private ${model} ${method}`)),
      },
    } as unknown as PrismaService);
  }

  it('contains season create and delete failures', async () => {
    await expectContained(
      rejectedMutationService('season', 'create').createSeason('user-a', {
        name: '',
        clubId: 'club-a',
        groupId: 'group-a',
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-30'),
      }),
      'SEASON_CREATE_FAILED',
    );
    log.mockClear();
    await expectContained(
      rejectedMutationService('season', 'delete').deleteSeason('season-a'),
      'SEASON_DELETE_FAILED',
    );
  });

  it('contains week create and update failures', async () => {
    await expectContained(
      rejectedMutationService('weekPlan', 'create').createWeek('season-a', {
        weekNumber: 1,
        startDate: new Date('2026-09-01'),
        endDate: new Date('2026-09-07'),
      }),
      'SEASON_WEEK_CREATE_FAILED',
    );
    log.mockClear();
    await expectContained(
      rejectedMutationService('weekPlan', 'update').updateWeek('week-a', {
        notes: 'private',
        totalLoad: 10,
      }),
      'SEASON_WEEK_UPDATE_FAILED',
    );
  });

  it('contains day transaction failures', async () => {
    const service = new SeasonsService({
      $transaction: jest
        .fn()
        .mockRejectedValue(new Error('private transaction failure')),
    } as unknown as PrismaService);

    await expectContained(
      service.createOrUpdateDay('week-a', {
        dayOfWeek: 1,
        date: new Date('2026-09-01'),
        type: 'TRAINING',
      }),
      'SEASON_DAY_WRITE_FAILED',
    );
  });

  it('preserves explicit day validation failures without logging them', async () => {
    const service = new SeasonsService({
      $transaction: jest.fn().mockImplementation(async (callback) =>
        callback({
          weekPlan: { findUnique: jest.fn().mockResolvedValue(null) },
          trainingPlan: {
            findUnique: jest
              .fn()
              .mockResolvedValue({ clubId: 'club-a', groupId: 'group-a' }),
          },
        }),
      ),
    } as unknown as PrismaService);

    await expect(
      service.createOrUpdateDay('week-a', {
        dayOfWeek: 1,
        date: new Date('2026-09-01'),
        type: 'TRAINING',
        trainingPlanId: 'plan-a',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(log).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('contains day completion lookup, missing-record, and update failures', async () => {
    await expectContained(
      new SeasonsService({
        dayPlan: {
          findUnique: jest
            .fn()
            .mockRejectedValue(new Error('private day lookup')),
        },
      } as unknown as PrismaService).toggleDayCompleted('day-a'),
      'SEASON_DAY_TOGGLE_FAILED',
    );
    log.mockClear();
    await expectContained(
      new SeasonsService({
        dayPlan: { findUnique: jest.fn().mockResolvedValue(null) },
      } as unknown as PrismaService).toggleDayCompleted('day-a'),
      'SEASON_DAY_TOGGLE_FAILED',
    );
    log.mockClear();
    await expectContained(
      new SeasonsService({
        dayPlan: {
          findUnique: jest.fn().mockResolvedValue({ completed: false }),
          update: jest.fn().mockRejectedValue(new Error('private day update')),
        },
      } as unknown as PrismaService).toggleDayCompleted('day-a'),
      'SEASON_DAY_TOGGLE_FAILED',
    );
  });

  it('contains day delete failures', async () => {
    await expectContained(
      rejectedMutationService('dayPlan', 'delete').deleteDay('day-a'),
      'SEASON_DAY_DELETE_FAILED',
    );
  });

  it('contains match create, update, board, and delete failures', async () => {
    await expectContained(
      rejectedMutationService('match', 'create').createMatch('season-a', {
        date: new Date('2026-09-01'),
        opponent: '',
        location: '',
      }),
      'SEASON_MATCH_CREATE_FAILED',
    );
    log.mockClear();
    await expectContained(
      rejectedMutationService('match', 'update').updateMatch('match-a', {
        opponent: 'Opponent',
      }),
      'SEASON_MATCH_UPDATE_FAILED',
    );
    log.mockClear();
    await expectContained(
      rejectedMutationService('match', 'update').updateMatchTacticalBoard(
        'match-a',
        {},
      ),
      'SEASON_MATCH_BOARD_UPDATE_FAILED',
    );
    log.mockClear();
    await expectContained(
      rejectedMutationService('match', 'delete').deleteMatch('match-a'),
      'SEASON_MATCH_DELETE_FAILED',
    );
  });

  it('contains week generation lookup and missing-season failures', async () => {
    await expectContained(
      new SeasonsService({
        season: {
          findUnique: jest
            .fn()
            .mockRejectedValue(new Error('private season lookup')),
        },
      } as unknown as PrismaService).generateWeeks('season-a'),
      'SEASON_WEEKS_GENERATE_FAILED',
    );
    log.mockClear();
    await expectContained(
      new SeasonsService({
        season: { findUnique: jest.fn().mockResolvedValue(null) },
      } as unknown as PrismaService).generateWeeks('season-a'),
      'SEASON_WEEKS_GENERATE_FAILED',
    );
  });

  it('contains week generation writes after preserving range validation', async () => {
    const service = new SeasonsService({
      season: {
        findUnique: jest.fn().mockResolvedValue({
          startDate: new Date('2026-09-01'),
          endDate: new Date('2026-09-30'),
        }),
      },
      weekPlan: {
        createMany: jest
          .fn()
          .mockRejectedValue(new Error('private week write')),
      },
    } as unknown as PrismaService);

    await expectContained(
      service.generateWeeks('season-a'),
      'SEASON_WEEKS_GENERATE_FAILED',
    );
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
