import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import type { PaginatedResponse } from '@core/models/paginated-response';

import type { Customer, CustomerQuery, CustomerStats } from '../models/customer.model';
import { ApiCustomerDataSource } from './api-customer-data-source';

const BASE = 'http://localhost:3000/api/admin/customers';

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

const STATS: CustomerStats = { total: 12, active: 8, blocked: 2, pending: 2, newThisMonth: 2 };

describe('ApiCustomerDataSource', () => {
  let source: ApiCustomerDataSource;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiCustomerDataSource],
    });
    source = TestBed.inject(ApiCustomerDataSource);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list construye los query params y devuelve data + pagination', () => {
    const query: CustomerQuery = {
      page: 2,
      limit: 20,
      q: 'ana',
      status: 'blocked',
      sortBy: 'name',
      sortOrder: 'asc',
    };

    let result: PaginatedResponse<Customer[]> | undefined;
    source.list(query).subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      `${BASE}?page=2&limit=20&q=ana&status=blocked&sortBy=name&sortOrder=asc`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [makeCustomer()],
      pagination: { page: 2, limit: 20, total: 1, pages: 1 },
    });

    expect(result?.data).toEqual([makeCustomer()]);
    expect(result?.pagination.total).toBe(1);
  });

  it('list omite filtros vacíos', () => {
    source.list({ page: 1, limit: 50 }).subscribe();

    const req = httpMock.expectOne(`${BASE}?page=1&limit=50`);
    expect(req.request.params.has('q')).toBe(false);
    expect(req.request.params.has('status')).toBe(false);
    expect(req.request.params.has('sortBy')).toBe(false);
    expect(req.request.params.has('sortOrder')).toBe(false);
    req.flush({ success: true, data: [], pagination: { page: 1, limit: 50, total: 0, pages: 1 } });
  });

  it('findById recupera un cliente', () => {
    let result: Customer | undefined;
    source.findById('CUS-0001').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/CUS-0001`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: makeCustomer() });

    expect(result?.email).toBe('anamaria.rodriguez@gmail.com');
  });

  it('update hace PATCH parcial', () => {
    const payload = { phone: '(809) 555-9999' };

    let result: Customer | undefined;
    source.update('CUS-0001', payload).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/CUS-0001`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: makeCustomer({ phone: '(809) 555-9999' }) });

    expect(result?.phone).toBe('(809) 555-9999');
  });

  it('updateStatus hace PATCH a /status con el estado', () => {
    let result: Customer | undefined;
    source.updateStatus('CUS-0001', 'blocked').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/CUS-0001/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'blocked' });
    req.flush({ success: true, data: makeCustomer({ status: 'blocked' }) });

    expect(result?.status).toBe('blocked');
  });

  it('stats recupera los KPIs', () => {
    let result: CustomerStats | undefined;
    source.stats().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: STATS });

    expect(result).toEqual(STATS);
  });
});
