import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';
import type { SortDirection } from '@core/enums/sort-direction';

import { ProductsStore } from '../../state/products.store';
import {
  PRODUCT_SORT_FIELDS,
  PRODUCT_STATUS_OPTIONS,
  type ProductSortField,
} from '../../constants/products.constants';

const SORT_FIELD_LABELS: Record<ProductSortField, string> = {
  name: 'Nombre',
  price: 'Precio',
  createdAt: 'Más recientes',
  updatedAt: 'Actualizados',
};

const SORT_OPTIONS = PRODUCT_SORT_FIELDS.map((value) => ({
  value,
  label: SORT_FIELD_LABELS[value],
}));

@Component({
  selector: 'app-products-toolbar',
  templateUrl: './products-toolbar.component.html',
  styleUrl: './products-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SearchInputComponent, FilterSelectComponent, MatIcon, MatIconButton, MatTooltip],
})
export class ProductsToolbarComponent {
  protected readonly store = inject(ProductsStore);
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly statusOptions = [...PRODUCT_STATUS_OPTIONS];

  onSearch(value: string): void {
    this.store.setSearch(value);
  }

  onCategory(value: string): void {
    this.store.setCategory(value);
  }

  onStatus(value: string): void {
    this.store.setStatus(value as never);
  }

  onSortBy(value: string): void {
    this.store.setSort(value as ProductSortField, this.store.sortOrder());
  }

  toggleDirection(): void {
    const next: SortDirection = this.store.sortOrder() === 'asc' ? 'desc' : 'asc';
    this.store.setSort(this.store.sortBy(), next);
  }
}
