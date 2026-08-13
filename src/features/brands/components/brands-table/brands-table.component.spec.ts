import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { BrandsTableComponent } from './brands-table.component';
import type { Brand } from '../../models/brand.model';
import type { TableActionEvent } from '@shared/models/table.model';

const active: Brand = {
  id: 'b1',
  name: 'Coca-Cola',
  slug: 'coca-cola',
  description: 'Bebidas gaseosas',
  status: 'active',
};

const inactive = { ...active, id: 'b2', status: 'inactive' as const };

describe('BrandsTableComponent', () => {
  let fixture: ComponentFixture<BrandsTableComponent>;
  let component: BrandsTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, BrandsTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(BrandsTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [active, inactive]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('renderiza nombre, slug, descripción y estado', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Coca-Cola');
    expect(text).toContain('coca-cola');
    expect(text).toContain('Bebidas gaseosas');
    expect(text).toContain('Activa');
    expect(text).toContain('Inactiva');
  });

  it('la columna de estado devuelve badge con etiqueta y tono correctos', () => {
    const statusColumn = component['columns'].find((c) => c.key === 'status');
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

  it('la columna de descripción muestra guion cuando no existe', () => {
    const descriptionColumn = component['columns'].find((c) => c.key === 'description');
    expect(descriptionColumn?.cell?.(active)).toBe('Bebidas gaseosas');
    expect(descriptionColumn?.cell?.({ ...active, description: undefined })).toBe('—');
  });

  it('reemite actionClicked con la fila seleccionada', () => {
    let emitted: TableActionEvent<Brand> | undefined;
    component.actionClicked.subscribe((e) => (emitted = e));

    component.onAction({ actionId: 'edit', row: active });
    expect(emitted).toEqual({ actionId: 'edit', row: active });
  });
});
