import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type {
  CreateProductPayload,
  Product,
  ProductStatus,
  UpdateProductPayload,
} from '../../models/product.model';
import { PRODUCT_STATUS_OPTIONS } from '../../constants/products.constants';

export interface SelectOption {
  value: string;
  label: string;
}

export type ProductFormPayload = CreateProductPayload | UpdateProductPayload;

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
})
export class ProductFormComponent {
  readonly product = input<Product | null>(null);
  readonly isCreate = input<boolean>(true);
  readonly categories = input<SelectOption[]>([]);
  readonly brands = input<SelectOption[]>([]);
  readonly submitting = input<boolean>(false);

  readonly submitted = output<ProductFormPayload>();
  readonly cancelled = output<void>();

  protected readonly statusOptions = PRODUCT_STATUS_OPTIONS;

  protected readonly form = new FormGroup({
    name: new FormControl('', { validators: [Validators.required] }),
    sku: new FormControl(''),
    price: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0)],
    }),
    image: new FormControl('', { validators: [Validators.required] }),
    categoryId: new FormControl('', { validators: [Validators.required] }),
    brandId: new FormControl(''),
    unit: new FormControl(''),
    unitQuantity: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
    description: new FormControl(''),
    status: new FormControl<ProductStatus>('active', { validators: [Validators.required] }),
    isAvailable: new FormControl(true),
    stock: new FormControl<number | null>(null, { validators: [Validators.min(0)] }),
    minStock: new FormControl<number | null>(null, { validators: [Validators.min(0)] }),
  });

  constructor() {
    effect(() => {
      const product = this.product();
      if (!product) return;
      this.form.patchValue({
        name: product.name,
        sku: product.sku,
        price: product.price,
        image: product.image,
        categoryId: product.categoryId,
        brandId: product.brandId ?? '',
        unit: product.unit ?? '',
        unitQuantity: product.unitQuantity ?? null,
        description: product.description ?? '',
        status: product.status,
        isAvailable: product.isAvailable,
      });
    });
  }

  protected onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }
    this.submitted.emit(this.isCreate() ? this.toCreatePayload() : this.toUpdatePayload());
  }

  protected onCancel(): void {
    this.cancelled.emit();
  }

  hasUnsavedChanges(): boolean {
    return this.form.dirty;
  }

  private toCreatePayload(): CreateProductPayload {
    const c = this.form.controls;
    return {
      name: c.name.value?.trim() ?? '',
      price: this.price(c.price),
      image: c.image.value?.trim() ?? '',
      categoryId: c.categoryId.value ?? '',
      sku: optional(c.sku.value),
      brandId: optional(c.brandId.value),
      unit: optional(c.unit.value),
      unitQuantity: nullableNumber(c.unitQuantity.value),
      description: optional(c.description.value),
      status: c.status.value ?? 'active',
      isAvailable: c.isAvailable.value ?? true,
      stock: nullableNumber(c.stock.value),
      minStock: nullableNumber(c.minStock.value),
    };
  }

  private toUpdatePayload(): UpdateProductPayload {
    const c = this.form.controls;
    const brandValue = c.brandId.value?.trim();
    return {
      name: c.name.value?.trim() ?? '',
      price: this.price(c.price),
      image: c.image.value?.trim() ?? '',
      categoryId: c.categoryId.value ?? '',
      sku: optional(c.sku.value),
      brandId: brandValue ? brandValue : null,
      unit: optional(c.unit.value),
      unitQuantity: nullableNumber(c.unitQuantity.value),
      description: optional(c.description.value),
      status: c.status.value ?? 'active',
      isAvailable: c.isAvailable.value ?? true,
    };
  }

  private price(control: FormControl<number | null>): number {
    return control.value === null || control.value === undefined ? 0 : Number(control.value);
  }
}

function optional(value: string | null | undefined): string | undefined {
  return value && value.trim() ? value.trim() : undefined;
}

function nullableNumber(value: number | null | undefined): number | undefined {
  if (value === null || value === undefined) return undefined;
  return Number(value);
}
