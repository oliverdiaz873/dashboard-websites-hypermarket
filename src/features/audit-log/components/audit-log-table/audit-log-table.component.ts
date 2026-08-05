import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import type { TableAction, TableActionEvent, TableColumn } from '@shared/models/table.model';

import type { AuditLog } from '../../models/audit-log.model';
import { getAuditActionLabel, getAuditEntityLabel } from '../../constants/audit-log.constants';

const detailSnippet = (row: AuditLog): string => {
  if (row.details === undefined || row.details === null) return '—';
  const raw = typeof row.details === 'string' ? row.details : JSON.stringify(row.details);
  return raw.length > 40 ? `${raw.slice(0, 40)}…` : raw;
};

const userLabel = (row: AuditLog): string => row.userName ?? row.userId ?? '—';

@Component({
  selector: 'app-audit-log-table',
  templateUrl: './audit-log-table.component.html',
  styleUrl: './audit-log-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, MatIcon],
})
export class AuditLogTableComponent {
  readonly items = input<AuditLog[]>([]);
  readonly loading = input<boolean>(false);

  readonly actionClicked = output<TableActionEvent<AuditLog>>();

  protected readonly columns: TableColumn<AuditLog>[] = [
    {
      key: 'createdAt',
      header: 'Fecha',
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: 'userName',
      header: 'Usuario',
      cell: userLabel,
    },
    {
      key: 'action',
      header: 'Acción',
      cell: (row) => getAuditActionLabel(row.action),
    },
    {
      key: 'entity',
      header: 'Entidad',
      cell: (row) => getAuditEntityLabel(row.entity),
      hideOnMobile: true,
    },
    {
      key: 'entityId',
      header: 'Entidad ID',
      cell: (row) => row.entityId ?? '—',
      hideOnMobile: true,
    },
    {
      key: 'details',
      header: 'Detalle',
      cell: detailSnippet,
      hideOnMobile: true,
    },
  ];

  protected readonly actions: TableAction<AuditLog>[] = [
    { id: 'detail', label: 'Ver detalle', icon: 'visibility' },
  ];

  protected readonly emptyTitle = 'Sin registros';
  protected readonly emptyMessage = 'No se encontraron registros con los filtros actuales.';

  onAction(event: TableActionEvent<AuditLog>): void {
    this.actionClicked.emit(event);
  }
}
