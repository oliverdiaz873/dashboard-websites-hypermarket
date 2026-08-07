import { Injectable } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

import type { PaginatedResponse } from '@core/models/paginated-response';

import type {
  CreateCustomerPayload,
  Customer,
  CustomerAddress,
  CustomerQuery,
  CustomerStats,
  CustomerStatus,
  UpdateCustomerPayload,
} from '../models/customer.model';
import type { CustomerDataSource } from './customer-data-source';

const DEFAULT_DELAY_MS = 320;

/** Fecha relativa a hoy para que los datos del mock nunca queden desactualizados. */
function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function seedCustomers(): Customer[] {
  return [
    {
      id: 'CUS-0001',
      name: 'Ana María Rodríguez',
      email: 'anamaria.rodriguez@gmail.com',
      phone: '(809) 555-0101',
      address: {
        street: 'Av. 27 de Febrero 123',
        city: 'Santo Domingo',
        country: 'República Dominicana',
      },
      status: 'active',
      createdAt: daysAgo(267),
      updatedAt: daysAgo(10),
    },
    {
      id: 'CUS-0002',
      name: 'Carlos Alberto Pérez',
      email: 'carlos.perez@hotmail.com',
      phone: '(809) 555-0102',
      status: 'active',
      createdAt: daysAgo(214),
      updatedAt: daysAgo(4),
    },
    {
      id: 'CUS-0003',
      name: 'Juana De Los Santos',
      email: 'juana.dls@yahoo.com',
      phone: '(829) 555-0103',
      address: { street: 'Calle Duarte 45', city: 'Santiago', country: 'República Dominicana' },
      status: 'blocked',
      createdAt: daysAgo(319),
      updatedAt: daysAgo(60),
    },
    {
      id: 'CUS-0004',
      name: 'Miguel Ángel Peña',
      email: 'miguel.pena@gmail.com',
      phone: '(809) 555-0104',
      status: 'active',
      createdAt: daysAgo(145),
      updatedAt: daysAgo(2),
    },
    {
      id: 'CUS-0005',
      name: 'Rosa Elena Gómez',
      email: 'rosa.gomez@outlook.com',
      phone: '(849) 555-0105',
      status: 'pending',
      createdAt: daysAgo(3),
      updatedAt: daysAgo(3),
    },
    {
      id: 'CUS-0006',
      name: 'José Ramón Hernández',
      email: 'jose.hernandez@gmail.com',
      phone: '(809) 555-0106',
      address: {
        street: 'Av. Independencia 88',
        city: 'Santo Domingo',
        country: 'República Dominicana',
      },
      status: 'active',
      createdAt: daysAgo(169),
      updatedAt: daysAgo(1),
    },
    {
      id: 'CUS-0007',
      name: 'Luisa Fernanda Núñez',
      email: 'luisa.nunez@gmail.com',
      phone: '(829) 555-0107',
      status: 'active',
      createdAt: daysAgo(246),
      updatedAt: daysAgo(7),
    },
    {
      id: 'CUS-0008',
      name: 'Pedro Antonio Reyes',
      email: 'pedro.reyes@hotmail.com',
      phone: '(809) 555-0108',
      address: { street: 'Calle El Sol 12', city: 'La Vega', country: 'República Dominicana' },
      status: 'blocked',
      createdAt: daysAgo(121),
      updatedAt: daysAgo(35),
    },
    {
      id: 'CUS-0009',
      name: 'Carmen Gloria Sánchez',
      email: 'carmen.sanchez@gmail.com',
      phone: '(849) 555-0109',
      status: 'active',
      createdAt: daysAgo(82),
      updatedAt: daysAgo(6),
    },
    {
      id: 'CUS-0010',
      name: 'Rafael Domingo Jiménez',
      email: 'rafael.jimenez@yahoo.com',
      phone: '(809) 555-0110',
      address: { street: 'Av. Las Palmas 7', city: 'Punta Cana', country: 'República Dominicana' },
      status: 'pending',
      createdAt: daysAgo(5),
      updatedAt: daysAgo(5),
    },
    {
      id: 'CUS-0011',
      name: 'María Teresa Mota',
      email: 'maria.mota@gmail.com',
      phone: '(829) 555-0111',
      status: 'active',
      createdAt: daysAgo(46),
      updatedAt: daysAgo(3),
    },
    {
      id: 'CUS-0012',
      name: 'Francisco Javier Cáceres',
      email: 'francisco.caceres@gmail.com',
      phone: '(809) 555-0112',
      address: {
        street: 'Calle 5ta 90',
        city: 'San Pedro de Macorís',
        country: 'República Dominicana',
      },
      status: 'active',
      createdAt: daysAgo(188),
      updatedAt: daysAgo(9),
    },
  ];
}

