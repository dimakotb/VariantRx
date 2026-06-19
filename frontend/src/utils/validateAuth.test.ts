import { describe, expect, it } from 'vitest';
import {
  isValidEmail,
  validatePassword,
  validateRegisterForm,
} from '@/utils/validateAuth';

describe('validateAuth', () => {
  it('validates email format', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('not-email')).toBe(false);
  });

  it('requires 8 character password on register', () => {
    expect(validatePassword('1234567')).toMatch(/at least 8/);
    expect(validatePassword('12345678')).toBeNull();
  });

  it('validates full register form', () => {
    expect(validateRegisterForm('jdoe', 'bad-email', '12345678')).toMatch(/valid email/);
    expect(validateRegisterForm('jdoe', 'u@lab.org', '12345678')).toBeNull();
  });
});
