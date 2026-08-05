import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AuditLogTableComponent } from './audit-log-table.component';
import type { AuditLog } from '../../models/audit-log.model';
import type { TableActionEvent } from '@shared/models/table.model';

const auditLog: AuditLog = {
  id: 'log1',
  userId: 'u1',
  userName: 'Oliver Diaz',
  action: 'INVENTORY_ADJUST',
  entity: 'inventory',
  entityId: 'prod_1',
  success: true,
  details: { operation: 'increase', quantity: 5 },
  createdAt: new Date('2026-01-15T00:00:00.000Z'),
};

describe('AuditLogTableComponent', () => {
  let fixture: ComponentFixture<AuditLogTableComponent>;
  let component: AuditLogTableComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AuditLogTableComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(AuditLogTableComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('items', [auditLog]);
    fixture.componentRef.setInput('loading', false);
    fixture.detectChanges();
  });

  it('renderiza la acción, el usuario y la entidad', () => {
    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Ajuste de inventario');
    expect(text).toContain('Oliver Diaz');
    expect(text).toContain('Inventario');
  });

  it('la columna de acción traduce la acción a su etiqueta', () => {
    const actionColumn = component['columns'].find((c) => c.key === 'action');
    expect(actionColumn?.cell?.(auditLog)).toBe('Ajuste de inventario');
  });

  it('la columna de usuario muestra userName o userId como fallback', () => {
    const userColumn = component['columns'].find((c) => c.key === 'userName');
    expect(userColumn?.cell?.(auditLog)).toBe('Oliver Diaz');
    expect(userColumn?.cell?.({ ...auditLog, userName: undefined, userId: 'u42' })).toBe('u42');
  });

  it('la columna de detalle aplana el JSON y lo trunca', () => {
    const detailColumn = component['columns'].find((c) => c.key === 'details');
    const snippet = detailColumn?.cell?.(auditLog) ?? '';
    expect(snippet).toContain('"increase"');
    expect(snippet.length).toBeLessThanOrEqual(41);
  });

  it('ofrece únicamente la acción de detalle', () => {
    expect(component['actions'].map((a) => a.id)).toEqual(['detail']);
  });

  it('reemite actionClicked con la fila seleccionada', () => {
    let emitted: TableActionEvent<AuditLog> | undefined;
    component.actionClicked.subscribe((e) => (emitted = e));

    component.onAction({ actionId: 'detail', row: auditLog });
    expect(emitted).toEqual({ actionId: 'detail', row: auditLog });
  });
});
