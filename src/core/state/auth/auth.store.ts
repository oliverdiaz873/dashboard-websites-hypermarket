import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import type { LoginResponse } from '../../models/auth.model';
import type { User } from '../../models/user.model';
import type { UserRole } from '../../models/user-role';
import { AuthService } from '../../services/auth.service';
import { AuthTokenService } from '../../services/auth-token.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  /** true una vez que se intentó restaurar la sesión (desde un token persistido). */
  initialized: boolean;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({ user: null, token: null, isLoading: false, initialized: false }),
  withComputed(({ user, token }) => ({
    isAuthenticated: computed(() => token() !== null && user() !== null),
    currentUser: computed<User | null>(() => user()),
    currentRole: computed<UserRole | null>(() => user()?.role ?? null),
  })),
  withMethods((store) => {
    const authService = inject(AuthService);
    const authTokenService = inject(AuthTokenService);

    /** Proceso de restauración en curso: cierre interno del store (no es estado → no provoca renders). */
    let sessionPromise: Promise<void> | undefined;

    return {
      /** El cliente nunca toca localStorage: la persistencia va vía AuthTokenService. */
      login: async (credentials: { email: string; password: string }): Promise<void> => {
        patchState(store, { isLoading: true });
        try {
          const result = await firstValueFrom(authService.login(credentials));
          authTokenService.setToken(result.token);
          patchState(store, { user: result.user, token: result.token });
        } finally {
          patchState(store, { isLoading: false });
        }
      },

      setAuthenticated(result: LoginResponse): void {
        authTokenService.setToken(result.token);
        patchState(store, { user: result.user, token: result.token });
      },

      logout: (): void => {
        authTokenService.removeToken();
        patchState(store, { user: null, token: null });
      },

      /**
       * Restaura la sesión desde el token persistido. No lanza si el token es
       * inválido/expirado: deja al usuario sin sesión y deja el filtro al guard.
       *
       * Protegida contra doble llamada: si dos guards (o un refresh en paralelo)
       * invocan `initializeSession` a la vez, ambos comparten la misma
       * restauración y solo se dispara un `GET /auth/me`. El flag `sessionPromise`
       * es un cierre interno del store (no es estado → no provoca renders).
       */
      initializeSession(): Promise<void> {
        if (store.initialized()) {
          return Promise.resolve();
        }
        if (sessionPromise) {
          return sessionPromise;
        }
        sessionPromise = restoreSession();
        return sessionPromise;
      },

      /** RBAC: roles vacío = acceso público; si no coincide, denegado. */
      hasRole: (roles: readonly UserRole[]): boolean => {
        if (roles.length === 0) return true;
        return store.currentRole() !== null && roles.includes(store.currentRole() as UserRole);
      },
    };

    /** Restaura la sesión leyendo el token persistido y validándolo contra el backend. */
    async function restoreSession(): Promise<void> {
      patchState(store, { isLoading: true });
      const token = authTokenService.getToken();
      try {
        if (!token) return;
        const user = await firstValueFrom(authService.getProfile());
        patchState(store, { user, token });
      } catch {
        authTokenService.removeToken();
        patchState(store, { token: null });
      } finally {
        sessionPromise = undefined;
        patchState(store, { initialized: true, isLoading: false });
      }
    }
  }),
);
