import type { CanActivateFn, Route } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import type { UserRole } from '../models/user-role';
import { AuthStore } from '../state/auth/auth.store';

/**
 * Guard de autorización por roles. Espera que la ruta declare los roles
 * permitidos en `data.roles` (p. ej. `roles: ['admin']`). Si el usuario actual
 * no tiene un rol permitido, redirige al dashboard.
 *
 * OJO: este guard asume que la sesión ya fue inicializada (authGuard). Por eso
 * en las rutas protegidas se encadenan `[authGuard, roleGuard]`.
 */
export const roleGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const roles = (route.data?.['roles'] as UserRole[] | undefined) ?? [];
  if (authStore.hasRole(roles)) {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};

/**
 * Helper de tipado para rutas con `data.roles`: evita typos y mantiene el
 * contrato en un solo sitio. Uso: `{ ...childRoute, data: { roles: ['admin'] } satisfies RoleRoute }`.
 */
export type RoleRoute = Route & { data: { roles: UserRole[] } };
