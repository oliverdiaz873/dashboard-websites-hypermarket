import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import {
  EMPTY_SEARCH_RESULTS,
  GlobalSearchResults,
} from '@core/search/models/global-search-result.model';
import { AuthStore } from '@core/state/auth/auth.store';

import { ProductsService } from '@features/products/services/products.service';
import type { Product } from '@features/products/models/product.model';
import { OrdersService } from '@features/orders/services/orders.service';
import type { AdminOrder } from '@features/orders/models/order.model';
import { CustomersService } from '@features/customers/services/customers.service';
import type { Customer } from '@features/customers/models/customer.model';

import { LocalSearchAdapterSource } from './local-search-adapter.source';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    sku: 'SKU-001',
    name: 'Coca Cola Original 2L',
    price: 120,
    image: 'coca.png',
    categoryId: 'c1',
    category: { name: 'Bebidas', slug: 'bebidas' },
    status: 'active',
    isAvailable: true,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function makeOrder(overrides: Partial<AdminOrder> = {}): AdminOrder {
  return {
    id: 'ORD-4521',
    userId: 'u1',
    items: [],
    totalItems: 1,
    subtotal: 500,
    status: 'completed',
    paymentStatus: 'paid',
    customer: { id: 'u1', name: 'Juan Pérez', email: 'juan@x.com' },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'CUS-0001',
    name: 'Ana María Rodríguez',
    email: 'anamaria.rodriguez@gmail.com',
    phone: '(809) 555-0101',
    status: 'active',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function paginated<T>(data: T[]): {
  data: T[];
  pagination: { page: number; limit: number; total: number; pages: number };
} {
  return { data, pagination: { page: 1, limit: 5, total: data.length, pages: 1 } };
}

const adminUser = {
  id: '1',
  name: 'Admin',
  email: 'admin@hypermarket.dev',
  role: 'admin' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const customerUser = { ...adminUser, id: '2', name: 'Cliente', role: 'customer' as const };

describe('LocalSearchAdapterSource', () => {
  let source: LocalSearchAdapterSource;
  let productsService: { list: jest.Mock };
  let ordersService: { list: jest.Mock };
  let customersService: { list: jest.Mock };
  let authStore: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    productsService = { list: jest.fn() };
    ordersService = { list: jest.fn() };
    customersService = { list: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: ProductsService, useValue: productsService },
        { provide: OrdersService, useValue: ordersService },
        { provide: CustomersService, useValue: customersService },
      ],
    });

    source = TestBed.inject(LocalSearchAdapterSource);
    authStore = TestBed.inject(AuthStore);
    authStore.setAuthenticated({ token: 'jwt', user: adminUser });
  });

  it('devuelve resultados vacíos para un query vacío sin llamar a los servicios', () => {
    let result: GlobalSearchResults | undefined;
    source.search('   ').subscribe((r) => (result = r));

    expect(result).toEqual(EMPTY_SEARCH_RESULTS);
    expect(productsService.list).not.toHaveBeenCalled();
    expect(ordersService.list).not.toHaveBeenCalled();
    expect(customersService.list).not.toHaveBeenCalled();
  });

  it('agrega productos, órdenes y clientes en la estructura global', () => {
    productsService.list.mockReturnValue(of(paginated([makeProduct()])));
    ordersService.list.mockReturnValue(of(paginated([makeOrder()])));
    customersService.list.mockReturnValue(of(paginated([makeCustomer()])));

    let result: GlobalSearchResults | undefined;
    source.search('coca').subscribe((r) => (result = r));

    expect(productsService.list).toHaveBeenCalledWith({ page: 1, limit: 5, q: 'coca' });
    expect(ordersService.list).toHaveBeenCalledWith({ page: 1, limit: 5, q: 'coca' });
    expect(customersService.list).toHaveBeenCalledWith({ page: 1, limit: 5, q: 'coca' });
    expect(result?.products).toEqual([
      {
        id: 'p1',
        type: 'product',
        label: 'Coca Cola Original 2L',
        subtitle: 'Bebidas',
        route: '/products/p1/edit',
      },
    ]);
    expect(result?.orders).toEqual([
      {
        id: 'ORD-4521',
        type: 'order',
        label: 'Pedido #ORD-4521',
        subtitle: 'Juan Pérez',
        route: '/orders/ORD-4521',
      },
    ]);
    expect(result?.customers).toEqual([
      {
        id: 'CUS-0001',
        type: 'customer',
        label: 'Ana María Rodríguez',
        subtitle: 'anamaria.rodriguez@gmail.com',
        route: '/customers/CUS-0001',
      },
    ]);
    expect(result?.users).toEqual([]);
  });

  it('trima el query antes de consultar y usarlo en navegación', () => {
    productsService.list.mockReturnValue(of(paginated([])));
    ordersService.list.mockReturnValue(of(paginated([])));
    customersService.list.mockReturnValue(of(paginated([])));

    source.search('  coca  ').subscribe();

    expect(productsService.list).toHaveBeenCalledWith({ page: 1, limit: 5, q: 'coca' });
    expect(ordersService.list).toHaveBeenCalledWith({ page: 1, limit: 5, q: 'coca' });
    expect(customersService.list).toHaveBeenCalledWith({ page: 1, limit: 5, q: 'coca' });
  });

  it('usa el SKU como subtítulo cuando el producto no tiene categoría', () => {
    productsService.list.mockReturnValue(
      of(paginated([makeProduct({ category: undefined, categoryId: '' })])),
    );
    ordersService.list.mockReturnValue(of(paginated([])));
    customersService.list.mockReturnValue(of(paginated([])));

    let result: GlobalSearchResults | undefined;
    source.search('coca').subscribe((r) => (result = r));

    expect(result?.products[0]?.subtitle).toBe('SKU-001');
  });

  it('tolera errores de un servicio sin romper el resto de secciones', () => {
    productsService.list.mockReturnValue(throwError(() => new Error('fail')));
    ordersService.list.mockReturnValue(of(paginated([makeOrder()])));
    customersService.list.mockReturnValue(of(paginated([makeCustomer()])));

    let result: GlobalSearchResults | undefined;
    source.search('coca').subscribe((r) => (result = r));

    expect(result?.products).toEqual([]);
    expect(result?.orders).toHaveLength(1);
    expect(result?.customers).toHaveLength(1);
  });

  it('incluye solo secciones de navegación habilitadas y coincidentes', () => {
    productsService.list.mockReturnValue(of(paginated([])));
    ordersService.list.mockReturnValue(of(paginated([])));
    customersService.list.mockReturnValue(of(paginated([])));

    let result: GlobalSearchResults | undefined;
    source.search('productos').subscribe((r) => (result = r));

    expect(result?.navigation).toEqual([
      {
        id: 'nav-/products',
        type: 'navigation',
        label: 'Productos',
        subtitle: 'Sección',
        route: '/products',
      },
    ]);
  });

  it('excluye secciones deshabilitadas del roadmap', () => {
    productsService.list.mockReturnValue(of(paginated([])));
    ordersService.list.mockReturnValue(of(paginated([])));
    customersService.list.mockReturnValue(of(paginated([])));

    let result: GlobalSearchResults | undefined;
    source.search('marcas').subscribe((r) => (result = r));

    expect(result?.navigation).toEqual([]);
  });

  it('respeta el RBAC al filtrar la navegación', () => {
    authStore.setAuthenticated({ token: 'jwt', user: customerUser });
    productsService.list.mockReturnValue(of(paginated([])));
    ordersService.list.mockReturnValue(of(paginated([])));
    customersService.list.mockReturnValue(of(paginated([])));

    let result: GlobalSearchResults | undefined;
    source.search('estadísticas').subscribe((r) => (result = r));

    expect(result?.navigation).toEqual([]);
  });

  it('no consulta clientes (PII) para usuarios sin rol admin', () => {
    authStore.setAuthenticated({ token: 'jwt', user: customerUser });
    productsService.list.mockReturnValue(of(paginated([makeProduct()])));
    ordersService.list.mockReturnValue(of(paginated([makeOrder()])));
    customersService.list.mockReturnValue(of(paginated([makeCustomer()])));

    let result: GlobalSearchResults | undefined;
    source.search('juan').subscribe((r) => (result = r));

    expect(customersService.list).not.toHaveBeenCalled();
    expect(result?.customers).toEqual([]);
    expect(result?.products).toHaveLength(1);
    expect(result?.orders).toHaveLength(1);
  });
});
