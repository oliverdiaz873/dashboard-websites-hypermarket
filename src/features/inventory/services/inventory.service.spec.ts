import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { InventoryService } from './inventory.service';
import type { Inventory, InventoryQuery } from '../models/inventory.model';

const BASE = 'http://localhost:3000/api/inventory';

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

describe('InventoryService', () => {
  let service: InventoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(InventoryService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list construye los query params y devuelve data + pagination', () => {
    const query: InventoryQuery = {
      page: 2,
      limit: 20,
      q: 'arroz',
      status: 'low-stock',
      sortBy: 'stock',
      sortOrder: 'asc',
    };

    let result: { data: Inventory[]; pagination: { total: number } } | undefined;
    service.list(query).subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      `${BASE}?page=2&limit=20&q=arroz&status=low-stock&sortBy=stock&sortOrder=asc`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [makeInventory()],
      pagination: { page: 2, limit: 20, total: 1, pages: 1 },
    });

    expect(result?.data).toEqual([makeInventory()]);
    expect(result?.pagination.total).toBe(1);
  });

  it('list omite filtros vacíos', () => {
    service.list({ page: 1, limit: 50 }).subscribe();

    const req = httpMock.expectOne(`${BASE}?page=1&limit=50`);
    expect(req.request.params.has('q')).toBe(false);
    expect(req.request.params.has('status')).toBe(false);
    req.flush({ success: true, data: [], pagination: { page: 1, limit: 50, total: 0, pages: 1 } });
  });

  it('getById recupera un registro de inventario', () => {
    let result: Inventory | undefined;
    service.getById('inv1').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/inv1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: makeInventory() });

    expect(result?.id).toBe('inv1');
  });

  it('getMovements devuelve el historial paginado', () => {
    let result: { data: unknown[]; pagination: { total: number } } | undefined;
    service.getMovements('inv1', 2, 10).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/inv1/movements?page=2&limit=10`);
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [{ id: 'm1', type: 'increase' }],
      pagination: { page: 2, limit: 10, total: 1, pages: 1 },
    });

    expect(result?.data).toEqual([{ id: 'm1', type: 'increase' }]);
    expect(result?.pagination.total).toBe(1);
  });

  it('adjust hace POST con el payload de ajuste', () => {
    const payload = {
      operation: 'increase' as const,
      quantity: 5,
      reason: 'supplier_adjustment' as const,
    };

    let result: Inventory | undefined;
    service.adjust('inv1', payload).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/inv1/adjust`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: makeInventory({ stock: 15 }) });

    expect(result?.stock).toBe(15);
  });

  it('changeMinStock hace PATCH con el payload de mínimo', () => {
    const payload = { minStock: 8, reason: 'manual_correction' as const };

    let result: Inventory | undefined;
    service.changeMinStock('inv1', payload).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/inv1/min-stock`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: makeInventory({ minStock: 8 }) });

    expect(result?.minStock).toBe(8);
  });
});
