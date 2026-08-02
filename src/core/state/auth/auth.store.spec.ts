import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { authInterceptor } from '../../interceptors/auth.interceptor';
import { STORAGE_KEYS } from '../../constants/storage-keys';
import { AuthStore } from './auth.store';

const adminUser = {
  id: '1',
  name: 'Admin',
  email: 'admin@hypermarket.dev',
  role: 'admin' as const,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const customerUser = { ...adminUser, id: '2', name: 'Cliente', role: 'customer' as const };

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    store = TestBed.inject(AuthStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('inicia sin sesión y sin inicializar', () => {
    expect(store.isAuthenticated()).toBe(false);
    expect(store.initialized()).toBe(false);
  });

  it('setAuthenticated marca el usuario como autenticado y persiste el token', () => {
    store.setAuthenticated({ token: 'jwt-1', user: adminUser });
    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentUser()).toEqual(adminUser);
    expect(store.currentRole()).toBe('admin');
    expect(window.localStorage.getItem(STORAGE_KEYS.authToken)).toBeTruthy();
  });

  it('logout limpia la sesión y elimina el token persistido', () => {
    store.setAuthenticated({ token: 'jwt-1', user: adminUser });
    store.logout();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.currentUser()).toBeNull();
    expect(window.localStorage.getItem(STORAGE_KEYS.authToken)).toBeNull();
  });

  it('initializeSession restaura la sesión desde un token persistido', async () => {
    window.localStorage.setItem(STORAGE_KEYS.authToken, JSON.stringify('jwt-1'));

    const promise = store.initializeSession();
    const me = httpMock.expectOne('http://localhost:3000/api/auth/me');
    me.flush({ success: true, data: adminUser });
    await promise;

    expect(store.initialized()).toBe(true);
    expect(store.currentUser()).toEqual(adminUser);
  });

  it('initializeSession sin token marca inicializado sin llamar a la API', async () => {
    await store.initializeSession();
    expect(store.initialized()).toBe(true);
    expect(store.isAuthenticated()).toBe(false);
  });

  it('initializeSession limpia el token ante un 401 del perfil', async () => {
    window.localStorage.setItem(STORAGE_KEYS.authToken, JSON.stringify('token-invalid'));
    store.setAuthenticated({ token: 'token-invalid', user: adminUser });

    const promise = store.initializeSession();
    const me = httpMock.expectOne('http://localhost:3000/api/auth/me');
    me.flush(
      { success: false, message: 'No autorizado', statusCode: 401 },
      { status: 401, statusText: 'Unauthorized' },
    );
    await promise;

    expect(store.initialized()).toBe(true);
    expect(store.isAuthenticated()).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEYS.authToken)).toBeNull();
  });

  it('hasRole: roles vacíos conceden acceso a todos', () => {
    store.setAuthenticated({ token: 'jwt-1', user: customerUser });
    expect(store.hasRole([])).toBe(true);
  });

  it('hasRole solo autoriza roles coincidentes', () => {
    store.setAuthenticated({ token: 'jwt-1', user: customerUser });
    expect(store.hasRole(['admin'])).toBe(false);

    store.setAuthenticated({ token: 'jwt-2', user: adminUser });
    expect(store.hasRole(['admin'])).toBe(true);
    expect(store.hasRole(['customer'])).toBe(false);
  });
});
