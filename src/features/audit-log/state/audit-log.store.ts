import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { getStorageItem, setStorageItem } from '@core/utils/storage.util';

import { AuditLogService } from '../services/audit-log.service';
import type { AuditLog } from '../models/audit-log.model';
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from '../constants/audit-log.constants';

interface AuditLogState {
  items: AuditLog[];
  selectedLog: AuditLog | null;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  action: string;
  entity: string;
  from: string;
  to: string;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
}

function initialPageSize(): number {
  const stored = getStorageItem<number>(STORAGE_KEYS.auditLogsPageSize);
  return stored !== null && PAGE_SIZE_OPTIONS.includes(stored) ? stored : DEFAULT_PAGE_SIZE;
}

export const AuditLogStore = signalStore(
  { providedIn: 'root' },
  withState<AuditLogState>(() => ({
    items: [],
    selectedLog: null,
    total: 0,
    page: 1,
    pageSize: initialPageSize(),
    search: '',
    action: '',
    entity: '',
    from: '',
    to: '',
    isLoading: false,
    hasLoaded: false,
    error: null,
  })),
  withComputed(({ items }) => ({
    isEmpty: computed(() => items().length === 0),
  })),
  withMethods((store) => {
    const auditLogService = inject(AuditLogService);

    let requestId = 0;

    const load = async (): Promise<void> => {
      const id = ++requestId;
      patchState(store, { isLoading: true, error: null });
      try {
        const result = await firstValueFrom(
          auditLogService.list({
            page: store.page(),
            limit: store.pageSize(),
            q: store.search() || undefined,
            action: (store.action() || undefined) as never,
            entity: store.entity() || undefined,
            from: store.from() || undefined,
            to: store.to() || undefined,
          }),
        );
        if (id !== requestId) return;
        patchState(store, { items: result.data, total: result.pagination.total, hasLoaded: true });
      } catch {
        if (id !== requestId) return;
        patchState(store, {
          error: 'No se pudieron cargar los registros de auditoría.',
          hasLoaded: true,
        });
      } finally {
        if (id === requestId) {
          patchState(store, { isLoading: false });
        }
      }
    };

    const loadDetail = async (id: string): Promise<void> => {
      patchState(store, { isLoading: true, error: null });
      try {
        const log = await firstValueFrom(auditLogService.getById(id));
        patchState(store, { selectedLog: log });
      } catch {
        patchState(store, { error: 'No se pudo cargar el detalle del registro.' });
      } finally {
        patchState(store, { isLoading: false });
      }
    };

    return {
      load,
      loadDetail,

      setPage(page: number): void {
        patchState(store, { page });
        void load();
      },

      setPageSize(pageSize: number): void {
        setStorageItem(STORAGE_KEYS.auditLogsPageSize, pageSize);
        patchState(store, { pageSize, page: 1 });
        void load();
      },

      setSearch(search: string): void {
        patchState(store, { search, page: 1 });
        void load();
      },

      setAction(action: string): void {
        patchState(store, { action, page: 1 });
        void load();
      },

      setEntity(entity: string): void {
        patchState(store, { entity, page: 1 });
        void load();
      },

      setDateRange(from: string, to: string): void {
        patchState(store, { from, to, page: 1 });
        void load();
      },

      clearFilters(): void {
        patchState(store, { search: '', action: '', entity: '', from: '', to: '', page: 1 });
        void load();
      },

      refresh(): void {
        void load();
      },
    };
  }),
);
