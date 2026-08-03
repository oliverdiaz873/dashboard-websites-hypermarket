import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { formatCurrency } from '@core/utils/currency.util';
import type {
  TableAction,
  TableActionEvent,
  TableColumn,
  TableSort,
} from '@shared/models/table.model';
import type { SortDirection } from '@core/enums/sort-direction';

import type { Product } from '../../models/product.model';
import { PRODUCT_ACTION_PENDING_LABEL } from '../../constants/products.constants';

@Component({
  selector: 'app-products-table',
  templateUrl: './products-table.component.html',
  styleUrl: './products-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, MatIcon],
})
export class ProductsTableComponent {
  readonly products = input<Product[]>([]);
  readonly loading = input<boolean>(false);
  readonly sort = input<{ key: string; direction: SortDirection } | null>(null);
  readonly selectable = input<boolean>(true);
  readonly selectedIds = input<readonly string[]>([]);

  readonly sortChange = output<TableSort>();
  readonly selectionChange = output<readonly string[]>();
  readonly actionClicked = output<TableActionEvent<Product>>();

  protected readonly columns: TableColumn<Product>[] = [
    { key: 'name', header: 'Producto', sortable: true },
    { key: 'sku', header: 'SKU' },
    {
      key: 'price',
      header: 'Precio',
      align: 'right',
      sortable: true,
      cell: (row) => formatCurrency(row.price),
    },
    { key: 'category.name', header: 'Categoría', hideOnMobile: true },
    { key: 'brand.name', header: 'Marca', hideOnMobile: true },
    { key: 'status', header: 'Estado', hideOnMobile: true },
    {
      key: 'createdAt',
      header: 'Creado',
      hideOnMobile: true,
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  protected readonly actions: TableAction<Product>[] = [
    { id: 'edit', label: 'Editar', icon: 'edit' },
    { id: 'delete', label: 'Eliminar', icon: 'delete' },
  ];

  protected readonly emptyTitle = 'Sin productos';
  protected readonly emptyMessage = 'No se encontraron productos con los filtros actuales.';
  protected readonly pendingLabel = PRODUCT_ACTION_PENDING_LABEL;

  onAction(event: TableActionEvent<Product>): void {
    this.actionClicked.emit(event);
  }
}
