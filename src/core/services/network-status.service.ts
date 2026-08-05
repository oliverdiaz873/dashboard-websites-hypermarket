import { Injectable, inject } from '@angular/core';

import { OfflineStore } from '../state/offline/offline.store';

/**
 * Escucha los eventos `online`/`offline` del navegador y refleja el estado en el
 * `OfflineStore`. Se instancia al arrancar la app (en AppComponent) para que el
 * banner de conectividad reaccione en toda la sesión.
 */
@Injectable({ providedIn: 'root' })
export class NetworkStatusService {
  private readonly offlineStore = inject(OfflineStore);

  constructor() {
    if (typeof window === 'undefined') return;

    const update = (): void => this.offlineStore.setOnline(navigator.onLine === true);
    window.addEventListener('online', update);
    window.addEventListener('offline', update);
    update();
  }
}
