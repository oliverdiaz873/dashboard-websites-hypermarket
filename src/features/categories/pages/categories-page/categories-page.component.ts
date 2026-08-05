import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { DataTableComponent } from '@shared/components/data-table/data-table.component';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import { NOTIFICATION_TYPE } from '@core/enums/notification-type';
import { NotificationsStore } from '@core/state/notifications/notifications.store';
import type { TableAction, TableActionEvent, TableColumn } from '@shared/models/table.model';

import { CategoriesStore } from '../../state/categories.store';
import {
  CategoryFormDialogComponent,
  type CategoryFormDialogData,
  type CategoryFormResult,
} from '../../components/category-form-dialog/category-form-dialog.component';
import type { Category } from '../../models/category.model';

@Component({
  selector: 'app-categories-page',
  templateUrl: './categories-page.component.html',
  styleUrl: './categories-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, EmptyStateComponent, DataTableComponent, MatIcon],
})
export class CategoriesPageComponent {
  protected readonly store = inject(CategoriesStore);
  private readonly notificationsStore = inject(NotificationsStore);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = computed(() => this.store.isLoading() && !this.store.hasLoaded());
  protected readonly showTable = computed(() => this.store.hasLoaded() && !this.store.isEmpty());
  protected readonly showError = computed(
    () => this.store.hasLoaded() && this.store.error() !== null,
  );

  protected readonly columns: TableColumn<Category>[] = [
    { key: 'name', header: 'Nombre' },
    { key: 'slug', header: 'Slug', hideOnMobile: true },
    {
      key: 'subcategories',
      header: 'Subcategorías',
      cell: (row) => row.subcategories.map((sub) => sub.name).join(', ') || '—',
    },
  ];

  protected readonly actions: TableAction<Category>[] = [
    { id: 'edit', label: 'Editar', icon: 'edit' },
    { id: 'delete', label: 'Eliminar', icon: 'delete' },
  ];

  constructor() {
    void this.store.load();
  }

  protected onAction(event: TableActionEvent<Category>): void {
    if (event.actionId === 'edit') {
      this.openFormDialog(event.row);
      return;
    }
    if (event.actionId === 'delete') {
      this.requestDelete(event.row);
    }
  }

  protected openCreate(): void {
    this.openFormDialog();
  }

  protected retry(): void {
    void this.store.load();
  }

  private openFormDialog(category?: Category): void {
    const dialogRef = this.dialog.open<
      CategoryFormDialogComponent,
      CategoryFormDialogData,
      CategoryFormResult | undefined
    >(CategoryFormDialogComponent, {
      data: { category },
      width: '520px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) return;
      const pending = category ? this.store.update(category.id, result) : this.store.create(result);
      void pending.then(
        () => {
          this.notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: category ? 'Categoría actualizada' : 'Categoría creada',
            message: category
              ? 'La categoría se actualizó correctamente.'
              : 'La categoría se creó correctamente.',
          });
        },
        () => {
          // El error ya se notifica vía ErrorInterceptor.
        },
      );
    });
  }

  private requestDelete(category: Category): void {
    const dialogRef = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Eliminar categoría',
          message: `¿Deseas eliminar "${category.name}"?`,
          confirmLabel: 'Eliminar',
          cancelLabel: 'Cancelar',
        },
      },
    );

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      void this.store.remove(category.id).then(
        () => {
          this.notificationsStore.add({
            type: NOTIFICATION_TYPE.SUCCESS,
            title: 'Categoría eliminada',
            message: 'La categoría se eliminó correctamente.',
          });
        },
        () => {
          // El error ya se notifica vía ErrorInterceptor.
        },
      );
    });
  }
}
