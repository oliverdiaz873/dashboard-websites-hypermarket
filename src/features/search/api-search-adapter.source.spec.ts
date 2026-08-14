import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import {
  EMPTY_SEARCH_RESULTS,
  GlobalSearchResults,
} from '@core/search/models/global-search-result.model';
import { AuthStore } from '@core/state/auth/auth.store';

import { ApiSearchAdapterSource } from './api-search-adapter.source';

const BASE = 'http://localhost:3000/api/admin/search';

function makeBackendProduct(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'p1',
    sku: 'SKU-001',
    name: 'Coca Cola Original 2L',
    category: { name: 'Bebidas', slug: 'bebidas' },
    ...overrides,
  };
}

function makeBackendOrder(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'ORD-4521',
    customer: { id: 'u1', name: 'Juan Pérez', email: 'juan@x.com' },
    ...overrides,
  };
}

function makeBackendCustomer(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'CUS-0001',
    name: 'Ana María Rodríguez',
    email: 'anamaria.rodriguez@gmail.com',
    ...overrides,
  };
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

describe('ApiSearchAdapterSource', () => {
  let source: ApiSearchAdapterSource;
  let httpMock: HttpTestingController;
  let authStore: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiSearchAdapterSource],
    });
    source = TestBed.inject(ApiSearchAdapterSource);
    httpMock = TestBed.inject(HttpTestingController);
    authStore = TestBed.inject(AuthStore);
    authStore.setAuthenticated({ token: 'jwt', user: adminUser });
  });

  afterEach(() => httpMock.verify());

  it('consume GET /api/admin/search con q y limit y mapea las secciones globales', () => {
    let result: GlobalSearchResults | undefined;
    source.search('coca').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${BASE}?q=coca&limit=5`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: {
        products: [makeBackendProduct()],
        orders: [makeBackendOrder()],
        customers: [makeBackendCustomer()],
      },
    });

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

  it('usa el SKU como subtítulo cuando el producto no tiene categoría', () => {
    let result: GlobalSearchResults | undefined;
    source.search('coca').subscribe((r) => (result = r));

    const req = httpMock.expectOne(`${BASE}?q=coca&limit=5`);
    req.flush({
      success: true,
      data: {
        products: [makeBackendProduct({ category: null })],
        orders: [],
        customers: [],
      },
    });

    expect(result?.products[0]?.subtitle).toBe('SKU-001');
  });

  it('trima el query antes de enviarlo', () => {
    source.search('  coca  ').subscribe();

    httpMock.expectOne(`${BASE}?q=coca&limit=5`).flush({
      success: true,
      data: { products: [], orders: [], customers: [] },
    });
  });

  it('devuelve resultados vacíos para un query vacío sin llamar a la API', () => {
    let result: GlobalSearchResults | undefined;
    source.search('   ').subscribe((r) => (result = r));

    expect(result).toEqual(EMPTY_SEARCH_RESULTS);
    httpMock.expectNone(BASE);
  });

  it('respeta el RBAC: sin rol admin no llama a la API y devuelve vacío', () => {
    authStore.setAuthenticated({ token: 'jwt', user: customerUser });

    let result: GlobalSearchResults | undefined;
    source.search('coca').subscribe((r) => (result = r));

    expect(result).toEqual(EMPTY_SEARCH_RESULTS);
    httpMock.expectNone(BASE);
  });

  it('propaga errores HTTP al consumidor', () => {
    let error: unknown;
    source.search('coca').subscribe({
      next: () => undefined,
      error: (e: unknown) => (error = e),
    });

    const req = httpMock.expectOne(`${BASE}?q=coca&limit=5`);
    req.flush({ success: false, message: 'Forbidden' }, { status: 403, statusText: 'Forbidden' });

    expect(error).toBeTruthy();
  });

  it('incluye solo secciones de navegación habilitadas y coincidentes', () => {
    let result: GlobalSearchResults | undefined;
    source.search('productos').subscribe((r) => (result = r));

    httpMock.expectOne(`${BASE}?q=productos&limit=5`).flush({
      success: true,
      data: { products: [], orders: [], customers: [] },
    });

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

  it('excluye secciones deshabilitadas del roadmap y respeta el RBAC de navegación', () => {
    authStore.setAuthenticated({ token: 'jwt', user: customerUser });

    let result: GlobalSearchResults | undefined;
    source.search('configuración').subscribe((r) => (result = r));

    expect(result).toEqual(EMPTY_SEARCH_RESULTS);
    httpMock.expectNone(BASE);
  });

  it('implementa la interfaz GlobalSearchSource', () => {
    expect(source.search).toBeInstanceOf(Function);
    expect(typeof source.search('x').subscribe).toBe('function');
  });
});
