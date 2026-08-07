import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { GlobalSearchResults } from '../models/global-search-result.model';
import { GlobalSearchSource, SEARCH_GLOBAL_SOURCE } from './global-search-source';

/**
 * Orquesta la búsqueda global delegando en la fuente configurada
 * (`SEARCH_GLOBAL_SOURCE`). El store aplica el debounce; aquí solo se resuelve
 * la fuente de datos.
 */
@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  private readonly source: GlobalSearchSource = inject(SEARCH_GLOBAL_SOURCE);

  search(query: string): Observable<GlobalSearchResults> {
    return this.source.search(query);
  }
}
