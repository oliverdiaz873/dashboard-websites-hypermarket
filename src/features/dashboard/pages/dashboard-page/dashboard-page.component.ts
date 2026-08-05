import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { DASHBOARD_RANGES } from '../../constants/dashboard.constants';
import { DashboardStore } from '../../state/dashboard.store';
import { RevenueChartComponent } from '../../components/revenue-chart/revenue-chart.component';
import { OrdersByStatusChartComponent } from '../../components/orders-by-status-chart/orders-by-status-chart.component';
import { TopProductsChartComponent } from '../../components/top-products-chart/top-products-chart.component';
import { CategorySalesChartComponent } from '../../components/category-sales-chart/category-sales-chart.component';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    PageHeaderComponent,
    EmptyStateComponent,
    StatCardComponent,
    RevenueChartComponent,
    OrdersByStatusChartComponent,
    TopProductsChartComponent,
    CategorySalesChartComponent,
  ],
})
export class DashboardPageComponent {
  protected readonly store = inject(DashboardStore);

  protected readonly ranges = DASHBOARD_RANGES;
  protected readonly loading = computed(() => this.store.isLoading() && !this.store.hasLoaded());
  protected readonly showError = computed(
    () => this.store.hasLoaded() && this.store.error() !== null,
  );

  constructor() {
    void this.store.load();
  }

  protected retry(): void {
    void this.store.load();
  }

  protected onRangeChange(range: number): void {
    this.store.setRange(range as (typeof DASHBOARD_RANGES)[number]);
  }
}
