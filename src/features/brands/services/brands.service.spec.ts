import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BrandsService } from './brands.service';
import type { Brand } from '../models/brand.model';

const BRANDS_URL = 'http://localhost:3000/api/brands';

function makeBrand(overrides: Partial<Brand> = {}): Brand {
  return {
    id: 'b1',
    name: 'Coca-Cola',
    slug: 'coca-cola',
    description: 'Bebidas gaseosas',
    status: 'active',
    ...overrides,
  };
}

describe('BrandsService', () => {
  let service: BrandsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(BrandsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list consume GET /api/brands', () => {
    let result: Brand[] | undefined;
    service.list().subscribe((res) => (result = res));

    const req = httpMock.expectOne(BRANDS_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [makeBrand()] });

    expect(result).toEqual([makeBrand()]);
  });

  it('create hace POST /api/brands con el payload', () => {
    let result: Brand | undefined;
    service.create({ name: 'Coca-Cola' }).subscribe((res) => (result = res));

    const req = httpMock.expectOne(BRANDS_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Coca-Cola' });
    req.flush({ success: true, data: makeBrand() });

    expect(result?.id).toBe('b1');
  });

  it('update hace PATCH /api/brands/:id y devuelve la marca actualizada', () => {
    let result: Brand | undefined;
    service.update('b1', { status: 'inactive' }).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BRANDS_URL}/b1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'inactive' });
    req.flush({ success: true, data: makeBrand({ status: 'inactive' }) });

    expect(result?.status).toBe('inactive');
  });

  it('remove emite DELETE /api/brands/:id y completa sin cuerpo (204)', () => {
    let completed = false;
    service.remove('b1').subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne(`${BRANDS_URL}/b1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
  });
});
