import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import type { TableActionEvent } from '@shared/models/table.model';

import { ProductsStore } from '../../state/products.store';
import { ProductsToolbarComponent } from '../../components/products-toolbar/products-toolbar.component';
import { ProductsTableComponent } from '../../components/products-table/products-table.component';
import type { Product } from '../../models/product.model';

@Component({
  selector: 'app-products-page',
  templateUrl: './products-page.component.html',
  styleUrl: './products-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    PaginationComponent,
    ProductsToolbarComponent,
    ProductsTableComponent,
    MatIcon,
  ],
})
export class ProductsPageComponent {
  protected readonly store = inject(ProductsStore);
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
    void this.store.loadCategories();
    void this.store.load();
  }

  protected onAction(event: TableActionEvent<Product>): void {
    if (event.actionId === 'edit') {
      void this.router.navigate(['/products', event.row.id, 'edit']);
      return;
    }
    if (event.actionId === 'delete') {
      this.requestDelete(event.row);
      return;
    }
    if (event.actionId === 'publish') {
      void this.publish(event.row);
    }
  }

  private async publish(product: Product): Promise<void> {
    try {
      await this.store.updateProduct(product.id, { status: 'active', isAvailable: true });
      this.notificationsStore.add({
        type: NOTIFICATION_TYPE.SUCCESS,
        title: 'Producto publicado',
        message: 'El producto ya está visible en el catálogo público.',
      });
    } catch {
      // El error ya se notifica vía ErrorInterceptor.
    }
  }

  protected navigateToCreate(): void {
    void this.router.navigate(['/products/new']);
  }

  protected retry(): void {
    void this.store.load();
  }

  private requestDelete(product: Product): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Eliminar producto',
          message: `¿Deseas eliminar "${product.name}"? También se eliminará su inventario relacionado.`,
          confirmLabel: 'Eliminar',
          cancelLabel: 'Cancelar',
        },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      void this.store.deleteProduct(product.id).then(
        () => {
          this.notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: 'Producto eliminado',
            message: 'El producto se eliminó correctamente.',
          });
        },
        () => {
          // El error ya se notifica vía ErrorInterceptor.
        },
      );
    });
  }
}
