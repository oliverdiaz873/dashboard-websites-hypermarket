import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { SORT_DIRECTION, type SortDirection } from '@core/enums/sort-direction';
import { getStorageItem, setStorageItem } from '@core/utils/storage.util';

import { InventoryService } from '../services/inventory.service';
import type {
  AdjustPayload,
  Inventory,
  InventoryStatus,
  MinStockPayload,
} from '../models/inventory.model';
import {
  DEFAULT_PAGE_SIZE,
  INVENTORY_SORT_FIELDS,
  PAGE_SIZE_OPTIONS,
  type InventorySortField,
} from '../constants/inventory.constants';

interface InventoryState {
  items: Inventory[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: InventoryStatus | '';
  sortBy: InventorySortField;
  sortOrder: SortDirection;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  isSubmitting: boolean;
}

function initialSortBy(): InventorySortField {
  const stored = getStorageItem<InventorySortField>(STORAGE_KEYS.inventorySortBy);
  return stored !== null && (INVENTORY_SORT_FIELDS as readonly string[]).includes(stored)
    ? stored
    : 'updatedAt';
}

function initialSortOrder(): SortDirection {
  const stored = getStorageItem<SortDirection>(STORAGE_KEYS.inventorySortOrder);
  return stored === SORT_DIRECTION.DESC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;
}

function initialPageSize(): number {
  const stored = getStorageItem<number>(STORAGE_KEYS.inventoryPageSize);
  return stored !== null && PAGE_SIZE_OPTIONS.includes(stored) ? stored : DEFAULT_PAGE_SIZE;
}

export const InventoryStore = signalStore(
  { providedIn: 'root' },
  withState<InventoryState>(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: initialPageSize(),
    search: '',
    status: '',
    sortBy: initialSortBy(),
    sortOrder: initialSortOrder(),
    isLoading: false,
    hasLoaded: false,
    error: null,
    isSubmitting: false,
  })),
  withComputed(({ items }) => ({
    isEmpty: computed(() => items().length === 0),
    lowStockCount: computed(() => items().filter((item) => item.status === 'low-stock').length),
    outOfStockCount: computed(
      () => items().filter((item) => item.status === 'out-of-stock').length,
    ),
  })),
  withMethods((store) => {
    const inventoryService = inject(InventoryService);

    const load = async (): Promise<void> => {
      if (store.isLoading()) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const result = await firstValueFrom(
          inventoryService.list({
            page: store.page(),
            limit: store.pageSize(),
            q: store.search() || undefined,
            status: store.status() || undefined,
            sortBy: store.sortBy(),
            sortOrder: store.sortOrder(),
          }),
        );
        patchState(store, {
          items: result.data,
          total: result.pagination.total,
          hasLoaded: true,
        });
      } catch {
        patchState(store, { error: 'No se pudo cargar el inventario.' });
      } finally {
        patchState(store, { isLoading: false });
      }
    };

    const applySort = (field: InventorySortField, direction: SortDirection): void => {
      setStorageItem(STORAGE_KEYS.inventorySortBy, field);
      setStorageItem(STORAGE_KEYS.inventorySortOrder, direction);
      patchState(store, { sortBy: field, sortOrder: direction, page: 1 });
      void load();
    };

    return {
      load,

      setPage(page: number): void {
        patchState(store, { page });
        void load();
      },

      setPageSize(pageSize: number): void {
        setStorageItem(STORAGE_KEYS.inventoryPageSize, pageSize);
        patchState(store, { pageSize, page: 1 });
        void load();
      },

      setSearch(search: string): void {
        patchState(store, { search, page: 1 });
        void load();
      },

      setStatus(status: InventoryStatus | ''): void {
        patchState(store, { status, page: 1 });
        void load();
      },

      setSort(field: InventorySortField, direction: SortDirection): void {
        applySort(field, direction);
      },

      onSortChange(sort: { key: string; direction: SortDirection }): void {
        if (!(INVENTORY_SORT_FIELDS as readonly string[]).includes(sort.key)) return;
        applySort(sort.key as InventorySortField, sort.direction);
      },

      refresh(): void {
        void load();
      },

      async adjust(id: string, payload: AdjustPayload): Promise<Inventory> {
        patchState(store, { isSubmitting: true, error: null });
        try {
          const updated = await firstValueFrom(inventoryService.adjust(id, payload));
          patchState(store, { isSubmitting: false });
          await load();
          return updated;
        } catch (error) {
          patchState(store, { isSubmitting: false, error: toErrorMessage(error) });
          throw error;
        }
      },

      async changeMinStock(id: string, payload: MinStockPayload): Promise<Inventory> {
        patchState(store, { isSubmitting: true, error: null });
        try {
          const updated = await firstValueFrom(inventoryService.changeMinStock(id, payload));
          patchState(store, { isSubmitting: false });
          await load();
          return updated;
        } catch (error) {
          patchState(store, { isSubmitting: false, error: toErrorMessage(error) });
          throw error;
        }
      },
    };
  }),
);

function toErrorMessage(error: unknown): string | null {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return null;
}
