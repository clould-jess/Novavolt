import { TokenType } from '@prisma/client';
import { createHash, randomInt } from 'crypto';

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

export function createOtpCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, '0');
}

export function normalizeOtpCode(code: string): string {
  return code.trim().replace(/\D/g, '');
}

export function hashOtpCode(userId: string, type: TokenType, code: string): string {
  return createHash('sha256')
    .update(`${userId}:${type}:${normalizeOtpCode(code)}`, 'utf8')
    .digest('hex');
}
