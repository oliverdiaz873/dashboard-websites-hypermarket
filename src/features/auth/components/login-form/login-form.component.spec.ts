import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { AuthStore } from '@core/state/auth/auth.store';

import { LoginFormComponent } from './login-form.component';

@Component({ template: '<p>protected</p>' })
class ProtectedStubComponent {}

@Component({ template: '' })
class RootStubComponent {}

const adminUser = {
  id: '1',
  name: 'Admin',
  email: 'admin@hypermarket.dev',
  role: 'admin' as const,
  createdAt: '',
  updatedAt: '',
};

describe('LoginFormComponent', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [LoginFormComponent],
      providers: [
        provideRouter([
          { path: '', component: RootStubComponent },
          { path: 'dashboard', component: ProtectedStubComponent },
        ]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('autentica al usuario y navega a la raíz protegida', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(LoginFormComponent);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('input[type="email"]');
    const password = fixture.nativeElement.querySelector('input[type="password"]');
    email.value = 'admin@hypermarket.dev';
    password.value = 'secreto';
    email.dispatchEvent(new Event('input'));
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button[type="submit"]').click();
    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    req.flush({ success: true, data: { token: 'jwt', user: adminUser } });
    await fixture.whenStable();

    expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(true);
    expect(router.url).toBe('/dashboard');
  });

  it('muestra el mensaje de error cuando las credenciales son inválidas', async () => {
    const fixture = TestBed.createComponent(LoginFormComponent);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('input[type="email"]');
    const password = fixture.nativeElement.querySelector('input[type="password"]');
    email.value = 'admin@hypermarket.dev';
    password.value = '123456';
    email.dispatchEvent(new Event('input'));
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button[type="submit"]').click();
    const req = httpMock.expectOne('http://localhost:3000/api/auth/login');
    req.flush(
      { success: false, message: 'Usuario o contraseña incorrectos', statusCode: 401 },
      { status: 401, statusText: 'Unauthorized' },
    );
    await fixture.whenStable();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Usuario o contraseña incorrectos',
    );
    expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(false);
  });
});
