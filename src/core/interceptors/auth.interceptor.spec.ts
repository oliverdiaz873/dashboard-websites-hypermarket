import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SKIP_AUTH } from '../http/tokens/http-context.tokens';
import { AUTH_TOKEN } from '../tokens/auth.tokens';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  function setup(tokenSource?: () => string | null) {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        ...(tokenSource ? [{ provide: AUTH_TOKEN, useValue: tokenSource }] : []),
      ],
    });
    return {
      http: TestBed.inject(HttpClient),
      httpMock: TestBed.inject(HttpTestingController),
    };
  }

  it('añade Authorization: Bearer cuando hay token', () => {
    const { http, httpMock } = setup(() => 'token-123');

    http.get('/users').subscribe();
    const req = httpMock.expectOne('/users');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-123');
    req.flush({ success: true, data: [] });
  });

  it('no añade cabecera cuando no hay token (por defecto inerte)', () => {
    const { http, httpMock } = setup();

    http.get('/users').subscribe();
    const req = httpMock.expectOne('/users');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ success: true, data: [] });
  });

  it('respeta el contexto SKIP_AUTH incluso con token', () => {
    const { http, httpMock } = setup(() => 'token-123');
    const context = new HttpContext().set(SKIP_AUTH, true);

    http.get('/public', { context }).subscribe();
    const req = httpMock.expectOne('/public');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({ success: true, data: [] });
  });
});
