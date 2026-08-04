import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { SORT_DIRECTION, type SortDirection } from '@core/enums/sort-direction';
import { getStorageItem, setStorageItem } from '@core/utils/storage.util';

import { OrdersService } from '../services/orders.service';
import type { AdminOrder, ChangeOrderStatusPayload, OrderStatus } from '../models/order.model';
import {
  DEFAULT_PAGE_SIZE,
  ORDER_SORT_FIELDS,
  PAGE_SIZE_OPTIONS,
  type OrderSortField,
} from '../constants/orders.constants';

interface OrdersState {
  items: AdminOrder[];
  selectedOrder: AdminOrder | null;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: OrderStatus | '';
  sortBy: OrderSortField;
  sortOrder: SortDirection;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  isSubmitting: boolean;
}

function initialSortBy(): OrderSortField {
  const stored = getStorageItem<OrderSortField>(STORAGE_KEYS.ordersSortBy);
  return stored !== null && (ORDER_SORT_FIELDS as readonly string[]).includes(stored)
    ? stored
    : 'createdAt';
}

function initialSortOrder(): SortDirection {
  const stored = getStorageItem<SortDirection>(STORAGE_KEYS.ordersSortOrder);
  return stored === SORT_DIRECTION.DESC ? SORT_DIRECTION.DESC : SORT_DIRECTION.ASC;
}

function initialPageSize(): number {
  const stored = getStorageItem<number>(STORAGE_KEYS.ordersPageSize);
  return stored !== null && PAGE_SIZE_OPTIONS.includes(stored) ? stored : DEFAULT_PAGE_SIZE;
}

export const OrdersStore = signalStore(
  { providedIn: 'root' },
  withState<OrdersState>(() => ({
    items: [],
    selectedOrder: null,
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
  })),
  withMethods((store) => {
    const ordersService = inject(OrdersService);

    const load = async (): Promise<void> => {
      if (store.isLoading()) return;
      patchState(store, { isLoading: true, error: null });
      try {
        const result = await firstValueFrom(
          ordersService.list({
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
        patchState(store, { error: 'No se pudieron cargar los pedidos.' });
      } finally {
        patchState(store, { isLoading: false });
      }
    };

    const loadDetail = async (id: string): Promise<void> => {
      patchState(store, { isLoading: true, error: null });
      try {
        const order = await firstValueFrom(ordersService.getById(id));
        patchState(store, { selectedOrder: order });
      } catch {
        patchState(store, { error: 'No se pudo cargar el pedido.' });
      } finally {
        patchState(store, { isLoading: false });
      }
    };

    const applySort = (field: OrderSortField, direction: SortDirection): void => {
      setStorageItem(STORAGE_KEYS.ordersSortBy, field);
      setStorageItem(STORAGE_KEYS.ordersSortOrder, direction);
      patchState(store, { sortBy: field, sortOrder: direction, page: 1 });
      void load();
    };

    return {
      load,
      loadDetail,

      setPage(page: number): void {
        patchState(store, { page });
        void load();
      },

      setPageSize(pageSize: number): void {
        setStorageItem(STORAGE_KEYS.ordersPageSize, pageSize);
        patchState(store, { pageSize, page: 1 });
        void load();
      },

      setSearch(search: string): void {
        patchState(store, { search, page: 1 });
        void load();
      },

      setStatus(status: OrderStatus | ''): void {
        patchState(store, { status, page: 1 });
        void load();
      },

      setSort(field: OrderSortField, direction: SortDirection): void {
        applySort(field, direction);
      },

      onSortChange(sort: { key: string; direction: SortDirection }): void {
        if (!(ORDER_SORT_FIELDS as readonly string[]).includes(sort.key)) return;
        applySort(sort.key as OrderSortField, sort.direction);
      },

      refresh(): void {
        void load();
      },

      async changeStatus(id: string, payload: ChangeOrderStatusPayload): Promise<AdminOrder> {
        patchState(store, { isSubmitting: true, error: null });
        try {
          const updated = await firstValueFrom(ordersService.changeStatus(id, payload));
          patchState(store, { isSubmitting: false });
          if (store.selectedOrder()?.id === id) {
            patchState(store, { selectedOrder: updated });
          }
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
