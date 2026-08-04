import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';
import type { SortDirection } from '@core/enums/sort-direction';

import { OrdersStore } from '../../state/orders.store';
import {
  ORDER_SORT_OPTIONS,
  ORDER_STATUS_OPTIONS,
  type OrderSortField,
} from '../../constants/orders.constants';

@Component({
  selector: 'app-orders-toolbar',
  templateUrl: './orders-toolbar.component.html',
  styleUrl: './orders-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchInputComponent, FilterSelectComponent, MatIcon, MatIconButton, MatTooltip],
})
export class OrdersToolbarComponent {
  protected readonly store = inject(OrdersStore);
  protected readonly sortOptions = ORDER_SORT_OPTIONS;
  protected readonly statusOptions = [...ORDER_STATUS_OPTIONS];

  onSearch(value: string): void {
    this.store.setSearch(value);
  }

  onStatus(value: string): void {
    this.store.setStatus(value as never);
  }

  onSortBy(value: string): void {
    this.store.setSort(value as OrderSortField, this.store.sortOrder());
  }

  toggleDirection(): void {
    const next: SortDirection = this.store.sortOrder() === 'asc' ? 'desc' : 'asc';
    this.store.setSort(this.store.sortBy(), next);
  }
}
