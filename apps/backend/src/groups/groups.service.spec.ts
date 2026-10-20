import {
  ArgumentsHost,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { GroupsService } from './groups.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GroupsService create error boundary', () => {
  const input = {
    clubId: 'private-club',
    name: 'Private group',
    ageGroup: 'U16',
  };
  const create = jest.fn();
  let service: GroupsService;
  let log: jest.SpyInstance;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    create.mockReset();
    service = new GroupsService({
      playerGroup: { create },
    } as unknown as PrismaService);
    log = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
  });
  afterEach(() => jest.restoreAllMocks());

  it.each([undefined, null, '', 'ALT_YAPI', 'A_TAKIM'])(
    'preserves the create result and category default (%s)',
    async (category) => {
      const result = { id: 'group-a' };
      create.mockResolvedValue(result);
      await expect(service.create({ ...input, category })).resolves.toBe(
        result,
      );
      expect(create).toHaveBeenCalledWith({
        data: { ...input, category: category || 'ALT_YAPI' },
      });
      expect(log).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
    },
  );

  it.each([
    Object.assign(new Error('synthetic-private query\nforged log line'), {
      code: 'P2003',
    }),
    new Error('synthetic-private driver error'),
    {
      code: 'P2003',
      meta: { field: 'private-club' },
      message: 'synthetic-private data',
    },
    null,
    'synthetic-private string',
  ])(
    'contains thrown value %# through the Nest exception filter',
    async (failure) => {
      create.mockRejectedValue(failure);
      const caught = await service
        .create(input)
        .catch((error: unknown) => error);
      expect(caught).toBeInstanceOf(InternalServerErrorException);
      expect(caught).not.toHaveProperty('cause');
      const reply = jest.fn();
      const response = {};
      const adapter = { isHeadersSent: () => false, reply };
      const filter = new BaseExceptionFilter(
        adapter as unknown as ConstructorParameters<
          typeof BaseExceptionFilter
        >[0],
      );
      filter.catch(caught, {
        getArgByIndex: () => response,
      } as unknown as ArgumentsHost);
      expect(reply).toHaveBeenCalledWith(
        response,
        { statusCode: 500, message: 'Internal server error' },
        500,
      );
      expect(log.mock.calls).toEqual([['GROUP_CREATE_FAILED']]);
      expect(consoleError).not.toHaveBeenCalled();
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
