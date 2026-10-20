export type OperatorAccountDeliveryConfig = {
  mode: 'operator';
};

export type SmtpAccountDeliveryConfig = {
  mode: 'smtp';
  publicBaseUrl: string;
  host: string;
  port: number;
  secure: boolean;
  timeoutMs: number;
  user?: string;
  password?: string;
  from: string;
};

export type AccountDeliveryConfig =
  | OperatorAccountDeliveryConfig
  | SmtpAccountDeliveryConfig;

export const ACCOUNT_DELIVERY_CONFIG = Symbol('ACCOUNT_DELIVERY_CONFIG');
export const ACCOUNT_MAIL_TRANSPORT = Symbol('ACCOUNT_MAIL_TRANSPORT');

function required(env: NodeJS.ProcessEnv, key: string) {
  const value = env[key]?.trim();
  if (!value)
    throw new Error(`${key} is required when SMTP delivery is enabled`);
  return value;
}

function parseBoolean(value: string, key: string) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  throw new Error(`${key} must be true or false`);
}

function parsePublicBaseUrl(value: string, production: boolean) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error('ACCOUNT_PUBLIC_BASE_URL must be a valid absolute URL');
  }
  const loopback = ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash) {
    throw new Error(
      'ACCOUNT_PUBLIC_BASE_URL must not include credentials, query or fragment',
    );
  }
  if (
    url.pathname !== '/' ||
    (url.protocol !== 'https:' && !(url.protocol === 'http:' && loopback))
  ) {
    throw new Error(
      'ACCOUNT_PUBLIC_BASE_URL must be an HTTPS origin or a loopback HTTP origin',
    );
  }
  if (production && url.protocol !== 'https:') {
    throw new Error('ACCOUNT_PUBLIC_BASE_URL must use HTTPS in production');
  }
  return url.origin;
}

export function resolveAccountDeliveryConfig(
  env: NodeJS.ProcessEnv = process.env,
): AccountDeliveryConfig {
  const production = env.NODE_ENV === 'production';
  const rawMode = env.ACCOUNT_DELIVERY_MODE?.trim().toLowerCase();
  const mode = rawMode || (production ? '' : 'operator');

  if (mode !== 'operator' && mode !== 'smtp') {
    throw new Error('ACCOUNT_DELIVERY_MODE must be operator or smtp');
  }
  if (mode === 'operator') {
    if (production) {
      throw new Error(
        'ACCOUNT_DELIVERY_MODE=operator is not allowed in production',
      );
    }
    return { mode };
  }

  const portText = required(env, 'SMTP_PORT');
  const port = Number(portText);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error('SMTP_PORT must be an integer between 1 and 65535');
  }
  const user = env.SMTP_USER?.trim();
  const password = env.SMTP_PASSWORD?.trim();
  if (Boolean(user) !== Boolean(password)) {
    throw new Error('SMTP_USER and SMTP_PASSWORD must be provided together');
  }

  const timeoutText = env.SMTP_TIMEOUT_MS?.trim() || '10000';
  const timeoutMs = Number(timeoutText);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1_000 || timeoutMs > 60_000) {
    throw new Error(
      'SMTP_TIMEOUT_MS must be an integer between 1000 and 60000',
    );
  }

  return {
    mode,
    publicBaseUrl: parsePublicBaseUrl(
      required(env, 'ACCOUNT_PUBLIC_BASE_URL'),
      production,
    ),
    host: required(env, 'SMTP_HOST'),
    port,
    secure: parseBoolean(required(env, 'SMTP_SECURE'), 'SMTP_SECURE'),
    timeoutMs,
    ...(user && password ? { user, password } : {}),
    from: required(env, 'MAIL_FROM'),
  };
}
