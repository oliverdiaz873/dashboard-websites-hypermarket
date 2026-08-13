import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import type { TableAction } from '@shared/models/table.model';

import type { Customer } from '../../models/customer.model';
import { CustomersTableComponent } from './customers-table.component';

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

function actionsOf(component: CustomersTableComponent): TableAction<Customer>[] {
  return (component as unknown as { actions: TableAction<Customer>[] }).actions;
}

describe('CustomersTableComponent', () => {
  async function setup() {
    await TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, CustomersTableComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(CustomersTableComponent);
    fixture.detectChanges();
    return { fixture };
  }

  it('define la columna de cliente con template de celda (avatar + nombre)', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;
    const nameColumn = (
      component as unknown as { columns: { key: string; cellTemplate?: unknown }[] }
    ).columns.find((c) => c.key === 'name');

    expect(nameColumn?.cellTemplate).toBeTruthy();
  });

  it('ofrece la acción ver detalle para cualquier cliente', async () => {
    const { fixture } = await setup();
    const view = actionsOf(fixture.componentInstance).find((a) => a.id === 'view');

    expect(view).toBeDefined();
    expect(view?.label).toBe('Ver detalle');
    expect(view?.icon).toBe('visibility');
  });

  it('ofrece bloquear solo a clientes activos', async () => {
    const { fixture } = await setup();
    const actions = actionsOf(fixture.componentInstance);
    const block = actions.find((a) => a.id === 'block');
    const unblock = actions.find((a) => a.id === 'unblock');

    expect(block?.visible?.(makeCustomer({ status: 'active' }))).toBe(true);
    expect(block?.visible?.(makeCustomer({ status: 'blocked' }))).toBe(false);
    expect(block?.visible?.(makeCustomer({ status: 'pending' }))).toBe(false);
    expect(unblock?.visible?.(makeCustomer({ status: 'blocked' }))).toBe(true);
    expect(unblock?.visible?.(makeCustomer({ status: 'active' }))).toBe(false);
  });

  it('emite actionClicked al interactuar con una acción', async () => {
    const { fixture } = await setup();
    const component = fixture.componentInstance;
    const customer = makeCustomer();

    let emitted: { actionId: string; row: Customer } | undefined;
    component.actionClicked.subscribe((e) => (emitted = e));

    component.onAction({ actionId: 'block', row: customer });

    expect(emitted).toEqual({ actionId: 'block', row: customer });
  });
});
