import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { OrdersService } from './orders.service';
import type { AdminOrder, OrderQuery } from '../models/order.model';

const BASE = 'http://localhost:3000/api/admin/orders';

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

describe('OrdersService', () => {
  let service: OrdersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(OrdersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list construye los query params y devuelve data + pagination', () => {
    const query: OrderQuery = {
      page: 2,
      limit: 20,
      q: 'oliver',
      status: 'processing',
      sortBy: 'subtotal',
      sortOrder: 'asc',
    };

    let result: { data: AdminOrder[]; pagination: { total: number } } | undefined;
    service.list(query).subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      `${BASE}?page=2&limit=20&q=oliver&status=processing&sortBy=subtotal&sortOrder=asc`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [makeOrder()],
      pagination: { page: 2, limit: 20, total: 1, pages: 1 },
    });

    expect(result?.data).toEqual([makeOrder()]);
    expect(result?.pagination.total).toBe(1);
  });

  it('list omite filtros vacíos', () => {
    service.list({ page: 1, limit: 50 }).subscribe();

    const req = httpMock.expectOne(`${BASE}?page=1&limit=50`);
    expect(req.request.params.has('q')).toBe(false);
    expect(req.request.params.has('status')).toBe(false);
    req.flush({ success: true, data: [], pagination: { page: 1, limit: 50, total: 0, pages: 1 } });
  });

  it('getById recupera una orden con su snapshot de cliente', () => {
    let result: AdminOrder | undefined;
    service.getById('o1').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/o1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: makeOrder() });

    expect(result?.id).toBe('o1');
    expect(result?.customer?.email).toBe('oliver@example.com');
  });

  it('changeStatus hace PATCH con status y nota', () => {
    const payload = { status: 'processing' as const, note: 'Aprobado' };

    let result: AdminOrder | undefined;
    service.changeStatus('o1', payload).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/o1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: makeOrder({ status: 'processing' }) });

    expect(result?.status).toBe('processing');
  });

  it('changeStatus admite un payload sin nota', () => {
    service.changeStatus('o1', { status: 'cancelled' }).subscribe();

    const req = httpMock.expectOne(`${BASE}/o1/status`);
    expect(req.request.body).toEqual({ status: 'cancelled' });
    req.flush({ success: true, data: makeOrder({ status: 'cancelled' }) });
  });
});
