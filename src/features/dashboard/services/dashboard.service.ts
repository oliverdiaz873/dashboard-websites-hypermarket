import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';

import type {
  CategorySalesStat,
  DashboardKpis,
  InventorySummary,
  RevenueTrendPoint,
  StatsOrdersByStatus,
  StatsQuery,
  TopProductStat,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseApiService {
  private readonly base = API_ENDPOINTS.stats;

  getDashboard(days?: number): Observable<DashboardKpis> {
    const params: Record<string, string | number> = {};
    if (days !== undefined) params['days'] = days;
    return this.get<DashboardKpis>(`${this.base}/dashboard`, { params });
  }

  getRevenueSeries(query: StatsQuery = {}): Observable<RevenueTrendPoint[]> {
    return this.get<RevenueTrendPoint[]>(`${this.base}/revenue`, { params: this.toParams(query) });
  }

  getOrdersByStatus(query: StatsQuery = {}): Observable<StatsOrdersByStatus> {
    return this.get<StatsOrdersByStatus>(`${this.base}/orders-status`, {
      params: this.toParams(query),
    });
  }

  getTopProducts(query: StatsQuery = {}): Observable<TopProductStat[]> {
    return this.get<TopProductStat[]>(`${this.base}/top-products`, {
      params: this.toParams(query),
    });
  }

  getCategorySales(query: StatsQuery = {}): Observable<CategorySalesStat[]> {
    return this.get<CategorySalesStat[]>(`${this.base}/category-sales`, {
      params: this.toParams(query),
    });
  }

  getInventorySummary(): Observable<InventorySummary> {
    return this.get<InventorySummary>(`${this.base}/inventory-summary`);
  }

  private toParams(query: StatsQuery): Record<string, string | number> {
    const params: Record<string, string | number> = {};
    if (query.days !== undefined) params['days'] = query.days;
    if (query.from) params['from'] = query.from;
    if (query.to) params['to'] = query.to;
    if (query.categoryId) params['categoryId'] = query.categoryId;
    if (query.productId) params['productId'] = query.productId;
    if (query.storeId) params['storeId'] = query.storeId;
    if (query.limit !== undefined) params['limit'] = query.limit;
    return params;
  }
}
