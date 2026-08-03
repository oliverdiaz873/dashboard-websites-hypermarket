import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductsStore } from './products.store';
import type { Product } from '../models/product.model';

const URL = 'http://localhost:3000/api/products';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    sku: 'SKU-1',
    name: 'Arroz',
    price: 80,
    image: 'arroz.png',
    categoryId: 'c1',
    category: { name: 'Granos', slug: 'granos' },
    status: 'active',
    isAvailable: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('ProductsStore', () => {
  let store: InstanceType<typeof ProductsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ProductsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('carga la primera página con los defaults', async () => {
    const flush = (page: number) => {
      const req = httpMock.expectOne(
        (r) => r.url.includes(URL) && r.params.get('page') === `${page}`,
      );
      req.flush({
        success: true,
        data: [makeProduct()],
        pagination: { page, limit: 20, total: 1, pages: 1 },
      });
    };

    const p = store.load();
    flush(1);
    await p;

    expect(store.page()).toBe(1);
    expect(store.isLoading()).toBe(false);
    expect(store.hasLoaded()).toBe(true);
    expect(store.products().length).toBe(1);
  });

  it('limpia el error si un filtro devuelve vacío', async () => {
    const pending = store.load();
    const req = httpMock.expectOne((r) => r.url.includes(URL));
    req.flush({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } });
    await pending;

    expect(store.isEmpty()).toBe(true);
    expect(store.total()).toBe(0);
    expect(store.error()).toBeNull();
  });

  it('cambiar search/category/status resetea la página a 1', async () => {
    const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    // Página previa: el usuario estaba en página 2.
    store.setPage(2);
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.params.get('page') === '2')
      .flush({
        success: true,
        data: [],
        pagination: { page: 2, limit: 20, total: 0, pages: 1 },
      });
    await tick();
    expect(store.page()).toBe(2);

    // Cambiar búsqueda debe disparar recarga con page=1.
    store.setSearch('arroz');
    const req = httpMock.expectOne((r) => r.url.includes(URL) && r.params.get('q') === 'arroz');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({
      success: true,
      data: [makeProduct()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    await tick();

    expect(store.page()).toBe(1);
    expect(store.search()).toBe('arroz');

    // Cambiar status también resetea a página 1.
    store.setPage(2);
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.params.get('page') === '2')
      .flush({
        success: true,
        data: [],
        pagination: { page: 2, limit: 20, total: 0, pages: 1 },
      });
    await tick();

    store.setStatus('inactive');
    const statusReq = httpMock.expectOne(
      (r) => r.url.includes(URL) && r.params.get('status') === 'inactive',
    );
    expect(statusReq.request.params.get('page')).toBe('1');
    statusReq.flush({
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    });
    await tick();
    expect(store.page()).toBe(1);
  });

  it('expone la selección de filas', async () => {
    store.setPage(1);
    httpMock
      .expectOne((r) => r.url.includes(URL))
      .flush({
        success: true,
        data: [makeProduct()],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      });

    store.setSelectedIds(['p1']);
    expect(store.selectedCount()).toBe(1);
    store.clearSelection();
    expect(store.selectedCount()).toBe(0);
  });

  it('carga subcategorías como opciones de filtro con value = slug de la subcategoría', async () => {
    const pending = store.loadCategories();
    httpMock
      .expectOne((r) => r.url.includes('http://localhost:3000/api/categories'))
      .flush({
        success: true,
        data: [
          {
            id: 'alimentos',
            name: 'Alimentos',
            slug: 'alimentos',
            subcategories: [
              { name: 'Bebidas', slug: 'bebidas' },
              { name: 'Despensa', slug: 'despensa' },
            ],
          },
        ],
      });
    await pending;

    expect(store.categories()).toEqual([
      { value: 'bebidas', label: 'Alimentos - Bebidas' },
      { value: 'despensa', label: 'Alimentos - Despensa' },
    ]);
  });
});
