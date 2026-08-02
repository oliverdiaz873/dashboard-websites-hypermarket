import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { STORAGE_KEYS } from '../../constants/storage-keys';
import { getStorageItem, setStorageItem } from '../../utils/storage.util';

export type SidebarViewport = 'mobile' | 'tablet' | 'desktop';

interface SidebarState {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  viewport: SidebarViewport;
}

function initialSidebarCollapsed(): boolean {
  const stored = getStorageItem<boolean>(STORAGE_KEYS.sidebarCollapsed);
  return stored ?? false;
}

export const SidebarStore = signalStore(
  { providedIn: 'root' },
  withState<SidebarState>(() => ({
    isCollapsed: initialSidebarCollapsed(),
    isMobileOpen: false,
    viewport: 'desktop',
  })),
  withComputed(({ isCollapsed, isMobileOpen, viewport }) => ({
    isSidebarOpen: computed(() => !isCollapsed() || isMobileOpen()),
    isMobile: computed(() => viewport() === 'mobile'),
    isTablet: computed(() => viewport() === 'tablet'),
    isDesktop: computed(() => viewport() === 'desktop'),
  })),
  withMethods((store) => ({
    toggleCollapsed: () => {
      const next = !store.isCollapsed();
      patchState(store, { isCollapsed: next });
      setStorageItem(STORAGE_KEYS.sidebarCollapsed, next);
    },
    setMobileOpen: (open: boolean) => patchState(store, { isMobileOpen: open }),
    closeMobile: () => patchState(store, { isMobileOpen: false }),
    setViewport: (viewport: SidebarViewport) =>
      patchState(store, {
        viewport,
        isMobileOpen: viewport === 'mobile' ? store.isMobileOpen() : false,
      }),
  })),
);
