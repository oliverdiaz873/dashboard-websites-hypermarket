import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

import {
  GlobalSearchItem,
  GlobalSearchResultType,
  GlobalSearchResults,
} from '@core/search/models/global-search-result.model';
import { SearchStore } from '@core/search/state/search.store';

interface SearchGroup {
  type: GlobalSearchResultType;
  title: string;
  icon: string;
  items: SearchOptionItem[];
}

/** Item de resultado enriquecido con su índice dentro de la lista plana del store. */
export interface SearchOptionItem extends GlobalSearchItem {
  index: number;
}

const SECTION_META: readonly {
  type: GlobalSearchResultType;
  key: keyof GlobalSearchResults;
  title: string;
  icon: string;
}[] = [
  { type: 'product', key: 'products', title: 'Productos', icon: 'inventory_2' },
  { type: 'order', key: 'orders', title: 'Órdenes', icon: 'receipt_long' },
  { type: 'user', key: 'users', title: 'Usuarios', icon: 'group' },
  { type: 'navigation', key: 'navigation', title: 'Navegación', icon: 'north_east' },
];

function optionId(index: number): string {
  return `hs-search-option-${index}`;
}

@Component({
  selector: 'app-global-search-results',
  templateUrl: './global-search-results.component.html',
  styleUrl: './global-search-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatProgressSpinner],
})
export class GlobalSearchResultsComponent {
  protected readonly searchStore = inject(SearchStore);

  protected readonly optionId = optionId;

  protected readonly groups = computed<SearchGroup[]>(() => {
    const results = this.searchStore.results();
    let flatIndex = 0;
    const groups: SearchGroup[] = [];

    for (const meta of SECTION_META) {
      const items = results[meta.key];
      if (items.length === 0) continue;
      groups.push({
        type: meta.type,
        title: meta.title,
        icon: meta.icon,
        items: items.map((item) => ({ ...item, index: flatIndex++ })),
      });
    }

    return groups;
  });

  protected isActive(index: number): boolean {
    return index === this.searchStore.activeIndex();
  }

  protected onItemClick(item: SearchOptionItem): void {
    this.searchStore.select(item);
  }

  protected onItemHover(item: SearchOptionItem): void {
    this.searchStore.moveTo(item);
  }

  protected onRetry(): void {
    this.searchStore.setQuery(this.searchStore.query());
  }
}
