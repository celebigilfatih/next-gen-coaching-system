import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { DrillContentService } from './drill-content.service';
import { starterDrillIds } from './drill-starter-pack';

describe('starter release gate', () => {
  const admin = { id: 'publisher', role: 'SYSTEM_ADMIN' } as never;
  it('requires all 120 independently approved identities before any publish write', async () => {
    const tx = {
      drillVersion: {
        findMany: jest.fn().mockResolvedValue(
          starterDrillIds.slice(1).map((drillId) => ({
            drillId,
            reviewedById: 'expert',
            createdById: 'author',
          })),
        ),
        update: jest.fn(),
      },
    };
    const service = new DrillContentService(
      { $transaction: (operation) => operation(tx) } as never,
      {} as never,
    );
    await expect(service.publishStarterPack(admin)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(tx.drillVersion.update).not.toHaveBeenCalled();
  });
  it('does not allow a non-system publisher', async () => {
    const service = new DrillContentService({} as never, {} as never);
    await expect(
      service.publishStarterPack({ role: 'COACH' } as never),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
  it('blocks individual starter publication before the full first release', async () => {
    const service = new DrillContentService(
      {
        drillVersion: {
          findUnique: jest.fn().mockResolvedValue({
            id: 'v',
            drillId: starterDrillIds[0],
            status: 'APPROVED',
            reviewedById: 'expert',
          }),
          findMany: jest.fn().mockResolvedValue([]),
        },
      } as never,
      {} as never,
    );
    await expect(service.publish(admin, 'v')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
