/**
 * Decodificación segura del payload de un JWT (parte 2, base64url).
 *
 * Nunca lanza: ante cualquier JWT mal formado devuelve `null`. El consumidor
 * debe tratar `null` como "no se puede leer" y NO provocar un logout por error
 * secundario.
 */
export interface DecodedToken {
  exp?: number;
  [key: string]: unknown;
}

export function decodeToken(token: string): DecodedToken | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2 || !parts[1]) return null;

    const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), '=');
    if (typeof atob !== 'function') return null;

    const decoded = JSON.parse(atob(padded)) as unknown;
    return decoded !== null && typeof decoded === 'object' ? (decoded as DecodedToken) : null;
  } catch {
    return null;
  }
}

/**
 * Indica si el token está expirado según su claim `exp` (segundos epoch).
 * Si no hay token, no se puede leer o no tiene `exp`, devuelve `false`: no se
 * considera expirado para no eliminar sesiones sin información clara.
 */
export function isTokenExpired(token: string | null, now: number = Date.now()): boolean {
  if (!token) return false;
  const decoded = decodeToken(token);
  if (!decoded || typeof decoded.exp !== 'number') return false;
  return decoded.exp * 1000 <= now;
}
