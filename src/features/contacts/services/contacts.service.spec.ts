import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ContactsService } from './contacts.service';
import type { ContactMessage } from '../models/contact-message.model';

const BASE = 'http://localhost:3000/api/admin/contact';

function makeContact(overrides: Partial<ContactMessage> = {}): ContactMessage {
  return {
    id: 'cm1',
    name: 'Juan Pérez',
    email: 'juan@example.com',
    message: 'Consulta sobre un pedido',
    status: 'pending',
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-01-15T00:00:00.000Z',
    ...overrides,
  };
}

describe('ContactsService', () => {
  let service: ContactsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ContactsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list recupera todos los mensajes (array, sin paginación)', () => {
    let result: ContactMessage[] | undefined;
    service.list().subscribe((res) => (result = res));

    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [makeContact()] });

    expect(result).toEqual([makeContact()]);
  });

  it('getById recupera un mensaje por id', () => {
    let result: ContactMessage | undefined;
    service.getById('cm1').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/cm1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: makeContact() });

    expect(result?.id).toBe('cm1');
  });

  it('updateStatus envía PATCH con { status } y devuelve el mensaje actualizado', () => {
    let result: ContactMessage | undefined;
    service.updateStatus('cm1', 'read').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/cm1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'read' });
    req.flush({ success: true, data: makeContact({ status: 'read' }) });

    expect(result?.status).toBe('read');
  });

  it('remove emite DELETE y completa sin cuerpo (204)', () => {
    let completed = false;
    service.remove('cm1').subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne(`${BASE}/cm1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
  });
});
