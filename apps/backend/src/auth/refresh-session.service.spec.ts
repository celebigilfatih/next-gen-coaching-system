import { RefreshSessionService } from './refresh-session.service';
import { resolvePersistentSessionConfig } from './persistent-session.config';
import type { Request } from 'express';

describe('refresh browser boundary', () => {
  const service = new RefreshSessionService(
    {} as never,
    resolvePersistentSessionConfig({
      NODE_ENV: 'production',
      PERSISTENT_SESSIONS_ENABLED: 'true',
      FRONTEND_ORIGIN: 'https://app.example.test',
    }),
  );
  it.each([
    undefined,
    'null',
    'https://evil.example.test',
    'https://app.example.test.evil.test',
    'https://app.example.test/',
  ])('rejects invalid origin %s even with the CSRF header', (origin) => {
    expect(() =>
      service.assertBrowserRequest({
        get: (name: string) => (name === 'origin' ? origin : '1'),
      } as Request),
    ).toThrow();
  });
  it('requires the custom header on the exact approved origin', () => {
    expect(() =>
      service.assertBrowserRequest({
        get: (name: string) =>
          name === 'origin' ? 'https://app.example.test' : undefined,
      } as Request),
    ).toThrow();
    expect(() =>
      service.assertBrowserRequest({
        get: (name: string) =>
          name === 'origin' ? 'https://app.example.test' : '1',
      } as Request),
    ).not.toThrow();
  });
  it('sets the host-only production cookie attributes without Domain', () => {
    expect(service.cookieName).toBe('__Host-ngcs_refresh');
    expect(service.cookieOptions()).toEqual({
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });
  });
  it('rejects malformed or duplicate credential cookies', () => {
    const token = 'a'.repeat(43);
    const parse = (cookie: string) =>
      service.readRefreshToken({ headers: { cookie } } as Request);
    expect(parse(`__Host-ngcs_refresh=${token}`)).toBe(token);
    expect(
      parse(`__Host-ngcs_refresh=${token}; __Host-ngcs_refresh=${token}`),
    ).toBeNull();
    expect(parse('__Host-ngcs_refresh=bad')).toBeNull();
  });
});
