import { InjectionToken, inject } from '@angular/core';

import { AuthTokenService } from '../services/auth-token.service';

/**
 * Fuente del token JWT para el AuthInterceptor.
 *
 * Lee el token persistido a través de AuthTokenService (única puerta a
 * localStorage), por lo que el interceptor puede adjuntar `Authorization: Bearer`
 * en cada petición autenticada. Si no hay token, devuelve `null` y el interceptor
 * queda inerte para esa petición.
 */
export type AuthTokenSource = () => string | null;

export const AUTH_TOKEN = new InjectionToken<AuthTokenSource>('AUTH_TOKEN', {
  providedIn: 'root',
  factory: () => () => inject(AuthTokenService).getToken(),
});
