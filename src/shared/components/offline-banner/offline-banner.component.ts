import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { OfflineStore } from '@core/state/offline/offline.store';

/**
 * Banner global que informa de la pérdida de conexión con internet. Se oculta
 * automáticamente al recuperar la conectividad.
 */
@Component({
  selector: 'app-offline-banner',
  template: `
    @if (offlineStore.isOffline()) {
      <div class="hs-offline-banner" role="status">
        Sin conexión a internet. Algunas operaciones no estarán disponibles.
      </div>
    }
  `,
  styles: [
    `
      .hs-offline-banner {
        position: sticky;
        top: 0;
        z-index: 50;
        background-color: #d97706;
        color: #fff;
        text-align: center;
        font-size: 0.875rem;
        font-weight: 600;
        padding: 0.5rem 1rem;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineBannerComponent {
  protected readonly offlineStore = inject(OfflineStore);
}
