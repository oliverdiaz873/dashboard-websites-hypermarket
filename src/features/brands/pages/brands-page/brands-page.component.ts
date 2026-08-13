import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import type { TableActionEvent } from '@shared/models/table.model';

import { BrandsStore } from '../../state/brands.store';
import { BrandsToolbarComponent } from '../../components/brands-toolbar/brands-toolbar.component';
import { BrandsTableComponent } from '../../components/brands-table/brands-table.component';
import {
  BrandFormDialogComponent,
  type BrandFormDialogData,
} from '../../components/brand-form-dialog/brand-form-dialog.component';
import type { Brand } from '../../models/brand.model';

@Component({
  selector: 'app-brands-page',
  templateUrl: './brands-page.component.html',
  styleUrl: './brands-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, EmptyStateComponent, BrandsToolbarComponent, BrandsTableComponent],
})
export class BrandsPageComponent {
  protected readonly store = inject(BrandsStore);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = computed(() => this.store.isLoading() && !this.store.hasLoaded());
  protected readonly showTable = computed(
    () => this.store.hasLoaded() && this.store.filteredItems().length > 0,
  );
  protected readonly showError = computed(
    () => this.store.hasLoaded() && this.store.error() !== null,
  );

  protected readonly emptyTitle = computed(() =>
    this.store.isEmpty() ? 'Sin marcas' : 'Sin coincidencias',
  );
  protected readonly emptyMessage = computed(() =>
    this.store.isEmpty()
      ? 'Aún no hay marcas registradas. Crea la primera con el botón "Nueva marca".'
      : 'No hay marcas que coincidan con el filtro de estado actual.',
  );

  constructor() {
    void this.store.load();
  }

  protected onCreate(): void {
    this.openForm();
  }

  protected onAction(event: TableActionEvent<Brand>): void {
    if (event.actionId === 'edit') {
      this.openForm(event.row);
      return;
    }
    if (event.actionId === 'toggle') {
      void this.store.toggleStatus(event.row);
      return;
    }
    if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  protected retry(): void {
    void this.store.load();
  }

  private openForm(brand?: Brand): void {
    this.dialog.open<BrandFormDialogComponent, BrandFormDialogData>(BrandFormDialogComponent, {
      data: { brand },
      width: '520px',
    });
  }

  private confirmDelete(brand: Brand): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Eliminar marca',
          message: `¿Eliminar la marca "${brand.name}"? Esta acción no se puede deshacer.`,
          confirmLabel: 'Eliminar',
          cancelLabel: 'Cancelar',
        },
      },
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) void this.store.remove(brand.id);
    });
  }
}
