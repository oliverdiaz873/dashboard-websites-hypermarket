import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class EmptyStateComponent {
  readonly icon = input<string>();
  readonly title = input<string>();
  readonly message = input<string>();
}
