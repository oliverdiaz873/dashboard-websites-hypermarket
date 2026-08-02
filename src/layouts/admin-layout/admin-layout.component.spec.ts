import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { SidebarStore } from '@core/state/sidebar/sidebar.store';

import { AdminLayoutComponent } from './admin-layout.component';

@Component({ template: '' })
class StubComponent {}

function installMatchMedia(initialMatches: string[]): void {
  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    matches: initialMatches.includes(query),
    media: query,
    onchange: null,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe('AdminLayoutComponent', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
  });

  async function setup(queries: string[]) {
    installMatchMedia(queries);
    await TestBed.configureTestingModule({
      imports: [AdminLayoutComponent],
      providers: [provideRouter([{ path: '**', component: StubComponent }])],
    }).compileComponents();
    const fixture = TestBed.createComponent(AdminLayoutComponent);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture;
  }

  it('renderiza el shell (sidebar, topbar y outlet)', async () => {
    const fixture = await setup(['(min-width: 1200px)']);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-sidebar')).toBeTruthy();
    expect(el.querySelector('app-topbar')).toBeTruthy();
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });

  it('marca viewport desktop vía BreakpointObserver', async () => {
    await setup(['(min-width: 1200px)']);
    expect(TestBed.inject(SidebarStore).viewport()).toBe('desktop');
  });

  it('marca viewport mobile vía BreakpointObserver', async () => {
    await setup(['(max-width: 767.98px)']);
    expect(TestBed.inject(SidebarStore).viewport()).toBe('mobile');
  });

  it('Escape cierra el drawer móvil', async () => {
    const fixture = await setup(['(max-width: 767.98px)']);
    const store = TestBed.inject(SidebarStore);
    store.setMobileOpen(true);
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(store.isMobileOpen()).toBe(false);
  });

  it('aplica la clase hs-shell--desktop al cuerpo del shell', async () => {
    const fixture = await setup(['(min-width: 1200px)']);
    const body = fixture.nativeElement.querySelector('.hs-shell__body') as HTMLElement;
    expect(body.classList.contains('hs-shell--desktop')).toBe(true);
  });

  it('aplica la clase de colapso al cuerpo en desktop colapsado', async () => {
    const fixture = await setup(['(min-width: 1200px)']);
    const store = TestBed.inject(SidebarStore);
    store.toggleCollapsed();
    fixture.detectChanges();
    const body = fixture.nativeElement.querySelector('.hs-shell__body') as HTMLElement;
    expect(body.classList.contains('hs-shell--sidebar-collapsed')).toBe(true);
  });

  it('no aplica offset al cuerpo en mobile (drawer overlay)', async () => {
    const fixture = await setup(['(max-width: 767.98px)']);
    const body = fixture.nativeElement.querySelector('.hs-shell__body') as HTMLElement;
    expect(body.classList.contains('hs-shell--desktop')).toBe(false);
    expect(body.classList.contains('hs-shell--tablet')).toBe(false);
  });
});
