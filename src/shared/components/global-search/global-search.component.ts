import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { map } from 'rxjs';

import { SearchStore } from '@core/search/state/search.store';

import { ClickOutsideDirective } from '@shared/directives/click-outside/click-outside.directive';

import { GlobalSearchResultsComponent } from './global-search-results.component';

const MOBILE_QUERY = '(max-width: 767.98px)';

@Component({
  selector: 'app-global-search',
  templateUrl: './global-search.component.html',
  styleUrl: './global-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClickOutsideDirective, GlobalSearchResultsComponent, MatIcon, MatIconButton],
})
export class GlobalSearchComponent {
  protected readonly searchStore = inject(SearchStore);

  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly paletteInput = viewChild<ElementRef<HTMLInputElement>>('paletteInput');

  /** Móvil (<768px): el Topbar muestra un icono que abre la palette a pantalla completa. */
  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_QUERY).pipe(map((result) => result.matches)),
    { initialValue: false },
  );

  protected readonly showDropdown = computed(() => !this.isMobile() && this.searchStore.isOpen());

  protected readonly showPalette = computed(() => this.isMobile() && this.searchStore.isOpen());

  protected readonly activeDescendantId = computed(() => {
    const index = this.searchStore.activeIndex();
    return index >= 0 ? `hs-search-option-${index}` : '';
  });

  constructor() {
    // Enfoca el input de la palette cada vez que se abre (sin escribir en el
    // render directamente: se ejecuta tras la actualización de la vista).
    effect(() => {
      const visible = this.showPalette();
      const input = this.paletteInput();
      if (visible && input) {
        input.nativeElement.focus();
      }
    });
  }

  protected onInput(event: Event): void {
    this.searchStore.setQuery((event.target as HTMLInputElement).value);
  }

  protected onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.searchStore.moveSelection(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.searchStore.moveSelection(-1);
        break;
      case 'Enter':
        event.preventDefault();
        this.searchStore.selectActive();
        break;
      case 'Escape':
        event.preventDefault();
        this.searchStore.close();
        break;
    }
  }

  protected openPalette(): void {
    this.searchStore.open();
  }

  protected clear(): void {
    this.searchStore.clear();
  }
}
