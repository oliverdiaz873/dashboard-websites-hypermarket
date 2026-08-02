import { TestBed } from '@angular/core/testing';

import { STORAGE_KEYS } from '../../constants/storage-keys';
import { ThemeStore } from './theme.store';

describe('ThemeStore', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
  });

  it('por defecto usa modo system', () => {
    const store = TestBed.inject(ThemeStore);
    expect(store.mode()).toBe('system');
  });

  it('setMode actualiza el estado y persiste', () => {
    const store = TestBed.inject(ThemeStore);
    store.setMode('dark');
    expect(store.mode()).toBe('dark');
    expect(window.localStorage.getItem(STORAGE_KEYS.theme)).toBe('"dark"');
  });

  it('toggle alterna entre light y dark', () => {
    const store = TestBed.inject(ThemeStore);
    store.setMode('light');
    store.toggle();
    expect(store.mode()).toBe('dark');
    store.toggle();
    expect(store.mode()).toBe('light');
  });

  it('restaura el modo persistido al instanciar', () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, '"dark"');
    const store = TestBed.inject(ThemeStore);
    expect(store.mode()).toBe('dark');
  });

  it('ignora valores no válidos persistidos', () => {
    window.localStorage.setItem(STORAGE_KEYS.theme, '"blue"');
    const store = TestBed.inject(ThemeStore);
    expect(store.mode()).toBe('system');
  });
});
