import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TrainingPlansService } from './training-plans.service';

describe('TrainingPlansService lifecycle transactions', () => {
  const linkedPlan = {
    id: 'plan-a',
    clubId: 'club-a',
    groupId: 'group-a',
    drills: [],
    dayPlans: [
      {
        id: 'day-a',
        week: {
          season: { id: 'season-a', clubId: 'club-a', groupId: 'group-a' },
        },
      },
    ],
  };

  function updateFixture(targetWeek: { id: string } | null = { id: 'week-b' }) {
    const transaction = {
      trainingPlan: {
        findUnique: jest.fn().mockResolvedValue(linkedPlan),
        update: jest.fn().mockResolvedValue({ id: 'plan-a' }),
      },
      weekPlan: { findFirst: jest.fn().mockResolvedValue(targetWeek) },
      dayPlan: { update: jest.fn().mockResolvedValue({ id: 'day-a' }) },
    };
    const prisma = {
      $transaction: jest
        .fn()
        .mockImplementation((callback) => callback(transaction)),
    };
    return {
      transaction,
      prisma,
      service: new TrainingPlansService(prisma as unknown as PrismaService),
    };
  }

  it('updates the plan and its linked calendar projection in one serializable transaction', async () => {
    const { service, transaction, prisma } = updateFixture();
    const date = '2026-09-13T12:30:00.000Z';
    await expect(
      service.update('plan-a', {
        title: 'Güncel plan',
        date,
        notes: 'Güncel amaç',
      }),
    ).resolves.toEqual({ id: 'plan-a' });

    const parsed = new Date(date);
    expect(transaction.weekPlan.findFirst).toHaveBeenCalledWith({
      where: {
        seasonId: 'season-a',
        startDate: { lte: parsed },
        endDate: { gte: parsed },
      },
      select: { id: true },
    });
    expect(transaction.trainingPlan.update).toHaveBeenCalledWith({
      where: { id: 'plan-a' },
      data: {
        title: 'Güncel plan',
        totalDuration: undefined,
        groupId: undefined,
        date: parsed,
        notes: 'Güncel amaç',
      },
    });
    expect(transaction.dayPlan.update).toHaveBeenCalledWith({
      where: { id: 'day-a' },
      data: {
        title: 'Güncel plan',
        notes: 'Güncel amaç',
        weekId: 'week-b',
        dayOfWeek: parsed.getDay() === 0 ? 7 : parsed.getDay(),
        date: parsed,
      },
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
  });

  it('rejects a date outside every linked season week before writing', async () => {
    const { service, transaction } = updateFixture(null);
    await expect(
      service.update('plan-a', {
        date: '2030-01-01T12:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction.trainingPlan.update).not.toHaveBeenCalled();
    expect(transaction.dayPlan.update).not.toHaveBeenCalled();
  });

  it('rejects clearing the date while a calendar projection exists', async () => {
    const { service, transaction } = updateFixture();
    await expect(
      service.update('plan-a', { date: null }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction.weekPlan.findFirst).not.toHaveBeenCalled();
    expect(transaction.trainingPlan.update).not.toHaveBeenCalled();
  });

  it('deletes calendar, attendance, phases/snapshots and the plan in order', async () => {
    const order: string[] = [];
    const transaction = {
      dayPlan: {
        deleteMany: jest.fn().mockImplementation(async () => {
          order.push('dayPlan');
        }),
      },
      attendance: {
        deleteMany: jest.fn().mockImplementation(async () => {
          order.push('attendance');
        }),
      },
      planDrill: {
        deleteMany: jest.fn().mockImplementation(async () => {
          order.push('planDrill');
        }),
      },
      trainingPlan: {
        delete: jest.fn().mockImplementation(async () => {
          order.push('trainingPlan');
          return { id: 'plan-a' };
        }),
      },
    };
    const prisma = {
      $transaction: jest
        .fn()
        .mockImplementation((callback) => callback(transaction)),
    };
    const service = new TrainingPlansService(
      prisma as unknown as PrismaService,
    );

    await expect(service.remove('plan-a')).resolves.toEqual({ id: 'plan-a' });
    expect(order).toEqual([
      'dayPlan',
      'attendance',
      'planDrill',
      'trainingPlan',
    ]);
    expect(transaction.planDrill.deleteMany).toHaveBeenCalledWith({
      where: { trainingPlanId: 'plan-a' },
    });
    expect(prisma.$transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
  });

  it('contains an intermediate delete failure behind the generic boundary', async () => {
    const log = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const transaction = {
      dayPlan: { deleteMany: jest.fn().mockResolvedValue({ count: 1 }) },
      attendance: {
        deleteMany: jest.fn().mockRejectedValue(new Error('private failure')),
      },
      planDrill: { deleteMany: jest.fn() },
      trainingPlan: { delete: jest.fn() },
    };
    const service = new TrainingPlansService({
      $transaction: jest
        .fn()
        .mockImplementation((callback) => callback(transaction)),
    } as unknown as PrismaService);

    await expect(service.remove('plan-a')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
    expect(log).toHaveBeenCalledWith('TRAINING_PLAN_DELETE_FAILED');
    expect(transaction.planDrill.deleteMany).not.toHaveBeenCalled();
    expect(transaction.trainingPlan.delete).not.toHaveBeenCalled();
    log.mockRestore();
  });
});
