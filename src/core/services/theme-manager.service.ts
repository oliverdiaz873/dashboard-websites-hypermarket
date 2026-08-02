import { DestroyRef, computed, effect, inject, Injectable, signal } from '@angular/core';

import { ThemeStore } from '../state/theme/theme.store';

export type ResolvedTheme = 'light' | 'dark';

/**
 * Aplica el tema resuelto (light/dark/system) al documento:
 *   `<html data-theme="…">` + `color-scheme`.
 * Usa UNA sola suscripción a `matchMedia` para el modo `system`; el listener se
 * limpia en `onDestroy`.
 */
@Injectable({ providedIn: 'root' })
export class ThemeManagerService {
  private readonly themeStore = inject(ThemeStore);
  private readonly destroyRef = inject(DestroyRef);

  private readonly systemPrefersDark = signal(false);

  private readonly mql: MediaQueryList | null =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  /**
   * Tema efectivo visible: `mode` resuelto por la preferencia del sistema cuando
   * está en `system`. Es la fuente de verdad para iconos/tooltips y el DOM.
   */
  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const mode = this.themeStore.mode();
    return mode === 'system' ? (this.systemPrefersDark() ? 'dark' : 'light') : mode;
  });

  constructor() {
    this.systemPrefersDark.set(this.mql?.matches ?? false);
    this.mql?.addEventListener('change', this.onSystemThemeChange);

    effect(() => {
      const theme = this.resolvedTheme();
      document.documentElement.dataset['theme'] = theme;
      document.documentElement.style.colorScheme = theme;
    });

    this.destroyRef.onDestroy(() => {
      this.mql?.removeEventListener('change', this.onSystemThemeChange);
    });
  }

  private readonly onSystemThemeChange = (event: MediaQueryListEvent) => {
    this.systemPrefersDark.set(event.matches);
  };
}
