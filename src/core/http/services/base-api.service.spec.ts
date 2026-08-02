import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BaseApiService } from './base-api.service';
import {
  REQUEST_TIMEOUT_MS,
  RETRY_ATTEMPTS,
  SKIP_AUTH,
  SKIP_LOADING,
} from '../tokens/http-context.tokens';

class TestApiService extends BaseApiService {
  getProducts() {
    return this.get<{ id: number }[]>('/products');
  }

  createProduct() {
    return this.post<{ id: number }>('/products', { name: 'Test' });
  }

  updateProduct() {
    return this.put<{ id: number }>('/products/1', { name: 'Test 2' });
  }

  deleteProduct() {
    return this.delete('/products/1');
  }

  getWithOptions() {
    return this.get<{ id: number }>('/products', {
      params: { page: '1', sort: 'name' },
      timeoutMs: 5_000,
      retryAttempts: 1,
      skipLoading: true,
      skipAuth: true,
    });
  }
}

describe('BaseApiService', () => {
  let service: TestApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), TestApiService],
    });
    service = TestBed.inject(TestApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('GET construye la URL con baseUrl y desempaqueta data', () => {
    let result: { id: number }[] | undefined;
    service.getProducts().subscribe((data) => (result = data));

    const req = httpMock.expectOne('http://localhost:3000/api/products');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [{ id: 1 }] });

    expect(result).toEqual([{ id: 1 }]);
  });

  it('POST envía el body y desempaqueta data', () => {
    let result: { id: number } | undefined;
    service.createProduct().subscribe((data) => (result = data));

    const req = httpMock.expectOne('http://localhost:3000/api/products');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Test' });
    req.flush({ success: true, data: { id: 1 } });

    expect(result).toEqual({ id: 1 });
  });

  it('PUT envía el body y desempaqueta data', () => {
    service.updateProduct().subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/products/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ name: 'Test 2' });
    req.flush({ success: true, data: { id: 1 } });
  });

  it('DELETE con 204 resuelve como void', () => {
    let result: unknown = 'not-called';
    service.deleteProduct().subscribe((data) => (result = data));

    const req = httpMock.expectOne('http://localhost:3000/api/products/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(result).toBeUndefined();
  });

  it('aplica las opciones por petición al contexto HTTP', () => {
    service.getWithOptions().subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/products?page=1&sort=name');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('sort')).toBe('name');
    expect(req.request.context.get(SKIP_LOADING)).toBe(true);
    expect(req.request.context.get(SKIP_AUTH)).toBe(true);
    expect(req.request.context.get(REQUEST_TIMEOUT_MS)).toBe(5_000);
    expect(req.request.context.get(RETRY_ATTEMPTS)).toBe(1);
    req.flush({ success: true, data: { id: 1 } });
  });

  it('reintenta la petición según retryAttempts', () => {
    const errors: unknown[] = [];
    service.getWithOptions().subscribe({ error: (e) => errors.push(e) });

    const first = httpMock.expectOne('http://localhost:3000/api/products?page=1&sort=name');
    first.flush(
      { success: false, message: 'fail', statusCode: 500 },
      { status: 500, statusText: 'Server Error' },
    );

    const second = httpMock.expectOne('http://localhost:3000/api/products?page=1&sort=name');
    second.flush(
      { success: false, message: 'fail', statusCode: 500 },
      { status: 500, statusText: 'Server Error' },
    );

    expect(errors).toHaveLength(1);
  });
});
