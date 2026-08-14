import { Injectable, inject } from '@angular/core';
import { Observable, map, of } from 'rxjs';

import { NAVIGATION_ITEMS } from '@core/constants/navigation';
import { API_ENDPOINTS } from '@core/http/endpoints';
import { BaseApiService } from '@core/http/services/base-api.service';
import {
  EMPTY_SEARCH_RESULTS,
  GlobalSearchItem,
  GlobalSearchResults,
} from '@core/search/models/global-search-result.model';
import { GlobalSearchSource } from '@core/search/services/global-search-source';
import { AuthStore } from '@core/state/auth/auth.store';

const SEARCH_LIMIT = 5;

/** DTO mínimo del contrato GET /api/admin/search (backend Express). */
interface AdminSearchResponse {
  products: AdminSearchProduct[];
  orders: AdminSearchOrder[];
  customers: AdminSearchCustomer[];
}

interface AdminSearchProduct {
  id: string;
  name: string;
  sku: string;
  category?: { name: string; slug: string } | null;
}

interface AdminSearchOrder {
  id: string;
  customer?: { name: string } | null;
}

interface AdminSearchCustomer {
  id: string;
  name: string;
  email: string;
}

/**
 * Fuente de búsqueda global respaldada por el backend real
 * (GET /api/admin/search?q=<term>&limit=<n>).
 *
 * Implementa `GlobalSearchSource` (Dependency Inversion): el `core/search` y los
 * componentes no conocen esta implementación. La navegación (solo UI) se filtra
 * localmente; el resto se mapea desde el contrato del backend.
 *
 * RBAC: `/api/admin/search` es exclusivo de admins. Si el usuario no es admin no
 * se llama a la API (evita un 403) y se devuelven resultados vacíos. El token
 * viaja en el `authInterceptor`.
 */
@Injectable()
export class ApiSearchAdapterSource extends BaseApiService implements GlobalSearchSource {
  private readonly authStore = inject(AuthStore);

  search(query: string): Observable<GlobalSearchResults> {
    const q = query.trim();
    if (!q || !this.authStore.hasRole(['admin'])) {
      return of(EMPTY_SEARCH_RESULTS);
    }

    return this.get<AdminSearchResponse>(API_ENDPOINTS.adminSearch, {
      params: { q, limit: SEARCH_LIMIT },
    }).pipe(map((data) => this.toResults(data, q)));
  }

  private toResults(data: AdminSearchResponse, q: string): GlobalSearchResults {
    return {
      products: data.products.map((p): GlobalSearchItem => ({
        id: p.id,
        type: 'product',
        label: p.name,
        subtitle: p.category?.name ?? p.sku,
        route: `/products/${p.id}/edit`,
      })),
      orders: data.orders.map((o): GlobalSearchItem => ({
        id: o.id,
        type: 'order',
        label: `Pedido #${o.id}`,
        subtitle: o.customer?.name,
        route: `/orders/${o.id}`,
      })),
      customers: data.customers.map((c): GlobalSearchItem => ({
        id: c.id,
        type: 'customer',
        label: c.name,
        subtitle: c.email,
        route: `/customers/${c.id}`,
      })),
      users: [],
      navigation: this.searchNavigation(q),
    };
  }

  private searchNavigation(q: string): GlobalSearchResults['navigation'] {
    const needle = q.toLocaleLowerCase();
    return NAVIGATION_ITEMS.filter(
      (item) =>
        item.enabled &&
        this.authStore.hasRole(item.roles ?? []) &&
        item.label.toLocaleLowerCase().includes(needle),
    ).map((item) => ({
      id: `nav-${item.route}`,
      type: 'navigation' as const,
      label: item.label,
      subtitle: 'Sección',
      route: item.route,
    }));
  }
}
