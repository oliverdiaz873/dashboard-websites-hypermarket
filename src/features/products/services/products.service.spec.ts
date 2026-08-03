import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductsService } from '../services/products.service';
import type { ProductsQuery } from '../models/products-query';
import type { Product } from '../models/product.model';

const BASE = 'http://localhost:3000/api/products';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ProductsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('list construye los query params y devuelve data + pagination', () => {
    const query: ProductsQuery = {
      page: 2,
      limit: 20,
      q: 'arroz',
      status: 'active',
      sortBy: 'name',
      sortOrder: 'asc',
    };
    const product: Product = {
      id: 'p1',
      sku: 'SKU-1',
      name: 'Arroz',
      price: 80,
      image: 'arroz.png',
      categoryId: 'c1',
      category: { name: 'Granos', slug: 'granos' },
      status: 'active',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    let result: { data: Product[]; pagination: { total: number } } | undefined;
    service.list(query).subscribe((res) => (result = res));

    const req = httpMock.expectOne(
      `${BASE}?page=2&limit=20&q=arroz&status=active&sortBy=name&sortOrder=asc`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: [product],
      pagination: { page: 2, limit: 20, total: 1, pages: 1 },
    });

    expect(result?.data).toEqual([product]);
    expect(result?.pagination.total).toBe(1);
  });

  it('list omite filtros vacÃ­os', () => {
    service.list({ page: 1, limit: 50 }).subscribe();

    const req = httpMock.expectOne(`${BASE}?page=1&limit=50`);
    expect(req.request.params.has('q')).toBe(false);
    req.flush({ success: true, data: [], pagination: { page: 1, limit: 50, total: 0, pages: 1 } });
  });
});
