import { TestBed } from '@angular/core/testing';

import { ThemeStore } from '../state/theme/theme.store';
import { ThemeManagerService } from './theme-manager.service';

describe('ThemeManagerService', () => {
  let addEventListenerSpy: jest.SpyInstance;
  let removeEventListenerSpy: jest.SpyInstance;
  let changeHandler: ((event: MediaQueryListEvent) => void) | null = null;

  const mockMatchMedia = (prefersDark: boolean) => {
    const mql = {
      matches: prefersDark,
      addEventListener: (_type: string, handler: (event: MediaQueryListEvent) => void) => {
        changeHandler = handler;
      },
      removeEventListener: () => {
        changeHandler = null;
      },
    } as unknown as MediaQueryList;
    addEventListenerSpy = jest.spyOn(mql, 'addEventListener');
    removeEventListenerSpy = jest.spyOn(mql, 'removeEventListener');
    window.matchMedia = jest.fn(() => mql) as unknown as typeof window.matchMedia;
    return mql;
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    delete document.documentElement.dataset['theme'];
  });

  it('aplica data-theme light por defecto', () => {
    mockMatchMedia(false);
    TestBed.inject(ThemeManagerService);
    TestBed.flushEffects();
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('reacciona a ThemeStore.toggle y aplica dark', () => {
    mockMatchMedia(false);
    const themeStore = TestBed.inject(ThemeStore);
    themeStore.setMode('light');
    TestBed.inject(ThemeManagerService);
    TestBed.flushEffects();
    expect(document.documentElement.dataset['theme']).toBe('light');

    themeStore.setMode('dark');
    TestBed.flushEffects();
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('resuelve mode system con matchMedia (dark)', () => {
    mockMatchMedia(true);
    const themeStore = TestBed.inject(ThemeStore);
    themeStore.setMode('system');
    TestBed.inject(ThemeManagerService);
    TestBed.flushEffects();
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('usa una sola suscripción a matchMedia y la limpia al destruir', () => {
    mockMatchMedia(false);
    TestBed.inject(ThemeManagerService);
    expect(addEventListenerSpy).toHaveBeenCalledTimes(1);

    TestBed.resetTestingModule();
    expect(removeEventListenerSpy).toHaveBeenCalledTimes(1);
  });

  it('reacciona al cambio de preferencia del sistema en modo system', () => {
    mockMatchMedia(false);
    const themeStore = TestBed.inject(ThemeStore);
    themeStore.setMode('system');
    TestBed.inject(ThemeManagerService);
    TestBed.flushEffects();
    expect(document.documentElement.dataset['theme']).toBe('light');

    changeHandler?.({ matches: true } as MediaQueryListEvent);
    TestBed.flushEffects();
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });
});
