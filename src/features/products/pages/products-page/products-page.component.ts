import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import type { TableActionEvent } from '@shared/models/table.model';

import { ProductsStore } from '../../state/products.store';
import { ProductsToolbarComponent } from '../../components/products-toolbar/products-toolbar.component';
import { ProductsTableComponent } from '../../components/products-table/products-table.component';
import { PRODUCT_ACTION_PENDING_LABEL } from '../../constants/products.constants';
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
  ],
})
export class ProductsPageComponent {
  protected readonly store = inject(ProductsStore);
  private readonly notificationsStore = inject(NotificationsStore);

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

  onAction(event: TableActionEvent<Product>): void {
    this.notificationsStore.add({
      type: NOTIFICATION_TYPE.INFO,
      title: event.actionId,
      message: PRODUCT_ACTION_PENDING_LABEL,
    });
  }

  retry(): void {
    void this.store.load();
  }
}
