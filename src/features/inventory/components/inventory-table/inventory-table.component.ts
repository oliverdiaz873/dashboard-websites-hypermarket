import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import type {
  TableAction,
  TableActionEvent,
  TableBadge,
  TableColumn,
  TableSort,
} from '@shared/models/table.model';
import type { SortDirection } from '@core/enums/sort-direction';

import type { Inventory, InventoryStatus } from '../../models/inventory.model';
import { INVENTORY_STATUS_LABELS } from '../../constants/inventory.constants';

const STATUS_TONES: Record<InventoryStatus, TableBadge['tone']> = {
  ok: 'ok',
  'low-stock': 'low',
  'out-of-stock': 'out',
};

const statusBadge = (row: Inventory): TableBadge | null => {
  if (!row.status) return null;
  return { label: INVENTORY_STATUS_LABELS[row.status], tone: STATUS_TONES[row.status] };
};

@Component({
  selector: 'app-inventory-table',
  templateUrl: './inventory-table.component.html',
  styleUrl: './inventory-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, MatIcon],
})
export class InventoryTableComponent {
  readonly items = input<Inventory[]>([]);
  readonly loading = input<boolean>(false);
  readonly sort = input<{ key: string; direction: SortDirection } | null>(null);

  readonly sortChange = output<TableSort>();
  readonly actionClicked = output<TableActionEvent<Inventory>>();

  protected readonly columns: TableColumn<Inventory>[] = [
    {
      key: 'product.name',
      header: 'Producto',
      cell: (row) => row.product?.name ?? row.productId,
    },
    { key: 'product.sku', header: 'SKU', cell: (row) => row.product?.sku ?? '—' },
    { key: 'stock', header: 'Stock', align: 'right', sortable: true },
    { key: 'reservedStock', header: 'Reservado', align: 'right', hideOnMobile: true },
    { key: 'availableStock', header: 'Disponible', align: 'right' },
    {
      key: 'minStock',
      header: 'Mínimo',
      align: 'right',
      sortable: true,
      cell: (row) => (row.minStock ?? 0).toString(),
    },
    {
      key: 'status',
      header: 'Estado',
      badge: statusBadge,
    },
    {
      key: 'updatedAt',
      header: 'Actualizado',
      hideOnMobile: true,
      sortable: true,
      cell: (row) => new Date(row.updatedAt).toLocaleDateString(),
    },
  ];

  protected readonly actions: TableAction<Inventory>[] = [
    { id: 'adjust', label: 'Ajustar stock', icon: 'tune' },
    { id: 'movements', label: 'Historial', icon: 'history' },
  ];

  protected readonly emptyTitle = 'Sin inventario';
  protected readonly emptyMessage =
    'No se encontraron registros de inventario con los filtros actuales.';

  onAction(event: TableActionEvent<Inventory>): void {
    this.actionClicked.emit(event);
  }
}
