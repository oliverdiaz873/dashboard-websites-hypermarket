import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';

import type { Brand, CreateBrandPayload, UpdateBrandPayload } from '../models/brand.model';

@Injectable({ providedIn: 'root' })
export class BrandsService extends BaseApiService {
  list(): Observable<Brand[]> {
    return this.get<Brand[]>(API_ENDPOINTS.brands);
  }

  create(payload: CreateBrandPayload): Observable<Brand> {
    return this.post<Brand>(API_ENDPOINTS.brands, payload);
  }

  update(id: string, payload: UpdateBrandPayload): Observable<Brand> {
    return this.patch<Brand>(`${API_ENDPOINTS.brands}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`${API_ENDPOINTS.brands}/${id}`);
  }
}
