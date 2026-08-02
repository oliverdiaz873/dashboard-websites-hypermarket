import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

import { STORAGE_KEYS } from '../../constants/storage-keys';
import { getStorageItem, setStorageItem } from '../../utils/storage.util';

export type ThemeMode = 'light' | 'dark' | 'system';

const THEME_OPTIONS: readonly ThemeMode[] = ['light', 'dark', 'system'];

function initialThemeMode(): ThemeMode {
  const stored = getStorageItem<ThemeMode>(STORAGE_KEYS.theme);
  return stored !== null && THEME_OPTIONS.includes(stored) ? stored : 'system';
}

export const ThemeStore = signalStore(
  { providedIn: 'root' },
  withState(() => ({ mode: initialThemeMode() })),
  withMethods((store) => ({
    setMode: (mode: ThemeMode) => {
      patchState(store, { mode });
      setStorageItem(STORAGE_KEYS.theme, mode);
    },
    toggle: () => {
      const next: ThemeMode = store.mode() === 'dark' ? 'light' : 'dark';
      patchState(store, { mode: next });
      setStorageItem(STORAGE_KEYS.theme, next);
    },
  })),
);
