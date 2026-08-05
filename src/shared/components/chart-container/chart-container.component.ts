import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-chart-container',
  templateUrl: './chart-container.component.html',
  styleUrl: './chart-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent],
})
export class ChartContainerComponent {
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly loading = input<boolean>(false);
  readonly isEmpty = input<boolean>(false);
  readonly emptyMessage = input<string>('Sin datos para este período.');
}
