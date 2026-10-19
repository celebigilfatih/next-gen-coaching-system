import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TrainingPlansController } from './training-plans.controller';
import { TrainingPlansService } from './training-plans.service';
import { AuthorizationService } from '../auth/authorization.service';
import type { AuthPrincipal } from '../auth/auth-principal';
import { PrismaService } from '../prisma/prisma.service';

describe('Single plan-drill runtime input boundary', () => {
  const principal = {
    id: 'coach-a',
    role: 'COACH',
    clubId: 'club-a',
  } as AuthPrincipal;
  const entry = { drillId: 'drill-a', phase: 'WARM_UP', order: 0 };
  const addDrill = jest.fn();
  const authorization = {
    assertPlanManage: jest.fn(),
    assertDrillView: jest.fn(),
  };
  let controller: TrainingPlansController;
  beforeEach(() => {
    jest.resetAllMocks();
    controller = new TrainingPlansController(
      { addDrill } as unknown as TrainingPlansService,
      authorization as unknown as AuthorizationService,
    );
  });

  it.each([
    undefined,
    null,
    [],
    {},
    'invalid',
    { ...entry, drillId: '' },
    { ...entry, drillId: 1 },
    { ...entry, phase: 'INVALID' },
    { ...entry, order: -1 },
    { ...entry, order: 1.5 },
    { ...entry, order: '0' },
    { ...entry, notes: null },
  ])(
    'rejects malformed entry %# before source lookup or mutation',
    async (body) => {
      await expect(
        controller.addDrill({ user: principal }, 'plan-a', body),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(authorization.assertPlanManage).toHaveBeenCalledWith(
        principal,
        'plan-a',
      );
      expect(authorization.assertDrillView).not.toHaveBeenCalled();
      expect(addDrill).not.toHaveBeenCalled();
    },
  );

  it.each(['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN'])(
    'preserves %s and optional notes',
    async (phase) => {
      for (const notes of [undefined, '', 'Demo note']) {
        await controller.addDrill({ user: principal }, 'plan-a', {
          ...entry,
          phase,
          notes,
          trainingPlanId: 'other-plan',
        });
        expect(authorization.assertDrillView).toHaveBeenCalledWith(
          principal,
          entry.drillId,
        );
        expect(addDrill).toHaveBeenLastCalledWith(
          'plan-a',
          entry.drillId,
          phase,
          0,
          notes,
        );
      }
    },
  );

  it.each(['assertPlanManage', 'assertDrillView'] as const)(
    'preserves %s denial',
    async (check) => {
      authorization[check].mockRejectedValue(new ForbiddenException());
      await expect(
        controller.addDrill({ user: principal }, 'plan-a', entry),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(addDrill).not.toHaveBeenCalled();
    },
  );

  it('rejects invalid direct service input before its transaction', async () => {
    const transaction = jest.fn();
    const service = new TrainingPlansService({
      $transaction: transaction,
    } as unknown as PrismaService);
    await expect(
      service.addDrill('plan-a', 'drill-a', 'WARM_UP', -1),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction).not.toHaveBeenCalled();
  });
});
