import { ForbiddenException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import type { AuthorizationService } from '../auth/authorization.service';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { parseAttendancePageQuery } from './dto/attendance-page.dto';
import { TrainingPlansService } from '../training-plans/training-plans.service';
import { TrainingPlansController } from '../training-plans/training-plans.controller';

describe('bounded plan attendance', () => {
  const user = { id: 'coach', role: 'COACH', clubId: 'club' } as AuthPrincipal;
  it('projects only the page, counts before cursor and preserves missing status', async () => {
    const findMany = jest.fn().mockResolvedValue([
      { id: 'm1', user: { id: 'p1', name: 'One', attendances: [] } },
      {
        id: 'm2',
        user: { id: 'p2', name: 'Two', attendances: [{ status: 'PRESENT' }] },
      },
    ]);
    const count = jest.fn().mockResolvedValueOnce(30).mockResolvedValueOnce(12);
    const service = new AttendanceService({
      groupMember: { findMany, count },
    } as unknown as PrismaService);
    const result = await service.playerPage(
      { planId: 'plan', limit: 1, after: 'm0' },
      'group',
    );
    expect(result).toEqual({
      items: [{ id: 'm1', playerId: 'p1', name: 'One', status: null }],
      total: 30,
      presentTotal: 12,
      limit: 1,
      nextCursor: 'm1',
    });
    expect(findMany.mock.calls[0][0]).toEqual({
      where: { groupId: 'group', user: { role: 'PLAYER' }, id: { gt: 'm0' } },
      orderBy: { id: 'asc' },
      take: 2,
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            attendances: {
              where: { planId: 'plan' },
              select: { status: true },
            },
          },
        },
      },
    });
    expect(count.mock.calls[0][0]).toEqual({
      where: { groupId: 'group', user: { role: 'PLAYER' } },
    });
    expect(count.mock.calls[1][0].where.user.attendances).toEqual({
      some: { planId: 'plan', status: 'PRESENT' },
    });
  });
  it('restricts player pages and totals to self and leaves empty continuation totals intact', async () => {
    const findMany = jest.fn().mockResolvedValue([]);
    const count = jest.fn().mockResolvedValue(1);
    const service = new AttendanceService({
      groupMember: { findMany, count },
    } as unknown as PrismaService);
    expect(
      await service.playerPage(
        { planId: 'plan', limit: 25, after: 'last' },
        'group',
        'self',
      ),
    ).toEqual({
      items: [],
      total: 1,
      presentTotal: 1,
      limit: 25,
      nextCursor: null,
    });
    for (const call of [
      findMany.mock.calls[0][0],
      ...count.mock.calls.map((c) => c[0]),
    ])
      expect(call.where.user.id).toBe('self');
    expect(
      await service.playerPage(
        { planId: 'plan', limit: 25, after: undefined },
        null,
      ),
    ).toEqual({
      items: [],
      total: 0,
      presentTotal: 0,
      limit: 25,
      nextCursor: null,
    });
    expect(findMany).toHaveBeenCalledTimes(1);
  });
  it('authorizes the plan first and derives group and self scope on the server', async () => {
    const playerPage = jest.fn();
    const assertPlanView = jest.fn().mockResolvedValue({ groupId: 'group' });
    const controller = new AttendanceController(
      { playerPage } as unknown as AttendanceService,
      { assertPlanView } as unknown as AuthorizationService,
    );
    await controller.page(
      { user: { ...user, role: 'PLAYER', id: 'self' } },
      { planId: 'plan' },
    );
    expect(playerPage).toHaveBeenCalledWith(
      { planId: 'plan', limit: 25, after: undefined },
      'group',
      'self',
    );
    playerPage.mockClear();
    assertPlanView.mockRejectedValue(new ForbiddenException());
    await expect(
      controller.page({ user }, { planId: 'foreign' }),
    ).rejects.toThrow(ForbiddenException);
    expect(playerPage).not.toHaveBeenCalled();
  });
  it.each([
    undefined,
    [],
    {},
    { planId: '' },
    { planId: ' x' },
    { planId: 'x'.repeat(161) },
    { planId: 'p', limit: '101' },
    { planId: 'p', after: '' },
    { planId: 'p', groupId: 'g' },
    { planId: 'p', playerId: 'other' },
    { planId: 'p', role: 'SYSTEM_ADMIN' },
  ])('rejects malformed/unknown input %j', (input) => {
    expect(() => parseAttendancePageQuery(input)).toThrow();
  });
  it('editor read omits group members and attendance without altering legacy detail', async () => {
    const findUnique = jest.fn().mockResolvedValue({ id: 'plan', drills: [] });
    const service = new TrainingPlansService({
      trainingPlan: { findUnique },
    } as unknown as PrismaService);
    await service.getEditor('plan');
    expect(findUnique).toHaveBeenCalledWith({
      where: { id: 'plan' },
      include: { drills: { include: { drill: true } } },
    });
    const assertPlanView = jest
      .fn()
      .mockRejectedValue(new ForbiddenException());
    const getEditor = jest.fn();
    const controller = new TrainingPlansController(
      { getEditor } as unknown as TrainingPlansService,
      { assertPlanView } as unknown as AuthorizationService,
    );
    await expect(controller.editor({ user }, 'foreign')).rejects.toThrow(
      ForbiddenException,
    );
    expect(getEditor).not.toHaveBeenCalled();
  });
});
