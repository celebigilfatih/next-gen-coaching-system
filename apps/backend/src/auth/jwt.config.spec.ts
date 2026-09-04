import { resolveJwtSecret } from './jwt.config';
import { ConfigService } from '@nestjs/config';
import { JwtConfiguration } from './jwt-configuration.module';

describe('resolveJwtSecret', () => {
  it('rejects a missing production secret', () => {
    expect(() => resolveJwtSecret({ NODE_ENV: 'production' })).toThrow(
      'JWT_SECRET is required in production',
    );
  });

  it.each([
    'devsecret',
    'your-secret-key-change-in-production',
    'your-super-secret-jwt-key-change-in-production-min-32-chars',
    'short-secret',
  ])('rejects unsafe configured secret %s', (secret) => {
    expect(() =>
      resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: secret }),
    ).toThrow('JWT_SECRET must be at least 32 characters');
  });

  it('accepts a sufficiently strong configured secret', () => {
    const secret = '0123456789abcdef0123456789abcdef';
    expect(
      resolveJwtSecret({ NODE_ENV: 'production', JWT_SECRET: secret }),
    ).toBe(secret);
  });

  it('uses an unpredictable ephemeral secret outside production', () => {
    const first = resolveJwtSecret({ NODE_ENV: 'test' });
    const second = resolveJwtSecret({ NODE_ENV: 'test' });

    expect(first).toHaveLength(64);
    expect(second).toHaveLength(64);
    expect(first).not.toBe(second);
  });

  it('resolves one injectable secret for signer and verifier consumers', () => {
    const secret = '0123456789abcdef0123456789abcdef';
    const config = {
      get: jest.fn((key: string) =>
        key === 'JWT_SECRET' ? secret : 'production',
      ),
    } as unknown as ConfigService;

    expect(new JwtConfiguration(config).secret).toBe(secret);
  });
});
