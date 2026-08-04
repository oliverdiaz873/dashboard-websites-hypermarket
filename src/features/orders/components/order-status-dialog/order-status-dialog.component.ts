import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import type { AdminOrder, OrderStatus } from '../../models/order.model';
import { getOrderStatusTransitions, ORDER_STATUS_LABELS } from '../../constants/orders.constants';

export interface OrderStatusDialogData {
  order: AdminOrder;
}

export interface OrderStatusResult {
  status: OrderStatus;
  note?: string;
}

@Component({
  selector: 'app-order-status-dialog',
  templateUrl: './order-status-dialog.component.html',
  styleUrl: './order-status-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput,
    MatSelect,
    MatOption,
  ],
})
export class OrderStatusDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<OrderStatusDialogComponent>);
  protected readonly data = inject<OrderStatusDialogData>(MAT_DIALOG_DATA);

  protected readonly status = new FormControl<OrderStatus | null>(null, {
    validators: [Validators.required],
  });
  protected readonly note = new FormControl<string>('');

  protected readonly statusOptions = getOrderStatusTransitions(this.data.order.status);

  protected readonly currentStatusLabel = ORDER_STATUS_LABELS[this.data.order.status];

  submit(): void {
    if (this.status.invalid) return;
    const selected = this.status.value;
    if (!selected) return;
    const result: OrderStatusResult = {
      status: selected,
      ...(this.note.value?.trim() ? { note: this.note.value.trim() } : {}),
    };
    this.dialogRef.close(result);
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
