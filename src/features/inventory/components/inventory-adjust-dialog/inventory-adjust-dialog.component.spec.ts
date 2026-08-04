import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';

import {
  InventoryAdjustDialogComponent,
  type InventoryAdjustResult,
} from './inventory-adjust-dialog.component';
import type { Inventory } from '../../models/inventory.model';

const inventory: Inventory = {
  id: 'inv1',
  productId: 'p1',
  product: { name: 'Arroz', sku: 'SKU-1' },
  stock: 10,
  reservedStock: 0,
  availableStock: 10,
  minStock: 5,
  status: 'ok',
  updatedAt: new Date('2026-01-01'),
};

function controls(component: InventoryAdjustDialogComponent): {
  operation: FormControl<string>;
  quantity: FormControl<number | null>;
  reason: FormControl<string>;
} {
  return component as unknown as {
    operation: FormControl<string>;
    quantity: FormControl<number | null>;
    reason: FormControl<string>;
  };
}

describe('InventoryAdjustDialogComponent', () => {
  let fixture: ComponentFixture<InventoryAdjustDialogComponent>;
  let component: InventoryAdjustDialogComponent;
  let closeSpy: jest.Mock;

  beforeEach(async () => {
    closeSpy = jest.fn();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, InventoryAdjustDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { inventory } },
        { provide: MatDialogRef, useValue: { close: closeSpy } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(InventoryAdjustDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function submit(): void {
    (component as unknown as { submit(): void }).submit();
  }

  it('somete un ajuste increase con la cantidad y el motivo elegido', () => {
    const c = controls(component);
    c.operation.setValue('increase');
    c.quantity.setValue(5);
    c.reason.setValue('supplier_adjustment');
    fixture.detectChanges();

    submit();

    expect(closeSpy).toHaveBeenCalledWith({
      kind: 'adjust',
      payload: { operation: 'increase', quantity: 5, reason: 'supplier_adjustment' },
    } satisfies InventoryAdjustResult);
  });

  it('calcula el preview de decrease sin bajar de cero', () => {
    const c = controls(component);
    c.operation.setValue('decrease');
    c.quantity.setValue(15);
    fixture.detectChanges();

    const preview = (
      component as unknown as { preview(): { previous: number; next: number } }
    ).preview();
    expect(preview).toEqual({ previous: 10, next: 0 });
  });

  it('set fija el stock a la cantidad indicada', () => {
    const c = controls(component);
    c.operation.setValue('set');
    c.quantity.setValue(25);
    fixture.detectChanges();

    submit();
    expect(closeSpy).toHaveBeenCalledWith({
      kind: 'adjust',
      payload: { operation: 'set', quantity: 25, reason: 'manual_correction' },
    } satisfies InventoryAdjustResult);
  });

  it('no somete con cantidad vacía o cero en operaciones de stock', () => {
    const c = controls(component);
    c.quantity.setValue(null);
    submit();
    expect(closeSpy).not.toHaveBeenCalled();

    c.quantity.setValue(0);
    submit();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('min-stock somete un payload de mínimo sin exigir cantidad mayor que cero', () => {
    const c = controls(component);
    c.operation.setValue('min-stock');
    c.quantity.setValue(0);
    fixture.detectChanges();

    submit();
    expect(closeSpy).toHaveBeenCalledWith({
      kind: 'minStock',
      payload: { minStock: 0, reason: 'manual_correction' },
    } satisfies InventoryAdjustResult);
  });

  it('cancelar cierra sin resultado', () => {
    (component as unknown as { cancel(): void }).cancel();
    expect(closeSpy).toHaveBeenCalledWith(undefined);
  });
});
