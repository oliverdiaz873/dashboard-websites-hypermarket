import { Observable } from 'rxjs';

import type { PaginatedResponse } from '@core/models/paginated-response';

import type {
  Customer,
  CustomerQuery,
  CustomerStats,
  CustomerStatus,
  UpdateCustomerPayload,
} from '../models/customer.model';

/**
 * Abstracción de la fuente de clientes (Ports & Adapters). La UI depende de este
 * contrato, no de una implementación concreta: `ApiCustomerDataSource` consume
 * el backend Express. Se selecciona vía el token `CUSTOMER_DATA_SOURCE`.
 * Los clientes se crean vía el registro del storefront (role: customer); el
 * dashboard solo gestiona (lista, detalle, edición y estado de cuenta).
 */
export abstract class CustomerDataSource {
  abstract list(query: CustomerQuery): Observable<PaginatedResponse<Customer[]>>;
  abstract findById(id: string): Observable<Customer>;
  abstract update(id: string, payload: UpdateCustomerPayload): Observable<Customer>;
  abstract updateStatus(id: string, status: CustomerStatus): Observable<Customer>;
  abstract stats(): Observable<CustomerStats>;
}
