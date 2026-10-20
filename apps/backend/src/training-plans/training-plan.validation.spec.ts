import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { TrainingPlansController } from './training-plans.controller';
import { TrainingPlansService } from './training-plans.service';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthPrincipal } from '../auth/auth-principal';
import {
  parseCreateTrainingPlanBody,
  parseUpdateTrainingPlanBody,
  CreateTrainingPlanDto,
  UpdateTrainingPlanDto,
} from './dto/training-plan.dto';

const base = {
  title: 'Demo plan',
  clubId: 'club-a',
  coachId: 'coach-a',
  groupId: 'group-a',
};

describe('Training plan runtime DTOs', () => {
  it.each([
    null,
    undefined,
    [],
    'invalid',
    { ...base, title: null },
    { ...base, title: 2 },
    { ...base, title: { set: 'x' } },
    { ...base, groupId: '' },
    { ...base, groupId: 2 },
    { ...base, notes: false },
    { ...base, notes: { set: 'x' } },
    { ...base, date: '' },
    { ...base, date: 'invalid' },
    { ...base, date: '2026-02-30T12:00:00Z' },
    { ...base, date: '2026-09-05' },
    { ...base, date: '2026-09-05T12:00:00' },
    { ...base, date: 123 },
    { ...base, date: {} },
    { ...base, date: new Date(NaN) },
  ])('rejects malformed shared fields %#', (input) => {
    expect(() => parseCreateTrainingPlanBody(input)).toThrow(
      BadRequestException,
    );
    expect(() => parseUpdateTrainingPlanBody(input)).toThrow(
      BadRequestException,
    );
  });

  it.each([
    {},
    { ...base, clubId: null },
    { ...base, clubId: '' },
    { ...base, coachId: undefined },
    { ...base, coachId: {} },
  ])('requires effective create identity/title %#', (input) => {
    expect(() => parseCreateTrainingPlanBody(input)).toThrow(
      BadRequestException,
    );
  });

  it.each([
    null,
    '75',
    1.5,
    NaN,
    Infinity,
    -2147483649,
    2147483648,
    { increment: 1 },
  ])('rejects invalid Int duration %#', (totalDuration) => {
    expect(() => parseUpdateTrainingPlanBody({ totalDuration })).toThrow(
      BadRequestException,
    );
  });

  it.each([-2147483648, -1, 0, 75, 2147483647])(
    'preserves schema Int value %s without inventing a product range',
    (totalDuration) => {
      expect(parseUpdateTrainingPlanBody({ totalDuration }).totalDuration).toBe(
        totalDuration,
      );
    },
  );

  it.each([
    undefined,
    null,
    '2026-09-05T12:00:00.000Z',
    '2024-02-29T12:00:00+03:00',
    '2026-09-05T12:00:00-05:30',
    new Date('2026-09-05T12:00:00Z'),
  ])('preserves supported dates %# without coercion', (date) => {
    expect(parseCreateTrainingPlanBody({ ...base, date }).date).toBe(date);
    expect(parseUpdateTrainingPlanBody({ date }).date).toBe(date);
  });

  it('preserves empty strings, nullable values, empty patches and field projection', () => {
    const input = Object.freeze({
      ...base,
      title: '',
      groupId: null,
      date: null,
      notes: null,
      id: 'ignored',
      totalDuration: 999,
    });
    expect(parseCreateTrainingPlanBody(input)).toEqual({
      title: '',
      clubId: base.clubId,
      coachId: base.coachId,
      groupId: null,
      date: null,
      notes: null,
    });
    expect(
      parseUpdateTrainingPlanBody({
        title: '',
        notes: '',
        clubId: 'ignored',
        coachId: 'ignored',
      }),
    ).toEqual({
      title: '',
      notes: '',
      groupId: undefined,
      date: undefined,
      totalDuration: undefined,
    });
    expect(parseUpdateTrainingPlanBody({})).toEqual({
      title: undefined,
      notes: undefined,
      groupId: undefined,
      date: undefined,
      totalDuration: undefined,
    });
  });
});

