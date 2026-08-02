import { TestBed } from '@angular/core/testing';

import { STORAGE_KEYS } from '../constants/storage-keys';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  let service: AuthTokenService;

  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    service = TestBed.inject(AuthTokenService);
  });

  it('inicia sin token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('persiste y devuelve el token bajo la clave hs.auth-token', () => {
    service.setToken('jwt-abc');
    expect(service.getToken()).toBe('jwt-abc');
    expect(window.localStorage.getItem(STORAGE_KEYS.authToken)).toBeTruthy();
  });

  it('removeToken elimina el token', () => {
    service.setToken('jwt-abc');
    service.removeToken();
    expect(service.getToken()).toBeNull();
  });
});
