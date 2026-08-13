import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';

import { BrandsStore } from '../../state/brands.store';
import type { Brand, CreateBrandPayload, UpdateBrandPayload } from '../../models/brand.model';

export interface BrandFormDialogData {
  /** Presente en edición; ausente al crear. */
  brand?: Brand;
}

const requiredName = (control: AbstractControl): ValidationErrors | null => {
  const value = control.value as string | undefined;
  return !value || !value.trim() ? { required: true } : null;
};

@Component({
  selector: 'app-brand-form-dialog',
  templateUrl: './brand-form-dialog.component.html',
  styleUrl: './brand-form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, MatButton, MatDialogTitle, MatDialogContent, MatDialogActions],
})
export class BrandFormDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<BrandFormDialogComponent>);
  private readonly data = inject<BrandFormDialogData>(MAT_DIALOG_DATA);
  protected readonly store = inject(BrandsStore);

  protected readonly isEdit = computed(() => Boolean(this.data.brand));
  protected readonly submitting = signal(false);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [requiredName] }),
    slug: new FormControl('', { nonNullable: true }),
    description: new FormControl('', { nonNullable: true }),
    logo: new FormControl('', { nonNullable: true }),
    isActive: new FormControl(true, { nonNullable: true }),
  });

  constructor() {
    if (this.data.brand) {
      this.form.patchValue({
        name: this.data.brand.name,
        slug: this.data.brand.slug,
        description: this.data.brand.description ?? '',
        logo: this.data.brand.logo ?? '',
        isActive: this.data.brand.status === 'active',
      });
    }
  }

  protected async onSubmit(): Promise<void> {
    if (this.submitting()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.submitting.set(true);
    try {
      const result = this.data.brand
        ? await this.store.update(this.data.brand.id, this.buildPayload() as UpdateBrandPayload)
        : await this.store.create(this.buildPayload() as CreateBrandPayload);
      if (result) this.dialogRef.close(result);
    } finally {
      this.submitting.set(false);
    }
  }

  private buildPayload(): CreateBrandPayload {
    const value = this.form.getRawValue();
    return {
      name: value.name.trim(),
      slug: value.slug.trim() || undefined,
      description: value.description.trim() || undefined,
      logo: value.logo.trim() || undefined,
      status: value.isActive ? 'active' : 'inactive',
    };
  }

  protected cancel(): void {
    this.dialogRef.close();
  }
}
