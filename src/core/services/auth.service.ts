import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
} from '@features/auth/models/auth.model';
import { API_ENDPOINTS } from '../http/endpoints';
import { BaseApiService } from '../http/services/base-api.service';
import type { User } from '../models/user.model';

/**
 * Acceso a los endpoints de autenticación del backend Express.
 *
 * `login`/`register` no llevan token; `me` lo adjunta el AuthInterceptor
 * leyendo el token persistido. Todas las rutas se resuelven contra
 * `API_ENDPOINTS.auth` (`/auth`).
 */
@Injectable({ providedIn: 'root' })
export class AuthService extends BaseApiService {
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.post<LoginResponse>(`${API_ENDPOINTS.auth}/login`, credentials, {
      skipAuth: true,
    });
  }

  register(data: RegisterRequest): Observable<User> {
    return this.post<User>(`${API_ENDPOINTS.auth}/register`, data, {
      skipAuth: true,
    });
  }

  getProfile(): Observable<User> {
    return this.get<User>(`${API_ENDPOINTS.auth}/me`);
  }
}
