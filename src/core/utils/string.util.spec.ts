import { capitalize, slugify, titleCase, truncate } from './string.util';

describe('string util', () => {
  it('capitalize pone la primera letra en mayúscula', () => {
    expect(capitalize('hola')).toBe('Hola');
    expect(capitalize('')).toBe('');
  });

  it('titleCase pone cada palabra en mayúscula inicial', () => {
    expect(titleCase('hola MUNDO')).toBe('Hola Mundo');
  });

  it('slugify genera slugs ascii', () => {
    expect(slugify('  Café Con Leche!  ')).toBe('cafe-con-leche');
    expect(slugify('Hola--mundo')).toBe('hola-mundo');
  });

  it('truncate recorta con sufijo', () => {
    expect(truncate('abcdef', 3)).toBe('abc…');
    expect(truncate('abc', 3)).toBe('abc');
  });
});
