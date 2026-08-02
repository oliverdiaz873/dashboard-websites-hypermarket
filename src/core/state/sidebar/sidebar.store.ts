import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { STORAGE_KEYS } from '../../constants/storage-keys';
import { getStorageItem, setStorageItem } from '../../utils/storage.util';

function initialSidebarCollapsed(): boolean {
  const stored = getStorageItem<boolean>(STORAGE_KEYS.sidebarCollapsed);
  return stored ?? false;
}

export const SidebarStore = signalStore(
  { providedIn: 'root' },
  withState(() => ({ isCollapsed: initialSidebarCollapsed(), isMobileOpen: false })),
  withComputed(({ isCollapsed, isMobileOpen }) => ({
    isSidebarOpen: computed(() => !isCollapsed() || isMobileOpen()),
  })),
  withMethods((store) => ({
    toggleCollapsed: () => {
      const next = !store.isCollapsed();
      patchState(store, { isCollapsed: next });
      setStorageItem(STORAGE_KEYS.sidebarCollapsed, next);
    },
    setMobileOpen: (open: boolean) => patchState(store, { isMobileOpen: open }),
    closeMobile: () => patchState(store, { isMobileOpen: false }),
  })),
);
