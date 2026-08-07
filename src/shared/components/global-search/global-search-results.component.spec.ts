import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import {
  EMPTY_SEARCH_RESULTS,
  GlobalSearchResults,
} from '@core/search/models/global-search-result.model';
import { SEARCH_GLOBAL_SOURCE } from '@core/search/services/global-search-source';
import { SearchStore } from '@core/search/state/search.store';

import { GlobalSearchResultsComponent } from './global-search-results.component';

const results: GlobalSearchResults = {
  products: [
    {
      id: 'p1',
      type: 'product',
      label: 'Coca Cola Original 2L',
      subtitle: 'Bebidas',
      route: '/products/p1/edit',
    },
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

describe('GlobalSearchResultsComponent', () => {
  let store: InstanceType<typeof SearchStore>;
  let source: { search: jest.Mock };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    source = { search: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [GlobalSearchResultsComponent],
      providers: [provideRouter([]), { provide: SEARCH_GLOBAL_SOURCE, useValue: source }],
    }).compileComponents();
    // Evita rechazos por rutas inexistentes al navegar tras seleccionar un item.
    jest.spyOn(Router.prototype, 'navigateByUrl').mockResolvedValue(true);
    store = TestBed.inject(SearchStore);
    jest.clearAllMocks();
  });

  function flushDebounce(): Promise<void> {
    return wait(350);
  }

  it('muestra el hint en estado idle', () => {
    const fixture = TestBed.createComponent(GlobalSearchResultsComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Escribe para buscar');
  });

  it('muestra el estado de carga tras escribir', () => {
    source.search.mockReturnValue(of(results));
    const fixture = TestBed.createComponent(GlobalSearchResultsComponent);
    fixture.detectChanges();

    store.setQuery('coca');
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Buscando');
  });

  it('renderiza grupos de resultados solo con items', async () => {
    source.search.mockReturnValue(of(results));
    store.setQuery('coca');
    const fixture = TestBed.createComponent(GlobalSearchResultsComponent);
    fixture.detectChanges();
    await flushDebounce();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Coca Cola Original 2L');
    expect(text).toContain('Bebidas');
    expect(text).toContain('Navegación');
    expect(text).not.toContain('Órdenes');
    expect(text).not.toContain('Usuarios');
  });

  it('muestra el estado vacío cuando no hay resultados', async () => {
    source.search.mockReturnValue(of(EMPTY_SEARCH_RESULTS));
    store.setQuery('coca');
    const fixture = TestBed.createComponent(GlobalSearchResultsComponent);
    fixture.detectChanges();
    await flushDebounce();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Sin resultados');
  });

  it('muestra el error y reintenta re-disparando el query', async () => {
    source.search.mockReturnValue(throwError(() => new Error('boom')));
    const setQuerySpy = jest.spyOn(store, 'setQuery');
    store.setQuery('coca');
    const fixture = TestBed.createComponent(GlobalSearchResultsComponent);
    fixture.detectChanges();
    await flushDebounce();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No se pudo completar la búsqueda.');

    const retryBtn = el.querySelector('.hs-search-results__retry') as HTMLButtonElement;
    expect(retryBtn).toBeTruthy();
    retryBtn.click();
    expect(setQuerySpy).toHaveBeenCalledWith('coca');
  });

  it('selecciona un resultado al hacer clic', async () => {
    source.search.mockReturnValue(of(results));
    store.setQuery('coca');
    const fixture = TestBed.createComponent(GlobalSearchResultsComponent);
    fixture.detectChanges();
    await flushDebounce();
    fixture.detectChanges();

    const selectSpy = jest.spyOn(store, 'select');
    const option = (fixture.nativeElement as HTMLElement).querySelector(
      'button[role="option"]',
    ) as HTMLButtonElement;
    expect(option).toBeTruthy();
    option.click();

    expect(selectSpy).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'p1', type: 'product', label: 'Coca Cola Original 2L' }),
    );
  });

  it('resalta el item activo y el hover mueve la selección', async () => {
    source.search.mockReturnValue(of(results));
    store.setQuery('coca');
    const fixture = TestBed.createComponent(GlobalSearchResultsComponent);
    fixture.detectChanges();
    await flushDebounce();
    fixture.detectChanges();

    const moveToSpy = jest.spyOn(store, 'moveTo');
    const options = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'button[role="option"]',
    );
    const navigationOption = options[1] as HTMLButtonElement;
    navigationOption.dispatchEvent(new MouseEvent('mouseenter'));
    expect(moveToSpy).toHaveBeenCalled();

    store.moveSelection(1);
    fixture.detectChanges();

    const active = (fixture.nativeElement as HTMLElement).querySelector('[aria-selected="true"]');
    expect(active?.textContent).toContain('Productos');
  });
});
