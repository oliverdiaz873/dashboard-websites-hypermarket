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

import { LocalSearchAdapterSource } from '@features/search/local-search-adapter.source';

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
      // la fuente local. Cuando exista `GET /search`, se sustituye por un
      // `ApiSearchAdapterSource` sin tocar componentes ni stores.
      provide: SEARCH_GLOBAL_SOURCE,
      useClass: LocalSearchAdapterSource,
    },
  ],
};
