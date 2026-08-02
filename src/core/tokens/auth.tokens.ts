import { InjectionToken } from '@angular/core';

/**
 * Fuente del token JWT para el AuthInterceptor.
 *
 * Hoy devuelve siempre `null` (el interceptor queda inerte: no añade ninguna
 * cabecera). La Phase de Authentication proveerá el valor real leyendo el token
 * almacenado. Así toda la infraestructura queda lista sin lógica de auth.
 */
export type AuthTokenSource = () => string | null;

export const AUTH_TOKEN = new InjectionToken<AuthTokenSource>('AUTH_TOKEN', {
  providedIn: 'root',
  factory: () => () => null,
});
