// -----------------------------------------------------------------------------
// global-search-result.model.ts
// -----------------------------------------------------------------------------
// Contrato de resultados de la búsqueda global. Es independiente de las fuentes
// concretas (LocalSearchAdapterSource, ApiSearchAdapterSource, ...): cada tipo
// se agrupa en una sección del dropdown.
// -----------------------------------------------------------------------------

export type GlobalSearchResultType = 'product' | 'order' | 'user' | 'navigation';

export interface GlobalSearchItem {
  id: string;
  type: GlobalSearchResultType;
  label: string;
  subtitle?: string;
  route: string;
}

export interface GlobalSearchResults {
  products: GlobalSearchItem[];
  orders: GlobalSearchItem[];
  users: GlobalSearchItem[];
  navigation: GlobalSearchItem[];
}

export const EMPTY_SEARCH_RESULTS: GlobalSearchResults = {
  products: [],
  orders: [],
  users: [],
  navigation: [],
};
