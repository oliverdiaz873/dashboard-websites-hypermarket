import { Injectable } from '@angular/core';

import { STORAGE_KEYS } from '../constants/storage-keys';
import { getStorageItem, removeStorageItem, setStorageItem } from '../utils/storage.util';

/**
 * Única puerta de acceso al token en `localStorage`.
 *
 * El AuthStore y el AuthInterceptor nunca escriben `localStorage` directamente:
 * siempre pasan por aquí. Esto centraliza la serialización (`setStorageItem`
 * usa JSON) y facilita migrar a cookie/httpOnly en el futuro sin tocar el resto.
 */
@Injectable({ providedIn: 'root' })
export class AuthTokenService {
  getToken(): string | null {
    return getStorageItem<string>(STORAGE_KEYS.authToken);
  }

  setToken(token: string): void {
    setStorageItem<string>(STORAGE_KEYS.authToken, token);
  }

  removeToken(): void {
    removeStorageItem(STORAGE_KEYS.authToken);
  }
}
