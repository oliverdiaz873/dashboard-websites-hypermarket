import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of } from 'rxjs';

import { NAVIGATION_ITEMS } from '@core/constants/navigation';
import type { PaginatedResponse } from '@core/models/paginated-response';
import {
  EMPTY_SEARCH_RESULTS,
  GlobalSearchResults,
} from '@core/search/models/global-search-result.model';
import { GlobalSearchSource } from '@core/search/services/global-search-source';
import { AuthStore } from '@core/state/auth/auth.store';

import { ProductsService } from '@features/products/services/products.service';
import { OrdersService } from '@features/orders/services/orders.service';
import { CustomersService } from '@features/customers/services/customers.service';

/** Página vacía con la forma `PaginatedResponse` para no romper el mapeo cuando un service falla. */
const EMPTY_PAGE: PaginatedResponse<never[]> = {
  data: [],
  pagination: { page: 1, limit: 0, total: 0, pages: 0 },
};

/**
 * Fuente local de la búsqueda global.
 *
 * Mientras el backend no expone `GET /search`, se reensamblan los services de las
 * features (Products/Orders/Customers) y se filtra la navegación localmente. Vive en
 * `features/search` porque conoce el dominio; cuando llegue el endpoint real, se
 * sustituye por `ApiSearchAdapterSource` registrando otro provider.
 *
 * RBAC: la sección `customers` solo se consulta para admins (expone PII: nombre y
 * correo); para el resto de roles se emite una página vacía sin llamar a la API.
 */
@Injectable({ providedIn: 'root' })
export class LocalSearchAdapterSource implements GlobalSearchSource {
  private readonly productsService = inject(ProductsService);
  private readonly ordersService = inject(OrdersService);
  private readonly customersService = inject(CustomersService);
  private readonly authStore = inject(AuthStore);

  search(query: string): Observable<GlobalSearchResults> {
    const q = query.trim();
    if (!q) return of(EMPTY_SEARCH_RESULTS);

    const canSearchCustomers = this.authStore.hasRole(['admin']);

    return forkJoin({
      products: this.productsService
        .list({ page: 1, limit: 5, q })
        .pipe(catchError(() => of(EMPTY_PAGE))),
      orders: this.ordersService
        .list({ page: 1, limit: 5, q })
        .pipe(catchError(() => of(EMPTY_PAGE))),
      customers: canSearchCustomers
        ? this.customersService
            .list({ page: 1, limit: 5, q })
            .pipe(catchError(() => of(EMPTY_PAGE)))
        : of(EMPTY_PAGE),
    }).pipe(
      map(({ products, orders, customers }) => ({
        products: products.data.map((product) => ({
          id: product.id,
          type: 'product' as const,
          label: product.name,
          subtitle: product.category?.name ?? product.sku,
          route: `/products/${product.id}/edit`,
        })),
        orders: orders.data.map((order) => ({
          id: order.id,
          type: 'order' as const,
          label: `Pedido #${order.id}`,
          subtitle: order.customer?.name,
          route: `/orders/${order.id}`,
        })),
        customers: customers.data.map((customer) => ({
          id: customer.id,
          type: 'customer' as const,
          label: customer.name,
          subtitle: customer.email,
          // La ruta :id queda registrada (redirige al listado) hasta que exista
          // customer-detail-page en la fase 2.
          route: `/customers/${customer.id}`,
        })),
        users: [],
        navigation: this.searchNavigation(q),
      })),
    );
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
