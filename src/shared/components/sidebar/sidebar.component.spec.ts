import { Component } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NAVIGATION_ITEMS } from '@core/constants/navigation';
import type { User } from '@core/models/user.model';
import { AuthStore } from '@core/state/auth/auth.store';
import { SidebarStore } from '@core/state/sidebar/sidebar.store';

import { SidebarComponent } from './sidebar.component';

const adminUser: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@hypermarket.dev',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

const customerUser: User = { ...adminUser, id: '2', name: 'Cliente', role: 'customer' };

@Component({ template: '' })
class StubComponent {}

describe('SidebarComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SidebarComponent],
      providers: [provideRouter([{ path: '**', component: StubComponent }]), provideHttpClient()],
    }).compileComponents();
  });

  function create() {
    const fixture = TestBed.createComponent(SidebarComponent);
    fixture.detectChanges();
    return fixture;
  }

  function authenticate(user: User) {
    TestBed.inject(AuthStore).setAuthenticated({ token: 'token-123', user });
  }

  it('muestra la navegación completa para un administrador', () => {
    authenticate(adminUser);
    const fixture = create();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.hs-sidebar__item').length).toBe(NAVIGATION_ITEMS.length);
    expect(el.textContent).toContain('Hipermercado Superior');
    expect(el.textContent).toContain('Productos');
  });

  it('oculta los items restringidos por rol para un cliente', () => {
    authenticate(customerUser);
    const fixture = create();
    const el = fixture.nativeElement as HTMLElement;
    const labels = Array.from(el.querySelectorAll('.hs-sidebar__item-label')).map(
      (node) => node.textContent,
    );
    expect(labels).not.toContain('Estadísticas');
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

  it('bloquea el scroll del body al abrir el drawer móvil', () => {
    const store = TestBed.inject(SidebarStore);
    store.setViewport('mobile');
    store.setMobileOpen(true);
    create();
    expect(document.body.style.overflow).toBe('hidden');
    store.closeMobile();
    TestBed.flushEffects();
    expect(document.body.style.overflow).toBe('');
  });

  it('no marca items activos con una URL sin coincidencia', () => {
    const fixture = create();
    const items = fixture.nativeElement.querySelectorAll('.hs-sidebar__item');
    const active = Array.from(items).filter((i) => i.getAttribute('aria-current') === 'page');
    expect(active.length).toBe(0);
  });
});
