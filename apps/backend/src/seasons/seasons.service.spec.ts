import { BadRequestException } from '@nestjs/common';
import { SeasonsService } from './seasons.service';
import { PrismaService } from '../prisma/prisma.service';

describe('SeasonsService generation bounds', () => {
  function createService(season: { startDate: Date; endDate: Date }) {
    const prisma = {
      season: { findUnique: jest.fn().mockResolvedValue(season) },
      weekPlan: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
    } as unknown as PrismaService;

    return {
      service: new SeasonsService(prisma),
      createMany: prisma.weekPlan.createMany as jest.Mock,
    };
  }

  it('rejects persisted season ranges above the work limit', async () => {
    const { service, createMany } = createService({
      startDate: new Date('2020-01-01T00:00:00.000Z'),
      endDate: new Date('2030-01-01T00:00:00.000Z'),
    });

    await expect(service.generateWeeks('season-1')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(createMany).not.toHaveBeenCalled();
  });

  it('generates bounded week records for a valid season', async () => {
    const { service, createMany } = createService({
      startDate: new Date('2026-01-01T00:00:00.000Z'),
      endDate: new Date('2026-01-14T00:00:00.000Z'),
    });

    await service.generateWeeks('season-1');

    expect(createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ seasonId: 'season-1', weekNumber: 1 }),
        expect.objectContaining({ seasonId: 'season-1', weekNumber: 2 }),
      ]),
      skipDuplicates: true,
    });
    expect(createMany.mock.calls[0][0].data).toHaveLength(2);
  });
});
