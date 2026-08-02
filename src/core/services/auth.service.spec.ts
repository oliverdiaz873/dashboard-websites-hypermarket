import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { authInterceptor } from '../interceptors/auth.interceptor';
import { AuthTokenService } from './auth-token.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
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
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('login POST al endpoint /auth/login sin cabecera auth (skipAuth)', async () => {
    const promise = firstValueFrom(service.login({ email: 'a@b.dev', password: '123456' }));

    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ success: true, data: { token: 'jwt', user: { id: 'u1' } } });

    const res = await promise;
    expect(res.token).toBe('jwt');
  });

  it('getProfile adjunta el Bearer del token persistido', async () => {
    TestBed.inject(AuthTokenService).setToken('jwt-abc');
    const promise = firstValueFrom(service.getProfile());

    const req = httpMock.expectOne('http://localhost:3000/api/auth/me');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-abc');
    req.flush({ success: true, data: { id: 'u1', role: 'admin' } });
    await promise;
  });
});
