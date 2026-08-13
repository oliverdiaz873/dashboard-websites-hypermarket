import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import type { TableActionEvent } from '@shared/models/table.model';

import { CustomersStore } from '../../state/customers.store';
import { CustomersToolbarComponent } from '../../components/customers-toolbar/customers-toolbar.component';
import { CustomersTableComponent } from '../../components/customers-table/customers-table.component';
import {
  CustomerFormDialogComponent,
  type CustomerFormDialogData,
  type CustomerFormResult,
} from '../../components/customer-form-dialog/customer-form-dialog.component';
import type { Customer } from '../../models/customer.model';

@Component({
  selector: 'app-customers-page',
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    PaginationComponent,
    StatCardComponent,
    CustomersToolbarComponent,
    CustomersTableComponent,
  ],
})
export class CustomersPageComponent {
  protected readonly store = inject(CustomersStore);
  private readonly notificationsStore = inject(NotificationsStore);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  protected readonly currentSort = computed(() => ({
    key: this.store.sortBy(),
    direction: this.store.sortOrder(),
  }));

  protected readonly loading = computed(() => this.store.isLoading() && !this.store.hasLoaded());
  protected readonly showTable = computed(() => this.store.hasLoaded() && !this.store.isEmpty());
  protected readonly showError = computed(
    () => this.store.hasLoaded() && this.store.error() !== null,
  );

  constructor() {
    void this.store.loadStats();
    void this.store.load();
  }

  protected onAction(event: TableActionEvent<Customer>): void {
    if (event.actionId === 'view') {
      void this.router.navigate(['/customers', event.row.id]);
      return;
    }
    if (event.actionId === 'edit') {
      this.openFormDialog(event.row);
      return;
    }
    if (event.actionId === 'block' || event.actionId === 'unblock') {
      this.requestToggleStatus(event.row);
    }
  }

  protected retry(): void {
    void this.store.load();
  }

  private openFormDialog(customer: Customer): void {
    const dialogRef = this.dialog.open<
      CustomerFormDialogComponent,
      CustomerFormDialogData,
      CustomerFormResult | undefined
    >(CustomerFormDialogComponent, {
      data: { customer },
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      void this.store.updateCustomer(customer.id, result).then(
        () => {
          this.notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: 'Cliente actualizado',
            message: 'Los datos del cliente se actualizaron correctamente.',
          });
        },
        () => {
          // El error ya se notifica vía ErrorInterceptor.
        },
      );
    });
  }

  private requestToggleStatus(customer: Customer): void {
    const blocking = customer.status === 'active';
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: blocking ? 'Bloquear cliente' : 'Desbloquear cliente',
          message: blocking
            ? `¿Deseas bloquear a "${customer.name}"? No podrá realizar pedidos mientras esté bloqueado.`
            : `¿Deseas desbloquear a "${customer.name}"? Podrá volver a realizar pedidos.`,
          confirmLabel: blocking ? 'Bloquear' : 'Desbloquear',
          cancelLabel: 'Cancelar',
        },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      void this.store.toggleStatus(customer).then(
        () => {
          this.notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: blocking ? 'Cliente bloqueado' : 'Cliente desbloqueado',
            message: blocking
              ? 'El cliente se bloqueó correctamente.'
              : 'El cliente se desbloqueó correctamente.',
          });
        },
        () => {
          // El error ya se notifica vía ErrorInterceptor.
        },
      );
    });
  }
}
