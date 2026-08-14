import { Injectable, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';

import { EMPTY_SEARCH_RESULTS, GlobalSearchResults } from '../models/global-search-result.model';

/**
 * Fuente de búsqueda (Dependency Inversion). Permite cambiar de motor sin tocar
 * store/componente: se registra la implementación vía el provider
 * `SEARCH_GLOBAL_SOURCE` (p. ej. `ApiSearchAdapterSource` respaldado por el
 * backend GET /api/admin/search).
 */
export interface GlobalSearchSource {
  /** Busca entidades que coincidan con la `query` normalizada. */
  search(query: string): Observable<GlobalSearchResults>;
}

export const SEARCH_GLOBAL_SOURCE = new InjectionToken<GlobalSearchSource>('SEARCH_GLOBAL_SOURCE', {
  providedIn: 'root',
  factory: () => new EmptyGlobalSearchSource(),
});

/**
 * Fuente por defecto (sin resultados). Mantiene el `core/search` puro (no
 * importa features) y garantiza que la DI nunca falle. Se sustituye desde la
 * configuración de la aplicación con una fuente real.
 */
@Injectable({ providedIn: 'root' })
class EmptyGlobalSearchSource implements GlobalSearchSource {
  search(): Observable<GlobalSearchResults> {
    return of(EMPTY_SEARCH_RESULTS);
  }
}
