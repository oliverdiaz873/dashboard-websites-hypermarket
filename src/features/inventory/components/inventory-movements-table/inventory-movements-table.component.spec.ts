import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { InventoryMovementsTableComponent } from './inventory-movements-table.component';
import type { InventoryMovement } from '../../models/inventory.model';

const movement: InventoryMovement = {
  id: 'm1',
  inventoryId: 'inv1',
  productId: 'p1',
  type: 'increase',
  quantity: 5,
  previousStock: 10,
  newStock: 15,
  previousReservedStock: 0,
  newReservedStock: 0,
  reason: 'supplier_adjustment',
  createdBy: 'admin@example.com',
  createdAt: new Date('2026-01-15T10:00:00'),
};

describe('InventoryMovementsTableComponent', () => {
  let fixture: ComponentFixture<InventoryMovementsTableComponent>;
  let component: InventoryMovementsTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, InventoryMovementsTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(InventoryMovementsTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('movements', [movement]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('renderiza la fila con la etiqueta de tipo, cantidades y usuario', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Aumento');
    expect(text).toContain('10 → 15');
    expect(text).toContain('admin@example.com');
  });

  it('la columna de tipo deriva la etiqueta del enum', () => {
    const typeColumn = component['columns'].find((c) => c.key === 'type');
    expect(typeColumn?.cell?.(movement)).toBe('Aumento');
  });

  it('la columna de cambio muestra previous → new y el usuario por defecto con —', () => {
    const changeColumn = component['columns'].find((c) => c.key === 'change');
    expect(changeColumn?.cell?.(movement)).toBe('10 → 15');

    const userColumn = component['columns'].find((c) => c.key === 'createdBy');
    expect(userColumn?.cell?.({ ...movement, createdBy: undefined })).toBe('—');
  });

  it('la columna de cambio incluye el reservado para movimientos de reserva', () => {
    const reserveMovement: InventoryMovement = {
      ...movement,
      type: 'reserve',
      previousStock: 100,
      newStock: 100,
      previousReservedStock: 0,
      newReservedStock: 5,
      orderId: 'o1',
    };
    const changeColumn = component['columns'].find((c) => c.key === 'change');
    expect(changeColumn?.cell?.(reserveMovement)).toBe('100 → 100 · R: 0 → 5');

    const orderColumn = component['columns'].find((c) => c.key === 'orderId');
    expect(orderColumn?.cell?.(reserveMovement)).toBe('o1');
    expect(orderColumn?.cell?.({ ...reserveMovement, orderId: undefined })).toBe('—');
  });
});
