import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { errorInterceptor } from '@core/interceptors/error.interceptor';
import { loadingInterceptor } from '@core/interceptors/loading.interceptor';
import { SEARCH_GLOBAL_SOURCE } from '@core/search/services/global-search-source';

import { ApiSearchAdapterSource } from '@features/search/api-search-adapter.source';
import { CUSTOMER_DATA_SOURCE } from '@features/customers/data/customer-data-source.token';
import { ApiCustomerDataSource } from '@features/customers/data/api-customer-data-source';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, errorInterceptor])),
    {
      // Composition root: `core/search` permanece puro y `features/search` aporta
      // la fuente respaldada por el backend (GET /api/admin/search).
      provide: SEARCH_GLOBAL_SOURCE,
      useClass: ApiSearchAdapterSource,
    },
    {
      // Composition root de clientes: fuente real del backend Express
      // (GET/PATCH /api/admin/customers). Servicios, stores y componentes no
      // conocen la implementación concreta.
      provide: CUSTOMER_DATA_SOURCE,
      useClass: ApiCustomerDataSource,
    },
  ],
};
