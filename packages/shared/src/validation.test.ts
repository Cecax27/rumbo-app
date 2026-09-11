import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPassword,
  isValidName,
  MIN_PASSWORD_LENGTH,
} from './validation';

describe('validation', () => {
  describe('isValidEmail', () => {
    it('accepts a valid email', () => {
      expect(isValidEmail('person@example.com')).toBe(true);
    });

    it('rejects empty or whitespace-only', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
    });

    it('rejects malformed emails', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('missing@tld')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it(`requires at least ${MIN_PASSWORD_LENGTH} characters`, () => {
      expect(isValidPassword('a'.repeat(MIN_PASSWORD_LENGTH - 1))).toBe(false);
      expect(isValidPassword('a'.repeat(MIN_PASSWORD_LENGTH))).toBe(true);
    });

    it('rejects empty passwords', () => {
      expect(isValidPassword('')).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('accepts non-empty names', () => {
      expect(isValidName('Ada')).toBe(true);
    });

    it('rejects empty or whitespace-only names', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('   ')).toBe(false);
    });
  });
});
