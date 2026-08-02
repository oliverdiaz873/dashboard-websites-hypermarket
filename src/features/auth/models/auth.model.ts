import type { User } from '@core/models/user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

/** Respuesta del backend para `/auth/login`: token + usuario público. */
export interface LoginResponse {
  token: string;
  user: User;
}
