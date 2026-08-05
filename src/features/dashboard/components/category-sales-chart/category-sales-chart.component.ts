import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, type ChartOptions, type TooltipItem } from 'chart.js';

import { ChartContainerComponent } from '@shared/components/chart-container/chart-container.component';
import { CHART_COLORS } from '../../constants/dashboard.constants';
import type { CategorySalesStat } from '../../models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-category-sales-chart',
  templateUrl: './category-sales-chart.component.html',
  styleUrl: './category-sales-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective, ChartContainerComponent],
})
export class CategorySalesChartComponent {
  readonly categories = input<CategorySalesStat[]>([]);
  readonly loading = input<boolean>(false);

  readonly type = 'doughnut';
  readonly data = computed(() => ({
    labels: this.categories().map((c) => c.category),
    datasets: [
      {
        data: this.categories().map((c) => c.revenue),
        backgroundColor: this.categories().map(
          (_, i) => CHART_COLORS.categoryPalette[i % CHART_COLORS.categoryPalette.length],
        ),
        borderWidth: 1,
      },
    ],
  }));
  readonly options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'doughnut'>) =>
            `${ctx.label}: RD$ ${Number(ctx.raw ?? 0).toLocaleString('en-US')}`,
        },
      },
    },
  };
}
