import { ChangeDetectionStrategy, Component, OnDestroy, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import { STORAGE_KEYS } from '@core/constants/storage-keys';
import { getStorageItem, removeStorageItem, setStorageItem } from '@core/utils/storage.util';

import type { Customer, CustomerAddress } from '../../models/customer.model';

export interface CustomerFormDialogData {
  customer?: Customer;
}

export interface CustomerFormResult {
  name: string;
  email: string;
  phone: string;
  address: CustomerAddress;
}

@Component({
  selector: 'app-customer-form-dialog',
  templateUrl: './customer-form-dialog.component.html',
  styleUrl: './customer-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatIcon,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
  ],
})
export class CustomerFormDialogComponent implements OnDestroy {
  private readonly dialogRef = inject(MatDialogRef<CustomerFormDialogComponent>);
  protected readonly data = inject<CustomerFormDialogData>(MAT_DIALOG_DATA);

  protected readonly isEditing = this.data.customer !== undefined;
  protected readonly address = this.data.customer?.address ?? {};

  protected readonly form = new FormGroup({
    name: new FormControl<string>(this.data.customer?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl<string>(this.data.customer?.email ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl<string>(this.data.customer?.phone ?? '', { nonNullable: true }),
    address: new FormGroup({
      street: new FormControl<string>(this.address.street ?? '', { nonNullable: true }),
      city: new FormControl<string>(this.address.city ?? '', { nonNullable: true }),
      zipCode: new FormControl<string>(this.address.zipCode ?? '', { nonNullable: true }),
      country: new FormControl<string>(this.address.country ?? '', { nonNullable: true }),
    }),
  });

  private submitted = false;
  private readonly initialValue: string;

  constructor() {
    if (!this.isEditing) {
      const draft = getStorageItem<CustomerFormResult>(STORAGE_KEYS.customerForm);
      if (draft) {
        this.form.patchValue({ ...draft, address: draft.address ?? {} });
      }
    }
    this.initialValue = JSON.stringify(this.form.getRawValue());
  }

  ngOnDestroy(): void {
    // Guarda el borrador solo en creación: si el usuario cancela con cambios,
    // se recuperan la próxima vez. Nunca se pisan datos de un cliente existente.
    if (!this.isEditing && !this.submitted && this.hasChanges()) {
      setStorageItem<CustomerFormResult>(STORAGE_KEYS.customerForm, this.form.getRawValue());
    }
  }

  private hasChanges(): boolean {
    return JSON.stringify(this.form.getRawValue()) !== this.initialValue;
  }

  protected submit(): void {
    if (this.form.invalid) return;
    this.submitted = true;
    removeStorageItem(STORAGE_KEYS.customerForm);
    this.dialogRef.close(this.form.getRawValue() as CustomerFormResult);
  }

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }
}
