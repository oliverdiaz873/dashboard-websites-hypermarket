import type { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStore } from '../state/auth/auth.store';

/**
 * Protege rutas restringidas. Si la sesión aún no se inicializó (p. ej. refresco
 * de página con token persistido) la restaura primero. Si el usuario no está
 * autenticado redirige a `/login` conservando la URL de destino en `returnUrl`
 * para volver tras autenticarse.
 */
export const authGuard: CanActivateFn = async (route, state) => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.initialized()) {
    await authStore.initializeSession();
  }

  if (authStore.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url },
  });
};
