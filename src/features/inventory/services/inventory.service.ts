import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';
import type { PaginatedResponse } from '@core/models/paginated-response';

import type {
  AdjustPayload,
  Inventory,
  InventoryMovement,
  InventoryQuery,
  MinStockPayload,
} from '../models/inventory.model';

@Injectable({ providedIn: 'root' })
export class InventoryService extends BaseApiService {
  list(query: InventoryQuery): Observable<PaginatedResponse<Inventory[]>> {
    return this.getPaginated<Inventory[]>(API_ENDPOINTS.inventory, {
      params: this.toParams(query),
    });
  }

  getById(id: string): Observable<Inventory> {
    return this.get<Inventory>(`${API_ENDPOINTS.inventory}/${id}`);
  }

  getMovements(
    id: string,
    page: number,
    limit: number,
  ): Observable<PaginatedResponse<InventoryMovement[]>> {
    return this.getPaginated<InventoryMovement[]>(`${API_ENDPOINTS.inventory}/${id}/movements`, {
      params: { page, limit },
    });
  }

  adjust(id: string, payload: AdjustPayload): Observable<Inventory> {
    return this.post<Inventory>(`${API_ENDPOINTS.inventory}/${id}/adjust`, payload);
  }

  changeMinStock(id: string, payload: MinStockPayload): Observable<Inventory> {
    return this.patch<Inventory>(`${API_ENDPOINTS.inventory}/${id}/min-stock`, payload);
  }

  private toParams(query: InventoryQuery): Record<string, string | number> {
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
