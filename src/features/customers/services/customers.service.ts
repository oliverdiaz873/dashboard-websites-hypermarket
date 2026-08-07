import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import type { PaginatedResponse } from '@core/models/paginated-response';

import { CUSTOMER_DATA_SOURCE } from '../data/customer-data-source.token';
import type {
  CreateCustomerPayload,
  Customer,
  CustomerQuery,
  CustomerStats,
  CustomerStatus,
  UpdateCustomerPayload,
} from '../models/customer.model';

/**
 * Facade de clientes. La UI depende de este service (no de la fuente concreta);
 * la selección de implementación vive en `CUSTOMER_DATA_SOURCE`. Aquí también se
 * dejan preparados los puntos de emisión de auditoría (fase 2).
 */
@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly dataSource = inject(CUSTOMER_DATA_SOURCE);

  list(query: CustomerQuery): Observable<PaginatedResponse<Customer[]>> {
    return this.dataSource.list(query);
  }

  findById(id: string): Observable<Customer> {
    return this.dataSource.findById(id);
  }

  create(payload: CreateCustomerPayload): Observable<Customer> {
    // Auditoría (fase 2): emitir ADMIN_CREATE_CUSTOMER con la sesión del admin.
    return this.dataSource.create(payload);
  }

  update(id: string, payload: UpdateCustomerPayload): Observable<Customer> {
    // Auditoría (fase 2): emitir ADMIN_UPDATE_CUSTOMER con los campos cambiados.
    return this.dataSource.update(id, payload);
  }

  updateStatus(id: string, status: CustomerStatus): Observable<Customer> {
    // Auditoría (fase 2): ADMIN_BLOCK_CUSTOMER / ADMIN_UNBLOCK_CUSTOMER según `status`.
    return this.dataSource.updateStatus(id, status);
  }

  stats(): Observable<CustomerStats> {
    return this.dataSource.stats();
  }
}
