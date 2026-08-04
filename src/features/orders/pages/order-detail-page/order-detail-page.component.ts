import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import { formatCurrency } from '@core/utils/currency.util';

import { OrdersStore } from '../../state/orders.store';
import {
  OrderStatusDialogComponent,
  type OrderStatusResult,
} from '../../components/order-status-dialog/order-status-dialog.component';
import type { AdminOrder, OrderStatus } from '../../models/order.model';
import {
  hasOrderStatusTransition,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
} from '../../constants/orders.constants';

const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  processing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
};

const STATUS_DOT_CLASSES: Record<OrderStatus, string> = {
  pending: 'bg-amber-500',
  processing: 'bg-emerald-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-rose-500',
};

@Component({
  selector: 'app-order-detail-page',
  templateUrl: './order-detail-page.component.html',
  styleUrl: './order-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatIconButton, MatTooltip, EmptyStateComponent],
})
export class OrderDetailPageComponent {
  protected readonly store = inject(OrdersStore);
  private readonly notificationsStore = inject(NotificationsStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialog = inject(MatDialog);

  protected readonly orderId: string = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly order = computed(() => this.store.selectedOrder());
  protected readonly loading = computed(
    () => this.store.isLoading() && this.store.selectedOrder() === null,
  );
  protected readonly error = computed(
    () => this.store.error() !== null && !this.store.selectedOrder(),
  );

  constructor() {
    if (!this.orderId) return;
    void this.store.loadDetail(this.orderId);
  }

  protected statusLabel(status: OrderStatus): string {
    return ORDER_STATUS_LABELS[status];
  }

  protected paymentLabel(status: AdminOrder['paymentStatus']): string {
    return PAYMENT_STATUS_LABELS[status];
  }

  protected statusBadgeClasses(status: OrderStatus): string {
    return STATUS_BADGE_CLASSES[status];
  }

  protected statusDotClasses(status: OrderStatus): string {
    return STATUS_DOT_CLASSES[status];
  }

  protected canChangeStatus(order: AdminOrder): boolean {
    return hasOrderStatusTransition(order.status) && !this.store.isSubmitting();
  }

  protected amount(value: number): string {
    return formatCurrency(value);
  }

  protected date(value: Date | string): string {
    return new Date(value).toLocaleString();
  }

  protected goBack(): void {
    void this.router.navigate(['/orders']);
  }

  protected openStatusDialog(order: AdminOrder): void {
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
