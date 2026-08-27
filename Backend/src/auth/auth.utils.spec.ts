import {
  assertPasswordIsNotCommon,
  createOtpCode,
  hashOtpCode,
  normalizeEmail,
  normalizeOtpCode,
} from './auth.utils';
import { TokenType } from '@prisma/client';

describe('auth utilities', () => {
  it('normalizes an email address', () => {
    expect(normalizeEmail('  USER@NovaVolt.CA ')).toBe('user@novavolt.ca');
  });

  it('creates distinct 6-digit otp codes', () => {
    const first = createOtpCode();
    const second = createOtpCode();
    expect(first).toMatch(/^\d{6}$/);
    expect(second).toMatch(/^\d{6}$/);
    expect(first).not.toBe(second);
  });

  it('normalizes otp codes by removing non-digits', () => {
    expect(normalizeOtpCode(' 12 34-56 ')).toBe('123456');
  });

  it('hashes otp codes deterministically without retaining the code', () => {
    const code = '123456';
    const hash = hashOtpCode('user-1', TokenType.EMAIL_VERIFICATION, code);
    expect(hash).toHaveLength(64);
    expect(hash).toBe(
      hashOtpCode('user-1', TokenType.EMAIL_VERIFICATION, code),
    );
    expect(hash).not.toContain(code);
  });

  it('rejects a common password', () => {
    expect(() => assertPasswordIsNotCommon('Password123!')).toThrow(
      'Password is too common',
    );
  });

  it('accepts a non-common password', () => {
    expect(() => assertPasswordIsNotCommon('R3ntal!Unique#2026')).not.toThrow();
  });
});
