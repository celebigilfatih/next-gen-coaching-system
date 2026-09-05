import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshSessionService } from './refresh-session.service';
import type { Request, Response } from 'express';

describe('AuthController', () => {
  it('delegates login without exposing a public registration method', async () => {
    const auth = {
      login: jest.fn().mockResolvedValue({ access_token: 'token' }),
    } as unknown as AuthService;
    const controller = new AuthController(auth, {
      assertBrowserRequest: jest.fn(),
    } as unknown as RefreshSessionService);

    await expect(
      controller.login(
        {
          email: 'player@example.com',
          password: 'safe-password',
        },
        {} as Request,
        {} as Response,
      ),
    ).resolves.toEqual({ access_token: 'token' });
    expect(
      (controller as unknown as { register?: unknown }).register,
    ).toBeUndefined();
  });
});
