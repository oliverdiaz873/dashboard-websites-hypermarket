import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductsService } from '../services/products.service';
import type { ProductsQuery } from '../models/products-query';
import type { CreateProductPayload, Product } from '../models/product.model';

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

  it('list omite filtros vacíos', () => {
    service.list({ page: 1, limit: 50 }).subscribe();

    const req = httpMock.expectOne(`${BASE}?page=1&limit=50`);
    expect(req.request.params.has('q')).toBe(false);
    req.flush({ success: true, data: [], pagination: { page: 1, limit: 50, total: 0, pages: 1 } });
  });

  it('getById recupera un producto con su id', () => {
    const product: Product = makeProduct({ id: 'p1' });

    let result: Product | undefined;
    service.getById('p1').subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/p1`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: product });

    expect(result).toEqual(product);
  });

  it('create hace POST con el payload y devuelve el producto', () => {
    const payload: CreateProductPayload = {
      name: 'Café Molido',
      price: 120,
      image: 'https://example.com/cafe.png',
      categoryId: 'c1',
      brandId: 'b1',
      stock: 10,
      minStock: 2,
    };
    const created: Product = makeProduct({ id: 'p9' });

    let result: Product | undefined;
    service.create(payload).subscribe((res) => (result = res));

    const req = httpMock.expectOne(BASE);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: created });

    expect(result).toEqual(created);
  });

  it('update hace PATCH con el id y el payload parcial', () => {
    const payload = { price: 99 };

    let result: Product | undefined;
    service.update('p1', payload).subscribe((res) => (result = res));

    const req = httpMock.expectOne(`${BASE}/p1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: makeProduct({ id: 'p1', price: 99 }) });

    expect(result?.price).toBe(99);
  });

  it('remove hace DELETE y no espera body', () => {
    let completed = false;
    service.remove('p1').subscribe({ complete: () => (completed = true) });

    const req = httpMock.expectOne(`${BASE}/p1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null, { status: 204, statusText: 'No Content' });

    expect(completed).toBe(true);
  });

  function makeProduct(overrides: Partial<Product> = {}): Product {
    return {
      id: 'p1',
      sku: 'SKU-1',
      name: 'Arroz',
      price: 80,
      image: 'arroz.png',
      categoryId: 'c1',
      category: { name: 'Granos', slug: 'granos' },
      status: 'active',
      isAvailable: true,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      ...overrides,
    };
  }
});
