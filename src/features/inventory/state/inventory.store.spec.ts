import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { InventoryStore } from './inventory.store';
import type { Inventory } from '../models/inventory.model';

const URL = 'http://localhost:3000/api/inventory';

function makeInventory(overrides: Partial<Inventory> = {}): Inventory {
  return {
    id: 'inv1',
    productId: 'p1',
    product: { name: 'Arroz', sku: 'SKU-1' },
    stock: 10,
    reservedStock: 0,
    availableStock: 10,
    minStock: 5,
    status: 'ok',
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}

describe('InventoryStore', () => {
  let store: InstanceType<typeof InventoryStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(InventoryStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const flushList = (data: Inventory[], total: number, page = 1, limit = 20) => {
    const req = httpMock.expectOne(
      (r) => r.url.includes(URL) && r.params.get('page') === `${page}`,
    );
    req.flush({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  };

  it('carga la primera página con los defaults', async () => {
    const pending = store.load();
    flushList([makeInventory()], 1);
    await pending;

    expect(store.page()).toBe(1);
    expect(store.hasLoaded()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.items().length).toBe(1);
  });

  it('cambiar search/status resetea la página a 1', async () => {
    const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    store.setPage(2);
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.params.get('page') === '2')
      .flush({ success: true, data: [], pagination: { page: 2, limit: 20, total: 0, pages: 1 } });
    await tick();
    expect(store.page()).toBe(2);

    store.setSearch('arroz');
    const req = httpMock.expectOne((r) => r.url.includes(URL) && r.params.get('q') === 'arroz');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({
      success: true,
      data: [makeInventory()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    await tick();

    expect(store.page()).toBe(1);
    expect(store.search()).toBe('arroz');
  });

  it('expone los contadores de bajo stock y agotados', async () => {
    const pending = store.load();
    flushList(
      [
        makeInventory({ status: 'low-stock' }),
        makeInventory({ id: 'inv2', status: 'out-of-stock' }),
        makeInventory({ id: 'inv3' }),
      ],
      3,
    );
    await pending;

    expect(store.lowStockCount()).toBe(1);
    expect(store.outOfStockCount()).toBe(1);
  });

  it('adjust hace POST, recarga el listado y gestiona isSubmitting', async () => {
    const pending = store.adjust('inv1', {
      operation: 'increase',
      quantity: 5,
      reason: 'supplier_adjustment',
    });

    const post = httpMock.expectOne(
      (r) => r.url.includes(`${URL}/inv1/adjust`) && r.method === 'POST',
    );
    expect(post.request.body).toEqual({
      operation: 'increase',
      quantity: 5,
      reason: 'supplier_adjustment',
    });
    expect(store.isSubmitting()).toBe(true);
    post.flush({ success: true, data: makeInventory({ stock: 15 }) });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    flushList([makeInventory({ stock: 15 })], 1);

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.items()[0]?.stock).toBe(15);
  });

  it('changeMinStock hace PATCH y recarga el listado', async () => {
    const pending = store.changeMinStock('inv1', { minStock: 8, reason: 'manual_correction' });

    const patch = httpMock.expectOne(
      (r) => r.url.includes(`${URL}/inv1/min-stock`) && r.method === 'PATCH',
    );
    expect(patch.request.body).toEqual({ minStock: 8, reason: 'manual_correction' });
    patch.flush({ success: true, data: makeInventory({ minStock: 8 }) });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    flushList([makeInventory({ minStock: 8 })], 1);

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.items()[0]?.minStock).toBe(8);
  });
});
