import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';

import { OffersStore } from '../../state/offers.store';
import { OFFER_ACTIVE_OPTIONS } from '../../constants/offer.constants';
import type { OfferActiveFilter } from '../../constants/offer.constants';

@Component({
  selector: 'app-offers-toolbar',
  templateUrl: './offers-toolbar.component.html',
  styleUrl: './offers-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterSelectComponent, MatIcon, MatIconButton, MatTooltip],
})
export class OffersToolbarComponent {
  protected readonly store = inject(OffersStore);
  protected readonly activeOptions = [...OFFER_ACTIVE_OPTIONS];

  readonly createClicked = output<void>();

  onActive(value: string): void {
    this.store.setActiveFilter(value as OfferActiveFilter);
  }
}
