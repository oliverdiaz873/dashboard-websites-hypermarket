import { TestBed } from '@angular/core/testing';

import { OfflineStore } from './offline.store';

describe('OfflineStore', () => {
  let store: InstanceType<typeof OfflineStore>;

  beforeEach(() => {
    TestBed.resetTestingModule();
    store = TestBed.inject(OfflineStore);
  });

  it('refleja el estado inicial de conectividad', () => {
    expect(typeof store.isOnline()).toBe('boolean');
  });

  it('cambia a offline al marcar setOnline(false)', () => {
    store.setOnline(false);
    expect(store.isOnline()).toBe(false);
    expect(store.isOffline()).toBe(true);
  });

  it('vuelve a online al marcar setOnline(true)', () => {
    store.setOnline(false);
    store.setOnline(true);
    expect(store.isOnline()).toBe(true);
    expect(store.isOffline()).toBe(false);
  });
});
