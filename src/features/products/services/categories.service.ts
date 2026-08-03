import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

@Injectable({ providedIn: 'root' })
export class CategoriesService extends BaseApiService {
  list(): Observable<CategoryOption[]> {
    return this.get<CategoryOption[]>(API_ENDPOINTS.categories);
  }
}
