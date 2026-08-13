import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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

import type { Customer, CustomerAddress } from '../../models/customer.model';

export interface CustomerFormDialogData {
  customer: Customer;
}

export interface CustomerFormResult {
  name: string;
  email: string;
  phone: string;
  address: CustomerAddress;
}

/**
 * Diálogo de edición de cliente (PATCH /admin/customers/:id). La creación de
 * clientes ocurre en el storefront (registro), no en el dashboard.
 */
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
export class CustomerFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<CustomerFormDialogComponent>);
  protected readonly data = inject<CustomerFormDialogData>(MAT_DIALOG_DATA);

  protected readonly address = this.data.customer.address ?? {};

  protected readonly form = new FormGroup({
    name: new FormControl<string>(this.data.customer.name, {
      nonNullable: true,
      validators: [Validators.required],
    }),
    email: new FormControl<string>(this.data.customer.email, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    phone: new FormControl<string>(this.data.customer.phone ?? '', { nonNullable: true }),
    address: new FormGroup({
      street: new FormControl<string>(this.address.street ?? '', { nonNullable: true }),
      city: new FormControl<string>(this.address.city ?? '', { nonNullable: true }),
      zipCode: new FormControl<string>(this.address.zipCode ?? '', { nonNullable: true }),
      country: new FormControl<string>(this.address.country ?? '', { nonNullable: true }),
    }),
  });

  protected submit(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.getRawValue() as CustomerFormResult);
  }

  protected cancel(): void {
    this.dialogRef.close(undefined);
  }
}
