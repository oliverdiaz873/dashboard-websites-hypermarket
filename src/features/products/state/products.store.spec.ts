import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ProductsStore } from './products.store';
import type { CreateProductPayload, Product } from '../models/product.model';

const URL = 'http://localhost:3000/api/products';

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

describe('ProductsStore', () => {
  let store: InstanceType<typeof ProductsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ProductsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  it('carga la primera página con los defaults', async () => {
    const flush = (page: number) => {
      const req = httpMock.expectOne(
        (r) => r.url.includes(URL) && r.params.get('page') === `${page}`,
      );
      req.flush({
        success: true,
        data: [makeProduct()],
        pagination: { page, limit: 20, total: 1, pages: 1 },
      });
    };

    const p = store.load();
    flush(1);
    await p;

    expect(store.page()).toBe(1);
    expect(store.isLoading()).toBe(false);
    expect(store.hasLoaded()).toBe(true);
    expect(store.products().length).toBe(1);
  });

  it('limpia el error si un filtro devuelve vacío', async () => {
    const pending = store.load();
    const req = httpMock.expectOne((r) => r.url.includes(URL));
    req.flush({ success: true, data: [], pagination: { page: 1, limit: 20, total: 0, pages: 1 } });
    await pending;

    expect(store.isEmpty()).toBe(true);
    expect(store.total()).toBe(0);
    expect(store.error()).toBeNull();
  });

  it('cambiar search/category/status resetea la página a 1', async () => {
    const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

    // Página previa: el usuario estaba en página 2.
    store.setPage(2);
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.params.get('page') === '2')
      .flush({
        success: true,
        data: [],
        pagination: { page: 2, limit: 20, total: 0, pages: 1 },
      });
    await tick();
    expect(store.page()).toBe(2);

    // Cambiar búsqueda debe disparar recarga con page=1.
    store.setSearch('arroz');
    const req = httpMock.expectOne((r) => r.url.includes(URL) && r.params.get('q') === 'arroz');
    expect(req.request.params.get('page')).toBe('1');
    req.flush({
      success: true,
      data: [makeProduct()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    });
    await tick();

    expect(store.page()).toBe(1);
    expect(store.search()).toBe('arroz');

    // Cambiar status también resetea a página 1.
    store.setPage(2);
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.params.get('page') === '2')
      .flush({
        success: true,
        data: [],
        pagination: { page: 2, limit: 20, total: 0, pages: 1 },
      });
    await tick();

    store.setStatus('inactive');
    const statusReq = httpMock.expectOne(
      (r) => r.url.includes(URL) && r.params.get('status') === 'inactive',
    );
    expect(statusReq.request.params.get('page')).toBe('1');
    statusReq.flush({
      success: true,
      data: [],
      pagination: { page: 1, limit: 20, total: 0, pages: 1 },
    });
    await tick();
    expect(store.page()).toBe(1);
  });

  it('expone la selección de filas', async () => {
    store.setPage(1);
    httpMock
      .expectOne((r) => r.url.includes(URL))
      .flush({
        success: true,
        data: [makeProduct()],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      });

    store.setSelectedIds(['p1']);
    expect(store.selectedCount()).toBe(1);
    store.clearSelection();
    expect(store.selectedCount()).toBe(0);
  });

  it('carga subcategorías como opciones de filtro con value = slug de la subcategoría', async () => {
    const pending = store.loadCategories();
    httpMock
      .expectOne((r) => r.url.includes('http://localhost:3000/api/categories'))
      .flush({
        success: true,
        data: [
          {
            id: 'alimentos',
            name: 'Alimentos',
            slug: 'alimentos',
            subcategories: [
              { name: 'Bebidas', slug: 'bebidas' },
              { name: 'Despensa', slug: 'despensa' },
            ],
          },
        ],
      });
    await pending;

    expect(store.categories()).toEqual([
      { value: 'bebidas', label: 'Alimentos - Bebidas' },
      { value: 'despensa', label: 'Alimentos - Despensa' },
    ]);
  });

  it('createProduct hace POST, recarga el listado y gestiona isSubmitting', async () => {
    const payload: CreateProductPayload = {
      name: 'Café Molido',
      price: 120,
      categoryId: 'c1',
    };

    const pending = store.createProduct(payload);

    const post = httpMock.expectOne((r) => r.url.includes(URL) && r.method === 'POST');
    expect(post.request.body).toEqual(payload);
    expect(store.isSubmitting()).toBe(true);
    post.flush({ success: true, data: makeProduct() });
    await tick();

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({
        success: true,
        data: [makeProduct()],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      });

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.products().length).toBe(1);
  });

  it('deleteProduct hace DELETE y recarga el listado', async () => {
    const pending = store.deleteProduct('p1');

    const del = httpMock.expectOne((r) => r.url.includes(URL) && r.method === 'DELETE');
    expect(del.request.method).toBe('DELETE');
    del.flush(null, { status: 204, statusText: 'No Content' });
    await tick();

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({
        success: true,
        data: [],
        pagination: { page: 1, limit: 20, total: 0, pages: 1 },
      });

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.isEmpty()).toBe(true);
  });

  it('updateProduct hace PATCH y recarga el listado', async () => {
    const payload = { price: 99 };

    const pending = store.updateProduct('p1', payload);

    const patch = httpMock.expectOne((r) => r.url.includes(URL) && r.method === 'PATCH');
    expect(patch.request.body).toEqual(payload);
    patch.flush({ success: true, data: makeProduct({ price: 99 }) });
    await tick();

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({
        success: true,
        data: [makeProduct({ price: 99 })],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      });

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.products()[0]?.price).toBe(99);
  });

  it('loadProduct recupera un producto por id (o null si falla)', async () => {
    const pending = store.loadProduct('p1');
    httpMock
      .expectOne((r) => r.url.includes(`${URL}/p1`) && r.method === 'GET')
      .flush({ success: true, data: makeProduct() });
    await expect(pending).resolves.toMatchObject({ id: 'p1' });
  });

  it('createProduct con file: POST + presign + upload PUT + PATCH imageKey', async () => {
    const payload: CreateProductPayload = { name: 'Café', price: 120, categoryId: 'c1' };
    const file = new File(['x'], 'cafe.png', { type: 'image/png' });
    const pending = store.createProduct(payload, file);

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'POST')
      .flush({ success: true, data: makeProduct() });
    await tick();

    const presign = httpMock.expectOne(
      (r) =>
        r.url.includes('http://localhost:3000/api/admin/uploads/presigned') && r.method === 'POST',
    );
    expect(presign.request.body).toEqual({
      fileName: 'cafe.png',
      contentType: 'image/png',
      productId: 'p1',
    });
    presign.flush({
      success: true,
      data: {
        uploadUrl: 'http://localhost:3000/api/uploads/local?key=products/p1/x.png&sig=s',
        publicUrl: 'http://localhost:3000/uploads/products/p1/x.png',
        expiresInSeconds: 600,
        key: 'products/p1/x.png',
        productId: 'p1',
        purpose: 'product',
      },
    });
    await tick();

    const put = httpMock.expectOne(
      (r) => r.url.includes('http://localhost:3000/api/uploads/local') && r.method === 'PUT',
    );
    expect(put.request.body).toBe(file);
    put.flush({ success: true });
    await tick();

    const patch = httpMock.expectOne((r) => r.url.includes(`${URL}/p1`) && r.method === 'PATCH');
    expect(patch.request.body).toEqual({ imageKey: 'products/p1/x.png' });
    patch.flush({ success: true, data: makeProduct() });
    await tick();

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({
        success: true,
        data: [makeProduct()],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      });

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.products().length).toBe(1);
  });

  it('updateProduct con file: presign + upload PUT + PATCH con imageKey', async () => {
    const file = new File(['x'], 'cafe.png', { type: 'image/png' });
    const pending = store.updateProduct('p1', { price: 99 }, file);

    httpMock
      .expectOne(
        (r) =>
          r.url.includes('http://localhost:3000/api/admin/uploads/presigned') &&
          r.method === 'POST',
      )
      .flush({
        success: true,
        data: {
          uploadUrl: 'http://localhost:3000/api/uploads/local?key=products/p1/y.png&sig=s',
          publicUrl: 'http://localhost:3000/uploads/products/p1/y.png',
          expiresInSeconds: 600,
          key: 'products/p1/y.png',
          productId: 'p1',
          purpose: 'product',
        },
      });
    await tick();

    httpMock
      .expectOne(
        (r) => r.url.includes('http://localhost:3000/api/uploads/local') && r.method === 'PUT',
      )
      .flush({ success: true });
    await tick();

    const patch = httpMock.expectOne((r) => r.url.includes(`${URL}/p1`) && r.method === 'PATCH');
    expect(patch.request.body).toEqual({ price: 99, imageKey: 'products/p1/y.png' });
    patch.flush({ success: true, data: makeProduct({ price: 99 }) });
    await tick();

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({
        success: true,
        data: [makeProduct({ price: 99 })],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      });

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.products()[0]?.price).toBe(99);
  });

  it('updateProduct con removeImage hace PATCH con removeImage:true', async () => {
    const pending = store.updateProduct('p1', { price: 99 }, null, true);

    const patch = httpMock.expectOne((r) => r.url.includes(`${URL}/p1`) && r.method === 'PATCH');
    expect(patch.request.body).toEqual({ price: 99, removeImage: true });
    patch.flush({ success: true, data: makeProduct({ price: 99 }) });
    await tick();

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({
        success: true,
        data: [makeProduct({ price: 99 })],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      });

    await pending;
    expect(store.isSubmitting()).toBe(false);
  });
});
