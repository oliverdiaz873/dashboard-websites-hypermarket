import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgClass } from '@angular/common';
import { MatIcon } from '@angular/material/icon';

export type StatCardTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, NgClass],
})
export class StatCardComponent {
  readonly title = input<string>('');
  readonly value = input<number>(0);
  readonly icon = input<string>('analytics');
  readonly tone = input<StatCardTone>('brand');
  readonly unit = input<string>('');
  readonly trend = input<number>();
  readonly trendLabel = input<string>('');

  protected readonly formattedValue = computed(() => {
    const value = this.value();
    if (this.unit() === 'RD$') {
      return value.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      });
    }
    return value.toLocaleString('en-US');
  });

  protected readonly trendTone = computed(() => {
    const trend = this.trend();
    if (trend === undefined || trend === 0) return 'neutral';
    return trend > 0 ? 'success' : 'danger';
  });

  protected readonly toneClass = computed(() => {
    switch (this.tone()) {
      case 'success':
        return 'text-emerald-600';
      case 'warning':
        return 'text-amber-600';
      case 'danger':
        return 'text-red-600';
      case 'neutral':
        return 'text-muted';
      default:
        return 'text-brand-600';
    }
  });

  protected readonly trendToneClass = computed(() => {
    switch (this.trendTone()) {
      case 'success':
        return 'text-emerald-600';
      case 'danger':
        return 'text-red-600';
      default:
        return 'text-muted';
    }
  });

  protected readonly trendLabelText = computed(() => {
    const trend = this.trend();
    if (trend === undefined) return '';
    const sign = trend > 0 ? '+' : '';
    return this.trendLabel() || `${sign}${trend.toLocaleString('en-US')}%`;
  });
}
