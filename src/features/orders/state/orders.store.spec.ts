import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { OrdersStore } from './orders.store';
import type { AdminOrder } from '../models/order.model';

const URL = 'http://localhost:3000/api/admin/orders';

function makeOrder(overrides: Partial<AdminOrder> = {}): AdminOrder {
  return {
    id: 'o1',
    userId: 'u1',
    items: [{ productId: 'p1', name: 'Arroz 1kg', price: 89.5, image: 'img.png', quantity: 2 }],
    totalItems: 2,
    subtotal: 179,
    status: 'pending',
    paymentStatus: 'pending',
    customer: { id: 'u1', name: 'Oliver Diaz', email: 'oliver@example.com' },
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

describe('OrdersStore', () => {
  let store: InstanceType<typeof OrdersStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(OrdersStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const flushList = (data: AdminOrder[], total: number, page = 1, limit = 20) => {
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
    flushList([makeOrder()], 1);
    await pending;

    expect(store.page()).toBe(1);
    expect(store.hasLoaded()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.items().length).toBe(1);
    expect(store.total()).toBe(1);
  });

  it('cambiar search/status resetea la página a 1', async () => {
    const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    store.setPage(2);
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.params.get('page') === '2')
      .flush({ success: true, data: [], pagination: { page: 2, limit: 20, total: 0, pages: 1 } });
    await tick();
    expect(store.page()).toBe(2);

    store.setSearch('oliver');
    const req = httpMock.expectOne((r) => r.url.includes(URL) && r.params.get('q') === 'oliver');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({
      success: true,
      data: [makeOrder()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    await tick();

    expect(store.page()).toBe(1);
    expect(store.search()).toBe('oliver');
  });

  it('loadDetail establece selectedOrder', async () => {
    const pending = store.loadDetail('o1');
    const req = httpMock.expectOne(`${URL}/o1`);
    req.flush({ success: true, data: makeOrder() });
    await pending;

    expect(store.selectedOrder()?.id).toBe('o1');
    expect(store.selectedOrder()?.customer?.name).toBe('Oliver Diaz');
    expect(store.isLoading()).toBe(false);
  });

  it('changeStatus hace PATCH, recarga el listado y gestiona isSubmitting', async () => {
    const pending = store.changeStatus('o1', { status: 'processing' });

    const patch = httpMock.expectOne(
      (r) => r.url.includes(`${URL}/o1/status`) && r.method === 'PATCH',
    );
    expect(patch.request.body).toEqual({ status: 'processing' });
    expect(store.isSubmitting()).toBe(true);
    patch.flush({ success: true, data: makeOrder({ status: 'processing' }) });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    flushList([makeOrder({ status: 'processing' })], 1);

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.items()[0]?.status).toBe('processing');
  });

  it('changeStatus actualiza selectedOrder cuando coincide con el id', async () => {
    const detail = store.loadDetail('o1');
    httpMock.expectOne(`${URL}/o1`).flush({ success: true, data: makeOrder() });
    await detail;

    const pending = store.changeStatus('o1', { status: 'cancelled' });
    const patch = httpMock.expectOne(
      (r) => r.url.includes(`${URL}/o1/status`) && r.method === 'PATCH',
    );
    patch.flush({ success: true, data: makeOrder({ status: 'cancelled' }) });
    await new Promise<void>((resolve) => setTimeout(resolve, 0));

    flushList([makeOrder({ status: 'cancelled' })], 1);

    await pending;
    expect(store.selectedOrder()?.status).toBe('cancelled');
  });
});
