import {
  assertPasswordIsNotCommon,
  createOpaqueToken,
  hashOpaqueToken,
  normalizeEmail,
} from './auth.utils';

describe('auth utilities', () => {
  it('normalizes an email address', () => {
    expect(normalizeEmail('  USER@NovaVolt.CA ')).toBe('user@novavolt.ca');
  });

  it('creates high-entropy, distinct opaque tokens', () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();
    expect(first).toHaveLength(43);
    expect(second).toHaveLength(43);
    expect(first).not.toBe(second);
  });

  it('hashes opaque tokens deterministically without retaining the token', () => {
    const token = 'a'.repeat(43);
    const hash = hashOpaqueToken(token);
    expect(hash).toHaveLength(64);
    expect(hash).toBe(hashOpaqueToken(token));
    expect(hash).not.toContain(token);
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
