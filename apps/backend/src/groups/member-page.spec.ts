import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { GroupsController } from './groups.controller';
import { parseMemberPageQuery } from './dto/member-page.dto';

describe('bounded player memberships', () => {
  it('filters players before paging/counting and selects only existing directory fields', async () => {
    const prisma: any = {
      groupMember: {
        findMany: jest.fn().mockResolvedValue([{ id: 'a' }, { id: 'b' }]),
        count: jest.fn().mockResolvedValue(130),
      },
    };
    const result = await new GroupsService(prisma).getPlayerMemberPage('g', {
      limit: '1',
      after: '0',
    });
    expect(result).toEqual({
      items: [{ id: 'a' }],
      total: 130,
      limit: 1,
      nextCursor: 'a',
    });
    const read = prisma.groupMember.findMany.mock.calls[0][0];
    expect(read.where).toEqual({
      groupId: 'g',
      user: { role: 'PLAYER' },
      id: { gt: '0' },
    });
    expect(read.orderBy).toEqual({ id: 'asc' });
    expect(read.take).toBe(2);
    expect(read.select.user.select).toEqual({
      id: true,
      name: true,
      email: true,
      role: true,
      position: true,
    });
    expect(prisma.groupMember.count).toHaveBeenCalledWith({
      where: { groupId: 'g', user: { role: 'PLAYER' } },
    });
  });
  it('retains full count on an empty continuation', async () => {
    const prisma: any = {
      groupMember: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(30),
      },
    };
    expect(
      await new GroupsService(prisma).getPlayerMemberPage('g', { after: 'z' }),
    ).toEqual({ items: [], total: 30, limit: 25, nextCursor: null });
  });
  it('checks current group authority before service access', async () => {
    const service: any = { getPlayerMemberPage: jest.fn() };
    const auth: any = {
      assertGroupView: jest.fn().mockRejectedValue(new ForbiddenException()),
    };
    const controller = new GroupsController(service, auth);
    await expect(
      controller.playerMemberPage(
        { user: { id: 'coach' } } as any,
        'foreign',
        {},
      ),
    ).rejects.toThrow(ForbiddenException);
    expect(service.getPlayerMemberPage).not.toHaveBeenCalled();
  });
  it.each([
    null,
    [],
    { limit: '0' },
    { limit: '101' },
    { limit: 25 },
    { limit: null },
    { after: ' x' },
    { after: 'x'.repeat(161) },
    { after: [] },
    { after: '' },
    { role: 'COACH' },
    { groupId: 'foreign' },
    { seasonId: 's' },
  ])('rejects unsupported query %j', (input) => {
    expect(() => parseMemberPageQuery(input)).toThrow(BadRequestException);
  });
});
