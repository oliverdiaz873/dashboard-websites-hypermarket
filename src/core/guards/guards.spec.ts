import type { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from '../services/auth.service';
import { STORAGE_KEYS } from '../constants/storage-keys';
import type { User } from '../models/user.model';
import { AuthStore } from '../state/auth/auth.store';
import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';

const adminUser: User = {
  id: '1',
  name: 'Admin',
  email: 'admin@hypermarket.dev',
  role: 'admin',
  createdAt: '',
  updatedAt: '',
};

const route = {} as ActivatedRouteSnapshot;
const state = { url: '/dashboard' } as RouterStateSnapshot;

const authServiceStub = {
  login: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn(() => of(adminUser)),
};

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: authServiceStub },
      ],
    });
  });

  it('permite el acceso cuando hay una sesión persistida', async () => {
    window.localStorage.setItem(STORAGE_KEYS.authToken, JSON.stringify('token-1'));

    const result = await runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
      authGuard(route, state),
    );
    expect(result).toBe(true);
    expect(TestBed.inject(AuthStore).isAuthenticated()).toBe(true);
  });

  it('redirige a /login con returnUrl cuando no hay sesión', async () => {
    const result = (await runInInjectionContext(TestBed.inject(EnvironmentInjector), () =>
      authGuard(route, state),
    )) as UrlTree;
    expect(result.toString()).toContain('/login');
    expect(result.toString()).toContain('returnUrl=');
  });
});

describe('roleGuard', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: authServiceStub },
      ],
    });
  });

  function runWithGuard(fn: () => boolean | UrlTree): boolean | UrlTree {
    return runInInjectionContext(TestBed.inject(EnvironmentInjector), () => fn());
  }

  function routeWithRoles(roles: string[]): ActivatedRouteSnapshot {
    return { data: { roles } } as ActivatedRouteSnapshot;
  }

  it('permite el acceso cuando el rol coincide', () => {
    TestBed.inject(AuthStore).setAuthenticated({ token: 't', user: adminUser });

    const result = runWithGuard(() => roleGuard(routeWithRoles(['admin']), state));
    expect(result).toBe(true);
  });

  it('redirige al dashboard cuando el rol no coincide', () => {
    TestBed.inject(AuthStore).setAuthenticated({
      token: 't',
      user: { ...adminUser, role: 'customer' },
    });

    const result = runWithGuard(() => roleGuard(routeWithRoles(['admin']), state)) as UrlTree;
    expect(result.toString()).toContain('/dashboard');
  });
});
