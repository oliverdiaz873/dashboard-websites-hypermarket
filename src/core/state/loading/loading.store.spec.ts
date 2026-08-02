import { TestBed } from '@angular/core/testing';

import { LoadingStore } from './loading.store';

describe('LoadingStore', () => {
  let store: InstanceType<typeof LoadingStore>;

  beforeEach(() => {
    store = TestBed.inject(LoadingStore);
    store.reset();
  });

  it('inicia sin peticiones activas', () => {
    expect(store.activeRequests()).toBe(0);
    expect(store.isLoading()).toBe(false);
  });

  it('begin incrementa el contador y activa isLoading', () => {
    store.begin();
    expect(store.activeRequests()).toBe(1);
    expect(store.isLoading()).toBe(true);
  });

  it('end decrementa y vuelve a false al llegar a cero', () => {
    store.begin();
    store.begin();
    store.end();
    expect(store.activeRequests()).toBe(1);
    store.end();
    expect(store.activeRequests()).toBe(0);
    expect(store.isLoading()).toBe(false);
  });

  it('end nunca baja de cero', () => {
    store.end();
    expect(store.activeRequests()).toBe(0);
  });

  it('reset limpia el contador', () => {
    store.begin();
    store.begin();
    store.reset();
    expect(store.activeRequests()).toBe(0);
    expect(store.isLoading()).toBe(false);
  });
});
