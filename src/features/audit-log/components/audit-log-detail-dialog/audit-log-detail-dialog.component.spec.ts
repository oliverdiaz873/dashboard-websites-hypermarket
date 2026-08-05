import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import {
  AuditLogDetailDialogComponent,
  type AuditLogDetailDialogData,
} from './audit-log-detail-dialog.component';
import type { AuditLog } from '../../models/audit-log.model';

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

describe('AuditLogDetailDialogComponent', () => {
  let fixture: ComponentFixture<AuditLogDetailDialogComponent>;
  let component: AuditLogDetailDialogComponent;
  let dialogRef: { close: jest.Mock };

  beforeEach(async () => {
    dialogRef = { close: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AuditLogDetailDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { log: auditLog } as AuditLogDetailDialogData },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLogDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('traduce la acción y la entidad a sus etiquetas', () => {
    expect(component.actionLabel()).toBe('Ajuste de inventario');
    expect(component.entityLabel()).toBe('Inventario');
  });

  it('prettifica details como JSON indentado', () => {
    expect(component.detailsJson()).toBe('{\n  "operation": "increase",\n  "quantity": 5\n}');
  });

  it('no genera JSON cuando details está vacío', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AuditLogDetailDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: { log: { ...auditLog, details: undefined } } as AuditLogDetailDialogData,
        },
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
      ],
    }).compileComponents();

    const dialogFixture = TestBed.createComponent(AuditLogDetailDialogComponent);
    dialogFixture.detectChanges();
    const dialogComponent = dialogFixture.componentInstance;

    expect(dialogComponent.detailsJson()).toBeNull();
  });

  it('formatea createdAt a string local', () => {
    expect(component.createdAt()).toContain('2026');
  });

  it('close cierra el diálogo', () => {
    component.close();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
