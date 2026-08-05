import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AuditLogService } from './audit-log.service';
import type { AuditLog, AuditLogQuery } from '../models/audit-log.model';

const BASE = 'http://localhost:3000/api/admin/audit-logs';

function makeAuditLog(overrides: Partial<AuditLog> = {}): AuditLog {
  return {
    id: 'log1',
    userId: 'u1',
    userName: 'Oliver Diaz',
    action: 'LOGIN',
    entity: 'auth',
    success: true,
    details: undefined,
    createdAt: new Date('2026-01-15T00:00:00.000Z'),
    ...overrides,
  };
}

describe('AuditLogService', () => {
  let service: AuditLogService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuditLogService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list construye los query params y devuelve data + pagination', () => {
    const query: AuditLogQuery = {
      page: 2,
      limit: 20,
      q: 'login',
      action: 'LOGIN',
      entity: 'inventory',
      entityId: 'p1',
      from: '2026-01-01',
      to: '2026-01-10',
    };

    let result: { data: AuditLog[]; pagination: { total: number } } | undefined;
    service.list(query).subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      `${BASE}?page=2&limit=20&q=login&action=LOGIN&entity=inventory&entityId=p1&from=2026-01-01&to=2026-01-10`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [makeAuditLog()],
      pagination: { page: 2, limit: 20, total: 1, pages: 1 },
    });

    expect(result?.data).toEqual([makeAuditLog()]);
    expect(result?.pagination.total).toBe(1);
  });

  it('list omite filtros vacíos', () => {
    service.list({ page: 1, limit: 50 }).subscribe();

    const req = httpMock.expectOne(`${BASE}?page=1&limit=50`);
    expect(req.request.params.has('q')).toBe(false);
    expect(req.request.params.has('action')).toBe(false);
    expect(req.request.params.has('entity')).toBe(false);
    expect(req.request.params.has('from')).toBe(false);
    expect(req.request.params.has('to')).toBe(false);
    req.flush({ success: true, data: [], pagination: { page: 1, limit: 50, total: 0, pages: 1 } });
  });

  it('getById recupera un registro de auditoría', () => {
    let result: AuditLog | undefined;
    service.getById('log1').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/log1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: makeAuditLog() });

    expect(result?.id).toBe('log1');
    expect(result?.action).toBe('LOGIN');
  });
});
