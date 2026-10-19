import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TrainingPlansController } from './training-plans.controller';
import { TrainingPlansService } from './training-plans.service';
import { AuthorizationService } from '../auth/authorization.service';
import type { AuthPrincipal } from '../auth/auth-principal';
import { PlanDrillInput } from './dto/replace-plan-drills.dto';

describe('TrainingPlansController replace-drills boundary', () => {
  const principal = {
    id: 'coach-a',
    role: 'COACH',
    clubId: 'club-a',
  } as AuthPrincipal;
  const entry = { drillId: 'drill-a', phase: 'WARM_UP', order: 0, notes: '' };
  let authorization: {
    assertPlanManage: jest.Mock;
    assertDrillView: jest.Mock;
  };
  let plans: { replaceDrills: jest.Mock };
  let controller: TrainingPlansController;

  beforeEach(() => {
    authorization = { assertPlanManage: jest.fn(), assertDrillView: jest.fn() };
    plans = { replaceDrills: jest.fn().mockResolvedValue({ id: 'plan-a' }) };
    controller = new TrainingPlansController(
      plans as unknown as TrainingPlansService,
      authorization as unknown as AuthorizationService,
    );
  });

  it.each([
    undefined,
    null,
    {},
    [],
    'invalid',
    { drills: null },
    { drills: {} },
    { drills: 'invalid' },
    { drills: [null] },
    { drills: [5] },
    { drills: [{ ...entry, drillId: '' }] },
    { drills: [{ ...entry, drillId: 1 }] },
    { drills: [{ ...entry, phase: 'INVALID' }] },
    { drills: [{ ...entry, order: -1 }] },
    { drills: [{ ...entry, order: 1.5 }] },
    { drills: [{ ...entry, order: '0' }] },
    { drills: [{ ...entry, notes: null }] },
    { drills: [{ ...entry, notes: 1 }] },
    { drills: Array.from({ length: 51 }, () => entry) },
  ])(
    'rejects malformed body %# before drill lookup or mutation',
    async (body) => {
      await expect(
        controller.replaceDrills({ user: principal }, 'plan-a', body),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(authorization.assertPlanManage).toHaveBeenCalledWith(
        principal,
        'plan-a',
      );
      expect(authorization.assertDrillView).not.toHaveBeenCalled();
      expect(plans.replaceDrills).not.toHaveBeenCalled();
    },
  );

  it.each([0, 50])('preserves the valid %i-entry boundary', async (length) => {
    const drills = Array.from({ length }, (_, order) => ({ ...entry, order }));
    await expect(
      controller.replaceDrills({ user: principal }, 'plan-a', { drills }),
    ).resolves.toEqual({ id: 'plan-a' });
    expect(plans.replaceDrills).toHaveBeenCalledWith(
      'plan-a',
      drills,
      principal,
    );
    expect(authorization.assertDrillView).toHaveBeenCalledTimes(length ? 1 : 0);
  });

  it('preserves all phases, optional notes and per-source authorization', async () => {
    const drills = ['WARM_UP', 'TECHNICAL', 'TACTICAL', 'COOL_DOWN'].map(
      (phase, order) => ({
        drillId: `drill-${order}`,
        phase,
        order,
      }),
    );
    await controller.replaceDrills({ user: principal }, 'plan-a', { drills });
    expect(plans.replaceDrills).toHaveBeenCalledWith(
      'plan-a',
      drills,
      principal,
    );
    for (const drill of drills)
      expect(authorization.assertDrillView).toHaveBeenCalledWith(
        principal,
        drill.drillId,
      );
  });

  it('retains plan denial before parsing and source denial before mutation', async () => {
    authorization.assertPlanManage.mockRejectedValueOnce(
      new ForbiddenException(),
    );
    await expect(
      controller.replaceDrills({ user: principal }, 'plan-b', null),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(authorization.assertDrillView).not.toHaveBeenCalled();
    authorization.assertDrillView.mockRejectedValueOnce(
      new ForbiddenException(),
    );
    await expect(
      controller.replaceDrills({ user: principal }, 'plan-a', {
        drills: [entry],
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(plans.replaceDrills).not.toHaveBeenCalled();
  });

  it('retains service-level validation for non-controller callers', async () => {
    const transaction = jest.fn();
    const service = new TrainingPlansService({
      $transaction: transaction,
    } as unknown as ConstructorParameters<typeof TrainingPlansService>[0]);
    await expect(
      service.replaceDrills('plan-a', [null] as unknown as PlanDrillInput[]),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction).not.toHaveBeenCalled();
  });
});
