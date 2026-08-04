import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatOption, MatSelect } from '@angular/material/select';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import type { Inventory } from '../../models/inventory.model';
import type {
  AdjustmentReason,
  AdjustPayload,
  MinStockPayload,
} from '../../models/inventory.model';
import {
  ADJUSTMENT_REASON_OPTIONS,
  ADJUST_OPERATION_LABELS,
  MOVEMENT_TYPE_LABELS,
} from '../../constants/inventory.constants';

export type InventoryAdjustDialogOperation = 'increase' | 'decrease' | 'set' | 'min-stock';

export type InventoryAdjustResult =
  { kind: 'adjust'; payload: AdjustPayload } | { kind: 'minStock'; payload: MinStockPayload };

export interface InventoryAdjustDialogData {
  inventory: Inventory;
}

const OPERATION_OPTIONS: { value: InventoryAdjustDialogOperation; label: string }[] = [
  { value: 'increase', label: ADJUST_OPERATION_LABELS.increase },
  { value: 'decrease', label: ADJUST_OPERATION_LABELS.decrease },
  { value: 'set', label: ADJUST_OPERATION_LABELS.set },
  { value: 'min-stock', label: MOVEMENT_TYPE_LABELS.min_stock_change },
];

@Component({
  selector: 'app-inventory-adjust-dialog',
  templateUrl: './inventory-adjust-dialog.component.html',
  styleUrl: './inventory-adjust-dialog.component.scss',
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
    MatRadioButton,
    MatRadioGroup,
    MatSelect,
    MatOption,
  ],
})
export class InventoryAdjustDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<InventoryAdjustDialogComponent>);
  protected readonly data = inject<InventoryAdjustDialogData>(MAT_DIALOG_DATA);

  protected readonly operation = new FormControl<InventoryAdjustDialogOperation>('increase', {
    nonNullable: true,
    validators: [Validators.required],
  });
  protected readonly quantity = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(0)],
  });
  protected readonly reason = new FormControl<AdjustmentReason>('manual_correction', {
    nonNullable: true,
    validators: [Validators.required],
  });

  protected readonly operationOptions = OPERATION_OPTIONS;
  protected readonly reasonOptions = ADJUSTMENT_REASON_OPTIONS;

  private readonly operationSignal = toSignal(
    this.operation.valueChanges.pipe(startWith(this.operation.value)),
    { initialValue: this.operation.value },
  );
  private readonly quantitySignal = toSignal(
    this.quantity.valueChanges.pipe(startWith(this.quantity.value)),
    { initialValue: this.quantity.value },
  );
  private readonly reasonSignal = toSignal(
    this.reason.valueChanges.pipe(startWith(this.reason.value)),
    { initialValue: this.reason.value },
  );

  protected readonly isMinStock = computed(() => this.operationSignal() === 'min-stock');

  protected readonly minQuantity = computed(() => (this.isMinStock() ? 0 : 1));

  protected readonly preview = computed(() => {
    const inventory = this.data.inventory;
    const quantity = this.quantitySignal() ?? 0;
    switch (this.operationSignal()) {
      case 'increase':
        return { previous: inventory.stock, next: inventory.stock + quantity };
      case 'decrease':
        return { previous: inventory.stock, next: Math.max(0, inventory.stock - quantity) };
      case 'set':
        return { previous: inventory.stock, next: quantity };
      case 'min-stock':
        return { previous: inventory.minStock ?? 0, next: quantity };
      default:
        return { previous: inventory.stock, next: inventory.stock };
    }
  });

  protected readonly invalid = computed(() => {
    const quantity = this.quantitySignal() ?? 0;
    const reason = this.reasonSignal();
    if (this.isMinStock()) return quantity < 0 || !reason;
    return quantity < 1 || !reason;
  });

  protected submit(): void {
    if (this.invalid()) return;
    const quantity = this.quantity.value ?? 0;
    const reason = this.reason.value;
    const operation = this.operation.value;
    const result: InventoryAdjustResult =
      operation === 'min-stock'
        ? { kind: 'minStock', payload: { minStock: quantity, reason } }
        : { kind: 'adjust', payload: { operation, quantity, reason } };
    this.dialogRef.close(result);
  }

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }
}
