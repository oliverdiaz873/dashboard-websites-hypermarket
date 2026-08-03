import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductFormComponent, type ProductFormPayload } from './product-form.component';
import type { Product } from '../../models/product.model';

interface FormAccess {
  form: { setValue(v: unknown): void; getRawValue(): Record<string, unknown> };
}

function ref(component: ProductFormComponent): FormAccess {
  return component as unknown as FormAccess;
}

function setForm(component: ProductFormComponent, values: Record<string, unknown>): void {
  ref(component).form.setValue(values);
}

describe('ProductFormComponent', () => {
  let fixture: ComponentFixture<ProductFormComponent>;
  let component: ProductFormComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductFormComponent] }).compileComponents();
    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function submit(): ProductFormPayload | undefined {
    let emitted: ProductFormPayload | undefined;
    component.submitted.subscribe((value) => (emitted = value));
    (component as unknown as { onSubmit(): void }).onSubmit();
    return emitted;
  }

  const validValues = {
    name: 'Café',
    sku: 'SKU1',
    price: 100,
    image: 'http://x.png',
    categoryId: 'c1',
    brandId: 'b2',
    unit: 'kg',
    unitQuantity: 1,
    description: 'd',
    status: 'active',
    isAvailable: true,
    stock: 5,
    minStock: 3,
  };

  it('emite un CreateProductPayload con todos los campos en modo create', () => {
    setForm(component, validValues);
    expect(submit()).toEqual(validValues);
  });

  it('no emite si faltan campos requeridos', () => {
    setForm(component, { ...validValues, name: '', price: null, categoryId: '' });
    expect(submit()).toBeUndefined();
  });

  describe('modo edit', () => {
    const product: Product = {
      id: 'p1',
      sku: 'SKU1',
      name: 'Arroz',
      price: 80,
      image: 'http://x.png',
      categoryId: 'c1',
      brandId: 'b1',
      brand: { name: 'Nestlé', slug: 'nestle' },
      status: 'active',
      isAvailable: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      fixture.componentRef.setInput('isCreate', false);
      fixture.componentRef.setInput('product', product);
      fixture.detectChanges();
    });

    it('pre-rellena el formulario desde el producto', () => {
      const raw = ref(component).form.getRawValue();
      expect(raw.name).toBe('Arroz');
      expect(raw.price).toBe(80);
      expect(raw.brandId).toBe('b1');
    });

    it('emite UpdateProductPayload sin stock/minStock y brandId null si se limpia', () => {
      const raw = ref(component).form.getRawValue();
      setForm(component, { ...raw, brandId: '', price: 99 });

      const payload = submit() as Record<string, unknown>;
      expect(payload).toEqual({
        name: 'Arroz',
        sku: 'SKU1',
        price: 99,
        image: 'http://x.png',
        categoryId: 'c1',
        brandId: null,
        unit: undefined,
        unitQuantity: undefined,
        description: undefined,
        status: 'active',
        isAvailable: true,
      });
      expect('stock' in payload).toBe(false);
      expect('minStock' in payload).toBe(false);
    });
  });
});
