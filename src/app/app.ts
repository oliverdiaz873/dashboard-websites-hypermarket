import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NetworkStatusService } from '@core/services/network-status.service';
import { ThemeManagerService } from '@core/services/theme-manager.service';
import { NotificationsToastComponent } from '@shared/components/notifications-toast/notifications-toast.component';
import { OfflineBannerComponent } from '@shared/components/offline-banner/offline-banner.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, NotificationsToastComponent, OfflineBannerComponent],
})
export class App {
  /**
   * Instancia ThemeManagerService y NetworkStatusService al crear la app: sus
   * `effect()`/listeners aplican el tema al documento y monitorizan la conexión.
   */
  private readonly themeManager = inject(ThemeManagerService);
  private readonly networkStatus = inject(NetworkStatusService);
}
