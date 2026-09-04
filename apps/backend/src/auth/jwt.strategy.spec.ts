import { UnauthorizedException } from '@nestjs/common';
import type { JwtConfiguration } from './jwt-configuration.module';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy current principal resolution', () => {
  it('uses the current database role and club instead of token claims', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-1',
          email: 'current@example.com',
          role: 'CLUB_ADMIN',
          status: 'ACTIVE',
          authVersion: 4,
          clubId: 'club-a',
        }),
      },
    };
    const strategy = new JwtStrategy(
      { secret: 'x'.repeat(32) } as JwtConfiguration,
      prisma as any,
    );

    await expect(
      strategy.validate({
        sub: 'user-1',
        email: 'stale@example.com',
        role: 'SYSTEM_ADMIN',
        ver: 4,
      }),
    ).resolves.toEqual({
      id: 'user-1',
      userId: 'user-1',
      email: 'current@example.com',
      role: 'CLUB_ADMIN',
      clubId: 'club-a',
    });
  });

  it('rejects tokens whose user no longer exists', async () => {
    const prisma = { user: { findUnique: jest.fn().mockResolvedValue(null) } };
    const strategy = new JwtStrategy(
      { secret: 'x'.repeat(32) } as JwtConfiguration,
      prisma as any,
    );

    await expect(
      strategy.validate({ sub: 'deleted-user' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects suspended accounts and revoked token versions', async () => {
    const prisma = {
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValueOnce({
            id: 'user-1',
            email: 'user@example.com',
            role: 'PLAYER',
            status: 'SUSPENDED',
            authVersion: 1,
            clubId: 'club-a',
          })
          .mockResolvedValueOnce({
            id: 'user-1',
            email: 'user@example.com',
            role: 'PLAYER',
            status: 'ACTIVE',
            authVersion: 2,
            clubId: 'club-a',
          }),
      },
    };
    const strategy = new JwtStrategy(
      { secret: 'x'.repeat(32) } as JwtConfiguration,
      prisma as any,
    );

    await expect(
      strategy.validate({ sub: 'user-1', ver: 1 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(
      strategy.validate({ sub: 'user-1', ver: 1 }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
