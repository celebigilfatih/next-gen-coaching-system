import {
  ArgumentsHost,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorizationService } from '../auth/authorization.service';
import type { AuthPrincipal } from '../auth/auth-principal';

const principal = {
  id: 'club-admin-a',
  role: 'CLUB_ADMIN',
  clubId: 'club-a',
} as AuthPrincipal;

describe('ClubsService write boundary', () => {
  it('projects club create fields before the Prisma sink', async () => {
    const create = jest.fn().mockResolvedValue({ id: 'server-club' });
    const service = new ClubsService({
      club: { create },
    } as unknown as PrismaService);

    await service.createClub({
      name: 'Club A',
      logo: null,
      description: 'First club',
      id: 'client-controlled',
      createdAt: new Date('2000-01-01T00:00:00.000Z'),
      users: { create: { id: 'nested-user' } },
      groups: { create: { id: 'nested-group' } },
    } as unknown as Parameters<ClubsService['createClub']>[0]);

    expect(create).toHaveBeenCalledWith({
      data: {
        name: 'Club A',
        logo: null,
        description: 'First club',
      },
    });
  });

  it.each([
    undefined,
    null,
    [],
    'invalid',
    {},
    { name: null },
    { name: 1 },
    { name: 'Club', logo: 1 },
    { name: 'Club', description: {} },
  ])('rejects malformed create input %# before Prisma', async (input) => {
    const create = jest.fn();
    const service = new ClubsService({
      club: { create },
    } as unknown as PrismaService);
    await expect(service.createClub(input)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(create).not.toHaveBeenCalled();
  });

  it.each([
    {},
    { name: '' },
    { name: 'Club', logo: null, description: null },
    { name: 'Club', logo: '', description: '' },
  ])('preserves club create values %#', async (input) => {
    const create = jest.fn().mockResolvedValue({ id: 'club-a' });
    const service = new ClubsService({
      club: { create },
    } as unknown as PrismaService);
    if (!('name' in input)) {
      await expect(service.createClub(input)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      return;
    }
    await service.createClub(input);
    expect(create).toHaveBeenCalledWith({
      data: {
        name: input.name,
        logo: 'logo' in input ? input.logo : undefined,
        description: 'description' in input ? input.description : undefined,
      },
    });
  });

  it.each([undefined, null, [], 'invalid', { name: 1 }, { logo: 1 }])(
    'rejects malformed update input %# before Prisma',
    async (input) => {
      const update = jest.fn();
      const service = new ClubsService({
        club: { update },
      } as unknown as PrismaService);
      await expect(service.updateClub('club-a', input)).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(update).not.toHaveBeenCalled();
    },
  );

  it('preserves omitted, null and empty club update fields', async () => {
    const update = jest.fn().mockResolvedValue({ id: 'club-a' });
    const service = new ClubsService({
      club: { update },
    } as unknown as PrismaService);
    await service.updateClub('club-a', {
      logo: null,
      description: '',
      id: 'ignored',
      users: { deleteMany: {} },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'club-a' },
      data: { name: undefined, logo: null, description: '' },
    });
  });

  it.each(['U8', 'U10', 'U12', 'U14', 'U16', 'U18', 'SENIOR'] as const)(
    'preserves club group age %s and database category default',
    async (ageGroup) => {
      const create = jest.fn().mockResolvedValue({ id: 'group-a' });
      const service = new ClubsService({
        playerGroup: { create },
      } as unknown as PrismaService);
      await service.createGroup('club-a', { name: '', ageGroup });
      expect(create).toHaveBeenCalledWith({
        data: { clubId: 'club-a', name: '', ageGroup },
      });
    },
  );

  it.each([
    undefined,
    null,
    [],
    {},
    { name: null, ageGroup: 'U16' },
    { name: 'Group', ageGroup: 'U17\n' },
  ])('rejects malformed club group input %# before Prisma', async (input) => {
    const create = jest.fn();
    const service = new ClubsService({
      playerGroup: { create },
    } as unknown as PrismaService);
    await expect(
      service.createGroup('club-a', input as never),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(create).not.toHaveBeenCalled();
  });

  it.each([
    ['createClub', 'CLUB_CREATE_FAILED'] as const,
    ['createGroup', 'CLUB_GROUP_CREATE_FAILED'] as const,
  ])(
    'contains %s persistence failure with fixed event',
    async (method, event) => {
      const failure = Object.assign(new Error('private query\nforged line'), {
        code: 'P2003',
        meta: { private: 'club-a' },
      });
      const create = jest.fn().mockRejectedValue(failure);
      const service = new ClubsService({
        club: { create },
        playerGroup: { create },
      } as unknown as PrismaService);
      const log = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      const consoleError = jest
        .spyOn(console, 'error')
        .mockImplementation(() => undefined);
      const caught = await (
        method === 'createClub'
          ? service.createClub({ name: 'Club' })
          : service.createGroup('club-a', { name: 'Group', ageGroup: 'U16' })
      ).catch((error: unknown) => error);
      expect(caught).toBeInstanceOf(InternalServerErrorException);
      expect(caught).not.toHaveProperty('cause');
      const reply = jest.fn();
      new BaseExceptionFilter({
        isHeadersSent: () => false,
        reply,
      } as never).catch(caught, {
        getArgByIndex: () => ({}),
      } as unknown as ArgumentsHost);
      expect(reply).toHaveBeenCalledWith(
        expect.anything(),
        { statusCode: 500, message: 'Internal server error' },
        500,
      );
      expect(log.mock.calls).toEqual([[event]]);
      expect(consoleError).not.toHaveBeenCalled();
      jest.restoreAllMocks();
    },
  );

  it('contains updateClub persistence failure with fixed event', async () => {
    const update = jest.fn().mockRejectedValue(
      Object.assign(new Error('private update query'), {
        code: 'P2025',
        meta: { private: 'club-a' },
      }),
    );
    const service = new ClubsService({
      club: { update },
    } as unknown as PrismaService);
    const log = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    const caught = await service
      .updateClub('club-a', { name: 'Updated' })
      .catch((error: unknown) => error);
    expect(caught).toBeInstanceOf(InternalServerErrorException);
    expect(caught).not.toHaveProperty('cause');
    const reply = jest.fn();
    new BaseExceptionFilter({
      isHeadersSent: () => false,
      reply,
    } as never).catch(caught, {
      getArgByIndex: () => ({}),
    } as unknown as ArgumentsHost);
    expect(reply).toHaveBeenCalledWith(
      expect.anything(),
      { statusCode: 500, message: 'Internal server error' },
      500,
    );
    expect(log.mock.calls).toEqual([['CLUB_UPDATE_FAILED']]);
    expect(consoleError).not.toHaveBeenCalled();
  });
});

describe('ClubsController authorization and parsing order', () => {
  let authorization: { assertClubManage: jest.Mock };
  let clubs: {
    createClub: jest.Mock;
    createGroup: jest.Mock;
    updateClub: jest.Mock;
  };
  let controller: ClubsController;

  beforeEach(() => {
    authorization = { assertClubManage: jest.fn() };
    clubs = {
      createClub: jest.fn(),
      createGroup: jest.fn(),
      updateClub: jest.fn(),
    };
    controller = new ClubsController(
      clubs as unknown as ClubsService,
      authorization as unknown as AuthorizationService,
    );
  });

  it('projects club create before calling the service', async () => {
    await controller.create({
      name: 'Club',
      logo: null,
      id: 'ignored',
      users: { create: {} },
    });
    expect(clubs.createClub).toHaveBeenCalledWith({
      name: 'Club',
      logo: null,
      description: undefined,
    });
  });

  it.each(['createGroup', 'update'] as const)(
    'keeps path authorization before %s body validation',
    async (method) => {
      authorization.assertClubManage.mockImplementation(() => {
        throw new ForbiddenException();
      });
      const call =
        method === 'createGroup'
          ? controller.createGroup({ user: principal }, 'club-b', null)
          : controller.update({ user: principal }, 'club-b', null);
      await expect(call).rejects.toBeInstanceOf(ForbiddenException);
      expect(clubs.createGroup).not.toHaveBeenCalled();
      expect(clubs.updateClub).not.toHaveBeenCalled();
    },
  );
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
