import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';

import { BrandsService } from '../services/brands.service';
import type { Brand, CreateBrandPayload, UpdateBrandPayload } from '../models/brand.model';
import type { BrandStatusFilter } from '../constants/brand.constants';

interface BrandsState {
  items: Brand[];
  statusFilter: BrandStatusFilter;
  isLoading: boolean;
  hasLoaded: boolean;
  isMutating: boolean;
  error: string | null;
}

export const BrandsStore = signalStore(
  { providedIn: 'root' },
  withState<BrandsState>(() => ({
    items: [],
    statusFilter: 'all',
    isLoading: false,
    hasLoaded: false,
    isMutating: false,
    error: null,
  })),
  withComputed(({ items, statusFilter }) => ({
    isEmpty: computed(() => items().length === 0),
    filteredItems: computed(() => {
      const filter = statusFilter();
      if (filter === 'all') return items();
      return items().filter((brand) =>
        filter === 'active' ? brand.status === 'active' : brand.status === 'inactive',
      );
    }),
    activeCount: computed(() => items().filter((brand) => brand.status === 'active').length),
  })),
  withMethods((store) => {
    const brandsService = inject(BrandsService);
    const notificationsStore = inject(NotificationsStore);

    const load = async (): Promise<void> => {
      if (store.isLoading()) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const items = await firstValueFrom(brandsService.list());
        patchState(store, { items, hasLoaded: true });
      } catch {
        patchState(store, {
          error: 'No se pudieron cargar las marcas.',
          hasLoaded: true,
        });
      } finally {
        patchState(store, { isLoading: false });
      }
    };

    const update = async (id: string, payload: UpdateBrandPayload): Promise<Brand | null> => {
      patchState(store, { isMutating: true });
      try {
        const updated = await firstValueFrom(brandsService.update(id, payload));
        await load();
        notificationsStore.add({
          type: NOTIFICATION_TYPE.SUCCESS,
          title: 'Marca actualizada',
          message: 'La marca se actualizó correctamente.',
        });
        return updated;
      } catch {
        return null;
      } finally {
        patchState(store, { isMutating: false });
      }
    };

    return {
      load,
      refresh(): void {
        void load();
      },

      setStatusFilter(filter: BrandStatusFilter): void {
        patchState(store, { statusFilter: filter });
      },

      async create(payload: CreateBrandPayload): Promise<Brand | null> {
        patchState(store, { isMutating: true });
        try {
          const created = await firstValueFrom(brandsService.create(payload));
          await load();
          notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: 'Marca creada',
            message: `La marca "${created.name}" se creó correctamente.`,
          });
          return created;
        } catch {
          return null;
        } finally {
          patchState(store, { isMutating: false });
        }
      },

      update,

      async toggleStatus(brand: Brand): Promise<void> {
        const next = brand.status === 'active' ? 'inactive' : 'active';
        const updated = await update(brand.id, { status: next });
        if (updated) {
          notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: next === 'active' ? 'Marca activada' : 'Marca desactivada',
            message: `La marca "${brand.name}" quedó ${next === 'active' ? 'activa' : 'inactiva'}.`,
          });
        }
      },

      async remove(id: string): Promise<void> {
        patchState(store, { isMutating: true });
        try {
          await firstValueFrom(brandsService.remove(id));
          patchState(store, {
            items: store.items().filter((brand) => brand.id !== id),
          });
          notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: 'Marca eliminada',
            message: 'La marca se eliminó correctamente.',
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
