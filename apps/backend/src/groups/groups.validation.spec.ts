import { BadRequestException, ForbiddenException } from '@nestjs/common';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

describe('Groups runtime input boundary', () => {
  const principal = {
    id: 'club-admin-a',
    role: 'CLUB_ADMIN',
    clubId: 'club-a',
  } as AuthPrincipal;
  const valid = { clubId: 'club-a', name: '', ageGroup: 'U16' };

  it.each([
    undefined,
    null,
    [],
    {},
    { ...valid, clubId: '' },
    { ...valid, clubId: 1 },
    { ...valid, name: null },
    { ...valid, ageGroup: 'U17\n' },
    { ...valid, category: 'A_TEAM' },
  ])('rejects malformed create %# before Prisma', async (input) => {
    const create = jest.fn();
    const service = new GroupsService({
      playerGroup: { create },
    } as unknown as PrismaService);
    await expect(service.create(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it.each([undefined, null, '', 'ALT_YAPI', 'A_TAKIM'])(
    'preserves create category/default %# and field projection',
    async (category) => {
      const create = jest.fn().mockResolvedValue({ id: 'group-a' });
      const service = new GroupsService({
        playerGroup: { create },
      } as unknown as PrismaService);
      await service.create({
        ...valid,
        category,
        id: 'ignored',
        club: { connect: { id: 'club-b' } },
        members: { create: { userId: 'other-user' } },
      });
      expect(create).toHaveBeenCalledWith({
        data: { ...valid, category: category || 'ALT_YAPI' },
      });
    },
  );

  it.each([
    undefined,
    null,
    [],
    'invalid',
    { name: null },
    { ageGroup: 'U17\n' },
    { category: null },
    { category: '' },
  ])('rejects malformed update %# before Prisma', async (input) => {
    const update = jest.fn();
    const service = new GroupsService({
      playerGroup: { update },
    } as unknown as PrismaService);
    await expect(service.update('group-a', input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(update).not.toHaveBeenCalled();
  });

  it('projects group update fields and preserves empty name', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'group-a' });
    const service = new GroupsService({
      playerGroup: {
        findUniqueOrThrow: jest.fn().mockResolvedValue({ category: 'A_TAKIM' }),
        update,
      },
    } as unknown as PrismaService);
    await service.update('group-a', {
      name: '',
      ageGroup: 'SENIOR',
      category: 'A_TAKIM',
      clubId: 'club-b',
      members: { deleteMany: {} },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'group-a' },
      data: { name: '', ageGroup: 'SENIOR', category: 'A_TAKIM' },
    });
  });

  it.each([
    ['', 'user-a'],
    ['group-a', ''],
    ['group-a', null],
    [null, 'user-a'],
  ])('rejects direct member identifiers %#/%#', async (groupId, userId) => {
    const findFirst = jest.fn();
    const service = new GroupsService({
      groupMember: { findFirst },
    } as unknown as PrismaService);
    await expect(
      service.addMember(groupId as string, userId as string),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(findFirst).not.toHaveBeenCalled();
  });

  describe('controller order and projection', () => {
    let authorization: {
      assertClubManage: jest.Mock;
      assertGroupManage: jest.Mock;
      assertUserInClub: jest.Mock;
    };
    let groups: {
      create: jest.Mock;
      update: jest.Mock;
      addMember: jest.Mock;
      removeMember: jest.Mock;
    };
    let controller: GroupsController;

    beforeEach(() => {
      authorization = {
        assertClubManage: jest.fn(),
        assertGroupManage: jest.fn().mockResolvedValue({ clubId: 'club-a' }),
        assertUserInClub: jest.fn(),
      };
      groups = {
        create: jest.fn(),
        update: jest.fn(),
        addMember: jest.fn(),
        removeMember: jest.fn(),
      };
      controller = new GroupsController(
        groups as unknown as GroupsService,
        authorization as unknown as AuthorizationService,
      );
    });

    it('parses body target before create authorization and projects fields', async () => {
      await controller.create(
        { user: principal },
        {
          ...valid,
          id: 'ignored',
          members: { create: {} },
        },
      );
      expect(authorization.assertClubManage).toHaveBeenCalledWith(
        principal,
        'club-a',
      );
      expect(groups.create).toHaveBeenCalledWith({
        ...valid,
        category: undefined,
      });
    });

    it('keeps foreign body-target authorization before other create fields', async () => {
      authorization.assertClubManage.mockImplementation(() => {
        throw new ForbiddenException();
      });
      await expect(
        controller.create(
          { user: principal },
          { clubId: 'club-b', name: null, ageGroup: 'U17' },
        ),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(authorization.assertClubManage).toHaveBeenCalledWith(
        principal,
        'club-b',
      );
      expect(groups.create).not.toHaveBeenCalled();
    });

    it('rejects an invalid create target before authorization', async () => {
      await expect(
        controller.create(
          { user: principal },
          { clubId: '', name: 'Group', ageGroup: 'U16' },
        ),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(authorization.assertClubManage).not.toHaveBeenCalled();
      expect(groups.create).not.toHaveBeenCalled();
    });

    it.each(['update', 'addMember', 'removeMember'] as const)(
      'keeps group authorization before %s body parsing',
      async (method) => {
        authorization.assertGroupManage.mockRejectedValue(
          new ForbiddenException(),
        );
        const call =
          method === 'update'
            ? controller.update({ user: principal }, 'group-b', null)
            : method === 'addMember'
              ? controller.addMember({ user: principal }, 'group-b', null)
              : controller.removeMember({ user: principal }, 'group-b', null);
        await expect(call).rejects.toBeInstanceOf(ForbiddenException);
        expect(groups[method]).not.toHaveBeenCalled();
      },
    );

    it('validates member body before user lookup and mutation', async () => {
      await expect(
        controller.addMember({ user: principal }, 'group-a', { userId: '' }),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(authorization.assertUserInClub).not.toHaveBeenCalled();
      expect(groups.addMember).not.toHaveBeenCalled();
    });

    it('projects member body after group and user authorization', async () => {
      await controller.addMember({ user: principal }, 'group-a', {
        userId: 'user-a',
        groupId: 'group-b',
        id: 'ignored',
      });
      expect(authorization.assertUserInClub).toHaveBeenCalledWith(
        'user-a',
        'club-a',
      );
      expect(groups.addMember).toHaveBeenCalledWith(
        'group-a',
        'user-a',
        'club-admin-a',
      );
    });
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
