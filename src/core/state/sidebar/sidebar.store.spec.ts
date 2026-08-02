import { TestBed } from '@angular/core/testing';

import { STORAGE_KEYS } from '../../constants/storage-keys';
import { SidebarStore } from './sidebar.store';

describe('SidebarStore', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
  });

  it('inicia expandido en desktop y cerrado en móvil', () => {
    const store = TestBed.inject(SidebarStore);
    expect(store.isCollapsed()).toBe(false);
    expect(store.isMobileOpen()).toBe(false);
  });

  it('toggleCollapsed alterna y persiste', () => {
    const store = TestBed.inject(SidebarStore);
    store.toggleCollapsed();
    expect(store.isCollapsed()).toBe(true);
    expect(window.localStorage.getItem(STORAGE_KEYS.sidebarCollapsed)).toBe('true');
    store.toggleCollapsed();
    expect(store.isCollapsed()).toBe(false);
  });

  it('setMobileOpen y closeMobile controlan el drawer móvil', () => {
    const store = TestBed.inject(SidebarStore);
    store.setMobileOpen(true);
    expect(store.isMobileOpen()).toBe(true);
    store.closeMobile();
    expect(store.isMobileOpen()).toBe(false);
  });

  it('isSidebarOpen considera ambos estados', () => {
    const store = TestBed.inject(SidebarStore);
    expect(store.isSidebarOpen()).toBe(true);
    store.toggleCollapsed();
    expect(store.isSidebarOpen()).toBe(false);
    store.setMobileOpen(true);
    expect(store.isSidebarOpen()).toBe(true);
  });

  it('restaura el estado colapsado persistido', () => {
    window.localStorage.setItem(STORAGE_KEYS.sidebarCollapsed, 'true');
    const store = TestBed.inject(SidebarStore);
    expect(store.isCollapsed()).toBe(true);
  });
});
