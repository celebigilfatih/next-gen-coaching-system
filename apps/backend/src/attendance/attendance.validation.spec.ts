import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { AttendanceController } from './attendance.controller';
import { AttendanceService } from './attendance.service';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthPrincipal } from '../auth/auth-principal';

describe('Attendance runtime input boundary', () => {
  const principal = {
    id: 'coach-a',
    role: 'COACH',
    clubId: 'club-a',
  } as AuthPrincipal;
  const input = { planId: 'plan-a', playerId: 'player-a', status: 'PRESENT' };
  let mark: jest.Mock;
  let authorization: {
    assertPlanManage: jest.Mock;
    assertAttendancePlayer: jest.Mock;
  };
  let controller: AttendanceController;
  beforeEach(() => {
    mark = jest.fn().mockResolvedValue({ id: 'attendance-a' });
    authorization = {
      assertPlanManage: jest.fn().mockResolvedValue({ id: 'plan-a' }),
      assertAttendancePlayer: jest.fn(),
    };
    controller = new AttendanceController(
      { mark } as unknown as AttendanceService,
      authorization as unknown as AuthorizationService,
    );
  });

  it.each([
    undefined,
    null,
    [],
    {},
    'invalid',
    { ...input, planId: undefined },
    { ...input, planId: '' },
    { ...input, planId: 1 },
    { ...input, playerId: undefined },
    { ...input, playerId: '' },
    { ...input, playerId: {} },
    { ...input, status: undefined },
    { ...input, status: null },
    { ...input, status: true },
    { ...input, status: 'LATE' },
    { ...input, status: 'present' },
  ])('rejects malformed input %# before lookups or mutation', async (body) => {
    await expect(
      controller.mark({ user: principal }, body),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(authorization.assertPlanManage).not.toHaveBeenCalled();
    expect(authorization.assertAttendancePlayer).not.toHaveBeenCalled();
    expect(mark).not.toHaveBeenCalled();
  });

  it.each(['PRESENT', 'ABSENT'])(
    'keeps %s, resource checks and field projection',
    async (status) => {
      await expect(
        controller.mark(
          { user: principal },
          { ...input, status, clubId: 'other-club', id: 'other-record' },
        ),
      ).resolves.toEqual({ id: 'attendance-a' });
      expect(authorization.assertPlanManage).toHaveBeenCalledWith(
        principal,
        input.planId,
      );
      expect(authorization.assertAttendancePlayer).toHaveBeenCalledWith(
        principal,
        { id: 'plan-a' },
        input.playerId,
      );
      expect(mark).toHaveBeenCalledWith(input.planId, input.playerId, status);
    },
  );

  it.each(['assertPlanManage', 'assertAttendancePlayer'] as const)(
    'preserves %s denial',
    async (check) => {
      authorization[check].mockRejectedValue(new ForbiddenException());
      await expect(
        controller.mark({ user: principal }, input),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(mark).not.toHaveBeenCalled();
    },
  );

  it('uses one compound-key upsert for create and status replacement', async () => {
    const upsert = jest.fn().mockResolvedValue({ id: 'attendance-a' });
    const service = new AttendanceService({
      attendance: { upsert },
    } as unknown as PrismaService);
    for (const status of ['PRESENT', 'ABSENT'] as const) {
      await service.mark(input.planId, input.playerId, status);
      expect(upsert).toHaveBeenLastCalledWith({
        where: {
          planId_playerId: {
            planId: input.planId,
            playerId: input.playerId,
          },
        },
        create: { ...input, status },
        update: { status },
      });
    }
  });

  it('rejects invalid direct service input before database access', async () => {
    const upsert = jest.fn();
    const service = new AttendanceService({
      attendance: { upsert },
    } as unknown as PrismaService);
    await expect(
      service.mark('plan-a', 'player-a', 'INVALID' as 'PRESENT'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(upsert).not.toHaveBeenCalled();
  });
});
