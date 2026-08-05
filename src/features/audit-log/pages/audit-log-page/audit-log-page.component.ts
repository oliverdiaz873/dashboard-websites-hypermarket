import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { EmptyStateComponent } from '@shared/components/empty-state/empty-state.component';
import { PaginationComponent } from '@shared/components/pagination/pagination.component';
import type { TableActionEvent } from '@shared/models/table.model';

import { AuditLogStore } from '../../state/audit-log.store';
import { AuditLogToolbarComponent } from '../../components/audit-log-toolbar/audit-log-toolbar.component';
import { AuditLogTableComponent } from '../../components/audit-log-table/audit-log-table.component';
import {
  AuditLogDetailDialogComponent,
  type AuditLogDetailDialogData,
} from '../../components/audit-log-detail-dialog/audit-log-detail-dialog.component';
import type { AuditLog } from '../../models/audit-log.model';

@Component({
  selector: 'app-audit-log-page',
  templateUrl: './audit-log-page.component.html',
  styleUrl: './audit-log-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeaderComponent,
    EmptyStateComponent,
    PaginationComponent,
    AuditLogToolbarComponent,
    AuditLogTableComponent,
  ],
})
export class AuditLogPageComponent {
  protected readonly store = inject(AuditLogStore);
  private readonly dialog = inject(MatDialog);

  protected readonly loading = computed(() => this.store.isLoading() && !this.store.hasLoaded());
  protected readonly showTable = computed(() => this.store.hasLoaded() && !this.store.isEmpty());
  protected readonly showError = computed(
    () => this.store.hasLoaded() && this.store.error() !== null,
  );

  constructor() {
    void this.store.load();
  }

  protected onAction(event: TableActionEvent<AuditLog>): void {
    if (event.actionId === 'detail') {
      this.openDetail(event.row);
    }
  }

  protected retry(): void {
    void this.store.load();
  }

  private openDetail(log: AuditLog): void {
    const data: AuditLogDetailDialogData = { log };
    this.dialog.open<AuditLogDetailDialogComponent, AuditLogDetailDialogData>(
      AuditLogDetailDialogComponent,
      { data, width: '560px' },
    );
  }
}
