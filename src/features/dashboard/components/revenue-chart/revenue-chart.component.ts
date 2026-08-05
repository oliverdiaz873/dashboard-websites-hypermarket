import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, type ChartOptions, type TooltipItem } from 'chart.js';

import { ChartContainerComponent } from '@shared/components/chart-container/chart-container.component';
import { CHART_COLORS } from '../../constants/dashboard.constants';
import type { RevenueTrendPoint } from '../../models/dashboard.model';

Chart.register(...registerables);

@Component({
  selector: 'app-revenue-chart',
  templateUrl: './revenue-chart.component.html',
  styleUrl: './revenue-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseChartDirective, ChartContainerComponent],
})
export class RevenueChartComponent {
  readonly points = input<RevenueTrendPoint[]>([]);
  readonly days = input<number>(30);
  readonly loading = input<boolean>(false);

  readonly type = 'line';
  readonly data = () => ({
    labels: this.points().map((p) => p.date),
    datasets: [
      {
        label: 'Ingresos',
        data: this.points().map((p) => p.total),
        borderColor: CHART_COLORS.revenue,
        backgroundColor: `${CHART_COLORS.revenue}33`,
        fill: true,
        tension: 0.3,
        pointRadius: 2,
      },
    ],
  });
  readonly options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'line'>) =>
            `RD$ ${Number(ctx.parsed.y ?? 0).toLocaleString('en-US')}`,
        },
      },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 10 } },
      y: { beginAtZero: true },
    },
  };
}
