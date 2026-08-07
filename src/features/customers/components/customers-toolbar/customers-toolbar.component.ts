import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';
import type { SortDirection } from '@core/enums/sort-direction';

import { CustomersStore } from '../../state/customers.store';
import {
  CUSTOMER_SORT_OPTIONS,
  CUSTOMER_STATUS_OPTIONS,
  type CustomerSortField,
} from '../../constants/customers.constants';

@Component({
  selector: 'app-customers-toolbar',
  templateUrl: './customers-toolbar.component.html',
  styleUrl: './customers-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchInputComponent, FilterSelectComponent, MatIcon, MatIconButton, MatTooltip],
})
export class CustomersToolbarComponent {
  protected readonly store = inject(CustomersStore);
  protected readonly sortOptions = CUSTOMER_SORT_OPTIONS;
  protected readonly statusOptions = [...CUSTOMER_STATUS_OPTIONS];

  onSearch(value: string): void {
    this.store.setSearch(value);
  }

  onStatus(value: string): void {
    this.store.setStatus(value as never);
  }

  onSortBy(value: string): void {
    this.store.setSort(value as CustomerSortField, this.store.sortOrder());
  }

  toggleDirection(): void {
    const next: SortDirection = this.store.sortOrder() === 'asc' ? 'desc' : 'asc';
    this.store.setSort(this.store.sortBy(), next);
  }
}
