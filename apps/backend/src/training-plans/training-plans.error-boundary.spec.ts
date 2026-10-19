import {
  ArgumentsHost,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingPlansService } from './training-plans.service';

describe('TrainingPlansService mutation error boundary', () => {
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

  function rejectedTransactionService() {
    return new TrainingPlansService({
      $transaction: jest
        .fn()
        .mockRejectedValue(new Error('private transaction failure')),
    } as unknown as PrismaService);
  }

  it('contains primary plan create failures before optional linking', async () => {
    const service = new TrainingPlansService({
      trainingPlan: {
        create: jest
          .fn()
          .mockRejectedValue(new Error('private create failure')),
      },
      season: { findMany: jest.fn() },
    } as unknown as PrismaService);

    await expectContained(
      service.create({
        title: 'Plan',
        clubId: 'club-a',
        coachId: 'coach-a',
        groupId: 'group-a',
        date: new Date('2026-09-07T15:00:00Z'),
      }),
      'TRAINING_PLAN_CREATE_FAILED',
    );
  });

  it('contains add-drill transaction failures', async () => {
    await expectContained(
      rejectedTransactionService().addDrill('plan-a', 'drill-a', 'WARM_UP', 0),
      'TRAINING_PLAN_DRILL_ADD_FAILED',
    );
  });

  it('preserves explicit add-drill validation failures without logging', async () => {
    const service = new TrainingPlansService({
      $transaction: jest.fn().mockImplementation(async (callback) =>
        callback({
          trainingPlan: { findUnique: jest.fn().mockResolvedValue(null) },
          drill: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'drill-a',
              durationMin: 10,
              scope: 'GLOBAL',
              clubId: null,
              groupId: null,
            }),
          },
        }),
      ),
    } as unknown as PrismaService);

    await expect(
      service.addDrill('plan-a', 'drill-a', 'WARM_UP', 0),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(log).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('contains replace-drills transaction failures', async () => {
    await expectContained(
      rejectedTransactionService().replaceDrills('plan-a', [
        { drillId: 'drill-a', phase: 'TECHNICAL', order: 0 },
      ]),
      'TRAINING_PLAN_DRILLS_REPLACE_FAILED',
    );
  });

  it('preserves explicit replace-drills validation failures without logging', async () => {
    const service = new TrainingPlansService({
      $transaction: jest.fn().mockImplementation(async (callback) =>
        callback({
          trainingPlan: {
            findUnique: jest.fn().mockResolvedValue({
              id: 'plan-a',
              clubId: 'club-a',
              groupId: 'group-a',
            }),
          },
          drill: { findMany: jest.fn().mockResolvedValue([]) },
        }),
      ),
    } as unknown as PrismaService);

    await expect(
      service.replaceDrills('plan-a', [
        { drillId: 'drill-a', phase: 'TECHNICAL', order: 0 },
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(log).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('contains board snapshot lookup failures', async () => {
    const service = new TrainingPlansService({
      async $transaction(work: (tx: unknown) => Promise<unknown>) {
        return work(this);
      },
      planDrill: {
        findFirst: jest
          .fn()
          .mockRejectedValue(new Error('private snapshot lookup')),
      },
    } as unknown as PrismaService);

    await expectContained(
      service.updateBoardSnapshot('plan-a', 'plan-drill-a', {}),
      'TRAINING_PLAN_BOARD_UPDATE_FAILED',
    );
  });

  it('preserves a missing board source as an explicit validation failure', async () => {
    const service = new TrainingPlansService({
      async $transaction(work: (tx: unknown) => Promise<unknown>) {
        return work(this);
      },
      planDrill: { findFirst: jest.fn().mockResolvedValue(null) },
    } as unknown as PrismaService);

    await expect(
      service.updateBoardSnapshot('plan-a', 'plan-drill-a', {}),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(log).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('contains board snapshot write failures', async () => {
    const service = new TrainingPlansService({
      async $transaction(work: (tx: unknown) => Promise<unknown>) {
        return work(this);
      },
      planDrill: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'plan-drill-a',
          boardSnapshot: null,
          drill: { jsonData: null },
        }),
        update: jest
          .fn()
          .mockRejectedValue(new Error('private snapshot write')),
      },
    } as unknown as PrismaService);

    await expectContained(
      service.updateBoardSnapshot('plan-a', 'plan-drill-a', {}),
      'TRAINING_PLAN_BOARD_UPDATE_FAILED',
    );
  });

  it('contains plan update transaction failures', async () => {
    await expectContained(
      rejectedTransactionService().update('plan-a', { notes: 'updated' }),
      'TRAINING_PLAN_UPDATE_FAILED',
    );
  });

  it('preserves explicit plan update validation failures without logging', async () => {
    const service = new TrainingPlansService({
      $transaction: jest.fn().mockImplementation(async (callback) =>
        callback({
          trainingPlan: { findUnique: jest.fn().mockResolvedValue(null) },
        }),
      ),
    } as unknown as PrismaService);

    await expect(
      service.update('plan-a', { groupId: 'group-a' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(log).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('contains plan delete failures', async () => {
    const service = new TrainingPlansService({
      $transaction: jest
        .fn()
        .mockRejectedValue(new Error('private delete failure')),
    } as unknown as PrismaService);

    await expectContained(
      service.remove('plan-a'),
      'TRAINING_PLAN_DELETE_FAILED',
    );
  });
});
