import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '@core/services/auth.service';
import { ThemeManagerService } from '@core/services/theme-manager.service';
import { AuthTokenService } from '@core/services/auth-token.service';
import { ThemeStore } from '@core/state/theme/theme.store';

import { routes } from './app.routes';
import { App } from './app';

const adminUser = {
  id: '1',
  name: 'Admin',
  email: 'admin@hypermarket.dev',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

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

describe('Shell integration', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    delete document.documentElement.dataset['theme'];
  });

  function setupProviders() {
    return [
      provideRouter(routes),
      provideHttpClient(),
      {
        provide: AuthService,
        useValue: {
          login: jest.fn(),
          register: jest.fn(),
          getProfile: jest.fn(() => of(adminUser)),
        },
      },
    ];
  }

  it('activa ThemeManagerService y aplica data-theme basado en system + OS dark', async () => {
    installMatchMedia({ '(prefers-color-scheme: dark)': true });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: setupProviders(),
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.flushEffects();

    // El shell inyecta ThemeManagerService al bootstrap: el effect aplica el tema.
    expect(TestBed.inject(ThemeManagerService)).toBeTruthy();
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(document.documentElement.style.colorScheme).toBe('dark');
  });

  it('reacciona al toggle del ThemeStore actualizando el DOM', async () => {
    installMatchMedia({ '(prefers-color-scheme: dark)': false });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: setupProviders(),
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    TestBed.flushEffects();
    expect(document.documentElement.dataset['theme']).toBe('light');

    const themeStore = TestBed.inject(ThemeStore);
    themeStore.toggle();
    TestBed.flushEffects();
    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('energiza el shell del dashboard y navega a una ruta feature', async () => {
    installMatchMedia({ '(min-width: 1200px)': true, '(prefers-color-scheme: dark)': false });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: setupProviders(),
    }).compileComponents();

    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    // El authGuard restaura la sesión a partir de un token persistido.
    TestBed.inject(AuthTokenService).setToken('token-valid');
    await router.navigateByUrl('/');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toBe('/dashboard');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-sidebar')).toBeTruthy();
    expect(el.querySelector('app-topbar')).toBeTruthy();
    expect(el.querySelector('.hs-shell__body.hs-shell--desktop')).toBeTruthy();
  });

  it('redirige a /login un usuario sin sesión y conserva returnUrl', async () => {
    installMatchMedia({ '(min-width: 1200px)': true, '(prefers-color-scheme: dark)': false });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: setupProviders(),
    }).compileComponents();

    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await router.navigateByUrl('/stats');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(router.url).toContain('/login');
    expect(router.url).toContain('returnUrl=');
  });

  it('no renderiza el shell en una ruta inexistente (wildcard 404)', async () => {
    installMatchMedia({ '(prefers-color-scheme: dark)': false });

    await TestBed.configureTestingModule({
      imports: [App],
      providers: setupProviders(),
    }).compileComponents();

    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await router.navigateByUrl('/no-existe');
    await fixture.whenStable();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Página no encontrada');
  });
});
