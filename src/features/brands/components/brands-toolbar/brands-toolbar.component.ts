import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';

import { BrandsStore } from '../../state/brands.store';
import { BRAND_STATUS_OPTIONS } from '../../constants/brand.constants';
import type { BrandStatusFilter } from '../../constants/brand.constants';

@Component({
  selector: 'app-brands-toolbar',
  templateUrl: './brands-toolbar.component.html',
  styleUrl: './brands-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterSelectComponent, MatIcon, MatIconButton, MatTooltip],
})
export class BrandsToolbarComponent {
  protected readonly store = inject(BrandsStore);
  protected readonly statusOptions = [...BRAND_STATUS_OPTIONS];

  readonly createClicked = output<void>();

  onStatus(value: string): void {
    this.store.setStatusFilter(value as BrandStatusFilter);
  }
}
