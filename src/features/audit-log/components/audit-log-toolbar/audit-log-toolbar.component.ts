import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

import { SearchInputComponent } from '@shared/components/search-input/search-input.component';
import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';

import { AuditLogStore } from '../../state/audit-log.store';
import { AUDIT_ACTION_OPTIONS, AUDIT_ENTITY_OPTIONS } from '../../constants/audit-log.constants';

@Component({
  selector: 'app-audit-log-toolbar',
  templateUrl: './audit-log-toolbar.component.html',
  styleUrl: './audit-log-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    SearchInputComponent,
    FilterSelectComponent,
    MatIcon,
    MatIconButton,
    MatTooltip,
    FormsModule,
  ],
})
export class AuditLogToolbarComponent {
  protected readonly store = inject(AuditLogStore);
  protected readonly actionOptions = [...AUDIT_ACTION_OPTIONS];
  protected readonly entityOptions = [...AUDIT_ENTITY_OPTIONS];

  onSearch(value: string): void {
    this.store.setSearch(value);
  }

  onAction(value: string): void {
    this.store.setAction(value);
  }

  onEntity(value: string): void {
    this.store.setEntity(value);
  }

  onFrom(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setDateRange(value, this.store.to());
  }

  onTo(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setDateRange(this.store.from(), value);
  }
}
