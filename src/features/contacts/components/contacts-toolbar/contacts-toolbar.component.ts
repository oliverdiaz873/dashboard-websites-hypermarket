import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';

import { FilterSelectComponent } from '@shared/components/filter-select/filter-select.component';

import { ContactsStore } from '../../state/contacts.store';
import { CONTACT_STATUS_OPTIONS } from '../../constants/contact.constants';
import type { ContactMessageStatus } from '../../constants/contact.constants';

@Component({
  selector: 'app-contacts-toolbar',
  templateUrl: './contacts-toolbar.component.html',
  styleUrl: './contacts-toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FilterSelectComponent, MatIcon, MatIconButton, MatTooltip],
})
export class ContactsToolbarComponent {
  protected readonly store = inject(ContactsStore);
  protected readonly statusOptions = [...CONTACT_STATUS_OPTIONS];

  onStatus(value: string): void {
    this.store.setStatusFilter(value as ContactMessageStatus | '');
  }
}
