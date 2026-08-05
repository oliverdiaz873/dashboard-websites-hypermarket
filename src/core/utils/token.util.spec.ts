import { decodeToken, isTokenExpired } from './token.util';

const b64url = (obj: object): string => Buffer.from(JSON.stringify(obj)).toString('base64url');

const makeToken = (payload: object): string => `header.${b64url(payload)}.signature`;

describe('token.util', () => {
  describe('decodeToken', () => {
    it('decodifica el payload de un JWT válido', () => {
      const token = makeToken({ sub: 'u1', exp: 4102444800 });
      expect(decodeToken(token)).toEqual({ sub: 'u1', exp: 4102444800 });
    });

    it('devuelve null ante un token mal formado', () => {
      expect(decodeToken('not-a-jwt')).toBeNull();
    });

    it('devuelve null si el payload no es JSON válido', () => {
      expect(decodeToken(`header.${b64url('hola')}.sig`)).toBeNull();
    });

    it('no lanza ante payload corrupto', () => {
      expect(decodeToken('a.%%%.c')).toBeNull();
    });
  });

  describe('isTokenExpired', () => {
    it('marca como expirado un token cuyo exp ya pasó', () => {
      const token = makeToken({ exp: 1_000 });
      expect(isTokenExpired(token, 2_000_000)).toBe(true);
    });

    it('marca como vigente un token no expirado', () => {
      const token = makeToken({ exp: 4_102_444_800 });
      expect(isTokenExpired(token, Date.now())).toBe(false);
    });

    it('devuelve false sin token o sin exp', () => {
      expect(isTokenExpired(null)).toBe(false);
      expect(isTokenExpired(makeToken({ sub: 'u1' }))).toBe(false);
    });
  });
});
