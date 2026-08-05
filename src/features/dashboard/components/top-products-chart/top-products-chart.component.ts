import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, type ChartOptions } from 'chart.js';

import { ChartContainerComponent } from '@shared/components/chart-container/chart-container.component';
import { CHART_COLORS } from '../../constants/dashboard.constants';
import type { TopProductStat } from '../../models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-top-products-chart',
  templateUrl: './top-products-chart.component.html',
  styleUrl: './top-products-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective, ChartContainerComponent],
})
export class TopProductsChartComponent {
  readonly products = input<TopProductStat[]>([]);
  readonly days = input<number>(30);
  readonly loading = input<boolean>(false);

  readonly type = 'bar';
  readonly data = computed(() => ({
    labels: [...this.products()].reverse().map((p) => p.name),
    datasets: [
      {
        label: 'Unidades vendidas',
        data: [...this.products()].reverse().map((p) => p.quantity),
        backgroundColor: CHART_COLORS.brand,
        borderRadius: 4,
      },
    ],
  }));
  readonly options: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0 } },
    },
  };
}
