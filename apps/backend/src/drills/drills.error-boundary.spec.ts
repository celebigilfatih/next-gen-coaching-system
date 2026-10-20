import {
  ArgumentsHost,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import type { AuthPrincipal } from '../auth/auth-principal';
import { AuthorizationService } from '../auth/authorization.service';
import { PrismaService } from '../prisma/prisma.service';
import { DrillsService } from './drills.service';

const systemAdmin: AuthPrincipal = {
  id: 'system-admin',
  userId: 'system-admin',
  email: 'system-admin@example.com',
  role: 'SYSTEM_ADMIN',
  clubId: null,
};

const clubAdmin: AuthPrincipal = {
  id: 'club-admin',
  userId: 'club-admin',
  email: 'club-admin@example.com',
  role: 'CLUB_ADMIN',
  clubId: 'club',
};

const board = {
  schemaVersion: 1,
  kind: 'tactical-board',
  pitch: { type: 'full', width: 1200, height: 800 },
  elements: [],
};

const input = {
  title: 'Geçiş oyunu',
  category: 'TACTICAL',
  ageGroup: 'U16',
  durationMin: 20,
  difficulty: 'MEDIUM',
  jsonData: board,
};

describe('DrillsService mutation error boundary', () => {
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

  const authorization = {
    assertClubManage: jest.fn(),
  } as unknown as AuthorizationService;

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

  it('contains create persistence failures', async () => {
    const service = new DrillsService(
      {
        drill: {
          create: jest.fn().mockRejectedValue({
            code: 'P2003',
            meta: { private: 'drill-create' },
          }),
        },
      } as unknown as PrismaService,
      authorization,
    );

    await expectContained(
      service.create(clubAdmin, input),
      'DRILL_CREATE_FAILED',
    );
  });

  it('contains update persistence failures after resource authorization', async () => {
    const service = new DrillsService(
      {
        async $transaction(work: (tx: unknown) => Promise<unknown>) {
          return work(this);
        },
        drill: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'drill-a',
            ...input,
            scope: 'CLUB',
            clubId: 'club',
            groupId: null,
            createdById: null,
            equipment: null,
            imageUrl: null,
          }),
          update: jest
            .fn()
            .mockRejectedValue(new Error('private update query')),
        },
      } as unknown as PrismaService,
      authorization,
    );

    await expectContained(
      service.update(clubAdmin, 'drill-a', { title: 'Yeni başlık' }),
      'DRILL_UPDATE_FAILED',
    );
  });

  it('contains delete persistence failures after resource authorization', async () => {
    const service = new DrillsService(
      {
        drill: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'drill-a',
            ...input,
            scope: 'CLUB',
            clubId: 'club',
            groupId: null,
            createdById: null,
            equipment: null,
            imageUrl: null,
          }),
          delete: jest
            .fn()
            .mockRejectedValue(new Error('private delete query')),
        },
      } as unknown as PrismaService,
      authorization,
    );

    await expectContained(
      service.remove(clubAdmin, 'drill-a'),
      'DRILL_DELETE_FAILED',
    );
  });

  it.each([undefined, null, [], 'invalid'])(
    'rejects malformed create body %# before persistence',
    async (body) => {
      const create = jest.fn();
      const service = new DrillsService(
        { drill: { create } } as unknown as PrismaService,
        authorization,
      );
      await expect(
        service.create(systemAdmin, body as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(create).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, null, [], 'invalid'])(
    'rejects malformed update body %# after resource authorization',
    async (body) => {
      const update = jest.fn();
      const findUnique = jest.fn().mockResolvedValue({
        id: 'drill-a',
        ...input,
        scope: 'GLOBAL',
        clubId: null,
        groupId: null,
        createdById: null,
        equipment: null,
        imageUrl: null,
      });
      const service = new DrillsService(
        {
          drill: { findUnique, update },
          async $transaction(work: (tx: unknown) => Promise<unknown>) {
            return work(this);
          },
        } as unknown as PrismaService,
        authorization,
      );
      await expect(
        service.update(systemAdmin, 'drill-a', body as never),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(findUnique).toHaveBeenCalledTimes(1);
      expect(update).not.toHaveBeenCalled();
      expect(log).not.toHaveBeenCalled();
    },
  );
});
