import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';
import type { PaginatedResponse } from '@core/models/paginated-response';

import type { Product } from '../models/product.model';
import type { ProductsQuery } from '../models/products-query';

@Injectable({ providedIn: 'root' })
export class ProductsService extends BaseApiService {
  list(query: ProductsQuery): Observable<PaginatedResponse<Product[]>> {
    return this.getPaginated<Product[]>(API_ENDPOINTS.products, { params: this.toParams(query) });
  }

  private toParams(query: ProductsQuery): Record<string, string | number> {
    const params: Record<string, string | number> = {
      page: query.page,
      limit: query.limit,
    };
    if (query.q) params['q'] = query.q;
    if (query.category) params['category'] = query.category;
    if (query.brand) params['brand'] = query.brand;
    if (query.status) params['status'] = query.status;
    if (query.sortBy) params['sortBy'] = query.sortBy;
    if (query.sortOrder) params['sortOrder'] = query.sortOrder;
    return params;
  }
}
