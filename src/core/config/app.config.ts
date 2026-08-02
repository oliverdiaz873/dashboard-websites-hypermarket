import { InjectionToken } from '@angular/core';

export interface AppConfig {
  appName: string;
  defaultLocale: string;
  defaultCurrency: string;
  storagePrefix: string;
}

export const APP_DEFAULTS: AppConfig = {
  appName: 'Hipermercado Superior',
  defaultLocale: 'es-DO',
  defaultCurrency: 'DOP',
  storagePrefix: 'hs',
};

export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => APP_DEFAULTS,
});
