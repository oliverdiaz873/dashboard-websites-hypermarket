import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import type { AuditLog } from '../../models/audit-log.model';
import { getAuditActionLabel, getAuditEntityLabel } from '../../constants/audit-log.constants';

export interface AuditLogDetailDialogData {
  log: AuditLog;
}

@Component({
  selector: 'app-audit-log-detail-dialog',
  templateUrl: './audit-log-detail-dialog.component.html',
  styleUrl: './audit-log-detail-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButton, MatDialogTitle, MatDialogContent, MatDialogActions],
})
export class AuditLogDetailDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AuditLogDetailDialogComponent>);
  protected readonly data = inject<AuditLogDetailDialogData>(MAT_DIALOG_DATA);

  protected readonly actionLabel = computed(() => getAuditActionLabel(this.data.log.action));
  protected readonly entityLabel = computed(() => getAuditEntityLabel(this.data.log.entity));

  protected readonly detailsJson = computed(() => {
    const details = this.data.log.details;
    if (details === undefined || details === null) return null;
    return JSON.stringify(details, null, 2);
  });

  protected readonly createdAt = computed(() => new Date(this.data.log.createdAt).toLocaleString());

  close(): void {
    this.dialogRef.close();
  }
}
