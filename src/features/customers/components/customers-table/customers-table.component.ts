import { ChangeDetectionStrategy, Component, ViewChild, input, output } from '@angular/core';
import type { OnInit, TemplateRef } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import { formatDateShort } from '@core/utils/date.util';
import type {
  TableAction,
  TableActionEvent,
  TableBadge,
  TableColumn,
  TableSort,
} from '@shared/models/table.model';
import type { SortDirection } from '@core/enums/sort-direction';

import type { Customer, CustomerStatus } from '../../models/customer.model';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function avatarHue(name: string): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

function statusBadge(status: CustomerStatus): TableBadge {
  switch (status) {
    case 'active':
      return { label: 'Activo', tone: 'ok' };
    case 'blocked':
      return { label: 'Bloqueado', tone: 'out' };
    case 'pending':
      return { label: 'Pendiente', tone: 'low' };
  }
}

@Component({
  selector: 'app-customers-table',
  templateUrl: './customers-table.component.html',
  styleUrl: './customers-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, MatIcon],
})
export class CustomersTableComponent implements OnInit {
  readonly customers = input<Customer[]>([]);
  readonly loading = input<boolean>(false);
  readonly sort = input<{ key: string; direction: SortDirection } | null>(null);

  readonly sortChange = output<TableSort>();
  readonly actionClicked = output<TableActionEvent<Customer>>();

  @ViewChild('nameCell', { static: true }) private nameCell?: TemplateRef<{ $implicit: Customer }>;

  protected columns: TableColumn<Customer>[] = [];

  protected readonly actions: TableAction<Customer>[] = [
    { id: 'view', label: 'Ver detalle', icon: 'visibility' },
    { id: 'edit', label: 'Editar', icon: 'edit' },
    {
      id: 'block',
      label: 'Bloquear',
      icon: 'block',
      visible: (row) => row.status === 'active',
    },
    {
      id: 'unblock',
      label: 'Desbloquear',
      icon: 'lock_open',
      visible: (row) => row.status === 'blocked',
    },
  ];

  protected readonly emptyTitle = 'Sin clientes';
  protected readonly emptyMessage = 'No se encontraron clientes con los filtros actuales.';

  protected readonly initials = initials;

  ngOnInit(): void {
    this.columns = [
      { key: 'name', header: 'Cliente', cellTemplate: this.nameCell },
      { key: 'email', header: 'Correo', hideOnMobile: true, cell: (row) => row.email },
      { key: 'phone', header: 'Teléfono', hideOnMobile: true, cell: (row) => row.phone || '—' },
      { key: 'status', header: 'Estado', badge: (row) => statusBadge(row.status) },
      {
        key: 'createdAt',
        header: 'Registro',
        sortable: true,
        hideOnMobile: true,
        cell: (row) => formatDateShort(row.createdAt),
      },
    ];
  }

  avatarColor(name: string): string {
    return `hsl(${avatarHue(name)} 65% 45%)`;
  }

  onAction(event: TableActionEvent<Customer>): void {
    this.actionClicked.emit(event);
  }
}
