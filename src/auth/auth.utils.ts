import { createHash, randomBytes } from 'crypto';

const commonPasswords = new Set([
  'password123!',
  'password1234!',
  'qwerty123456!',
  'novavolt123!',
  'azerty123456!',
]);

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function assertPasswordIsNotCommon(password: string): void {
  if (commonPasswords.has(password.toLowerCase())) {
    throw new Error('Password is too common');
  }
}

export function createOpaqueToken(): string {
  return randomBytes(32).toString('base64url');
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}
