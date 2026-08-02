import type { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';

import { LoadingStore } from '../state/loading/loading.store';
import { SKIP_LOADING } from '../http/tokens/http-context.tokens';

/**
 * Mantiene un contador de peticiones activas en el LoadingStore.
 * Las peticiones marcadas con el contexto `SKIP_LOADING` no lo afectan.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingStore = inject(LoadingStore);

  if (req.context.get(SKIP_LOADING)) {
    return next(req);
  }

  loadingStore.begin();
  return next(req).pipe(finalize(() => loadingStore.end()));
};
