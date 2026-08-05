import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AuditLogToolbarComponent } from './audit-log-toolbar.component';
import { AuditLogStore } from '../../state/audit-log.store';

describe('AuditLogToolbarComponent', () => {
  let fixture: ComponentFixture<AuditLogToolbarComponent>;
  let component: AuditLogToolbarComponent;
  let store: {
    search(): string;
    action(): string;
    entity(): string;
    from(): string;
    to(): string;
    total(): number;
    setSearch: jest.Mock;
    setAction: jest.Mock;
    setEntity: jest.Mock;
    setDateRange: jest.Mock;
    clearFilters: jest.Mock;
    refresh: jest.Mock;
  };

  beforeEach(async () => {
    store = {
      search: () => '',
      action: () => '',
      entity: () => '',
      from: () => '',
      to: () => '',
      total: () => 0,
      setSearch: jest.fn(),
      setAction: jest.fn(),
      setEntity: jest.fn(),
      setDateRange: jest.fn(),
      clearFilters: jest.fn(),
      refresh: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, AuditLogToolbarComponent],
      providers: [{ provide: AuditLogStore, useValue: store }],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditLogToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('expone las opciones de acción y entidad derivadas de los enums', () => {
    expect(component['actionOptions'].map((o) => o.value)).toContain('LOGIN');
    expect(component['actionOptions'].map((o) => o.value)).toContain('CANCEL_ORDER');
    expect(component['entityOptions'].map((o) => o.value)).toContain('inventory');
    expect(component['entityOptions'].map((o) => o.value)).toContain('order');
  });

  it('delega la búsqueda al store', () => {
    component.onSearch('login');
    expect(store.setSearch).toHaveBeenCalledWith('login');
  });

  it('delega la acción al store', () => {
    component.onAction('LOGIN');
    expect(store.setAction).toHaveBeenCalledWith('LOGIN');
  });

  it('delega la entidad al store', () => {
    component.onEntity('inventory');
    expect(store.setEntity).toHaveBeenCalledWith('inventory');
  });

  it('actualiza el límite inferior manteniendo el to', () => {
    component.onFrom({ target: { value: '2026-01-01' } } as unknown as Event);
    expect(store.setDateRange).toHaveBeenCalledWith('2026-01-01', '');
  });

  it('actualiza el límite superior manteniendo el from', () => {
    store.from = () => '2026-01-01';
    component.onTo({ target: { value: '2026-01-31' } } as unknown as Event);
    expect(store.setDateRange).toHaveBeenCalledWith('2026-01-01', '2026-01-31');
  });
});
