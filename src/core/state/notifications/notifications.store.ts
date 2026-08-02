import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import type { AppNotification } from '../../models/notification';
import { uniqueId } from '../../utils/common.util';

interface NotificationsState {
  notifications: AppNotification[];
}

export const NotificationsStore = signalStore(
  { providedIn: 'root' },
  withState<NotificationsState>({ notifications: [] }),
  withComputed(({ notifications }) => ({
    unreadCount: computed(() => notifications().length),
  })),
  withMethods((store) => ({
    add: (input: Omit<AppNotification, 'id' | 'createdAt'>) => {
      const notification: AppNotification = {
        ...input,
        id: uniqueId('notif'),
        createdAt: Date.now(),
      };
      patchState(store, { notifications: [...store.notifications(), notification] });
    },
    remove: (id: string) =>
      patchState(store, { notifications: store.notifications().filter((n) => n.id !== id) }),
    clear: () => patchState(store, { notifications: [] }),
  })),
);
