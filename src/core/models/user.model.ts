import type { UserRole } from './user-role';

/**
 * Identidad compartida del usuario autenticado.
 *
 * Modelo transversal usado por auth (AuthStore/AuthService), guards, sidebar y
 * topbar. No es un modelo del CRUD de usuarios, sino la representación pública
 * (`PublicUser`) que devuelve el backend (sin password).
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}
