import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';

export interface CategorySubcategory {
  name: string;
  slug: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  subcategories: CategorySubcategory[];
}

@Injectable({ providedIn: 'root' })
export class CategoriesService extends BaseApiService {
  list(): Observable<CategoryOption[]> {
    return this.get<CategoryOption[]>(API_ENDPOINTS.categories);
  }
}
