const insecureSecretMarkers = ['replace', 'change_me', 'secret', 'password'];

function requireString(config: Record<string, unknown>, key: string): string {
  const value = String(config[key] ?? '').trim();
  if (!value) {
    throw new Error(`${key} is required`);
  }
  return value;
}

function positiveInteger(
  config: Record<string, unknown>,
  key: string,
  fallback: number,
): number {
  const value = Number(config[key] ?? fallback);
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new Error(`${key} must be a positive integer`);
  }
  return value;
}

function booleanValue(
  config: Record<string, unknown>,
  key: string,
  fallback: boolean,
): boolean {
  const value = String(config[key] ?? fallback).toLowerCase();
  if (!['true', 'false'].includes(value)) {
    throw new Error(`${key} must be true or false`);
  }
  return value === 'true';
}

function assertSecret(secret: string, key: string, production: boolean): void {
  const minimumLength = production ? 64 : 32;
  if (secret.length < minimumLength) {
    throw new Error(`${key} must contain at least ${minimumLength} characters`);
  }
  if (
    production &&
    insecureSecretMarkers.some((marker) => secret.toLowerCase().includes(marker))
  ) {
    throw new Error(`${key} still contains an insecure placeholder`);
  }
}

export function validateEnvironment(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const config = { ...input };
  const nodeEnv = String(config.NODE_ENV ?? 'development').toLowerCase();
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error('NODE_ENV must be development, test, or production');
  }

  const production = nodeEnv === 'production';
  const databaseUrl = requireString(config, 'DATABASE_URL');
  if (!databaseUrl.startsWith('postgresql://') && !databaseUrl.startsWith('postgres://')) {
    throw new Error('DATABASE_URL must be a PostgreSQL connection URL');
  }

  const accessSecret = requireString(config, 'JWT_ACCESS_SECRET');
  const refreshSecret = requireString(config, 'JWT_REFRESH_SECRET');
  assertSecret(accessSecret, 'JWT_ACCESS_SECRET', production);
  assertSecret(refreshSecret, 'JWT_REFRESH_SECRET', production);
  if (accessSecret === refreshSecret) {
    throw new Error('JWT access and refresh secrets must be different');
  }

  const origins = requireString(config, 'CORS_ORIGINS')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (origins.includes('*')) {
    throw new Error('CORS_ORIGINS cannot contain a wildcard');
  }
  if (production && origins.some((origin) => !origin.startsWith('https://'))) {
    throw new Error('Every production CORS origin must use HTTPS');
  }

  const paymentsEnabled = booleanValue(config, 'PAYMENTS_ENABLED', false);
  if (paymentsEnabled) {
    requireString(config, 'STRIPE_SECRET_KEY');
    requireString(config, 'STRIPE_WEBHOOK_SECRET');
  }

  const documentUploadsEnabled = booleanValue(
    config,
    'DOCUMENT_UPLOADS_ENABLED',
    false,
  );
  if (documentUploadsEnabled) {
    requireString(config, 'OBJECT_STORAGE_BUCKET');
    requireString(config, 'OBJECT_STORAGE_REGION');
  }
  const malwareScanRequired = booleanValue(
    config,
    'MALWARE_SCAN_REQUIRED',
    production && documentUploadsEnabled,
  );
  if (production && documentUploadsEnabled && !malwareScanRequired) {
    throw new Error('MALWARE_SCAN_REQUIRED must be enabled with production uploads');
  }
  if (malwareScanRequired) {
    const scannerSecret = requireString(config, 'MALWARE_SCANNER_WEBHOOK_SECRET');
    if (scannerSecret.length < 32) {
      throw new Error(
        'MALWARE_SCANNER_WEBHOOK_SECRET must contain at least 32 characters',
      );
    }
  }

  const requireEmailVerification = booleanValue(
    config,
    'REQUIRE_EMAIL_VERIFICATION',
    production,
  );
  const notificationsEnabled = booleanValue(
    config,
    'NOTIFICATIONS_ENABLED',
    false,
  );
  if (production && requireEmailVerification && !notificationsEnabled) {
    throw new Error(
      'NOTIFICATIONS_ENABLED is required for production email verification',
    );
  }
  if (notificationsEnabled) {
    const webhookUrl = requireString(config, 'NOTIFICATION_WEBHOOK_URL');
    const webhookSecret = requireString(config, 'NOTIFICATION_WEBHOOK_SECRET');
    const payloadEncryptionKey = requireString(
      config,
      'NOTIFICATION_PAYLOAD_ENCRYPTION_KEY',
    );
    let parsedWebhookUrl: URL;
    try {
      parsedWebhookUrl = new URL(webhookUrl);
    } catch {
      throw new Error('NOTIFICATION_WEBHOOK_URL must be a valid URL');
    }
    if (production && parsedWebhookUrl.protocol !== 'https:') {
      throw new Error('Production notification webhook must use HTTPS');
    }
    if (webhookSecret.length < 32) {
      throw new Error(
        'NOTIFICATION_WEBHOOK_SECRET must contain at least 32 characters',
      );
    }
    if (!/^[a-fA-F0-9]{64}$/.test(payloadEncryptionKey)) {
      throw new Error(
        'NOTIFICATION_PAYLOAD_ENCRYPTION_KEY must be exactly 64 hexadecimal characters',
      );
    }
  }

  if (
    production &&
    booleanValue(config, 'EXPOSE_DEVELOPMENT_TOKENS', false)
  ) {
    throw new Error('EXPOSE_DEVELOPMENT_TOKENS cannot be enabled in production');
  }

  return {
    ...config,
    NODE_ENV: nodeEnv,
    PORT: positiveInteger(config, 'PORT', 4000),
    JWT_ACCESS_TTL_SECONDS: positiveInteger(
      config,
      'JWT_ACCESS_TTL_SECONDS',
      900,
    ),
    JWT_REFRESH_TTL_SECONDS: positiveInteger(
      config,
      'JWT_REFRESH_TTL_SECONDS',
      604800,
    ),
    AUTH_LOCK_MINUTES: positiveInteger(config, 'AUTH_LOCK_MINUTES', 15),
    AUTH_MAX_FAILED_ATTEMPTS: positiveInteger(
      config,
      'AUTH_MAX_FAILED_ATTEMPTS',
      5,
    ),
    MAX_ACTIVE_SESSIONS: positiveInteger(config, 'MAX_ACTIVE_SESSIONS', 10),
    REQUIRE_EMAIL_VERIFICATION: requireEmailVerification,
    EXPOSE_DEVELOPMENT_TOKENS: booleanValue(
      config,
      'EXPOSE_DEVELOPMENT_TOKENS',
      false,
    ),
    PAYMENTS_ENABLED: paymentsEnabled,
    DOCUMENT_UPLOADS_ENABLED: documentUploadsEnabled,
    MALWARE_SCAN_REQUIRED: malwareScanRequired,
    NOTIFICATIONS_ENABLED: notificationsEnabled,
    ENABLE_SWAGGER: booleanValue(config, 'ENABLE_SWAGGER', !production),
    CORS_ORIGINS: origins.join(','),
  };
}
