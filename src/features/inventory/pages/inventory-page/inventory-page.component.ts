import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import type { TableActionEvent } from '@shared/models/table.model';

import { InventoryStore } from '../../state/inventory.store';
import { InventoryToolbarComponent } from '../../components/inventory-toolbar/inventory-toolbar.component';
import { InventoryTableComponent } from '../../components/inventory-table/inventory-table.component';
import {
  InventoryAdjustDialogComponent,
  type InventoryAdjustResult,
} from '../../components/inventory-adjust-dialog/inventory-adjust-dialog.component';
import type { Inventory } from '../../models/inventory.model';

@Component({
  selector: 'app-inventory-page',
  templateUrl: './inventory-page.component.html',
  styleUrl: './inventory-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    PaginationComponent,
    InventoryToolbarComponent,
    InventoryTableComponent,
  ],
})
export class InventoryPageComponent {
  protected readonly store = inject(InventoryStore);
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

  protected onAction(event: TableActionEvent<Inventory>): void {
    if (event.actionId === 'movements') {
      void this.router.navigate(['/inventory', event.row.id, 'movements']);
      return;
    }
    if (event.actionId === 'adjust') {
      this.openAdjustDialog(event.row);
    }
  }

  protected retry(): void {
    void this.store.load();
  }

  private openAdjustDialog(inventory: Inventory): void {
    const dialogRef = this.dialog.open<
      InventoryAdjustDialogComponent,
      { inventory: Inventory },
      InventoryAdjustResult | undefined
    >(InventoryAdjustDialogComponent, { data: { inventory }, width: '480px' });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const done =
        result.kind === 'adjust'
          ? this.store.adjust(inventory.id, result.payload)
          : this.store.changeMinStock(inventory.id, result.payload);

      void done.then(
        () => {
          this.notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: 'Inventario actualizado',
            message: 'El ajuste se aplicó correctamente.',
          });
        },
        () => {
          // El error ya se notifica vía ErrorInterceptor.
        },
      );
    });
  }
}
