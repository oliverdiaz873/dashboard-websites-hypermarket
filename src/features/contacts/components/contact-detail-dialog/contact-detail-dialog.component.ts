import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import type { ContactMessage } from '../../models/contact-message.model';
import { getContactStatusLabel } from '../../constants/contact.constants';

export interface ContactDetailDialogData {
  message: ContactMessage;
}

@Component({
  selector: 'app-contact-detail-dialog',
  templateUrl: './contact-detail-dialog.component.html',
  styleUrl: './contact-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatDialogTitle, MatDialogContent, MatDialogActions],
})
export class ContactDetailDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ContactDetailDialogComponent>);
  protected readonly data = inject<ContactDetailDialogData>(MAT_DIALOG_DATA);

  protected readonly statusLabel = computed(() => getContactStatusLabel(this.data.message.status));
  protected readonly createdAt = computed(() =>
    new Date(this.data.message.createdAt).toLocaleString(),
  );

  close(): void {
    this.dialogRef.close();
  }
}
