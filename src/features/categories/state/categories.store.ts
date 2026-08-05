import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { CategoriesService } from '../services/categories.service';
import type { Category, CreateCategoryPayload } from '../models/category.model';

interface CategoriesState {
  items: Category[];
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  isSubmitting: boolean;
}

export const CategoriesStore = signalStore(
  { providedIn: 'root' },
  withState<CategoriesState>(() => ({
    items: [],
    isLoading: false,
    hasLoaded: false,
    error: null,
    isSubmitting: false,
  })),
  withComputed(({ items }) => ({
    isEmpty: computed(() => items().length === 0),
    sortedItems: computed(() => [...items()].sort((a, b) => a.name.localeCompare(b.name))),
  })),
  withMethods((store) => {
    const categoriesService = inject(CategoriesService);

    const load = async (): Promise<void> => {
      if (store.isLoading()) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const items = await firstValueFrom(categoriesService.list());
        patchState(store, { items, hasLoaded: true });
      } catch {
        patchState(store, { error: 'No se pudieron cargar las categorías.' });
      } finally {
        patchState(store, { isLoading: false });
      }
    };

    return {
      load,
      refresh(): void {
        void load();
      },

      async create(payload: CreateCategoryPayload): Promise<Category> {
        patchState(store, { isSubmitting: true });
        try {
          const created = await firstValueFrom(categoriesService.create(payload));
          patchState(store, { isSubmitting: false });
          await load();
          return created;
        } catch (error) {
          patchState(store, { isSubmitting: false });
          throw error;
        }
      },

      async update(id: string, payload: CreateCategoryPayload): Promise<Category> {
        patchState(store, { isSubmitting: true });
        try {
          const updated = await firstValueFrom(categoriesService.update(id, payload));
          patchState(store, { isSubmitting: false });
          await load();
          return updated;
        } catch (error) {
          patchState(store, { isSubmitting: false });
          throw error;
        }
      },

      async remove(id: string): Promise<void> {
        patchState(store, { isSubmitting: true });
        try {
          await firstValueFrom(categoriesService.remove(id));
          patchState(store, { isSubmitting: false });
          await load();
        } catch (error) {
          patchState(store, { isSubmitting: false });
          throw error;
        }
      },
    };
  }),
);
