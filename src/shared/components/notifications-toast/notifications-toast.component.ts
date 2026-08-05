import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import type { AppNotification } from '@core/models/notification';
import { NotificationsStore } from '@core/state/notifications/notifications.store';

/**
 * Renderiza las notificaciones del `NotificationsStore` mediante un Snackbar de
 * Angular Material. Cada entrada se muestra una única vez y se elimina del store
 * al cerrarse (maniobrable o auto), para no dejar mensajes aplazados sin vista.
 */
@Component({
  selector: 'app-notifications-toast',
  templateUrl: './notifications-toast.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsToastComponent {
  private readonly snackBar = inject(MatSnackBar);
  private readonly store = inject(NotificationsStore);

  private readonly shownIds = new Set<string>();
  private readonly DURATION_MS = 5_000;

  constructor() {
    effect(() => {
      for (const notification of this.store.notifications()) {
        if (this.shownIds.has(notification.id)) continue;
        this.shownIds.add(notification.id);
        this.show(notification);
      }
    });
  }

  private show(notification: AppNotification): void {
    const ref = this.snackBar.open(this.messageOf(notification), 'Cerrar', {
      duration: this.DURATION_MS,
      panelClass: ['hs-toast', this.panelClassOf(notification.type)],
      politeness: notification.type === NOTIFICATION_TYPE.ERROR ? 'assertive' : 'polite',
    });
    ref.afterDismissed().subscribe(() => this.store.remove(notification.id));
  }

  private messageOf(notification: AppNotification): string {
    return notification.title
      ? `${notification.title}: ${notification.message}`
      : notification.message;
  }

  private panelClassOf(type: string): string {
    switch (type) {
      case NOTIFICATION_TYPE.SUCCESS:
        return 'hs-toast--success';
      case NOTIFICATION_TYPE.WARNING:
        return 'hs-toast--warning';
      case NOTIFICATION_TYPE.ERROR:
        return 'hs-toast--error';
      default:
        return 'hs-toast--info';
    }
  }
}
