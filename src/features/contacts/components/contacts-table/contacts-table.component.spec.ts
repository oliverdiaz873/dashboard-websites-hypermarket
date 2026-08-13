import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ContactsTableComponent } from './contacts-table.component';
import type { ContactMessage } from '../../models/contact-message.model';
import type { TableActionEvent } from '@shared/models/table.model';

const pending: ContactMessage = {
  id: 'cm1',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '(809) 555-5555',
  message: 'Consulta sobre un pedido',
  status: 'pending',
  createdAt: '2026-01-15T00:00:00.000Z',
  updatedAt: '2026-01-15T00:00:00.000Z',
};

const read = { ...pending, id: 'cm2', status: 'read' as const };
const answered = { ...pending, id: 'cm3', status: 'answered' as const };

describe('ContactsTableComponent', () => {
  let fixture: ComponentFixture<ContactsTableComponent>;
  let component: ContactsTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, ContactsTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ContactsTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [pending, read, answered]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('renderiza nombre, correo y estado', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Juan Pérez');
    expect(text).toContain('juan@example.com');
    expect(text).toContain('Pendiente');
    expect(text).toContain('Respondido');
  });

  it('la columna de estado devuelve badge con la etiqueta y el tono correctos', () => {
    const statusColumn = component['columns'].find((c) => c.key === 'status');
    expect(statusColumn?.badge?.(pending)).toEqual({ label: 'Pendiente', tone: 'low' });
    expect(statusColumn?.badge?.(read)).toEqual({ label: 'Leído', tone: 'info' });
    expect(statusColumn?.badge?.(answered)).toEqual({ label: 'Respondido', tone: 'ok' });
  });

  it('la columna de teléfono muestra guion cuando no existe', () => {
    const phoneColumn = component['columns'].find((c) => c.key === 'phone');
    expect(phoneColumn?.cell?.(pending)).toBe('(809) 555-5555');
    expect(phoneColumn?.cell?.({ ...pending, phone: undefined })).toBe('—');
  });

  it('las acciones de estado son condicionales al status (transiciones del backend)', () => {
    const readAction = component['actions'].find((a) => a.id === 'read');
    const answeredAction = component['actions'].find((a) => a.id === 'answered');

    expect(readAction?.visible?.(pending)).toBe(true);
    expect(readAction?.visible?.(read)).toBe(false);
    expect(readAction?.visible?.(answered)).toBe(false);

    expect(answeredAction?.visible?.(pending)).toBe(true);
    expect(answeredAction?.visible?.(read)).toBe(true);
    expect(answeredAction?.visible?.(answered)).toBe(false);
  });

  it('reemite actionClicked con la fila seleccionada', () => {
    let emitted: TableActionEvent<ContactMessage> | undefined;
    component.actionClicked.subscribe((e) => (emitted = e));

    component.onAction({ actionId: 'delete', row: pending });
    expect(emitted).toEqual({ actionId: 'delete', row: pending });
  });
});
