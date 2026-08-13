import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { OffersTableComponent } from './offers-table.component';
import type { Offer } from '../../models/offer.model';
import type { TableActionEvent } from '@shared/models/table.model';

const active: Offer = {
  id: 'o1',
  productId: 'p1',
  productName: 'Arroz 1kg',
  originalPrice: 100,
  discountPrice: 80,
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-12-31T00:00:00.000Z',
  isActive: true,
};

const inactive = { ...active, id: 'o2', isActive: false };

describe('OffersTableComponent', () => {
  let fixture: ComponentFixture<OffersTableComponent>;
  let component: OffersTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, OffersTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(OffersTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [active, inactive]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('renderiza producto, precios, descuento y estado', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Arroz 1kg');
    expect(text).toContain('RD$100.00');
    expect(text).toContain('RD$80.00');
    expect(text).toContain('20%');
    expect(text).toContain('Activa');
    expect(text).toContain('Inactiva');
  });

  it('la columna de estado devuelve badge con etiqueta y tono correctos', () => {
    const statusColumn = component['columns'].find((c) => c.key === 'isActive');
    expect(statusColumn?.badge?.(active)).toEqual({ label: 'Activa', tone: 'ok' });
    expect(statusColumn?.badge?.(inactive)).toEqual({ label: 'Inactiva', tone: 'low' });
  });

  it('las acciones toggle son condicionales al estado activo', () => {
    const deactivate = component['actions'].find(
      (a) => a.id === 'toggle' && a.label === 'Desactivar',
    );
    const activate = component['actions'].find((a) => a.id === 'toggle' && a.label === 'Activar');

    expect(deactivate?.visible?.(active)).toBe(true);
    expect(deactivate?.visible?.(inactive)).toBe(false);
    expect(activate?.visible?.(inactive)).toBe(true);
    expect(activate?.visible?.(active)).toBe(false);
  });

  it('la columna de vigencia muestra fin "sin fin" cuando no existe', () => {
    const vigencia = component['columns'].find((c) => c.key === 'startDate');
    expect(vigencia?.cell?.(active)).toContain('→');
    expect(vigencia?.cell?.({ ...active, endDate: undefined })).toContain('sin fin');
  });

  it('reemite actionClicked con la fila seleccionada', () => {
    let emitted: TableActionEvent<Offer> | undefined;
    component.actionClicked.subscribe((e) => (emitted = e));

    component.onAction({ actionId: 'edit', row: active });
    expect(emitted).toEqual({ actionId: 'edit', row: active });
  });
});
