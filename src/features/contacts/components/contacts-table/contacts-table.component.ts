import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import type {
  TableAction,
  TableActionEvent,
  TableBadgeTone,
  TableColumn,
} from '@shared/models/table.model';

import type { ContactMessage } from '../../models/contact-message.model';
import type { ContactMessageStatus } from '../../constants/contact.constants';
import { getContactStatusLabel } from '../../constants/contact.constants';

const messageSnippet = (row: ContactMessage): string =>
  row.message.length > 60 ? `${row.message.slice(0, 60)}…` : row.message;

const STATUS_TONES: Record<ContactMessageStatus, TableBadgeTone> = {
  pending: 'low',
  read: 'info',
  answered: 'ok',
};

@Component({
  selector: 'app-contacts-table',
  templateUrl: './contacts-table.component.html',
  styleUrl: './contacts-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DataTableComponent, MatIcon],
})
export class ContactsTableComponent {
  readonly items = input<ContactMessage[]>([]);
  readonly loading = input<boolean>(false);

  readonly actionClicked = output<TableActionEvent<ContactMessage>>();

  protected readonly columns: TableColumn<ContactMessage>[] = [
    {
      key: 'createdAt',
      header: 'Fecha',
      cell: (row) => new Date(row.createdAt).toLocaleString(),
    },
    {
      key: 'name',
      header: 'Nombre',
      cell: (row) => row.name,
    },
    {
      key: 'email',
      header: 'Correo',
      cell: (row) => row.email,
    },
    {
      key: 'phone',
      header: 'Teléfono',
      cell: (row) => row.phone ?? '—',
      hideOnMobile: true,
    },
    {
      key: 'message',
      header: 'Mensaje',
      cell: messageSnippet,
      hideOnMobile: true,
    },
    {
      key: 'status',
      header: 'Estado',
      badge: (row) => ({
        label: getContactStatusLabel(row.status),
        tone: STATUS_TONES[row.status],
      }),
    },
  ];

  protected readonly actions: TableAction<ContactMessage>[] = [
    { id: 'detail', label: 'Ver detalle', icon: 'visibility' },
    {
      id: 'read',
      label: 'Marcar como leído',
      icon: 'mark_email_read',
      visible: (row) => row.status === 'pending',
    },
    {
      id: 'answered',
      label: 'Marcar como respondido',
      icon: 'reply_all',
      visible: (row) => row.status === 'pending' || row.status === 'read',
    },
    { id: 'delete', label: 'Eliminar', icon: 'delete' },
  ];

  protected readonly emptyTitle = 'Sin mensajes';
  protected readonly emptyMessage =
    'No hay mensajes de contacto que coincidan con el filtro actual.';

  onAction(event: TableActionEvent<ContactMessage>): void {
    this.actionClicked.emit(event);
  }
}
