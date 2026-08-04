import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import type { TableActionEvent } from '@shared/models/table.model';

import { OrdersStore } from '../../state/orders.store';
import { OrdersToolbarComponent } from '../../components/orders-toolbar/orders-toolbar.component';
import { OrdersTableComponent } from '../../components/orders-table/orders-table.component';
import {
  OrderStatusDialogComponent,
  type OrderStatusResult,
} from '../../components/order-status-dialog/order-status-dialog.component';
import type { AdminOrder } from '../../models/order.model';

@Component({
  selector: 'app-orders-page',
  templateUrl: './orders-page.component.html',
  styleUrl: './orders-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    PaginationComponent,
    OrdersToolbarComponent,
    OrdersTableComponent,
  ],
})
export class OrdersPageComponent {
  protected readonly store = inject(OrdersStore);
  private readonly notificationsStore = inject(NotificationsStore);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);

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
    void this.store.load();
  }

  protected onAction(event: TableActionEvent<AdminOrder>): void {
    if (event.actionId === 'detail') {
      void this.router.navigate(['/orders', event.row.id]);
      return;
    }
    if (event.actionId === 'status') {
      this.openStatusDialog(event.row);
    }
  }

  protected retry(): void {
    void this.store.load();
  }

  private openStatusDialog(order: AdminOrder): void {
    const dialogRef = this.dialog.open<
      OrderStatusDialogComponent,
      { order: AdminOrder },
      OrderStatusResult | undefined
    >(OrderStatusDialogComponent, { data: { order }, width: '480px' });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      void this.store.changeStatus(order.id, { status: result.status, note: result.note }).then(
        () => {
          this.notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: 'Estado actualizado',
            message: 'El estado del pedido se actualizó correctamente.',
          });
        },
        () => {
          // El error ya se notifica vía ErrorInterceptor.
        },
      );
    });
  }
}
