import {
  hasMaxLength,
  hasMinLength,
  isEmail,
  isInRange,
  isRequired,
  isUrl,
  matchesPattern,
} from './validation.util';

describe('validation util', () => {
  it('isEmail valida emails', () => {
    expect(isEmail('a@b.com')).toBe(true);
    expect(isEmail('nope')).toBe(false);
    expect(isEmail('')).toBe(false);
  });

  it('isUrl valida URLs http/https', () => {
    expect(isUrl('https://example.com')).toBe(true);
    expect(isUrl('http://example.com')).toBe(true);
    expect(isUrl('ftp://example.com')).toBe(false);
    expect(isUrl('not a url')).toBe(false);
  });

  it('isRequired valida presencia', () => {
    expect(isRequired('x')).toBe(true);
    expect(isRequired(0)).toBe(true);
    expect(isRequired('')).toBe(false);
    expect(isRequired('  ')).toBe(false);
    expect(isRequired(null)).toBe(false);
    expect(isRequired(undefined)).toBe(false);
  });

  it('hasMinLength y hasMaxLength validan longitudes', () => {
    expect(hasMinLength('abc', 3)).toBe(true);
    expect(hasMinLength('ab', 3)).toBe(false);
    expect(hasMaxLength('abc', 3)).toBe(true);
    expect(hasMaxLength('abcd', 3)).toBe(false);
  });

  it('isInRange valida rangos numéricos', () => {
    expect(isInRange(5, 0, 10)).toBe(true);
    expect(isInRange(15, 0, 10)).toBe(false);
  });

  it('matchesPattern valida con regex', () => {
    expect(matchesPattern('abc', /^abc$/)).toBe(true);
    expect(matchesPattern('xyz', /^abc$/)).toBe(false);
  });
});
