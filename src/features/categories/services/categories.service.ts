import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';

import type { Category, CreateCategoryPayload } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService extends BaseApiService {
  list(): Observable<Category[]> {
    return this.get<Category[]>(API_ENDPOINTS.categories);
  }

  create(payload: CreateCategoryPayload): Observable<Category> {
    return this.post<Category>(API_ENDPOINTS.categories, payload);
  }

  update(id: string, payload: CreateCategoryPayload): Observable<Category> {
    return this.patch<Category>(`${API_ENDPOINTS.categories}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`${API_ENDPOINTS.categories}/${id}`);
  }
}
