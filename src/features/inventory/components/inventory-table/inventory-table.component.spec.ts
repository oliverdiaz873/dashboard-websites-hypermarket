import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { InventoryTableComponent } from './inventory-table.component';
import type { Inventory } from '../../models/inventory.model';
import type { TableActionEvent } from '@shared/models/table.model';

const inventory: Inventory = {
  id: 'inv1',
  productId: 'p1',
  product: { name: 'Arroz', sku: 'SKU-1' },
  stock: 2,
  reservedStock: 1,
  availableStock: 1,
  minStock: 5,
  status: 'low-stock',
  updatedAt: new Date('2026-01-15'),
};

describe('InventoryTableComponent', () => {
  let fixture: ComponentFixture<InventoryTableComponent>;
  let component: InventoryTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, InventoryTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(InventoryTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [inventory]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('renderiza una fila con el nombre del producto y el SKU', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Arroz');
    expect(text).toContain('SKU-1');
  });

  it('muestra la etiqueta de estado en un badge', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Bajo');
  });

  it('la columna de estado deriva la etiqueta y el tono del enum', () => {
    const statusColumn = component['columns'].find((c) => c.key === 'status');
    expect(statusColumn?.badge?.(inventory)).toEqual({ label: 'Bajo', tone: 'low' });
  });

  it('no renderiza badge cuando no hay status', () => {
    const row = { ...inventory, status: '' as never };
    const statusColumn = component['columns'].find((c) => c.key === 'status');
    expect(statusColumn?.badge?.(row)).toBeNull();
  });

  it('reemite actionClicked con la fila seleccionada', () => {
    let emitted: TableActionEvent<Inventory> | undefined;
    component.actionClicked.subscribe((e) => (emitted = e));

    component.onAction({ actionId: 'adjust', row: inventory });
    expect(emitted).toEqual({ actionId: 'adjust', row: inventory });
  });
});
