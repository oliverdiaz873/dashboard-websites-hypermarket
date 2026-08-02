import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NAVIGATION_ITEMS } from '@core/constants/navigation';
import { SidebarStore } from '@core/state/sidebar/sidebar.store';

import { SidebarComponent } from './sidebar.component';

@Component({ template: '' })
class StubComponent {}

describe('SidebarComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([{ path: '**', component: StubComponent }])],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra la navegación completa y el nombre del sistema', () => {
    const fixture = create();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.hs-sidebar__item').length).toBe(NAVIGATION_ITEMS.length);
    expect(el.textContent).toContain('Hipermercado Superior');
    expect(el.textContent).toContain('Productos');
  });

  it('el botón de colapso expone aria-expanded', () => {
    const fixture = create();
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '.hs-sidebar__collapse-btn',
    ) as HTMLButtonElement;
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  it('toggle collapse actualiza el SidebarStore', () => {
    const store = TestBed.inject(SidebarStore);
    const fixture = create();
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '.hs-sidebar__collapse-btn',
    ) as HTMLButtonElement;
    expect(store.isCollapsed()).toBe(false);
    btn.click();
    expect(store.isCollapsed()).toBe(true);
    btn.click();
    expect(store.isCollapsed()).toBe(false);
  });

  it('cierra el drawer móvil al navegar', () => {
    const store = TestBed.inject(SidebarStore);
    store.setViewport('mobile');
    store.setMobileOpen(true);
    const fixture = create();
    const firstLink = (fixture.nativeElement as HTMLElement).querySelector(
      '.hs-sidebar__item',
    ) as HTMLAnchorElement;
    firstLink.click();
    expect(store.isMobileOpen()).toBe(false);
  });
});
