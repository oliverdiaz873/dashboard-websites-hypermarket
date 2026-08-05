import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, type ChartOptions } from 'chart.js';

import { ChartContainerComponent } from '@shared/components/chart-container/chart-container.component';
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS } from '../../constants/dashboard.constants';
import type { StatsOrdersByStatus } from '../../models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-orders-by-status-chart',
  templateUrl: './orders-by-status-chart.component.html',
  styleUrl: './orders-by-status-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective, ChartContainerComponent],
})
export class OrdersByStatusChartComponent {
  readonly status = input<StatsOrdersByStatus | null>(null);
  readonly loading = input<boolean>(false);

  readonly type = 'doughnut';
  readonly entries = computed(() => {
    const status = this.status();
    if (!status) return [];
    return (Object.keys(status) as (keyof StatsOrdersByStatus)[])
      .map((key) => ({
        key,
        count: status[key],
      }))
      .filter((entry) => entry.count > 0);
  });
  readonly hasData = computed(() => this.entries().length > 0);
  readonly data = computed(() => ({
    labels: this.entries().map((e) => ORDER_STATUS_LABELS[e.key] ?? e.key),
    datasets: [
      {
        data: this.entries().map((e) => e.count),
        backgroundColor: this.entries().map((e) => ORDER_STATUS_COLORS[e.key]),
        borderWidth: 1,
      },
    ],
  }));
  readonly options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  };
}
