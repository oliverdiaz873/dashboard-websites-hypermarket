import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OrdersTableComponent } from './orders-table.component';
import type { AdminOrder } from '../../models/order.model';
import type { TableActionEvent } from '@shared/models/table.model';

const order: AdminOrder = {
  id: 'o1',
  userId: 'u1',
  items: [{ productId: 'p1', name: 'Arroz 1kg', price: 89.5, image: 'img.png', quantity: 2 }],
  totalItems: 2,
  subtotal: 179,
  status: 'pending',
  paymentStatus: 'pending',
  customer: { id: 'u1', name: 'Oliver Diaz', email: 'oliver@example.com' },
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

describe('OrdersTableComponent', () => {
  let fixture: ComponentFixture<OrdersTableComponent>;
  let component: OrdersTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, OrdersTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(OrdersTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [order]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('renderiza el cliente con nombre y email', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Oliver Diaz');
    expect(text).toContain('oliver@example.com');
  });

  it('muestra la etiqueta de estado en un badge', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Pendiente');
  });

  it('formatea el subtotal como moneda', () => {
    const totalColumn = component['columns'].find((c) => c.key === 'subtotal');
    expect(totalColumn?.cell?.(order)).toContain('179');
  });

  it('la columna de estado deriva la etiqueta y el tono del enum', () => {
    const statusColumn = component['columns'].find((c) => c.key === 'status');
    expect(statusColumn?.badge?.(order)).toEqual({ label: 'Pendiente', tone: 'low' });
  });

  it('la acción de cambio de estado solo es visible cuando hay transiciones válidas', () => {
    const statusAction = component['actions'].find((a) => a.id === 'status');
    expect(statusAction?.visible?.(order)).toBe(true);
    expect(statusAction?.visible?.({ ...order, status: 'completed' })).toBe(false);
  });

  it('reemite actionClicked con la fila seleccionada', () => {
    let emitted: TableActionEvent<AdminOrder> | undefined;
    component.actionClicked.subscribe((e) => (emitted = e));

    component.onAction({ actionId: 'detail', row: order });
    expect(emitted).toEqual({ actionId: 'detail', row: order });
  });
});
