import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';

import { AUTH_TOKEN } from '../tokens/auth.tokens';
import { SKIP_AUTH } from '../http/tokens/http-context.tokens';

/**
 * Añade `Authorization: Bearer <token>` si existe un token (vía AUTH_TOKEN).
 * Las peticiones marcadas con `SKIP_AUTH` se omiten.
 * Hoy el proveedor de AUTH_TOKEN devuelve `null`, así que el interceptor queda
 * inerte hasta la Phase de Authentication.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const tokenSource = inject(AUTH_TOKEN);
  const token = tokenSource();
  if (!token) {
    return next(req);
  }

  return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
};
