import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import {
  ConfirmDialogComponent,
  type ConfirmDialogData,
} from '@shared/components/confirm-dialog/confirm-dialog.component';
import type { TableActionEvent } from '@shared/models/table.model';

import { OffersStore } from '../../state/offers.store';
import { OffersToolbarComponent } from '../../components/offers-toolbar/offers-toolbar.component';
import { OffersTableComponent } from '../../components/offers-table/offers-table.component';
import {
  OfferFormDialogComponent,
  type OfferFormDialogData,
} from '../../components/offer-form-dialog/offer-form-dialog.component';
import type { Offer } from '../../models/offer.model';

@Component({
  selector: 'app-offers-page',
  templateUrl: './offers-page.component.html',
  styleUrl: './offers-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PageHeaderComponent, EmptyStateComponent, OffersToolbarComponent, OffersTableComponent],
})
export class OffersPageComponent {
  protected readonly store = inject(OffersStore);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = computed(() => this.store.isLoading() && !this.store.hasLoaded());
  protected readonly showTable = computed(
    () => this.store.hasLoaded() && this.store.filteredItems().length > 0,
  );
  protected readonly showError = computed(
    () => this.store.hasLoaded() && this.store.error() !== null,
  );

  protected readonly emptyTitle = computed(() =>
    this.store.isEmpty() ? 'Sin ofertas' : 'Sin coincidencias',
  );
  protected readonly emptyMessage = computed(() =>
    this.store.isEmpty()
      ? 'Aún no hay ofertas registradas. Crea la primera con el botón "Nueva oferta".'
      : 'No hay ofertas que coincidan con el filtro de estado actual.',
  );

  constructor() {
    void this.store.load();
  }

  protected onCreate(): void {
    this.openForm();
  }

  protected onAction(event: TableActionEvent<Offer>): void {
    if (event.actionId === 'edit') {
      this.openForm(event.row);
      return;
    }
    if (event.actionId === 'toggle') {
      void this.store.toggleActive(event.row);
      return;
    }
    if (event.actionId === 'delete') {
      this.confirmDelete(event.row);
    }
  }

  protected retry(): void {
    void this.store.load();
  }

  private openForm(offer?: Offer): void {
    const ref = this.dialog.open<OfferFormDialogComponent, OfferFormDialogData>(
      OfferFormDialogComponent,
      { data: { offer }, width: '640px' },
    );
    ref.afterClosed().subscribe(() => {
      // El store ya actualizó `items` tras create/update; sin acción adicional.
    });
  }

  private confirmDelete(offer: Offer): void {
    const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData>(
      ConfirmDialogComponent,
      {
        data: {
          title: 'Eliminar oferta',
          message: `¿Eliminar la oferta de ${offer.productName}? Esta acción no se puede deshacer.`,
          confirmLabel: 'Eliminar',
          cancelLabel: 'Cancelar',
        },
      },
    );
    ref.afterClosed().subscribe((confirmed) => {
      if (confirmed) void this.store.remove(offer.id);
    });
  }
}
