import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
  OrderStatusDialogComponent,
  type OrderStatusDialogData,
} from './order-status-dialog.component';
import type { AdminOrder } from '../../models/order.model';

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

describe('OrderStatusDialogComponent', () => {
  let fixture: ComponentFixture<OrderStatusDialogComponent>;
  let component: OrderStatusDialogComponent;
  let dialogRef: { close: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, OrderStatusDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { order } as OrderStatusDialogData },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deriva los estados destino válidos desde el estado actual', () => {
    expect(component.statusOptions.map((o) => o.value)).toEqual(['confirmed', 'cancelled']);
  });

  it('submit cierra el diálogo con status y nota recortada', () => {
    component['status'].setValue('confirmed');
    component['note'].setValue('  Aprobado por admin  ');

    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith({
      status: 'confirmed',
      note: 'Aprobado por admin',
    });
  });

  it('submit sin nota omite la propiedad note', () => {
    component['status'].setValue('cancelled');

    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith({ status: 'cancelled' });
  });

  it('submit sin estado seleccionado no cierra el diálogo', () => {
    component.submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('cancel cierra el diálogo sin resultado', () => {
    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});
