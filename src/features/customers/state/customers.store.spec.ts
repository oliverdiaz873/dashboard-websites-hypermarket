import { TestBed } from '@angular/core/testing';
import { of, Subject, throwError } from 'rxjs';

import type { PaginatedResponse } from '@core/models/paginated-response';

import type { Customer, CustomerStats } from '../models/customer.model';
import { CustomersService } from '../services/customers.service';
import { CustomersStore } from './customers.store';

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

function pageOf(data: Customer[]): PaginatedResponse<Customer[]> {
  return { data, pagination: { page: 1, limit: 20, total: data.length, pages: 1 } };
}

const STATS: CustomerStats = { total: 1, active: 1, blocked: 0, pending: 0, newThisMonth: 1 };

describe('CustomersStore', () => {
  let store: InstanceType<typeof CustomersStore>;
  let customersService: {
    list: jest.Mock;
    findById: jest.Mock;
    stats: jest.Mock;
    update: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    window.localStorage.clear();
    customersService = {
      list: jest.fn(),
      findById: jest.fn(),
      stats: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: CustomersService, useValue: customersService }],
    });
    store = TestBed.inject(CustomersStore);
  });

  const tick = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

  it('carga la lista con los defaults y resuelve los estados de carga', async () => {
    customersService.list.mockReturnValue(of(pageOf([makeCustomer()])));

    const pending = store.load();
    expect(store.isLoading()).toBe(true);

    await pending;

    expect(store.isLoading()).toBe(false);
    expect(store.hasLoaded()).toBe(true);
    expect(store.customers().length).toBe(1);
  });

  it('marca error cuando la carga falla', async () => {
    customersService.list.mockReturnValue(throwError(() => new Error('boom')));

    await store.load();

    expect(store.hasLoaded()).toBe(true);
    expect(store.isLoading()).toBe(false);
    expect(store.error()).toBe('No se pudieron cargar los clientes.');
  });

  it('findById delega en el service para la fase 2', () => {
    const customer = makeCustomer();
    customersService.findById.mockReturnValue(of(customer));

    let result: Customer | undefined;
    store.findById('CUS-0001').subscribe((r) => (result = r));

    expect(customersService.findById).toHaveBeenCalledWith('CUS-0001');
    expect(result).toBe(customer);
  });

  it('cambiar búsqueda resetea la página a 1 y consulta con q', async () => {
    customersService.list.mockReturnValue(of(pageOf([makeCustomer()])));

    store.setPage(2);
    await tick();
    expect(store.page()).toBe(2);

    store.setSearch('ana');
    expect(store.page()).toBe(1);
    expect(store.search()).toBe('ana');
    await tick();

    expect(customersService.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ q: 'ana', page: 1 }),
    );
  });

  it('cambiar estado (filtro) dispara la consulta con status', async () => {
    customersService.list.mockReturnValue(of(pageOf([])));

    store.setStatus('blocked');
    await tick();

    expect(customersService.list).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'blocked', page: 1 }),
    );
  });

  it('descarta la respuesta obsoleta cuando llega una búsqueda más nueva', async () => {
    const first = new Subject<PaginatedResponse<Customer[]>>();
    const second = new Subject<PaginatedResponse<Customer[]>>();
    customersService.list.mockReturnValueOnce(first).mockReturnValueOnce(second);

    store.setSearch('a');
    store.setSearch('b');

    first.next(pageOf([makeCustomer({ id: 'CUS-OLD' })]));
    first.complete();
    await tick();

    expect(store.customers()).toEqual([]);
    expect(store.isLoading()).toBe(true);

    second.next(pageOf([makeCustomer({ id: 'CUS-NEW' })]));
    second.complete();
    await tick();

    expect(store.customers()[0]?.id).toBe('CUS-NEW');
    expect(store.isLoading()).toBe(false);
  });

  it('actualiza un cliente y recarga el listado', async () => {
    customersService.update.mockReturnValue(of(makeCustomer({ phone: '(809) 555-9999' })));
    customersService.list.mockReturnValue(of(pageOf([makeCustomer({ phone: '(809) 555-9999' })])));

    const updated = await store.updateCustomer('CUS-0001', { phone: '(809) 555-9999' });
    await tick();

    expect(updated.phone).toBe('(809) 555-9999');
    expect(store.customers()[0]?.phone).toBe('(809) 555-9999');
  });

  it('toggleStatus bloquea un cliente activo y refresca los stats', async () => {
    customersService.updateStatus.mockReturnValue(of(makeCustomer({ status: 'blocked' })));
    customersService.list.mockReturnValue(of(pageOf([makeCustomer({ status: 'blocked' })])));
    customersService.stats.mockReturnValue(of(STATS));

    const customer = makeCustomer({ status: 'active' });
    const pending = store.toggleStatus(customer);

    expect(customersService.updateStatus).toHaveBeenCalledWith('CUS-0001', 'blocked');
    await pending;
    await tick();

    expect(store.customers()[0]?.status).toBe('blocked');
    expect(customersService.stats).toHaveBeenCalled();
  });

  it('toggleStatus desbloquea un cliente bloqueado', () => {
    customersService.updateStatus.mockReturnValue(of(makeCustomer({ status: 'active' })));
    customersService.list.mockReturnValue(of(pageOf([makeCustomer()])));
    customersService.stats.mockReturnValue(of(STATS));

    const customer = makeCustomer({ status: 'blocked' });
    void store.toggleStatus(customer);

    expect(customersService.updateStatus).toHaveBeenCalledWith('CUS-0001', 'active');
  });
});
