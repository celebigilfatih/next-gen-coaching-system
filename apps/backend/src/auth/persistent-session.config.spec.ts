import {
  resolveBrowserOrigins,
  resolvePersistentSessionConfig,
} from './persistent-session.config';

describe('resolvePersistentSessionConfig', () => {
  it('keeps the legacy access lifetime while the feature is disabled', () => {
    expect(resolvePersistentSessionConfig({ NODE_ENV: 'production' })).toEqual(
      expect.objectContaining({
        enabled: false,
        accessTokenTtl: '7d',
        frontendOrigin: null,
      }),
    );
  });

  it('requires one exact HTTPS origin when enabled in production', () => {
    expect(() =>
      resolvePersistentSessionConfig({
        NODE_ENV: 'production',
        PERSISTENT_SESSIONS_ENABLED: 'true',
        FRONTEND_ORIGIN: 'http://app.example.test',
      }),
    ).toThrow('FRONTEND_ORIGIN must use HTTPS in production');
    expect(() =>
      resolvePersistentSessionConfig({
        NODE_ENV: 'production',
        PERSISTENT_SESSIONS_ENABLED: 'true',
        FRONTEND_ORIGIN: 'https://app.example.test/path',
      }),
    ).toThrow('exact HTTP(S) origin');
  });

  it('applies the approved session policy when enabled', () => {
    expect(
      resolvePersistentSessionConfig({
        NODE_ENV: 'production',
        PERSISTENT_SESSIONS_ENABLED: 'true',
        FRONTEND_ORIGIN: 'https://app.example.test',
      }),
    ).toEqual({
      enabled: true,
      frontendOrigin: 'https://app.example.test',
      cookieName: '__Host-ngcs_refresh',
      cookieSecure: true,
      accessTokenTtl: '15m',
      refreshIdleTtlMs: 604_800_000,
      refreshAbsoluteTtlMs: 2_592_000_000,
      retentionMs: 2_592_000_000,
      maxActiveSessionFamilies: 5,
    });
  });

  it('permits HTTP only on loopback outside production', () => {
    expect(
      resolvePersistentSessionConfig({
        NODE_ENV: 'test',
        PERSISTENT_SESSIONS_ENABLED: 'true',
        FRONTEND_ORIGIN: 'http://localhost:3500',
      }).cookieSecure,
    ).toBe(false);
    expect(() =>
      resolvePersistentSessionConfig({
        NODE_ENV: 'test',
        PERSISTENT_SESSIONS_ENABLED: 'true',
        FRONTEND_ORIGIN: 'http://staging.example.test',
      }),
    ).toThrow('loopback hosts');
  });

  it('allows the canonical local frontend origin while sessions are disabled', () => {
    expect(
      resolveBrowserOrigins({
        NODE_ENV: 'development',
        PERSISTENT_SESSIONS_ENABLED: 'false',
      }),
    ).toContain('http://localhost:3132');
  });

  it('uses only the configured local origin while sessions are enabled', () => {
    expect(
      resolveBrowserOrigins({
        NODE_ENV: 'development',
        PERSISTENT_SESSIONS_ENABLED: 'true',
        FRONTEND_ORIGIN: 'http://localhost:3132',
      }),
    ).toEqual(['http://localhost:3132']);
  });
});
