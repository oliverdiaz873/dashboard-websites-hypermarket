import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import type { TableActionEvent } from '@shared/models/table.model';

import { ContactsStore } from '../../state/contacts.store';
import { ContactsToolbarComponent } from '../../components/contacts-toolbar/contacts-toolbar.component';
import { ContactsTableComponent } from '../../components/contacts-table/contacts-table.component';
import {
  ContactDetailDialogComponent,
  type ContactDetailDialogData,
} from '../../components/contact-detail-dialog/contact-detail-dialog.component';
import type { ContactMessage } from '../../models/contact-message.model';

@Component({
  selector: 'app-contacts-page',
  templateUrl: './contacts-page.component.html',
  styleUrl: './contacts-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    ContactsToolbarComponent,
    ContactsTableComponent,
  ],
})
export class ContactsPageComponent {
  protected readonly store = inject(ContactsStore);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = computed(() => this.store.isLoading() && !this.store.hasLoaded());
  protected readonly showTable = computed(
    () => this.store.hasLoaded() && this.store.filteredItems().length > 0,
  );
  protected readonly showError = computed(
    () => this.store.hasLoaded() && this.store.error() !== null,
  );

  protected readonly emptyTitle = computed(() =>
    this.store.isEmpty() ? 'Sin mensajes' : 'Sin coincidencias',
  );
  protected readonly emptyMessage = computed(() =>
    this.store.isEmpty()
      ? 'Aún no hay mensajes del formulario de contacto del storefront.'
      : 'No hay mensajes que coincidan con el filtro de estado actual.',
  );

  constructor() {
    void this.store.load();
  }

  protected onAction(event: TableActionEvent<ContactMessage>): void {
    if (event.actionId === 'detail') {
      this.openDetail(event.row);
      return;
    }
    if (event.actionId === 'read') {
      void this.store.updateStatus(event.row.id, 'read');
      return;
    }
    if (event.actionId === 'answered') {
      void this.store.updateStatus(event.row.id, 'answered');
      return;
    }
    if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  protected retry(): void {
    void this.store.load();
  }

  private openDetail(message: ContactMessage): void {
    this.dialog.open<ContactDetailDialogComponent, ContactDetailDialogData>(
      ContactDetailDialogComponent,
      { data: { message }, width: '560px' },
    );
  }

  private confirmDelete(message: ContactMessage): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Eliminar mensaje',
          message: `¿Eliminar el mensaje de ${message.name}? Esta acción no se puede deshacer.`,
          confirmLabel: 'Eliminar',
          cancelLabel: 'Cancelar',
        },
      },
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) void this.store.remove(message.id);
    });
  }
}
