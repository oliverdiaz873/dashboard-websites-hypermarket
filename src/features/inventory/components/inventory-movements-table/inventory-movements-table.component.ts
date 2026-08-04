import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import type { TableColumn } from '@shared/models/table.model';

import type { InventoryMovement } from '../../models/inventory.model';
import { MOVEMENT_TYPE_LABELS } from '../../constants/inventory.constants';

const RESERVED_MOVEMENT_TYPES: readonly InventoryMovement['type'][] = [
  'reserve',
  'release_reservation',
  'complete_sale',
];

const changeLabel = (row: InventoryMovement): string => {
  if (RESERVED_MOVEMENT_TYPES.includes(row.type)) {
    return `${row.previousStock} → ${row.newStock} · R: ${row.previousReservedStock} → ${row.newReservedStock}`;
  }
  return `${row.previousStock} → ${row.newStock}`;
};

const orderLabel = (row: InventoryMovement): string => row.orderId ?? '—';

@Component({
  selector: 'app-inventory-movements-table',
  templateUrl: './inventory-movements-table.component.html',
  styleUrl: './inventory-movements-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, MatIcon],
})
export class InventoryMovementsTableComponent {
  readonly movements = input<InventoryMovement[]>([]);
  readonly loading = input<boolean>(false);
  readonly productName = input<string>('');

  protected readonly columns: TableColumn<InventoryMovement>[] = [
    {
      key: 'createdAt',
      header: 'Fecha',
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: 'type',
      header: 'Tipo',
      cell: (row) => MOVEMENT_TYPE_LABELS[row.type],
    },
    { key: 'quantity', header: 'Cantidad', align: 'right' },
    {
      key: 'change',
      header: 'Stock → nuevo',
      cell: changeLabel,
    },
    {
      key: 'orderId',
      header: 'Pedido',
      hideOnMobile: true,
      cell: orderLabel,
    },
    {
      key: 'reason',
      header: 'Motivo',
      hideOnMobile: true,
      cell: (row) => row.reason,
    },
    {
      key: 'createdBy',
      header: 'Usuario',
      hideOnMobile: true,
      cell: (row) => row.createdBy ?? '—',
    },
  ];

  protected readonly emptyTitle = 'Sin movimientos';
  protected readonly emptyMessage = 'Aún no hay movimientos registrados para este inventario.';
}
