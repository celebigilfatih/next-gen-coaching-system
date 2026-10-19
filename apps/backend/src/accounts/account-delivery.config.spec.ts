import { resolveAccountDeliveryConfig } from './account-delivery.config';

describe('account delivery configuration', () => {
  it('defaults to operator mode outside production', () => {
    expect(resolveAccountDeliveryConfig({ NODE_ENV: 'test' })).toEqual({
      mode: 'operator',
    });
  });

  it('rejects operator mode and missing mode in production', () => {
    expect(() =>
      resolveAccountDeliveryConfig({
        NODE_ENV: 'production',
        ACCOUNT_DELIVERY_MODE: 'operator',
      }),
    ).toThrow('not allowed in production');
    expect(() =>
      resolveAccountDeliveryConfig({ NODE_ENV: 'production' }),
    ).toThrow('must be operator or smtp');
  });

  it('resolves a complete SMTP configuration', () => {
    expect(
      resolveAccountDeliveryConfig({
        NODE_ENV: 'production',
        ACCOUNT_DELIVERY_MODE: 'smtp',
        ACCOUNT_PUBLIC_BASE_URL: 'https://coach.example.com',
        SMTP_HOST: 'smtp.example.com',
        SMTP_PORT: '465',
        SMTP_SECURE: 'true',
        SMTP_USER: 'mailer',
        SMTP_PASSWORD: 'secret-value',
        MAIL_FROM: 'NGCS <no-reply@example.com>',
      }),
    ).toEqual({
      mode: 'smtp',
      publicBaseUrl: 'https://coach.example.com',
      host: 'smtp.example.com',
      port: 465,
      secure: true,
      timeoutMs: 10_000,
      user: 'mailer',
      password: 'secret-value',
      from: 'NGCS <no-reply@example.com>',
    });
  });

  it('rejects partial credentials and insecure production URLs', () => {
    const base = {
      NODE_ENV: 'production',
      ACCOUNT_DELIVERY_MODE: 'smtp',
      ACCOUNT_PUBLIC_BASE_URL: 'https://coach.example.com',
      SMTP_HOST: 'smtp.example.com',
      SMTP_PORT: '587',
      SMTP_SECURE: 'false',
      MAIL_FROM: 'no-reply@example.com',
    };
    expect(() =>
      resolveAccountDeliveryConfig({ ...base, SMTP_USER: 'mailer' }),
    ).toThrow('must be provided together');
    expect(() =>
      resolveAccountDeliveryConfig({
        ...base,
        ACCOUNT_PUBLIC_BASE_URL: 'http://coach.example.com',
      }),
    ).toThrow('HTTPS origin');
    expect(() =>
      resolveAccountDeliveryConfig({
        ...base,
        ACCOUNT_PUBLIC_BASE_URL: 'ftp://localhost',
      }),
    ).toThrow('HTTPS origin');
  });
});
