import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';

import { ContactsService } from '../services/contacts.service';
import type { ContactMessage } from '../models/contact-message.model';
import type { ContactMessageStatus } from '../constants/contact.constants';
import { CONTACT_STATUS_LABELS } from '../constants/contact.constants';

interface ContactsState {
  items: ContactMessage[];
  statusFilter: ContactMessageStatus | '';
  isLoading: boolean;
  hasLoaded: boolean;
  isMutating: boolean;
  error: string | null;
}

export const ContactsStore = signalStore(
  { providedIn: 'root' },
  withState<ContactsState>(() => ({
    items: [],
    statusFilter: '',
    isLoading: false,
    hasLoaded: false,
    isMutating: false,
    error: null,
  })),
  withComputed(({ items, statusFilter }) => ({
    isEmpty: computed(() => items().length === 0),
    filteredItems: computed(() => {
      const filter = statusFilter();
      if (!filter) return items();
      return items().filter((item) => item.status === filter);
    }),
    pendingCount: computed(() => items().filter((item) => item.status === 'pending').length),
  })),
  withMethods((store) => {
    const contactsService = inject(ContactsService);
    const notificationsStore = inject(NotificationsStore);

    const load = async (): Promise<void> => {
      if (store.isLoading()) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const items = await firstValueFrom(contactsService.list());
        patchState(store, { items, hasLoaded: true });
      } catch {
        patchState(store, {
          error: 'No se pudieron cargar los mensajes de contacto.',
          hasLoaded: true,
        });
      } finally {
        patchState(store, { isLoading: false });
      }
    };

    return {
      load,
      refresh(): void {
        void load();
      },

      setStatusFilter(status: ContactMessageStatus | ''): void {
        patchState(store, { statusFilter: status });
      },

      async updateStatus(id: string, status: ContactMessageStatus): Promise<void> {
        patchState(store, { isMutating: true });
        try {
          const updated = await firstValueFrom(contactsService.updateStatus(id, status));
          patchState(store, {
            items: store.items().map((item) => (item.id === id ? updated : item)),
          });
          notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: 'Estado actualizado',
            message: `Mensaje marcado como ${CONTACT_STATUS_LABELS[status].toLowerCase()}.`,
          });
        } catch {
          // El error de mutación ya se notifica vía el ErrorInterceptor.
        } finally {
          patchState(store, { isMutating: false });
        }
      },

      async remove(id: string): Promise<void> {
        patchState(store, { isMutating: true });
        try {
          await firstValueFrom(contactsService.remove(id));
          patchState(store, {
            items: store.items().filter((item) => item.id !== id),
          });
          notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: 'Mensaje eliminado',
            message: 'El mensaje de contacto se eliminó correctamente.',
          });
        } catch {
          // El error de mutación ya se notifica vía el ErrorInterceptor.
        } finally {
          patchState(store, { isMutating: false });
        }
      },
    };
  }),
);
