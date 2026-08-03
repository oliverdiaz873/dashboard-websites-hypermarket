import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BrandsService, type BrandOption } from './brands.service';

const BASE = 'http://localhost:3000/api/brands';

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

  it('list devuelve las marcas desempaquetadas del envelope', () => {
    const brands: BrandOption[] = [
      { id: 'b1', name: 'Nestlé', slug: 'nestle' },
      { id: 'b2', name: 'Colgate', slug: 'colgate' },
    ];

    let result: BrandOption[] | undefined;
    service.list().subscribe((res) => (result = res));

    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: brands });

    expect(result).toEqual(brands);
  });
});