describe('Training plan controller contracts', () => {
  const coach = {
    id: base.coachId,
    clubId: base.clubId,
    role: 'COACH',
  } as AuthPrincipal;
  const plans = { create: jest.fn(), update: jest.fn(), remove: jest.fn() };
  const authorization = {
    assertClubManage: jest.fn(),
    assertCoachInClub: jest.fn(),
    assertCoachGroupAssignment: jest.fn(),
    assertGroupView: jest.fn(),
    assertPlanManage: jest.fn(),
  };
  let controller: TrainingPlansController;
  beforeEach(() => {
    jest.resetAllMocks();
    authorization.assertPlanManage.mockResolvedValue({
      id: 'plan-a',
      clubId: base.clubId,
    });
    authorization.assertCoachGroupAssignment.mockResolvedValue({
      clubId: base.clubId,
    });
    authorization.assertGroupView.mockResolvedValue({ clubId: base.clubId });
    controller = new TrainingPlansController(
      plans as unknown as TrainingPlansService,
      authorization as unknown as AuthorizationService,
    );
  });

  it.each(['COACH', 'CLUB_ADMIN', 'SYSTEM_ADMIN'] as const)(
    'preserves %s identity derivation',
    async (role) => {
      const principal = { ...coach, role };
      await controller.create(
        { user: principal },
        {
          ...base,
          clubId: role === 'SYSTEM_ADMIN' ? base.clubId : { ignored: true },
          coachId: role === 'COACH' ? { ignored: true } : base.coachId,
          id: 'ignored',
          totalDuration: 999,
        },
      );
      expect(plans.create).toHaveBeenCalledWith({
        ...base,
        date: undefined,
        notes: undefined,
      });
      expect(authorization.assertCoachInClub).toHaveBeenCalledWith(
        base.coachId,
        base.clubId,
      );
      expect(
        role === 'COACH'
          ? authorization.assertCoachGroupAssignment
          : authorization.assertGroupView,
      ).toHaveBeenCalledWith(principal, base.groupId);
    },
  );

  it('rejects malformed create before database-backed authorization', async () => {
    await expect(
      controller.create({ user: coach }, { ...base, date: 'invalid' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(authorization.assertCoachInClub).not.toHaveBeenCalled();
    expect(plans.create).not.toHaveBeenCalled();
  });

  it('requires a coach group while preserving ungrouped admin plans', async () => {
    await expect(
      controller.create({ user: coach }, { ...base, groupId: null }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(plans.create).not.toHaveBeenCalled();
    await controller.create(
      { user: { ...coach, role: 'CLUB_ADMIN' } },
      { ...base, groupId: null },
    );
    expect(plans.create).toHaveBeenCalledWith(
      expect.objectContaining({ groupId: null }),
    );
  });

  it('retains coach assignment denial for create and update', async () => {
    authorization.assertCoachGroupAssignment.mockRejectedValue(
      new ForbiddenException(),
    );
    await expect(
      controller.create({ user: coach }, base),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      controller.update({ user: coach }, 'plan-a', { groupId: base.groupId }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(plans.create).not.toHaveBeenCalled();
    expect(plans.update).not.toHaveBeenCalled();
  });

  it('retains mismatched-club group rejection', async () => {
    authorization.assertCoachGroupAssignment.mockResolvedValue({
      clubId: 'club-b',
    });
    await expect(
      controller.create({ user: coach }, base),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      controller.update({ user: coach }, 'plan-a', { groupId: base.groupId }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(plans.create).not.toHaveBeenCalled();
    expect(plans.update).not.toHaveBeenCalled();
  });

  it('retains update authorization before parsing', async () => {
    authorization.assertPlanManage.mockRejectedValue(new ForbiddenException());
    await expect(
      controller.update({ user: coach }, 'plan-b', null),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(plans.update).not.toHaveBeenCalled();
  });

  it('authorizes the exact plan before permanent deletion', async () => {
    await controller.remove({ user: coach }, 'plan-a');
    expect(authorization.assertPlanManage).toHaveBeenCalledWith(
      coach,
      'plan-a',
    );
    expect(plans.remove).toHaveBeenCalledWith('plan-a');

    authorization.assertPlanManage.mockRejectedValue(new ForbiddenException());
    await expect(
      controller.remove({ user: coach }, 'plan-b'),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(plans.remove).not.toHaveBeenCalledWith('plan-b');
  });

  it('rejects malformed update and projects only writable fields', async () => {
    await expect(
      controller.update({ user: coach }, 'plan-a', { totalDuration: '5' }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(plans.update).not.toHaveBeenCalled();
    await controller.update({ user: coach }, 'plan-a', {
      notes: null,
      date: null,
      clubId: 'other',
      coachId: 'other',
      id: 'other',
    });
    expect(plans.update).toHaveBeenCalledWith('plan-a', {
      notes: null,
      date: null,
      title: undefined,
      totalDuration: undefined,
      groupId: undefined,
    });
  });
});

describe('Training plan service validation and aggregates', () => {
  const update = jest.fn();
  const create = jest.fn();
  const findUnique = jest.fn();
  const transaction = jest.fn();
  let service: TrainingPlansService;
  beforeEach(() => {
    jest.resetAllMocks();
    transaction.mockImplementation((callback) =>
      callback({ trainingPlan: { findUnique, update } }),
    );
    service = new TrainingPlansService({
      $transaction: transaction,
      trainingPlan: { create },
    } as unknown as PrismaService);
    findUnique.mockResolvedValue({
      id: 'plan-a',
      clubId: base.clubId,
      drills: [],
      dayPlans: [],
    });
  });

  it('rejects invalid direct callers before write/transaction', async () => {
    await expect(
      service.create({
        ...base,
        title: null,
      } as unknown as CreateTrainingPlanDto),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.update('plan-a', {
        totalDuration: '5',
      } as unknown as UpdateTrainingPlanDto),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
    expect(transaction).not.toHaveBeenCalled();
  });

  it('preserves nullable create values and returned record', async () => {
    const result = { id: 'plan-a', ...base, groupId: null };
    create.mockResolvedValue(result);
    await expect(
      service.create({ ...base, groupId: null, date: null, notes: null }),
    ).resolves.toBe(result);
    expect(create).toHaveBeenCalledWith({
      data: { ...base, groupId: null, date: null, notes: null },
    });
  });

  it('preserves safe group detach and serializable update', async () => {
    await service.update('plan-a', { groupId: null, notes: null });
    expect(findUnique).toHaveBeenCalled();
    expect(update).toHaveBeenCalledWith({
      where: { id: 'plan-a' },
      data: {
        title: undefined,
        totalDuration: undefined,
        groupId: null,
        notes: null,
        date: undefined,
      },
    });
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
      isolationLevel: 'Serializable',
    });
  });

  it.each(['drill', 'day'])(
    'keeps %s aggregate group invariant on detach',
    async (kind) => {
      findUnique.mockResolvedValue({
        id: 'plan-a',
        clubId: base.clubId,
        drills:
          kind === 'drill'
            ? [
                {
                  drill: {
                    scope: 'CLUB',
                    clubId: base.clubId,
                    groupId: base.groupId,
                  },
                },
              ]
            : [],
        dayPlans:
          kind === 'day'
            ? [
                {
                  week: {
                    season: { clubId: base.clubId, groupId: base.groupId },
                  },
                },
              ]
            : [],
      });
      await expect(
        service.update('plan-a', { groupId: null }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(update).not.toHaveBeenCalled();
    },
  );
});
