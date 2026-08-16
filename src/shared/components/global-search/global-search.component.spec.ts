import { NO_ERRORS_SCHEMA, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { EMPTY_SEARCH_RESULTS } from '@core/search/models/global-search-result.model';
import { SEARCH_GLOBAL_SOURCE } from '@core/search/services/global-search-source';
import { SearchStore } from '@core/search/state/search.store';

import { GlobalSearchComponent } from './global-search.component';

function installMatchMedia(pairs: Record<string, boolean>): void {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: pairs[query] ?? false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

describe('GlobalSearchComponent', () => {
  let source: { search: jest.Mock };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    installMatchMedia({ '(max-width: 767.98px)': false });
    source = { search: jest.fn() };
    await TestBed.configureTestingModule({
      imports: [GlobalSearchComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [provideRouter([]), { provide: SEARCH_GLOBAL_SOURCE, useValue: source }],
    }).compileComponents();
    // Evita rechazos por rutas inexistentes al navegar con Enter en los tests.
    jest.spyOn(Router.prototype, 'navigateByUrl').mockResolvedValue(true);
    jest.clearAllMocks();
  });

  function desktopInput(fixture: { nativeElement: HTMLElement }): HTMLInputElement {
    return fixture.nativeElement.querySelector('.hs-global-search__input') as HTMLInputElement;
  }

  describe('desktop (md+)', () => {
    it('renderiza el input pill y envía el texto al store', () => {
      const store = TestBed.inject(SearchStore);
      const setQuerySpy = jest.spyOn(store, 'setQuery');
      const fixture = TestBed.createComponent(GlobalSearchComponent);
      fixture.detectChanges();

      const input = desktopInput(fixture);
      expect(input).toBeTruthy();
      input.value = 'coca';
      input.dispatchEvent(new Event('input'));

      expect(setQuerySpy).toHaveBeenCalledWith('coca');
    });

    it('navega con las flechas y selecciona con Enter', () => {
      const store = TestBed.inject(SearchStore);
      const moveSpy = jest.spyOn(store, 'moveSelection');
      const selectActiveSpy = jest.spyOn(store, 'selectActive');
      const fixture = TestBed.createComponent(GlobalSearchComponent);
      fixture.detectChanges();

      const input = desktopInput(fixture);
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
      expect(moveSpy).toHaveBeenCalledWith(1);

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
      expect(moveSpy).toHaveBeenCalledWith(-1);

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      expect(selectActiveSpy).toHaveBeenCalled();
    });

    it('cierra el dropdown con Escape', () => {
      const store = TestBed.inject(SearchStore);
      const closeSpy = jest.spyOn(store, 'close');
      const fixture = TestBed.createComponent(GlobalSearchComponent);
      fixture.detectChanges();

      const input = desktopInput(fixture);
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(closeSpy).toHaveBeenCalled();
    });

    it('muestra el dropdown al escribir', () => {
      source.search.mockReturnValue(of(EMPTY_SEARCH_RESULTS));
      const fixture = TestBed.createComponent(GlobalSearchComponent);
      fixture.detectChanges();

      const input = desktopInput(fixture);
      input.value = 'coca';
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(
        (fixture.nativeElement as HTMLElement).querySelector('.hs-global-search__dropdown'),
      ).toBeTruthy();
    });

    it('cierra el dropdown al hacer clic fuera', () => {
      const store = TestBed.inject(SearchStore);
      const fixture = TestBed.createComponent(GlobalSearchComponent);
      fixture.detectChanges();

      store.open();
      fixture.detectChanges();
      expect(store.isOpen()).toBe(true);

      document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(store.isOpen()).toBe(false);
    });

    it('no muestra la palette en desktop', () => {
      const fixture = TestBed.createComponent(GlobalSearchComponent);
      fixture.detectChanges();

      expect(
        (fixture.nativeElement as HTMLElement).querySelector('.hs-global-search__palette'),
      ).toBeFalsy();
    });
  });

  describe('móvil (<md)', () => {
    it('abre la palette al pulsar el icono y cierra con el backdrop', () => {
      installMatchMedia({ '(max-width: 767.98px)': true });
      const fixture = TestBed.createComponent(GlobalSearchComponent);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.querySelector('.hs-global-search__palette')).toBeFalsy();

      const trigger = el.querySelector('.hs-global-search__mobile-trigger') as HTMLButtonElement;
      expect(trigger).toBeTruthy();
      trigger.click();
      fixture.detectChanges();

      expect(el.querySelector('.hs-global-search__palette')).toBeTruthy();

      const backdrop = el.querySelector('.hs-global-search__backdrop') as HTMLElement;
      expect(backdrop).toBeTruthy();
      backdrop.click();
      fixture.detectChanges();

      expect(el.querySelector('.hs-global-search__palette')).toBeFalsy();
    });

    it('envía el texto de la palette al store', () => {
      installMatchMedia({ '(max-width: 767.98px)': true });
      const store = TestBed.inject(SearchStore);
      const setQuerySpy = jest.spyOn(store, 'setQuery');
      const fixture = TestBed.createComponent(GlobalSearchComponent);
      fixture.detectChanges();

      const trigger = (fixture.nativeElement as HTMLElement).querySelector(
        '.hs-global-search__mobile-trigger',
      ) as HTMLButtonElement;
      trigger.click();
      fixture.detectChanges();

      const paletteInput = (fixture.nativeElement as HTMLElement).querySelector(
        '.hs-global-search__palette-input',
      ) as HTMLInputElement;
      expect(paletteInput).toBeTruthy();
      paletteInput.value = 'coca';
      paletteInput.dispatchEvent(new Event('input'));

      expect(setQuerySpy).toHaveBeenCalledWith('coca');
    });

    it('cierra la palette con Escape', () => {
      installMatchMedia({ '(max-width: 767.98px)': true });
      const store = TestBed.inject(SearchStore);
      const closeSpy = jest.spyOn(store, 'close');
      const fixture = TestBed.createComponent(GlobalSearchComponent);
      fixture.detectChanges();

      const trigger = (fixture.nativeElement as HTMLElement).querySelector(
        '.hs-global-search__mobile-trigger',
      ) as HTMLButtonElement;
      trigger.click();
      fixture.detectChanges();

      const paletteInput = (fixture.nativeElement as HTMLElement).querySelector(
        '.hs-global-search__palette-input',
      ) as HTMLInputElement;
      paletteInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(closeSpy).toHaveBeenCalled();
    });
  });
});
