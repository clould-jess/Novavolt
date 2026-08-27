import { validateEnvironment } from './env.validation';

const base = {
  NODE_ENV: 'development',
  DATABASE_URL: 'postgresql://user:pass@neon.example.com:5432/novavolt',
  DIRECT_URL: 'postgresql://user:pass@neon.example.com:5432/novavolt',
  JWT_ACCESS_SECRET: 'a'.repeat(64),
  JWT_REFRESH_SECRET: 'b'.repeat(64),
  CORS_ORIGINS: 'http://localhost:3000',
  IMAGEKIT_PUBLIC_KEY: 'public_5msQhUtDlCR6lSYWUVSxs5HDVuA=',
  IMAGEKIT_PRIVATE_KEY: 'private_0EjJMYYdk0OZ/q5w2zvUbemgd6g=',
  IMAGEKIT_URL_ENDPOINT: 'https://ik.imagekit.io/p4swwhwet',
  IMAGEKIT_VEHICLES_FOLDER: 'vehicle',
  DEFAULT_ADMIN_EMAIL: 'admin@novavolt.local',
  DEFAULT_ADMIN_PASSWORD: 'ChangeThisDefaultAdminPass1!',
  DEFAULT_ADMIN_FIRST_NAME: 'Admin',
  DEFAULT_ADMIN_LAST_NAME: 'Novavolt',
};

describe('environment validation', () => {
  it('normalizes a valid development configuration', () => {
    const result = validateEnvironment(base);
    expect(result.PORT).toBe(4000);
    expect(result.JWT_ACCESS_TTL_SECONDS).toBe(900);
    expect(result.PAYMENTS_ENABLED).toBe(false);
  });

  it('requires independent JWT secrets', () => {
    expect(() =>
      validateEnvironment({ ...base, JWT_REFRESH_SECRET: base.JWT_ACCESS_SECRET }),
    ).toThrow('must be different');
  });

  it('allows wildcard CORS in development', () => {
    const result = validateEnvironment({ ...base, CORS_ORIGINS: '*' });
    expect(result.CORS_ORIGINS).toBe('*');
  });

  it('rejects wildcard CORS in production', () => {
    expect(() =>
      validateEnvironment({ ...base, NODE_ENV: 'production', CORS_ORIGINS: '*' }),
    ).toThrow('cannot contain a wildcard');
  });

  it('requires HTTPS origins in production', () => {
    expect(() =>
      validateEnvironment({ ...base, NODE_ENV: 'production' }),
    ).toThrow('must use HTTPS');
  });

  it('requires Stripe secrets when payments are enabled', () => {
    expect(() =>
      validateEnvironment({ ...base, PAYMENTS_ENABLED: 'true' }),
    ).toThrow('STRIPE_SECRET_KEY is required');
  });

  it('rejects development-token exposure in production', () => {
    expect(() =>
      validateEnvironment({
        ...base,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://novavolt.ca',
        REQUIRE_EMAIL_VERIFICATION: 'false',
        EXPOSE_DEVELOPMENT_TOKENS: 'true',
      }),
    ).toThrow('cannot be enabled in production');
  });

  it('requires malware scanning with production document uploads', () => {
    expect(() =>
      validateEnvironment({
        ...base,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://novavolt.ca',
        REQUIRE_EMAIL_VERIFICATION: 'false',
        DOCUMENT_UPLOADS_ENABLED: 'true',
        OBJECT_STORAGE_BUCKET: 'private-documents',
        OBJECT_STORAGE_REGION: 'ca-central-1',
        MALWARE_SCAN_REQUIRED: 'false',
      }),
    ).toThrow('MALWARE_SCAN_REQUIRED must be enabled');
  });

  it('requires a notification provider for production verification mail', () => {
    expect(() =>
      validateEnvironment({
        ...base,
        NODE_ENV: 'production',
        CORS_ORIGINS: 'https://novavolt.ca',
      }),
    ).toThrow('NOTIFICATIONS_ENABLED is required');
  });

  it('requires valid ImageKit credentials', () => {
    expect(() =>
      validateEnvironment({
        ...base,
        IMAGEKIT_PUBLIC_KEY: 'invalid',
      }),
    ).toThrow('must start with public_');
  });

  it('requires a 256-bit notification payload encryption key', () => {
    expect(() =>
      validateEnvironment({
        ...base,
        NOTIFICATIONS_ENABLED: 'true',
        NOTIFICATION_WEBHOOK_URL: 'http://localhost:4100/deliver',
        NOTIFICATION_WEBHOOK_SECRET: 'n'.repeat(32),
        NOTIFICATION_PAYLOAD_ENCRYPTION_KEY: 'not-a-key',
      }),
    ).toThrow('must be exactly 64 hexadecimal characters');
  });
});
