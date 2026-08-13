import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ContactsStore } from './contacts.store';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import type { ContactMessage } from '../models/contact-message.model';

const URL = 'http://localhost:3000/api/admin/contact';

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

describe('ContactsStore', () => {
  let store: InstanceType<typeof ContactsStore>;
  let notifications: NotificationsStore;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ContactsStore);
    notifications = TestBed.inject(NotificationsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('load consume GET /api/admin/contact y llena el estado', async () => {
    const pending = store.load();
    httpMock.expectOne(URL).flush({ success: true, data: [makeContact()] });
    await pending;

    expect(store.hasLoaded()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.items().length).toBe(1);
    expect(store.pendingCount()).toBe(1);
  });

  it('setStatusFilter filtra los items en memoria sin recargar', async () => {
    const pending = store.load();
    httpMock.expectOne(URL).flush({
      success: true,
      data: [makeContact(), makeContact({ id: 'cm2', status: 'answered' })],
    });
    await pending;

    store.setStatusFilter('answered');
    expect(store.filteredItems().map((item) => item.id)).toEqual(['cm2']);

    store.setStatusFilter('pending');
    expect(store.filteredItems().map((item) => item.id)).toEqual(['cm1']);
  });

  it('updateStatus PATCHea y reemplaza el item en memoria + notifica éxito', async () => {
    const pendingLoad = store.load();
    httpMock.expectOne(URL).flush({ success: true, data: [makeContact()] });
    await pendingLoad;

    const pending = store.updateStatus('cm1', 'read');
    const req = httpMock.expectOne(`${URL}/cm1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'read' });
    req.flush({ success: true, data: makeContact({ status: 'read' }) });
    await pending;

    expect(store.items()[0].status).toBe('read');
    expect(store.isMutating()).toBe(false);
    expect(notifications.notifications().length).toBe(1);
  });

  it('remove consume DELETE (204) y quita el mensaje del estado + notifica', async () => {
    const pendingLoad = store.load();
    httpMock.expectOne(URL).flush({ success: true, data: [makeContact()] });
    await pendingLoad;

    const pending = store.remove('cm1');
    const req = httpMock.expectOne(`${URL}/cm1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });
    await pending;

    expect(store.items()).toEqual([]);
    expect(store.isEmpty()).toBe(true);
    expect(notifications.notifications().length).toBe(1);
  });

  it('en fallo de la primera carga marca hasLoaded y expone el error', async () => {
    const pending = store.load();
    httpMock.expectOne(URL).error(new ErrorEvent('boom'), { status: 500 });
    await pending;

    expect(store.hasLoaded()).toBe(true);
    expect(store.error()).toBe('No se pudieron cargar los mensajes de contacto.');
    expect(store.isLoading()).toBe(false);
  });
});
