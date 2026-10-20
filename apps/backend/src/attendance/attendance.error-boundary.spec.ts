import {
  ArgumentsHost,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceService } from './attendance.service';

describe('AttendanceService mutation error boundary', () => {
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

  async function expectContained(promise: Promise<unknown>): Promise<void> {
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
    expect(log.mock.calls).toEqual([['ATTENDANCE_MARK_FAILED']]);
    expect(consoleError).not.toHaveBeenCalled();
  }

  it('contains attendance upsert failures', async () => {
    const service = new AttendanceService({
      attendance: {
        upsert: jest.fn().mockRejectedValue({
          code: 'P2024',
          meta: { private: 'attendance upsert' },
        }),
      },
    } as unknown as PrismaService);

    await expectContained(service.mark('plan-a', 'player-a', 'PRESENT'));
  });
});
