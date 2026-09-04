import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  it('delegates login without exposing a public registration method', async () => {
    const auth = {
      login: jest.fn().mockResolvedValue({ access_token: 'token' }),
    } as unknown as AuthService;
    const controller = new AuthController(auth);

    await expect(
      controller.login({
        email: 'player@example.com',
        password: 'safe-password',
      }),
    ).resolves.toEqual({ access_token: 'token' });
    expect(
      (controller as unknown as { register?: unknown }).register,
    ).toBeUndefined();
  });
});
