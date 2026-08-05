import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { AuditLogPageComponent } from './audit-log-page.component';
import type { AuditLog } from '../../models/audit-log.model';
import type { TableActionEvent } from '@shared/models/table.model';

const auditLog: AuditLog = {
  id: 'log1',
  userId: 'u1',
  userName: 'Oliver Diaz',
  action: 'LOGIN',
  entity: 'auth',
  success: true,
  createdAt: new Date('2026-01-15T00:00:00.000Z'),
};

describe('AuditLogPageComponent', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AuditLogPageComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  it('muestra el encabezado de auditoría y dispara la carga inicial', () => {
    const fixture = TestBed.createComponent(AuditLogPageComponent);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Auditoría');
  });

  it('onAction con detalle abre el diálogo de detalle', () => {
    const fixture = TestBed.createComponent(AuditLogPageComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const openSpy = jest.spyOn(component as never, 'openDetail');
    component.onAction({ actionId: 'detail', row: auditLog } as TableActionEvent<AuditLog>);

    expect(openSpy).toHaveBeenCalledWith(auditLog);
  });
});
