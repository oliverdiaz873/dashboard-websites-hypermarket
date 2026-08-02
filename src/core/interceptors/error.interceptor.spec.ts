import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { NOTIFICATION_TYPE } from '../enums/notification-type';
import { isApiError } from '../models/api-error';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AuthStore } from '../state/auth/auth.store';
import { NotificationsStore } from '../state/notifications/notifications.store';
import { errorInterceptor } from './error.interceptor';

describe('errorInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let notificationsStore: InstanceType<typeof NotificationsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    notificationsStore = TestBed.inject(NotificationsStore);
    notificationsStore.clear();
  });

  it('mapea errores HTTP a ApiError con mensaje del body', async () => {
    const errorPromise = firstValueFrom(http.get('/users')).catch((e) => e);

    const req = httpMock.expectOne('/users');
    req.flush(
      { success: false, message: 'No encontrado', statusCode: 404 },
      { status: 404, statusText: 'Not Found' },
    );

    const error = await errorPromise;
    expect(isApiError(error)).toBe(true);
    expect(error.statusCode).toBe(404);
    expect(error.message).toBe('No encontrado');
  });

  it('usa un mensaje por defecto cuando el body no trae message', async () => {
    const errorPromise = firstValueFrom(http.get('/users')).catch((e) => e);

    const req = httpMock.expectOne('/users');
    req.flush('', { status: 401, statusText: 'Unauthorized' });

    const error = await errorPromise;
    expect(isApiError(error)).toBe(true);
    expect(error.statusCode).toBe(401);
    expect(error.message).toBe('No autorizado');
  });

  it('notifica el error en el NotificationsStore', async () => {
    const promise = firstValueFrom(http.get('/users')).catch((e) => e);

    const req = httpMock.expectOne('/users');
    req.flush(
      { success: false, message: 'boom', statusCode: 500 },
      { status: 500, statusText: 'Server Error' },
    );
    await promise;

    expect(notificationsStore.unreadCount()).toBe(1);
    expect(notificationsStore.notifications()[0].type).toBe(NOTIFICATION_TYPE.ERROR);
    expect(notificationsStore.notifications()[0].message).toBe('boom');
  });

  it('un 401 fuera del login cierra la sesión del usuario', async () => {
    const authStore = TestBed.inject(AuthStore);
    authStore.setAuthenticated({
      token: 'token-x',
      user: {
        id: '1',
        name: 'Admin',
        email: 'admin@dev',
        role: 'admin',
        createdAt: '',
        updatedAt: '',
      },
    });
    window.localStorage.setItem(STORAGE_KEYS.authToken, JSON.stringify('token-x'));

    const promise = firstValueFrom(http.get('/users')).catch((e) => e);

    const req = httpMock.expectOne('/users');
    req.flush('', { status: 401, statusText: 'Unauthorized' });
    await promise;

    expect(authStore.isAuthenticated()).toBe(false);
    expect(window.localStorage.getItem(STORAGE_KEYS.authToken)).toBeNull();
  });

  it('no cierra la sesión en un 401 del propio login', async () => {
    const authStore = TestBed.inject(AuthStore);
    authStore.setAuthenticated({
      token: 'token-x',
      user: {
        id: '1',
        name: 'Admin',
        email: 'admin@dev',
        role: 'admin',
        createdAt: '',
        updatedAt: '',
      },
    });

    const promise = firstValueFrom(http.post('/auth/login', {})).catch((e) => e);

    const req = httpMock.expectOne('/auth/login');
    req.flush('', { status: 401, statusText: 'Unauthorized' });
    await promise;

    expect(authStore.isAuthenticated()).toBe(true);
  });
});
