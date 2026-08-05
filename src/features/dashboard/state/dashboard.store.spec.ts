import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { DashboardStore } from './dashboard.store';

const BASE = 'http://localhost:3000/api/admin/stats';

const kpis = {
  revenue: 1000,
  averageOrderValue: 200,
  orders: 10,
  completedOrders: 5,
  pendingOrders: 2,
  customers: 20,
  newCustomers: 4,
  lowStock: 3,
  pendingContactMessages: 7,
  growthPercent: 100,
};

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;
  let httpMock: HttpTestingController;

  const byUrl = (fragment: string) => (req: { url: string }) =>
    req.url.includes(`${BASE}${fragment}`);

  const flushOverview = () =>
    httpMock.expectOne(byUrl('/dashboard')).flush({ success: true, data: kpis });
  const flushRevenue = () =>
    httpMock
      .expectOne(byUrl('/revenue'))
      .flush({ success: true, data: [{ date: '2026-07-01', total: 100 }] });
  const flushOrders = () =>
    httpMock.expectOne(byUrl('/orders-status')).flush({
      success: true,
      data: { pending: 2, confirmed: 0, processing: 0, shipped: 0, completed: 5, cancelled: 3 },
    });
  const flushTop = () =>
    httpMock.expectOne(byUrl('/top-products')).flush({
      success: true,
      data: [{ productId: 'p1', name: 'Arroz', quantity: 3, revenue: 300 }],
    });
  const flushCategories = () =>
    httpMock.expectOne(byUrl('/category-sales')).flush({
      success: true,
      data: [{ category: 'Granos', slug: 'granos', revenue: 250, orders: 2 }],
    });
  const flushInventory = () =>
    httpMock.expectOne(byUrl('/inventory-summary')).flush({
      success: true,
      data: {
        inventoryValue: 1100,
        totalUnits: 12,
        totalProducts: 2,
        lowStockCount: 1,
        outOfStockCount: 0,
      },
    });

  const flushAll = () => {
    flushOverview();
    flushRevenue();
    flushOrders();
    flushTop();
    flushCategories();
    flushInventory();
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(DashboardStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('carga los KPIs y las series con el rango por defecto (30 días)', async () => {
    const pending = store.load();
    flushAll();
    await pending;

    expect(store.hasLoaded()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.kpis()?.revenue).toBe(1000);
    expect(store.revenueTrend().length).toBe(1);
    expect(store.topProducts().length).toBe(1);
    expect(store.categorySales().length).toBe(1);
    expect(store.inventorySummary()?.lowStockCount).toBe(1);
    expect(store.kpiCards().length).toBe(4);
  });

  it('envía days=30 en el dashboard y las series, y limit=5 en top-products por defecto', async () => {
    const pending = store.load();

    const dashboard = httpMock.expectOne(byUrl('/dashboard'));
    const revenue = httpMock.expectOne(byUrl('/revenue'));
    const top = httpMock.expectOne(byUrl('/top-products'));
    expect(dashboard.request.params.get('days')).toBe('30');
    expect(revenue.request.params.get('days')).toBe('30');
    expect(top.request.params.get('days')).toBe('30');
    expect(top.request.params.get('limit')).toBe('5');

    dashboard.flush({ success: true, data: kpis });
    revenue.flush({ success: true, data: [] });
    top.flush({ success: true, data: [] });
    flushOrders();
    flushCategories();
    flushInventory();
    await pending;
  });

  it('el título de ingresos refleja el rango activo', async () => {
    const pending = store.load();
    flushAll();
    await pending;

    expect(store.kpiCards()[0].title).toBe('Ingresos (30 días)');

    await store.setRange(7);
    httpMock.expectOne(byUrl('/revenue')).flush({ success: true, data: [] });
    // la recarga tras setRange hace 6 peticiones (dashboard, orders, top, categories, inventory)
    const dashboard = httpMock.expectOne(byUrl('/dashboard'));
    expect(dashboard.request.params.get('days')).toBe('7');
    dashboard.flush({ success: true, data: kpis });
    flushOrders();
    flushTop();
    flushCategories();
    flushInventory();

    expect(store.range()).toBe(7);
    expect(store.kpiCards()[0].title).toBe('Ingresos (7 días)');
  });

  it('setRange cambia el rango y recarga con el nuevo days', async () => {
    let pending = store.load();
    flushAll();
    await pending;

    pending = store.setRange(90);
    const reload = httpMock.expectOne(byUrl('/revenue'));
    expect(reload.request.params.get('days')).toBe('90');
    flushOverview();
    flushOrders();
    flushTop();
    flushCategories();
    flushInventory();
    await pending;

    expect(store.range()).toBe(90);
  });

  it('ignora reasignar el mismo rango sin disparar peticiones', async () => {
    store.setRange(30);
    expect(store.range()).toBe(30);
  });

  it('degrada el widget de KPIs sin tumbar el resto si /dashboard falla', async () => {
    const pending = store.load();

    httpMock.expectOne(byUrl('/dashboard')).error({ status: 500, statusText: 'Server Error' });
    flushRevenue();
    flushOrders();
    flushTop();
    flushCategories();
    flushInventory();

    await pending;
    expect(store.kpis()).toBeNull();
    expect(store.revenueTrend().length).toBe(1);
    expect(store.hasLoaded()).toBe(true);
    expect(store.error()).toBeNull();
    expect(store.isLoading()).toBe(false);
  });

  it('propaga error global solo si TODAS las métricas fallan', async () => {
    const pending = store.load();

    httpMock.expectOne(byUrl('/dashboard')).error({ status: 500, statusText: 'Server Error' });
    httpMock.expectOne(byUrl('/revenue')).error({ status: 500, statusText: 'Server Error' });
    httpMock.expectOne(byUrl('/orders-status')).error({ status: 500, statusText: 'Server Error' });
    httpMock.expectOne(byUrl('/top-products')).error({ status: 500, statusText: 'Server Error' });
    httpMock.expectOne(byUrl('/category-sales')).error({ status: 500, statusText: 'Server Error' });
    httpMock
      .expectOne(byUrl('/inventory-summary'))
      .error({ status: 500, statusText: 'Server Error' });

    await pending;
    expect(store.error()).toBeTruthy();
    expect(store.isLoading()).toBe(false);
  });
});
