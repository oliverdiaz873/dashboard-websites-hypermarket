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
import { formatCurrency } from '@core/utils/currency.util';
import type { SortDirection } from '@core/enums/sort-direction';

import type { AdminOrder, OrderStatus } from '../../models/order.model';
import { hasOrderStatusTransition, ORDER_STATUS_LABELS } from '../../constants/orders.constants';

const STATUS_TONES: Record<OrderStatus, TableBadge['tone']> = {
  pending: 'low',
  processing: 'ok',
  completed: 'ok',
  cancelled: 'out',
};

const statusBadge = (row: AdminOrder): TableBadge => ({
  label: ORDER_STATUS_LABELS[row.status],
  tone: STATUS_TONES[row.status],
});

const itemsLabel = (row: AdminOrder): string => {
  const first = row.items[0];
  if (!first) return '—';
  return row.items.length > 1 ? `${first.name} +${row.items.length - 1} más` : first.name;
};

const customerLabel = (row: AdminOrder): string => {
  if (row.customer) return `${row.customer.name} · ${row.customer.email}`;
  return row.userId;
};

@Component({
  selector: 'app-orders-table',
  templateUrl: './orders-table.component.html',
  styleUrl: './orders-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, MatIcon],
})
export class OrdersTableComponent {
  readonly items = input<AdminOrder[]>([]);
  readonly loading = input<boolean>(false);
  readonly sort = input<{ key: string; direction: SortDirection } | null>(null);

  readonly sortChange = output<TableSort>();
  readonly actionClicked = output<TableActionEvent<AdminOrder>>();

  protected readonly columns: TableColumn<AdminOrder>[] = [
    {
      key: 'customer.name',
      header: 'Cliente',
      cell: customerLabel,
    },
    {
      key: 'items',
      header: 'Productos',
      cell: itemsLabel,
    },
    {
      key: 'subtotal',
      header: 'Total',
      align: 'right',
      sortable: true,
      cell: (row) => formatCurrency(row.subtotal),
    },
    {
      key: 'status',
      header: 'Estado',
      sortable: true,
      badge: statusBadge,
    },
    {
      key: 'createdAt',
      header: 'Creado',
      hideOnMobile: true,
      sortable: true,
      cell: (row) => new Date(row.createdAt).toLocaleDateString(),
    },
  ];

  protected readonly actions: TableAction<AdminOrder>[] = [
    { id: 'detail', label: 'Ver detalle', icon: 'visibility' },
    {
      id: 'status',
      label: 'Cambiar estado',
      icon: 'autorenew',
      visible: (row) => hasOrderStatusTransition(row.status),
    },
  ];

  protected readonly emptyTitle = 'Sin pedidos';
  protected readonly emptyMessage = 'No se encontraron pedidos con los filtros actuales.';

  onAction(event: TableActionEvent<AdminOrder>): void {
    this.actionClicked.emit(event);
  }
}