/**
 * Implementación en memoria del contrato de clientes. Muta el arreglo local
 * (create/update/updateStatus) y emula latencia de red para que los skeletons y
 * estados de carga se comporten como con el backend real.
 */
@Injectable()
export class MockCustomerDataSource implements CustomerDataSource {
  private customers: Customer[];
  /** Latencia simulada en ms. Mutable para que los tests puedan desactivarla. */
  delayMs: number = DEFAULT_DELAY_MS;

  constructor() {
    this.customers = seedCustomers();
  }

  list(query: CustomerQuery): Observable<PaginatedResponse<Customer[]>> {
    return this.respond(() => this.applyQuery(query));
  }

  findById(id: string): Observable<Customer> {
    return this.respond(() => this.requireById(id));
  }

  create(payload: CreateCustomerPayload): Observable<Customer> {
    return this.respond(() => {
      const now = new Date();
      const customer: Customer = {
        id: `CUS-${(this.customers.length + 1).toString().padStart(4, '0')}`,
        name: payload.name,
        email: payload.email,
        phone: payload.phone ?? '',
        address: payload.address,
        status: payload.status ?? 'active',
        createdAt: now,
        updatedAt: now,
      };
      this.customers = [customer, ...this.customers];
      return customer;
    });
  }

  update(id: string, payload: UpdateCustomerPayload): Observable<Customer> {
    return this.respond(() => {
      const current = this.requireById(id);
      const address: CustomerAddress | undefined =
        payload.address !== undefined
          ? { ...current.address, ...payload.address }
          : current.address;
      const updated: Customer = { ...current, ...payload, address, updatedAt: new Date() };
      this.customers = this.customers.map((c) => (c.id === id ? updated : c));
      return updated;
    });
  }

  updateStatus(id: string, status: CustomerStatus): Observable<Customer> {
    return this.respond(() => {
      const current = this.requireById(id);
      const updated: Customer = { ...current, status, updatedAt: new Date() };
      this.customers = this.customers.map((c) => (c.id === id ? updated : c));
      return updated;
    });
  }

  stats(): Observable<CustomerStats> {
    return this.respond(() => {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      return {
        total: this.customers.length,
        active: this.customers.filter((c) => c.status === 'active').length,
        blocked: this.customers.filter((c) => c.status === 'blocked').length,
        pending: this.customers.filter((c) => c.status === 'pending').length,
        newThisMonth: this.customers.filter((c) => c.createdAt >= monthStart).length,
      };
    });
  }

  private applyQuery(query: CustomerQuery): PaginatedResponse<Customer[]> {
    const needle = query.q?.trim().toLocaleLowerCase();
    let filtered = [...this.customers];

    if (needle) {
      filtered = filtered.filter((c) =>
        [c.name, c.email, c.phone].some((value) => value.toLocaleLowerCase().includes(needle)),
      );
    }
    if (query.status) {
      filtered = filtered.filter((c) => c.status === query.status);
    }

    const sortBy = query.sortBy ?? 'createdAt';
    const direction = query.sortOrder ?? 'desc';
    filtered.sort((a, b) => compareField(a[sortBy], b[sortBy], direction));

    const page = Math.max(1, query.page);
    const limit = Math.max(1, query.limit);
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total: filtered.length,
        pages: Math.max(1, Math.ceil(filtered.length / limit)),
      },
    };
  }

  private requireById(id: string): Customer {
    const customer = this.customers.find((c) => c.id === id);
    if (!customer) throw new Error(`Cliente no encontrado: ${id}`);
    return customer;
  }

  private respond<T>(produce: () => T): Observable<T> {
    return of(null).pipe(
      delay(this.delayMs),
      map(() => produce()),
    );
  }
}

function compareField(
  left: string | Date,
  right: string | Date,
  direction: 'asc' | 'desc',
): number {
  let result: number;
  if (left instanceof Date && right instanceof Date) {
    result = left.getTime() - right.getTime();
  } else {
    result = String(left).localeCompare(String(right), 'es', { sensitivity: 'base' });
  }
  return direction === 'asc' ? result : -result;
}
