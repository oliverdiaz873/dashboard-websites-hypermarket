import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_ENDPOINTS } from '@core/http/endpoints';
import { BaseApiService } from '@core/http/services/base-api.service';
import type { PaginatedResponse } from '@core/models/paginated-response';

import type {
  Customer,
  CustomerQuery,
  CustomerStats,
  CustomerStatus,
  UpdateCustomerPayload,
} from '../models/customer.model';
import type { CustomerDataSource } from './customer-data-source';

/**
 * Adaptador HTTP del contrato de clientes (GET/PATCH /admin/customers).
 * Se activa registrando `ApiCustomerDataSource` en `CUSTOMER_DATA_SOURCE`.
 */
@Injectable()
export class ApiCustomerDataSource extends BaseApiService implements CustomerDataSource {
  list(query: CustomerQuery): Observable<PaginatedResponse<Customer[]>> {
    return this.getPaginated<Customer[]>(API_ENDPOINTS.customers, {
      params: this.toParams(query),
    });
  }

  findById(id: string): Observable<Customer> {
    return this.get<Customer>(`${API_ENDPOINTS.customers}/${id}`);
  }

  update(id: string, payload: UpdateCustomerPayload): Observable<Customer> {
    return this.patch<Customer>(`${API_ENDPOINTS.customers}/${id}`, payload);
  }

  updateStatus(id: string, status: CustomerStatus): Observable<Customer> {
    return this.patch<Customer>(`${API_ENDPOINTS.customers}/${id}/status`, { status });
  }

  stats(): Observable<CustomerStats> {
    return this.get<CustomerStats>(`${API_ENDPOINTS.customers}/stats`);
  }

  private toParams(query: CustomerQuery): Record<string, string | number> {
    const params: Record<string, string | number> = {
      page: query.page,
      limit: query.limit,
    };
    if (query.q) params['q'] = query.q;
    if (query.status) params['status'] = query.status;
    if (query.sortBy) params['sortBy'] = query.sortBy;
    if (query.sortOrder) params['sortOrder'] = query.sortOrder;
    return params;
  }
}
