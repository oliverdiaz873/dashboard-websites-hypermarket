import { clamp, isEmpty, isNil, uniqueId } from './common.util';

describe('common util', () => {
  it('isNil detecta null y undefined', () => {
    expect(isNil(null)).toBe(true);
    expect(isNil(undefined)).toBe(true);
    expect(isNil(0)).toBe(false);
    expect(isNil('')).toBe(false);
  });

  it('isEmpty detecta valores vacíos', () => {
    expect(isEmpty('')).toBe(true);
    expect(isEmpty('   ')).toBe(true);
    expect(isEmpty([])).toBe(true);
    expect(isEmpty({})).toBe(true);
    expect(isEmpty(null)).toBe(true);
    expect(isEmpty(undefined)).toBe(true);
    expect(isEmpty('a')).toBe(false);
    expect(isEmpty([1])).toBe(false);
  });

  it('clamp acota el valor al rango', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('uniqueId genera identificadores únicos y con prefijo', () => {
    const a = uniqueId();
    const b = uniqueId();
    expect(a).not.toBe(b);
    expect(a.startsWith('id-')).toBe(true);
    expect(uniqueId('notif').startsWith('notif-')).toBe(true);
  });
});
