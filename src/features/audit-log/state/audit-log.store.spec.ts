import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuditLogStore } from './audit-log.store';
import type { AuditLog } from '../models/audit-log.model';

const URL = 'http://localhost:3000/api/admin/audit-logs';

function makeAuditLog(overrides: Partial<AuditLog> = {}): AuditLog {
  return {
    id: 'log1',
    userId: 'u1',
    userName: 'Oliver Diaz',
    action: 'LOGIN',
    entity: 'auth',
    success: true,
    createdAt: new Date('2026-01-15T00:00:00.000Z'),
    ...overrides,
  };
}

describe('AuditLogStore', () => {
  let store: InstanceType<typeof AuditLogStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AuditLogStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const flushList = (data: AuditLog[], total: number, page = 1, limit = 20) => {
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
    flushList([makeAuditLog()], 1);

    await pending;
    expect(store.page()).toBe(1);
    expect(store.hasLoaded()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.items().length).toBe(1);
    expect(store.total()).toBe(1);
  });

  it('enviar filtros (búsqueda, acción, entidad, rango) resetea la página a 1', async () => {
    const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    store.setSearch('login');
    const searchReq = httpMock.expectOne(
      (r) => r.url.includes(URL) && r.params.get('q') === 'login',
    );
    expect(searchReq.request.params.get('page')).toBe('1');
    searchReq.flush({
      success: true,
      data: [makeAuditLog()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    await tick();

    store.setAction('INVENTORY_ADJUST');
    const actionReq = httpMock.expectOne(
      (r) => r.url.includes(URL) && r.params.get('action') === 'INVENTORY_ADJUST',
    );
    expect(actionReq.request.params.get('page')).toBe('1');
    actionReq.flush({
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    });
    await tick();

    store.setDateRange('2026-01-01', '2026-01-31');
    const dateReq = httpMock.expectOne(
      (r) =>
        r.url.includes(URL) &&
        r.params.get('from') === '2026-01-01' &&
        r.params.get('to') === '2026-01-31',
    );
    expect(dateReq.request.params.get('page')).toBe('1');
    dateReq.flush({
      success: true,
      data: [makeAuditLog()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    await tick();

    expect(store.search()).toBe('login');
    expect(store.action()).toBe('INVENTORY_ADJUST');
    expect(store.from()).toBe('2026-01-01');
    expect(store.to()).toBe('2026-01-31');
    expect(store.page()).toBe(1);
  });

  it('loadDetail establece selectedLog', async () => {
    const pending = store.loadDetail('log1');
    const req = httpMock.expectOne(`${URL}/log1`);
    req.flush({ success: true, data: makeAuditLog() });
    await pending;

    expect(store.selectedLog()?.id).toBe('log1');
    expect(store.selectedLog()?.userName).toBe('Oliver Diaz');
    expect(store.isLoading()).toBe(false);
  });

  it('clearFilters limpia todos los filtros y recarga', async () => {
    const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    store.setSearch('login');
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.params.get('q') === 'login')
      .flush({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } });
    await tick();

    store.clearFilters();
    const req = httpMock.expectOne(
      (r) => r.url.includes(URL) && !r.params.get('q') && !r.params.get('action'),
    );
    req.flush({
      success: true,
      data: [makeAuditLog()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    await tick();

    expect(store.search()).toBe('');
    expect(store.entity()).toBe('');
    expect(store.from()).toBe('');
    expect(store.to()).toBe('');
    expect(store.page()).toBe(1);
  });

  it('en fallo de la primera carga marca hasLoaded y expone el error', async () => {
    const pending = store.load();
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.params.get('page') === '1')
      .error(new ErrorEvent('boom'), { status: 500 });
    await pending;

    expect(store.hasLoaded()).toBe(true);
    expect(store.error()).toBe('No se pudieron cargar los registros de auditoría.');
    expect(store.isLoading()).toBe(false);
  });

  it('una carga más nueva descarta el resultado de una carga anterior en vuelo', async () => {
    const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    store.setSearch('order');
    const reqA = httpMock.expectOne((r) => r.url.includes(URL) && r.params.get('q') === 'order');

    store.setSearch('order-123');
    const reqB = httpMock.expectOne(
      (r) => r.url.includes(URL) && r.params.get('q') === 'order-123',
    );

    reqB.flush({
      success: true,
      data: [makeAuditLog({ id: 'new' })],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    await tick();

    reqA.flush({
      success: true,
      data: [makeAuditLog({ id: 'old' })],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    await tick();

    expect(store.search()).toBe('order-123');
    expect(store.items().map((item) => item.id)).toEqual(['new']);
    expect(store.isLoading()).toBe(false);
  });
});
