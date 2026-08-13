import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';

import type { Customer, CustomerStats } from '../../models/customer.model';
import { CustomersService } from '../../services/customers.service';
import { CustomersPageComponent } from './customers-page.component';
import type { TableActionEvent } from '@shared/models/table.model';

@Component({ template: '', standalone: true })
class DetailRouteStubComponent {}

function makeCustomer(overrides: Partial<Customer> = {}): Customer {
  return {
    id: 'CUS-0001',
    name: 'Ana María Rodríguez',
    email: 'anamaria.rodriguez@gmail.com',
    phone: '(809) 555-0101',
    status: 'active',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

const STATS: CustomerStats = { total: 12, active: 8, blocked: 2, pending: 2, newThisMonth: 2 };

describe('CustomersPageComponent', () => {
  let customersService: {
    list: jest.Mock;
    stats: jest.Mock;
    update: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(async () => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    customersService = {
      list: jest.fn(),
      stats: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };
    customersService.list.mockReturnValue(
      of({
        data: [makeCustomer()],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 },
      }),
    );
    customersService.stats.mockReturnValue(of(STATS));

    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CustomersPageComponent],
      providers: [
        provideRouter([{ path: 'customers/:id', component: DetailRouteStubComponent }]),
        { provide: CustomersService, useValue: customersService },
      ],
    }).compileComponents();
  });

  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  it('muestra el encabezado, los KPIs y la fila del cliente', async () => {
    const fixture = TestBed.createComponent(CustomersPageComponent);
    fixture.detectChanges();
    await tick();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Clientes');
    expect(text).toContain('Total clientes');
    expect(text).toContain('Activos');
    expect(text).toContain('Ana María Rodríguez');
    expect(text).toContain('anamaria.rodriguez@gmail.com');
  });

  it('muestra el estado de error con botón Reintentar si la primera carga falla', async () => {
    customersService.list.mockReturnValue(throwError(() => new Error('boom')));
    customersService.stats.mockReturnValue(of(STATS));

    const fixture = TestBed.createComponent(CustomersPageComponent);
    fixture.detectChanges();
    await tick();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No se pudieron cargar los clientes');
    expect(text).toContain('Reintentar');
  });

  it('onAction edit abre el formulario con el cliente', () => {
    const fixture = TestBed.createComponent(CustomersPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const spy = jest.spyOn(component as never, 'openFormDialog');
    const customer = makeCustomer();
    component.onAction({ actionId: 'edit', row: customer } as TableActionEvent<Customer>);

    expect(spy).toHaveBeenCalledWith(customer);
  });

  it('onAction block pide confirmación de bloqueo', () => {
    const fixture = TestBed.createComponent(CustomersPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const spy = jest.spyOn(component as never, 'requestToggleStatus');
    const customer = makeCustomer({ status: 'active' });
    component.onAction({ actionId: 'block', row: customer } as TableActionEvent<Customer>);

    expect(spy).toHaveBeenCalledWith(customer);
  });

  it('onAction unblock pide confirmación de desbloqueo', () => {
    const fixture = TestBed.createComponent(CustomersPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const spy = jest.spyOn(component as never, 'requestToggleStatus');
    const customer = makeCustomer({ status: 'blocked' });
    component.onAction({ actionId: 'unblock', row: customer } as TableActionEvent<Customer>);

    expect(spy).toHaveBeenCalledWith(customer);
  });

  it('onAction view navega al detalle del cliente', async () => {
    const fixture = TestBed.createComponent(CustomersPageComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    const navigate = jest.spyOn(component['router'], 'navigate');
    component.onAction({ actionId: 'view', row: makeCustomer() } as TableActionEvent<Customer>);
    await tick();

    expect(navigate).toHaveBeenCalledWith(['/customers', 'CUS-0001']);
  });
});
