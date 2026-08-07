import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom, type Observable } from 'rxjs';

import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { SORT_DIRECTION, type SortDirection } from '@core/enums/sort-direction';
import { getStorageItem, setStorageItem } from '@core/utils/storage.util';

import {
  CUSTOMER_SORT_FIELDS,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  type CustomerSortField,
} from '../constants/customers.constants';
import type {
  CreateCustomerPayload,
  Customer,
  CustomerStats,
  CustomerStatus,
  UpdateCustomerPayload,
} from '../models/customer.model';
import { CustomersService } from '../services/customers.service';

interface CustomersState {
  customers: Customer[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  status: CustomerStatus | '';
  sortBy: CustomerSortField;
  sortOrder: SortDirection;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
  isSubmitting: boolean;
  stats: CustomerStats | null;
}

function initialSortBy(): CustomerSortField {
  const stored = getStorageItem<CustomerSortField>(STORAGE_KEYS.customersSortBy);
  return stored !== null && (CUSTOMER_SORT_FIELDS as readonly string[]).includes(stored)
    ? stored
    : 'createdAt';
}

function initialSortOrder(): SortDirection {
  const stored = getStorageItem<SortDirection>(STORAGE_KEYS.customersSortOrder);
  return stored === SORT_DIRECTION.ASC ? SORT_DIRECTION.ASC : SORT_DIRECTION.DESC;
}

function initialPageSize(): number {
  const stored = getStorageItem<number>(STORAGE_KEYS.customersPageSize);
  return stored !== null && PAGE_SIZE_OPTIONS.includes(stored) ? stored : DEFAULT_PAGE_SIZE;
}

export const CustomersStore = signalStore(
  { providedIn: 'root' },
  withState<CustomersState>(() => ({
    customers: [],
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
    stats: null,
  })),
  withComputed(({ customers }) => ({
    isEmpty: computed(() => customers().length === 0),
  })),
  withMethods((store) => {
    const customersService = inject(CustomersService);

    let requestId = 0;

    const load = async (): Promise<void> => {
      const current = ++requestId;
      patchState(store, { isLoading: true, error: null });
      try {
        const result = await firstValueFrom(
          customersService.list({
            page: store.page(),
            limit: store.pageSize(),
            q: store.search() || undefined,
            status: store.status() || undefined,
            sortBy: store.sortBy(),
            sortOrder: store.sortOrder(),
          }),
        );
        if (current !== requestId) return;
        patchState(store, {
          customers: result.data,
          total: result.pagination.total,
          hasLoaded: true,
        });
      } catch {
        if (current !== requestId) return;
        patchState(store, { error: 'No se pudieron cargar los clientes.', hasLoaded: true });
      } finally {
        if (current === requestId) patchState(store, { isLoading: false });
      }
    };

    const loadStats = async (): Promise<void> => {
      try {
        const stats = await firstValueFrom(customersService.stats());
        patchState(store, { stats });
      } catch {
        /* Los KPIs no bloquean el listado. */
      }
    };

    const applySort = (field: CustomerSortField, direction: SortDirection): void => {
      setStorageItem(STORAGE_KEYS.customersSortBy, field);
      setStorageItem(STORAGE_KEYS.customersSortOrder, direction);
      patchState(store, { sortBy: field, sortOrder: direction, page: 1 });
      void load();
    };

    return {
      load,
      loadStats,

      findById(id: string): Observable<Customer> {
        return customersService.findById(id);
      },

      setPage(page: number): void {
        patchState(store, { page });
        void load();
      },

      setPageSize(pageSize: number): void {
        setStorageItem(STORAGE_KEYS.customersPageSize, pageSize);
        patchState(store, { pageSize, page: 1 });
        void load();
      },

      setSearch(search: string): void {
        patchState(store, { search, page: 1 });
        void load();
      },

      setStatus(status: CustomerStatus | ''): void {
        patchState(store, { status, page: 1 });
        void load();
      },

      setSort(field: CustomerSortField, direction: SortDirection): void {
        applySort(field, direction);
      },

      onSortChange(sort: { key: string; direction: SortDirection }): void {
        if (!(CUSTOMER_SORT_FIELDS as readonly string[]).includes(sort.key)) return;
        applySort(sort.key as CustomerSortField, sort.direction);
      },

      refresh(): void {
        void load();
      },

      async createCustomer(payload: CreateCustomerPayload): Promise<Customer> {
        patchState(store, { isSubmitting: true });
        try {
          const customer = await firstValueFrom(customersService.create(payload));
          patchState(store, { isSubmitting: false });
          await load();
          void loadStats();
          return customer;
        } catch (error) {
          // El error de mutación se notifica vía el toast (ErrorInterceptor);
          // no debe pintarse como error de carga del listado.
          patchState(store, { isSubmitting: false });
          throw error;
        }
      },

      async updateCustomer(id: string, payload: UpdateCustomerPayload): Promise<Customer> {
        patchState(store, { isSubmitting: true });
        try {
          const customer = await firstValueFrom(customersService.update(id, payload));
          patchState(store, { isSubmitting: false });
          await load();
          return customer;
        } catch (error) {
          patchState(store, { isSubmitting: false });
          throw error;
        }
      },

      async toggleStatus(customer: Customer): Promise<Customer> {
        const next: CustomerStatus = customer.status === 'active' ? 'blocked' : 'active';
        patchState(store, { isSubmitting: true });
        try {
          const updated = await firstValueFrom(customersService.updateStatus(customer.id, next));
          patchState(store, { isSubmitting: false });
          await load();
          void loadStats();
          return updated;
        } catch (error) {
          patchState(store, { isSubmitting: false });
          throw error;
        }
      },
    };
  }),
);
