import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-filter-select',
  templateUrl: './filter-select.component.html',
  styleUrl: './filter-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSelectComponent {
  protected readonly selectId = `filter-${Math.random().toString(36).slice(2, 8)}`;

  readonly label = input<string>('Filtrar');
  readonly options = input<SelectOption[]>([]);
  readonly value = input<string>('');
  /** Opción "todos" que se muestra al inicio; cadena vacía para ocultarla. */
  readonly allLabel = input<string>('Todos');

  readonly valueChange = output<string>();

  onSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.valueChange.emit(value);
  }
}
