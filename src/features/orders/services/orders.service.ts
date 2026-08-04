import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';
import type { PaginatedResponse } from '@core/models/paginated-response';

import type { AdminOrder, ChangeOrderStatusPayload, OrderQuery } from '../models/order.model';

@Injectable({ providedIn: 'root' })
export class OrdersService extends BaseApiService {
  list(query: OrderQuery): Observable<PaginatedResponse<AdminOrder[]>> {
    return this.getPaginated<AdminOrder[]>(API_ENDPOINTS.adminOrders, {
      params: this.toParams(query),
    });
  }

  getById(id: string): Observable<AdminOrder> {
    return this.get<AdminOrder>(`${API_ENDPOINTS.adminOrders}/${id}`);
  }

  changeStatus(id: string, payload: ChangeOrderStatusPayload): Observable<AdminOrder> {
    return this.patch<AdminOrder>(`${API_ENDPOINTS.adminOrders}/${id}/status`, payload);
  }

  private toParams(query: OrderQuery): Record<string, string | number> {
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
