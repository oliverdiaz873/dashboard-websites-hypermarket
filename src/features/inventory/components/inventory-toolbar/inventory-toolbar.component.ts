import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';
import type { SortDirection } from '@core/enums/sort-direction';

import { InventoryStore } from '../../state/inventory.store';
import {
  INVENTORY_SORT_OPTIONS,
  INVENTORY_STATUS_OPTIONS,
  type InventorySortField,
} from '../../constants/inventory.constants';

@Component({
  selector: 'app-inventory-toolbar',
  templateUrl: './inventory-toolbar.component.html',
  styleUrl: './inventory-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchInputComponent, FilterSelectComponent, MatIcon, MatIconButton, MatTooltip],
})
export class InventoryToolbarComponent {
  protected readonly store = inject(InventoryStore);
  protected readonly sortOptions = INVENTORY_SORT_OPTIONS;
  protected readonly statusOptions = [...INVENTORY_STATUS_OPTIONS];

  onSearch(value: string): void {
    this.store.setSearch(value);
  }

  onStatus(value: string): void {
    this.store.setStatus(value as never);
  }

  onSortBy(value: string): void {
    this.store.setSort(value as InventorySortField, this.store.sortOrder());
  }

  toggleDirection(): void {
    const next: SortDirection = this.store.sortOrder() === 'asc' ? 'desc' : 'asc';
    this.store.setSort(this.store.sortBy(), next);
  }
}
