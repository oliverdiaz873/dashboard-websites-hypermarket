import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DashboardService } from './dashboard.service';

const BASE = 'http://localhost:3000/api/admin/stats';

describe('DashboardService', () => {
  let service: DashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(DashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getDashboard devuelve los KPIs', () => {
    let result: unknown;
    service.getDashboard().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { revenue: 100 } });

    expect(result).toEqual({ revenue: 100 });
  });

  it('getDashboard envía days cuando se proporciona el rango', () => {
    service.getDashboard(7).subscribe();

    const req = httpMock.expectOne(`${BASE}/dashboard?days=7`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('days')).toBe('7');
    req.flush({ success: true, data: {} });
  });

  it('getRevenueSeries construye el query days', () => {
    service.getRevenueSeries({ days: 30 }).subscribe();

    const req = httpMock.expectOne(`${BASE}/revenue?days=30`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('getOrdersByStatus envía el rango', () => {
    service.getOrdersByStatus({ days: 7 }).subscribe();

    const req = httpMock.expectOne(`${BASE}/orders-status?days=7`);
    expect(req.request.params.get('days')).toBe('7');
    req.flush({ success: true, data: {} });
  });

  it('getTopProducts construye days y limit', () => {
    service.getTopProducts({ days: 30, limit: 5 }).subscribe();

    const req = httpMock.expectOne(`${BASE}/top-products?days=30&limit=5`);
    expect(req.request.params.get('limit')).toBe('5');
    req.flush({ success: true, data: [] });
  });

  it('getCategorySales envía el rango', () => {
    service.getCategorySales({ days: 90 }).subscribe();

    const req = httpMock.expectOne(`${BASE}/category-sales?days=90`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('getInventorySummary no envía query y devuelve el resumen', () => {
    let result: unknown;
    service.getInventorySummary().subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/inventory-summary`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({ success: true, data: { inventoryValue: 100 } });

    expect(result).toEqual({ inventoryValue: 100 });
  });

  it('omite los filtros vacíos / no enviados', () => {
    service.getRevenueSeries({}).subscribe();

    const req = httpMock.expectOne(`${BASE}/revenue`);
    expect(req.request.params.has('days')).toBe(false);
    req.flush({ success: true, data: [] });
  });
});
