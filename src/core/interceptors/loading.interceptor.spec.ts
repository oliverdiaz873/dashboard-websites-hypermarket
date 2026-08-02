import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { SKIP_LOADING } from '../http/tokens/http-context.tokens';
import { LoadingStore } from '../state/loading/loading.store';
import { loadingInterceptor } from './loading.interceptor';

describe('loadingInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loadingStore: InstanceType<typeof LoadingStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loadingInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loadingStore = TestBed.inject(LoadingStore);
    loadingStore.reset();
  });

  it('incrementa el contador durante la petición y lo decrementa al finalizar', () => {
    expect(loadingStore.isLoading()).toBe(false);

    http.get('/users').subscribe();
    expect(loadingStore.activeRequests()).toBe(1);
    expect(loadingStore.isLoading()).toBe(true);

    const req = httpMock.expectOne('/users');
    req.flush({ success: true, data: [] });

    expect(loadingStore.activeRequests()).toBe(0);
    expect(loadingStore.isLoading()).toBe(false);
  });

  it('no afecta al contador en peticiones SKIP_LOADING', () => {
    const context = new HttpContext().set(SKIP_LOADING, true);

    http.get('/public', { context }).subscribe();
    expect(loadingStore.activeRequests()).toBe(0);

    const req = httpMock.expectOne('/public');
    req.flush({ success: true, data: [] });
    expect(loadingStore.activeRequests()).toBe(0);
  });

  it('decrementa también cuando la petición falla', () => {
    http.get('/users').subscribe({ error: () => undefined });
    expect(loadingStore.activeRequests()).toBe(1);

    const req = httpMock.expectOne('/users');
    req.flush(
      { success: false, message: 'boom', statusCode: 500 },
      { status: 500, statusText: 'Server Error' },
    );

    expect(loadingStore.activeRequests()).toBe(0);
  });
});
