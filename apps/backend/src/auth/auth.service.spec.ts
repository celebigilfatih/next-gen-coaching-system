import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  it('returns a token and user without passwordHash', async () => {
    const password = 'safe-password';
    const passwordHash = await bcrypt.hash(password, 10);
    const users = {
      findByEmailWithPassword: jest.fn().mockResolvedValue({
        id: 'user-1',
        name: 'Player',
        email: 'player@example.com',
        passwordHash,
        role: 'PLAYER',
        status: 'ACTIVE',
        authVersion: 3,
        clubId: 'club-a',
        position: null,
        birthDate: null,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      }),
    } as unknown as UsersService;
    const jwt = {
      signAsync: jest.fn().mockResolvedValue('signed-token'),
    } as unknown as JwtService;
    const service = new AuthService(users, jwt);

    const result = await service.login('player@example.com', password);

    expect(result.access_token).toBe('signed-token');
    expect(result.user).not.toHaveProperty('passwordHash');
    expect(result.user).toMatchObject({ id: 'user-1', role: 'PLAYER' });
    expect(jwt.signAsync).toHaveBeenCalledWith(
      expect.objectContaining({ sub: 'user-1', ver: 3 }),
    );
  });

  it('rejects a suspended account even with a valid password', async () => {
    const password = 'safe-password';
    const users = {
      findByEmailWithPassword: jest.fn().mockResolvedValue({
        id: 'user-1',
        passwordHash: await bcrypt.hash(password, 10),
        status: 'SUSPENDED',
      }),
    } as unknown as UsersService;
    const service = new AuthService(users, { signAsync: jest.fn() } as any);

    await expect(
      service.login('player@example.com', password),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
