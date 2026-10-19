const ACCESS_TOKEN_TTL_WITH_REFRESH = '15m';
const LEGACY_ACCESS_TOKEN_TTL = '7d';
const REFRESH_IDLE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_ABSOLUTE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
const MAX_ACTIVE_SESSION_FAMILIES = 5;

export type PersistentSessionConfig = {
  enabled: boolean;
  frontendOrigin: string | null;
  cookieName: string;
  cookieSecure: boolean;
  accessTokenTtl: '15m' | '7d';
  refreshIdleTtlMs: number;
  refreshAbsoluteTtlMs: number;
  retentionMs: number;
  maxActiveSessionFamilies: number;
};

export function resolvePersistentSessionConfig(
  environment: NodeJS.ProcessEnv = process.env,
): PersistentSessionConfig {
  const flag = environment.PERSISTENT_SESSIONS_ENABLED?.trim();
  if (flag && flag !== 'true' && flag !== 'false') {
    throw new Error('PERSISTENT_SESSIONS_ENABLED must be true or false');
  }

  const enabled = flag === 'true';
  const production = environment.NODE_ENV === 'production';
  const frontendOrigin = enabled
    ? normalizeFrontendOrigin(environment.FRONTEND_ORIGIN, production)
    : null;

  return {
    enabled,
    frontendOrigin,
    cookieName: production ? '__Host-ngcs_refresh' : 'ngcs_refresh',
    cookieSecure: production || frontendOrigin?.startsWith('https:') === true,
    accessTokenTtl: enabled
      ? ACCESS_TOKEN_TTL_WITH_REFRESH
      : LEGACY_ACCESS_TOKEN_TTL,
    refreshIdleTtlMs: REFRESH_IDLE_TTL_MS,
    refreshAbsoluteTtlMs: REFRESH_ABSOLUTE_TTL_MS,
    retentionMs: RETENTION_MS,
    maxActiveSessionFamilies: MAX_ACTIVE_SESSION_FAMILIES,
  };
}

export function resolveBrowserOrigins(
  environment: NodeJS.ProcessEnv = process.env,
) {
  const session = resolvePersistentSessionConfig(environment);
  return session.enabled && session.frontendOrigin
    ? [session.frontendOrigin]
    : [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:3132',
        'http://localhost:3500',
        'http://localhost:9000',
        'http://localhost:9001',
      ];
}

function normalizeFrontendOrigin(
  configuredOrigin: string | undefined,
  production: boolean,
) {
  const value = configuredOrigin?.trim();
  if (!value) {
    throw new Error(
      'FRONTEND_ORIGIN is required when persistent sessions are enabled',
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('FRONTEND_ORIGIN must be an exact HTTP(S) origin');
  }

  if (
    parsed.origin !== value ||
    parsed.username ||
    parsed.password ||
    (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
  ) {
    throw new Error('FRONTEND_ORIGIN must be an exact HTTP(S) origin');
  }
  if (production && parsed.protocol !== 'https:') {
    throw new Error('FRONTEND_ORIGIN must use HTTPS in production');
  }
  if (
    !production &&
    parsed.protocol !== 'https:' &&
    !['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
  ) {
    throw new Error(
      'Non-production HTTP FRONTEND_ORIGIN is allowed only for loopback hosts',
    );
  }
  return parsed.origin;
}
