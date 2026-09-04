import { randomBytes } from 'crypto';

const MINIMUM_JWT_SECRET_LENGTH = 32;
const KNOWN_PLACEHOLDERS = new Set([
  'devsecret',
  'your-secret-key-change-in-production',
  'your-super-secret-jwt-key-change-in-production-min-32-chars',
]);

export function resolveJwtSecret(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const configuredSecret = environment.JWT_SECRET?.trim();

  if (configuredSecret) {
    if (
      configuredSecret.length < MINIMUM_JWT_SECRET_LENGTH ||
      KNOWN_PLACEHOLDERS.has(configuredSecret)
    ) {
      throw new Error(
        `JWT_SECRET must be at least ${MINIMUM_JWT_SECRET_LENGTH} characters and must not be a known placeholder`,
      );
    }

    return configuredSecret;
  }

  if (environment.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }

  return randomBytes(MINIMUM_JWT_SECRET_LENGTH).toString('hex');
}
