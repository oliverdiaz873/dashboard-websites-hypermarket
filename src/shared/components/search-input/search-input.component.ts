import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-search-input',
  templateUrl: './search-input.component.html',
  styleUrl: './search-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, MatIcon],
})
export class SearchInputComponent {
  readonly value = input<string>('');
  readonly placeholder = input<string>('Buscar…');
  readonly debounceMs = input<number>(300);

  readonly searchChange = output<string>();
  readonly clear = output<void>();

  private debounceTimer: ReturnType<typeof setTimeout> | undefined;

  protected text = signal('');

  protected onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.text.set(value);
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => this.searchChange.emit(this.text()), this.debounceMs());
  }

  protected clearText(): void {
    this.text.set('');
    if (this.debounceTimer) clearTimeout(this.debounceTimer);
    this.searchChange.emit('');
    this.clear.emit();
  }
}
