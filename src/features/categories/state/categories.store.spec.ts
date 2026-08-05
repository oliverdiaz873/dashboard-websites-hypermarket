import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CategoriesStore } from './categories.store';
import type { Category, CreateCategoryPayload } from '../models/category.model';

const URL = 'http://localhost:3000/api/categories';

function makeCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: 'c1',
    name: 'Alimentos',
    slug: 'alimentos',
    subcategories: [
      { name: 'Frutas y Verduras', slug: 'frutas-y-verduras' },
      { name: 'Despensa', slug: 'despensa' },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const bebidasCategory: Category = makeCategory({
  id: 'c2',
  name: 'bebidasCategory',
  slug: 'bebidas',
  subcategories: [],
});

describe('CategoriesStore', () => {
  let store: InstanceType<typeof CategoriesStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(CategoriesStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  it('carga las categorías y las ordena alfabéticamente por nombre', async () => {
    const pending = store.load();
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({ success: true, data: [makeCategory(), bebidasCategory] });
    await pending;

    expect(store.isLoading()).toBe(false);
    expect(store.hasLoaded()).toBe(true);
    expect(store.items().length).toBe(2);
    expect(store.sortedItems()[0]?.name).toBe('Alimentos');
    expect(store.sortedItems()[1]?.name).toBe('bebidasCategory');
  });

  it('queda vacío cuando la API no devuelve categorías', async () => {
    const pending = store.load();
    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({ success: true, data: [] });
    await pending;

    expect(store.isEmpty()).toBe(true);
    expect(store.error()).toBeNull();
  });

  it('create hace POST, recarga el listado y gestiona isSubmitting', async () => {
    const payload: CreateCategoryPayload = {
      name: 'Ropa',
      subcategories: [{ name: 'Casual', slug: 'casual' }],
    };

    const pending = store.create(payload);

    const post = httpMock.expectOne((r) => r.url.includes(URL) && r.method === 'POST');
    expect(post.request.body).toEqual(payload);
    post.flush({ success: true, data: makeCategory({ name: 'Ropa', slug: 'ropa' }) });
    await tick();

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({ success: true, data: [makeCategory(), bebidasCategory] });

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.items().length).toBe(2);
  });

  it('update hace PATCH y recarga el listado', async () => {
    const payload: CreateCategoryPayload = {
      name: 'Alimentos y bebidasCategory',
      subcategories: [],
    };

    const pending = store.update('c1', payload);

    const patch = httpMock.expectOne((r) => r.url.includes(`${URL}/c1`) && r.method === 'PATCH');
    expect(patch.request.body).toEqual(payload);
    patch.flush({
      success: true,
      data: makeCategory({ name: 'Alimentos y bebidasCategory', slug: 'alimentos-y-bebidas' }),
    });
    await tick();

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({ success: true, data: [makeCategory(), bebidasCategory] });

    await pending;
    expect(store.isSubmitting()).toBe(false);
  });

  it('remove hace DELETE y recarga el listado', async () => {
    const pending = store.remove('c2');

    const del = httpMock.expectOne((r) => r.url.includes(`${URL}/c2`) && r.method === 'DELETE');
    del.flush(null, { status: 204, statusText: 'No Content' });
    await tick();

    httpMock
      .expectOne((r) => r.url.includes(URL) && r.method === 'GET')
      .flush({ success: true, data: [makeCategory()] });

    await pending;
    expect(store.isSubmitting()).toBe(false);
    expect(store.items().length).toBe(1);
  });
});
