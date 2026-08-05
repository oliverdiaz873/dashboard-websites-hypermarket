import { InjectionToken } from '@angular/core';

import { environment } from '@env/environment';

export interface ApiConfig {
  baseUrl: string;
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  defaultHeaders: Record<string, string>;
}

export const API_DEFAULTS: ApiConfig = {
  baseUrl: environment.apiBaseUrl,
  timeoutMs: 10_000,
  // El reintento de GET es opt-in (por petición, vía `retryAttempts`), no el
  // default: activarlo globalmente rompe el contrato de los specs que simulan
  // un fallo de red (status 0) y esperan una única petición.
  retryAttempts: 0,
  retryDelayMs: 300,
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
};

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => API_DEFAULTS,
});
