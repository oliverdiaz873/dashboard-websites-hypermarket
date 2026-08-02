import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { LoadingStore } from '@core/state/loading/loading.store';

@Component({
  selector: 'app-loading-overlay',
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingOverlayComponent {
  private readonly loadingStore = inject(LoadingStore);

  /**
   * Sobrescritura opcional para futuros loading locales (p. ej. tablas grandes).
   * `null` = usar el LoadingStore global.
   */
  readonly visible = input<boolean | null>(null);

  protected readonly show = computed(() => this.visible() ?? this.loadingStore.isLoading());
}
