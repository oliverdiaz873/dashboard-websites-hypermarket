import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BrandsStore } from './brands.store';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import type { Brand } from '../models/brand.model';

const BRANDS_URL = 'http://localhost:3000/api/brands';

function makeBrand(overrides: Partial<Brand> = {}): Brand {
  return {
    id: 'b1',
    name: 'Coca-Cola',
    slug: 'coca-cola',
    description: 'Bebidas gaseosas',
    status: 'active',
    ...overrides,
  };
}

describe('BrandsStore', () => {
  let store: InstanceType<typeof BrandsStore>;
  let notifications: NotificationsStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(BrandsStore);
    notifications = TestBed.inject(NotificationsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('load consume GET /api/brands y rellena el estado', async () => {
    const pending = store.load();
    httpMock.expectOne(BRANDS_URL).flush({ success: true, data: [makeBrand()] });
    await pending;

    expect(store.hasLoaded()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.items().length).toBe(1);
    expect(store.isEmpty()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('load ante fallo marca hasLoaded y expone el error', async () => {
    const pending = store.load();
    httpMock.expectOne(BRANDS_URL).error(new ErrorEvent('boom'), { status: 500 });
    await pending;

    expect(store.hasLoaded()).toBe(true);
    expect(store.error()).toBe('No se pudieron cargar las marcas.');
    expect(store.isLoading()).toBe(false);
  });

  it('setStatusFilter filtra en memoria por estado', async () => {
    const pending = store.load();
    httpMock
      .expectOne(BRANDS_URL)
      .flush({ success: true, data: [makeBrand(), makeBrand({ id: 'b2', status: 'inactive' })] });
    await pending;

    store.setStatusFilter('inactive');
    expect(store.filteredItems().map((b) => b.id)).toEqual(['b2']);

    store.setStatusFilter('active');
    expect(store.filteredItems().map((b) => b.id)).toEqual(['b1']);

    store.setStatusFilter('all');
    expect(store.filteredItems().length).toBe(2);
  });

  it('create hace POST y recarga el listado + notifica', async () => {
    const pendingLoad = store.load();
    httpMock.expectOne(BRANDS_URL).flush({ success: true, data: [] });
    await pendingLoad;

    const pending = store.create({ name: 'Coca-Cola' });
    const req = httpMock.expectOne(BRANDS_URL);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: makeBrand() });
    await Promise.resolve();
    httpMock.expectOne(BRANDS_URL).flush({ success: true, data: [makeBrand()] });

    const result = await pending;
    expect(result?.id).toBe('b1');
    expect(store.items().length).toBe(1);
    expect(notifications.notifications().length).toBe(1);
  });

  it('toggleStatus hace PATCH status invertido y recarga', async () => {
    const pendingLoad = store.load();
    httpMock.expectOne(BRANDS_URL).flush({ success: true, data: [makeBrand()] });
    await pendingLoad;

    const pending = store.toggleStatus(makeBrand());
    const req = httpMock.expectOne(`${BRANDS_URL}/b1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'inactive' });
    req.flush({ success: true, data: makeBrand({ status: 'inactive' }) });
    await Promise.resolve();
    httpMock
      .expectOne(BRANDS_URL)
      .flush({ success: true, data: [makeBrand({ status: 'inactive' })] });

    await pending;
    expect(store.items()[0].status).toBe('inactive');
    expect(notifications.notifications().length).toBe(2);
  });

  it('remove consume DELETE 204 y elimina la marca del listado', async () => {
    const pendingLoad = store.load();
    httpMock.expectOne(BRANDS_URL).flush({ success: true, data: [makeBrand()] });
    await pendingLoad;

    const pending = store.remove('b1');
    const req = httpMock.expectOne(`${BRANDS_URL}/b1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    await pending;
    expect(store.items()).toEqual([]);
    expect(store.isEmpty()).toBe(true);
    expect(notifications.notifications().length).toBe(1);
  });
});
