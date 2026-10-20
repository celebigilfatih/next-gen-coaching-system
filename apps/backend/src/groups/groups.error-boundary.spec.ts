import {
  ArgumentsHost,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { GroupsService } from './groups.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GroupsService mutation error boundary', () => {
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

  it('deletes memberships and the group in one transaction', async () => {
    const deleteMany = jest.fn().mockResolvedValue({ count: 2 });
    const remove = jest.fn().mockResolvedValue({ id: 'group-a' });
    const transaction = jest.fn(async (work: (tx: unknown) => unknown) =>
      work({
        groupMember: { deleteMany },
        playerGroup: { delete: remove },
        team: { findUnique: jest.fn().mockResolvedValue(null) },
      }),
    );
    const service = new GroupsService({
      $transaction: transaction,
    } as unknown as PrismaService);

    await expect(service.delete('group-a')).resolves.toEqual({ id: 'group-a' });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(deleteMany).toHaveBeenCalledWith({ where: { groupId: 'group-a' } });
    expect(remove).toHaveBeenCalledWith({ where: { id: 'group-a' } });
    expect(deleteMany.mock.invocationCallOrder[0]).toBeLessThan(
      remove.mock.invocationCallOrder[0],
    );
    expect(log).not.toHaveBeenCalled();
  });

  it('rejects an invalid delete id before transaction or logging', async () => {
    const transaction = jest.fn();
    const service = new GroupsService({
      $transaction: transaction,
    } as unknown as PrismaService);
    await expect(service.delete('')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(transaction).not.toHaveBeenCalled();
    expect(log).not.toHaveBeenCalled();
  });

  it('contains group update persistence failures', async () => {
    const service = new GroupsService({
      playerGroup: {
        findUniqueOrThrow: jest
          .fn()
          .mockResolvedValue({ category: 'ALT_YAPI' }),
        update: jest.fn().mockRejectedValue({
          code: 'P2025',
          meta: { private: 'group-a' },
        }),
      },
    } as unknown as PrismaService);
    await expectContained(
      service.update('group-a', { name: 'Updated' }),
      'GROUP_UPDATE_FAILED',
    );
  });

  it('contains a failed transactional group delete', async () => {
    const service = new GroupsService({
      $transaction: jest
        .fn()
        .mockRejectedValue(new Error('private relation conflict')),
    } as unknown as PrismaService);
    await expectContained(service.delete('group-a'), 'GROUP_DELETE_FAILED');
  });

  it.each([
    ['lookup', new Error('private lookup'), null],
    ['duplicate', null, { id: 'membership-a' }],
    ['create', null, null],
  ])(
    'contains member add %s failures',
    async (stage, lookupFailure, existing) => {
      const findFirst = lookupFailure
        ? jest.fn().mockRejectedValue(lookupFailure)
        : jest.fn().mockResolvedValue(existing);
      const create =
        stage === 'create'
          ? jest.fn().mockRejectedValue(new Error('private insert'))
          : jest.fn();
      const service = new GroupsService({
        groupMember: { findFirst, create },
      } as unknown as PrismaService);
      await expectContained(
        service.addMember('group-a', 'user-a'),
        'GROUP_MEMBER_ADD_FAILED',
      );
      if (stage !== 'create') expect(create).not.toHaveBeenCalled();
    },
  );

  it.each([
    ['lookup', new Error('private lookup'), null],
    ['missing', null, null],
    ['delete', null, { id: 'membership-a' }],
  ])(
    'contains member remove %s failures',
    async (stage, lookupFailure, member) => {
      const findFirst = lookupFailure
        ? jest.fn().mockRejectedValue(lookupFailure)
        : jest.fn().mockResolvedValue(member);
      const remove =
        stage === 'delete'
          ? jest.fn().mockRejectedValue(new Error('private delete'))
          : jest.fn();
      const service = new GroupsService({
        groupMember: { findFirst, delete: remove },
      } as unknown as PrismaService);
      await expectContained(
        service.removeMember('group-a', 'user-a'),
        'GROUP_MEMBER_REMOVE_FAILED',
      );
      if (stage !== 'delete') expect(remove).not.toHaveBeenCalled();
    },
  );

  it('preserves successful member add and remove results', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'membership-new' });
    const remove = jest.fn().mockResolvedValue({ id: 'membership-old' });
    const findFirst = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'membership-old' });
    const service = new GroupsService({
      groupMember: { findFirst, create, delete: remove },
    } as unknown as PrismaService);
    await expect(service.addMember('group-a', 'user-a')).resolves.toEqual({
      id: 'membership-new',
    });
    await expect(service.removeMember('group-a', 'user-a')).resolves.toEqual({
      id: 'membership-old',
    });
    expect(create).toHaveBeenCalledWith({
      data: { groupId: 'group-a', userId: 'user-a' },
    });
    expect(remove).toHaveBeenCalledWith({ where: { id: 'membership-old' } });
    expect(log).not.toHaveBeenCalled();
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
