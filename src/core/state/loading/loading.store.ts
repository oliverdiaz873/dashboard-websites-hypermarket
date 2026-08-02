import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

interface LoadingState {
  activeRequests: number;
}

export const LoadingStore = signalStore(
  { providedIn: 'root' },
  withState<LoadingState>({ activeRequests: 0 }),
  withComputed(({ activeRequests }) => ({
    isLoading: computed(() => activeRequests() > 0),
  })),
  withMethods((store) => ({
    begin: () => patchState(store, { activeRequests: store.activeRequests() + 1 }),
    end: () => patchState(store, { activeRequests: Math.max(0, store.activeRequests() - 1) }),
    reset: () => patchState(store, { activeRequests: 0 }),
  })),
);
