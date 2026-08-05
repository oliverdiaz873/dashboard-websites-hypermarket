import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';

import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { getStorageItem, setStorageItem } from '@core/utils/storage.util';

import { DashboardService } from '../services/dashboard.service';
import {
  DASHBOARD_RANGES,
  DEFAULT_RANGE,
  DEFAULT_TOP_PRODUCTS_LIMIT,
  type DashboardRange,
} from '../constants/dashboard.constants';
import type {
  CategorySalesStat,
  DashboardKpis,
  InventorySummary,
  RevenueTrendPoint,
  StatsOrdersByStatus,
  TopProductStat,
} from '../models/dashboard.model';

interface DashboardState {
  range: DashboardRange;
  kpis: DashboardKpis | null;
  revenueTrend: RevenueTrendPoint[];
  ordersByStatus: StatsOrdersByStatus | null;
  topProducts: TopProductStat[];
  categorySales: CategorySalesStat[];
  inventorySummary: InventorySummary | null;
  isLoading: boolean;
  hasLoaded: boolean;
  error: string | null;
}

function initialRange(): DashboardRange {
  const stored = getStorageItem<DashboardRange>(STORAGE_KEYS.dashboardRange);
  return stored !== null && (DASHBOARD_RANGES as readonly number[]).includes(stored)
    ? stored
    : DEFAULT_RANGE;
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>(() => ({
    range: initialRange(),
    kpis: null,
    revenueTrend: [],
    ordersByStatus: null,
    topProducts: [],
    categorySales: [],
    inventorySummary: null,
    isLoading: false,
    hasLoaded: false,
    error: null,
  })),
  withComputed(({ kpis, range, revenueTrend, categorySales }) => ({
    kpiCards: computed(() => {
      const k = kpis();
      if (!k) return [];
      const active = range();
      return [
        {
          key: 'revenue',
          title: `Ingresos (${active} días)`,
          value: k.revenue,
          unit: 'RD$',
          icon: 'payments',
        },
        { key: 'orders', title: 'Pedidos', value: k.orders, icon: 'receipt_long' },
        {
          key: 'aov',
          title: 'Ticket promedio',
          value: k.averageOrderValue,
          unit: 'RD$',
          icon: 'shopping_cart',
        },
        { key: 'customers', title: 'Clientes', value: k.customers, icon: 'group' },
      ];
    }),
    hasSeriesData: computed(() => revenueTrend().length > 0 || categorySales().length > 0),
  })),
  withMethods((store) => {
    const dashboardService = inject(DashboardService);

    const load = async (): Promise<void> => {
      if (store.isLoading()) return;
      patchState(store, { isLoading: true, error: null });
      const range = store.range();
      try {
        // Carga independiente por métrica: un fallo en una serie NO tumba el
        // dashboard completo. El error global solo aparece si TODAS fallan.
        const [kpis, revenueTrend, ordersByStatus, topProducts, categorySales, inventorySummary] =
          await Promise.allSettled([
            firstValueFrom(dashboardService.getDashboard(range)),
            firstValueFrom(dashboardService.getRevenueSeries({ days: range })),
            firstValueFrom(dashboardService.getOrdersByStatus({ days: range })),
            firstValueFrom(
              dashboardService.getTopProducts({
                days: range,
                limit: DEFAULT_TOP_PRODUCTS_LIMIT,
              }),
            ),
            firstValueFrom(dashboardService.getCategorySales({ days: range })),
            firstValueFrom(dashboardService.getInventorySummary()),
          ]);
        patchState(store, {
          kpis: kpis.status === 'fulfilled' ? kpis.value : null,
          revenueTrend: revenueTrend.status === 'fulfilled' ? revenueTrend.value : [],
          ordersByStatus: ordersByStatus.status === 'fulfilled' ? ordersByStatus.value : null,
          topProducts: topProducts.status === 'fulfilled' ? topProducts.value : [],
          categorySales: categorySales.status === 'fulfilled' ? categorySales.value : [],
          inventorySummary: inventorySummary.status === 'fulfilled' ? inventorySummary.value : null,
          hasLoaded: true,
        });
        const allFailed = [
          kpis,
          revenueTrend,
          ordersByStatus,
          topProducts,
          categorySales,
          inventorySummary,
        ].every((result) => result.status === 'rejected');
        if (allFailed) {
          patchState(store, { error: 'No se pudieron cargar las estadísticas.' });
        }
      } catch {
        patchState(store, { error: 'No se pudieron cargar las estadísticas.' });
      } finally {
        patchState(store, { isLoading: false });
      }
    };

    return {
      load,

      setRange(range: DashboardRange): void {
        if (range === store.range()) return;
        setStorageItem(STORAGE_KEYS.dashboardRange, range);
        patchState(store, { range, hasLoaded: false });
        void load();
      },

      refresh(): void {
        void load();
      },
    };
  }),
);
