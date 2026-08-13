import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import { formatDateTime } from '@core/utils/date.util';

import { CustomersStore } from '../../state/customers.store';
import {
  CustomerFormDialogComponent,
  type CustomerFormDialogData,
  type CustomerFormResult,
} from '../../components/customer-form-dialog/customer-form-dialog.component';
import { CUSTOMER_STATUS_LABELS } from '../../constants/customers.constants';
import type { Customer, CustomerStatus } from '../../models/customer.model';

const STATUS_BADGE_CLASSES: Record<CustomerStatus, string> = {
  active: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  blocked: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

const STATUS_DOT_CLASSES: Record<CustomerStatus, string> = {
  active: 'bg-emerald-500',
  blocked: 'bg-rose-500',
  pending: 'bg-amber-500',
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

function avatarHueOf(name: string): number {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) % 360;
  return hash;
}

@Component({
  selector: 'app-customer-detail-page',
  templateUrl: './customer-detail-page.component.html',
  styleUrl: './customer-detail-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon, MatIconButton, MatTooltip, EmptyStateComponent],
})
export class CustomerDetailPageComponent {
  protected readonly customer = signal<Customer | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<string | null>(null);

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(CustomersStore);
  private readonly notificationsStore = inject(NotificationsStore);
  private readonly dialog = inject(MatDialog);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Cliente no encontrado.');
      this.loading.set(false);
      return;
    }
    void this.load(id);
  }

  protected readonly title = computed(() => this.customer()?.name ?? 'Detalle de cliente');
  protected readonly subtitle = computed(() => this.customer()?.email ?? 'Clientes');

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      const customer = await firstValueFrom(this.store.findById(id));
      this.customer.set(customer);
    } catch {
      this.error.set('No se pudo cargar el cliente. Verifica que exista o inténtalo de nuevo.');
    } finally {
      this.loading.set(false);
    }
  }

  protected statusLabel(status: CustomerStatus): string {
    return CUSTOMER_STATUS_LABELS[status];
  }

  protected statusBadgeClasses(status: CustomerStatus): string {
    return STATUS_BADGE_CLASSES[status];
  }

  protected statusDotClasses(status: CustomerStatus): string {
    return STATUS_DOT_CLASSES[status];
  }

  protected initialsOf(name: string): string {
    return initialsOf(name);
  }

  protected avatarColor(name: string): string {
    return `hsl(${avatarHueOf(name)} 65% 45%)`;
  }

  protected date(value: Date | string): string {
    return formatDateTime(value);
  }

  protected goBack(): void {
    void this.router.navigate(['/customers']);
  }

  protected openEdit(customer: Customer): void {
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
        (updated) => {
          this.customer.set(updated);
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

  protected requestToggleStatus(customer: Customer): void {
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
        (updated) => {
          this.customer.set(updated);
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
