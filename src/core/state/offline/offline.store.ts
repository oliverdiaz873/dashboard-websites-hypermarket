import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

interface OfflineState {
  online: boolean;
}

const initialOnline = typeof navigator !== 'undefined' ? navigator.onLine === true : true;

export const OfflineStore = signalStore(
  { providedIn: 'root' },
  withState<OfflineState>({ online: initialOnline }),
  withComputed(({ online }) => ({
    isOnline: computed(() => online()),
    isOffline: computed(() => !online()),
  })),
  withMethods((store) => ({
    setOnline: (online: boolean): void => patchState(store, { online }),
  })),
);
