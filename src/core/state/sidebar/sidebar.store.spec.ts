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

  it('inicia con viewport desktop y computeds correctos', () => {
    const store = TestBed.inject(SidebarStore);
    expect(store.viewport()).toBe('desktop');
    expect(store.isMobile()).toBe(false);
    expect(store.isTablet()).toBe(false);
    expect(store.isDesktop()).toBe(true);
  });

  it('setViewport actualiza viewport y computeds', () => {
    const store = TestBed.inject(SidebarStore);
    store.setViewport('mobile');
    expect(store.isMobile()).toBe(true);
    expect(store.isDesktop()).toBe(false);
    store.setViewport('tablet');
    expect(store.isTablet()).toBe(true);
  });

  it('setViewport fuera de móvil cierra el drawer', () => {
    const store = TestBed.inject(SidebarStore);
    store.setMobileOpen(true);
    store.setViewport('desktop');
    expect(store.isMobileOpen()).toBe(false);
  });
});
