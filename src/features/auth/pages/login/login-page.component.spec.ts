import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthStore } from '@core/state/auth/auth.store';

import { LoginPageComponent } from './login-page.component';

describe('LoginPageComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('muestra el nombre del sistema y el formulario de acceso', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Hipermercado Superior');
    expect(el.querySelector('input[type="email"]')).toBeTruthy();
    expect(el.querySelector('input[type="password"]')).toBeTruthy();
    expect((el.textContent ?? '').includes('Inicia sesión')).toBe(true);
  });

  it('muestra el logo oficial en el panel de branding y en el formulario', () => {
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const logos = Array.from(el.querySelectorAll('img'));
    expect(logos.some((img) => img.getAttribute('src')?.includes('logo-original.png'))).toBe(true);
    expect(logos.some((img) => img.getAttribute('loading') === 'eager')).toBe(true);
  });

  it('valida los campos obligatorios antes de llamar a la API', async () => {
    const authStore = TestBed.inject(AuthStore);
    const fixture = TestBed.createComponent(LoginPageComponent);
    fixture.detectChanges();
    const submit = (fixture.nativeElement as HTMLElement).querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;

    submit.click();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(authStore.isAuthenticated()).toBe(false);
  });
});
