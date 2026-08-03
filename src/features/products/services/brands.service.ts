import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';

export interface BrandOption {
  id: string;
  name: string;
  slug: string;
}

@Injectable({ providedIn: 'root' })
export class BrandsService extends BaseApiService {
  list(): Observable<BrandOption[]> {
    return this.get<BrandOption[]>(API_ENDPOINTS.brands);
  }
}
