import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import type { PaginatedResponse } from '@core/models/paginated-response';

import { CUSTOMER_DATA_SOURCE } from '../data/customer-data-source.token';
import type { Customer } from '../models/customer.model';
import { CustomersService } from './customers.service';

function makeCustomer(): Customer {
  return {
    id: 'CUS-0001',
    name: 'Ana María Rodríguez',
    email: 'anamaria.rodriguez@gmail.com',
    phone: '(809) 555-0101',
    status: 'active',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
  };
}

describe('CustomersService', () => {
  let service: CustomersService;
  let dataSource: {
    list: jest.Mock;
    findById: jest.Mock;
    update: jest.Mock;
    updateStatus: jest.Mock;
    stats: jest.Mock;
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
    dataSource = {
      list: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      updateStatus: jest.fn(),
      stats: jest.fn(),
    };
    TestBed.configureTestingModule({
      providers: [{ provide: CUSTOMER_DATA_SOURCE, useValue: dataSource }],
    });
    service = TestBed.inject(CustomersService);
  });

  it('delega list en la fuente con la query', () => {
    const page: PaginatedResponse<Customer[]> = {
      data: [makeCustomer()],
      pagination: { page: 1, limit: 20, total: 1, pages: 1 },
    };
    dataSource.list.mockReturnValue(of(page));

    let result: PaginatedResponse<Customer[]> | undefined;
    service.list({ page: 1, limit: 20 }).subscribe((r) => (result = r));

    expect(dataSource.list).toHaveBeenCalledWith({ page: 1, limit: 20 });
    expect(result).toBe(page);
  });

  it('delega findById', () => {
    const customer = makeCustomer();
    dataSource.findById.mockReturnValue(of(customer));

    let result: Customer | undefined;
    service.findById('CUS-0001').subscribe((r) => (result = r));

    expect(dataSource.findById).toHaveBeenCalledWith('CUS-0001');
    expect(result).toBe(customer);
  });

  it('delega update con el payload parcial', () => {
    const payload = { phone: '(809) 555-9999' };
    dataSource.update.mockReturnValue(of(makeCustomer()));

    service.update('CUS-0001', payload).subscribe();

    expect(dataSource.update).toHaveBeenCalledWith('CUS-0001', payload);
  });

  it('delega updateStatus con el estado', () => {
    dataSource.updateStatus.mockReturnValue(of(makeCustomer()));

    service.updateStatus('CUS-0001', 'blocked').subscribe();

    expect(dataSource.updateStatus).toHaveBeenCalledWith('CUS-0001', 'blocked');
  });

  it('delega stats', () => {
    const stats = { total: 1, active: 1, blocked: 0, pending: 0, newThisMonth: 0 };
    dataSource.stats.mockReturnValue(of(stats));

    let result: typeof stats | undefined;
    service.stats().subscribe((r) => (result = r));

    expect(dataSource.stats).toHaveBeenCalledTimes(1);
    expect(result).toBe(stats);
  });
});
