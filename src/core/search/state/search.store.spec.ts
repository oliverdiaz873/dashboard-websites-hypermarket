import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { EMPTY_SEARCH_RESULTS, GlobalSearchResults } from '../models/global-search-result.model';
import { SEARCH_GLOBAL_SOURCE } from '../services/global-search-source';
import { SearchStore } from './search.store';

const results: GlobalSearchResults = {
  products: [
    { id: 'p1', type: 'product', label: 'Coca Cola Original 2L', route: '/products/p1/edit' },
  ],
  orders: [],
  customers: [],
  users: [],
  navigation: [
    {
      id: 'nav-1',
      type: 'navigation',
      label: 'Productos',
      subtitle: 'Sección',
      route: '/products',
    },
  ],
};

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('SearchStore', () => {
  let store: InstanceType<typeof SearchStore>;
  let source: { search: jest.Mock };

  beforeEach(() => {
    TestBed.resetTestingModule();
    source = { search: jest.fn() };
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SEARCH_GLOBAL_SOURCE, useValue: source }],
    });
    // Evita rechazos por rutas inexistentes (`NG04002`) al navegar en los tests.
    jest.spyOn(Router.prototype, 'navigateByUrl').mockResolvedValue(true);
    store = TestBed.inject(SearchStore);
    jest.clearAllMocks();
  });

  function flushDebounce(): Promise<void> {
    return wait(350);
  }

  it('inicia en idle sin resultados y cerrado', () => {
    expect(store.status()).toBe('idle');
    expect(store.isEmpty()).toBe(true);
    expect(store.hasResults()).toBe(false);
    expect(store.isOpen()).toBe(false);
    expect(store.activeIndex()).toBe(-1);
  });

  it('setQuery abre el dropdown y marca loading antes del debounce', () => {
    source.search.mockReturnValue(of(EMPTY_SEARCH_RESULTS));
    store.setQuery('coca');

    expect(store.query()).toBe('coca');
    expect(store.isOpen()).toBe(true);
    expect(store.status()).toBe('loading');
    expect(source.search).not.toHaveBeenCalled();
  });

  it('aplica debounce de 300ms y solo consulta el último término', async () => {
    source.search.mockReturnValue(of(EMPTY_SEARCH_RESULTS));
    store.setQuery('co');
    store.setQuery('coc');
    store.setQuery('coca');
    expect(source.search).not.toHaveBeenCalled();

    await flushDebounce();

    expect(source.search).toHaveBeenCalledTimes(1);
    expect(source.search).toHaveBeenCalledWith('coca');
    expect(store.status()).toBe('success');
  });

  it('resuelve a success con los resultados agrupados de la fuente', async () => {
    source.search.mockReturnValue(of(results));
    store.setQuery('coca');
    await flushDebounce();

    expect(store.status()).toBe('success');
    expect(store.hasResults()).toBe(true);
    expect(store.totalCount()).toBe(2);
    expect(store.flatItems()).toEqual([results.products[0], results.navigation[0]]);
  });

  it('transita a error cuando la fuente falla', async () => {
    source.search.mockReturnValue(throwError(() => new Error('boom')));
    store.setQuery('coca');
    await flushDebounce();

    expect(store.status()).toBe('error');
    expect(store.error()).toBeTruthy();
    expect(store.hasResults()).toBe(false);
  });

  it('un query vacío vuelve a idle sin consultar la fuente', async () => {
    store.setQuery('');
    await flushDebounce();

    expect(source.search).not.toHaveBeenCalled();
    expect(store.status()).toBe('idle');
    expect(store.isEmpty()).toBe(true);
  });

  it('moveSelection mueve el índice activo dentro de los límites', async () => {
    source.search.mockReturnValue(of(results));
    store.setQuery('coca');
    await flushDebounce();

    store.moveSelection(1);
    expect(store.activeIndex()).toBe(0);
    store.moveSelection(1);
    expect(store.activeIndex()).toBe(1);
    store.moveSelection(1);
    expect(store.activeIndex()).toBe(1);
    store.moveSelection(-3);
    expect(store.activeIndex()).toBe(0);
  });

  it('moveTo resalta el item en la lista plana', async () => {
    source.search.mockReturnValue(of(results));
    store.setQuery('coca');
    await flushDebounce();

    store.moveTo(results.navigation[0]);
    expect(store.activeIndex()).toBe(1);
  });

  it('selectActive navega a la ruta del item activo y cierra', async () => {
    const navigateSpy = jest.spyOn(Router.prototype, 'navigateByUrl');

    source.search.mockReturnValue(of(results));
    store.setQuery('coca');
    await flushDebounce();
    store.moveTo(results.navigation[0]);
    store.selectActive();

    expect(navigateSpy).toHaveBeenCalledWith('/products');
    expect(store.isOpen()).toBe(false);
    expect(store.activeIndex()).toBe(-1);
  });

  it('select navega directamente al item elegido', () => {
    const navigateSpy = jest.spyOn(Router.prototype, 'navigateByUrl');

    store.select(results.products[0]);

    expect(navigateSpy).toHaveBeenCalledWith('/products/p1/edit');
    expect(store.isOpen()).toBe(false);
  });

  it('selectActive no navega sin un item activo', () => {
    const navigateSpy = jest.spyOn(Router.prototype, 'navigateByUrl');

    store.selectActive();

    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('clear resetea query, resultados y estado', async () => {
    source.search.mockReturnValue(of(results));
    store.setQuery('coca');
    await flushDebounce();
    store.clear();
    await flushDebounce();

    expect(store.query()).toBe('');
    expect(store.isEmpty()).toBe(true);
    expect(store.status()).toBe('idle');
    expect(store.isOpen()).toBe(false);
    expect(store.activeIndex()).toBe(-1);
  });

  it('open/close/toggle controlan isOpen', () => {
    store.open();
    expect(store.isOpen()).toBe(true);
    store.close();
    expect(store.isOpen()).toBe(false);
    store.toggle();
    expect(store.isOpen()).toBe(true);
  });
});
