import { Observable } from 'rxjs';

import type { PaginatedResponse } from '@core/models/paginated-response';

import type {
  CreateCustomerPayload,
  Customer,
  CustomerQuery,
  CustomerStats,
  CustomerStatus,
  UpdateCustomerPayload,
} from '../models/customer.model';

/**
 * Abstracción de la fuente de clientes (Ports & Adapters). La UI depende de este
 * contrato, no de una implementación concreta: `MockCustomerDataSource` permite
 * desarrollar el frontend sin backend y `ApiCustomerDataSource` consume el
 * backend Express. Se selecciona vía el token `CUSTOMER_DATA_SOURCE`.
 */
export abstract class CustomerDataSource {
  abstract list(query: CustomerQuery): Observable<PaginatedResponse<Customer[]>>;
  abstract findById(id: string): Observable<Customer>;
  abstract create(payload: CreateCustomerPayload): Observable<Customer>;
  abstract update(id: string, payload: UpdateCustomerPayload): Observable<Customer>;
  abstract updateStatus(id: string, status: CustomerStatus): Observable<Customer>;
  abstract stats(): Observable<CustomerStats>;
}
