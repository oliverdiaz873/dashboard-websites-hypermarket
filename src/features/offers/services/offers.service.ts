import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';

import type { CreateOfferPayload, Offer, UpdateOfferPayload } from '../models/offer.model';

/**
 * CRUD de ofertas. El listado admin usa `GET /api/admin/offers` (todas, con
 * `productName`); las mutaciones van a `/api/offers` (rutas admin del backend).
 */
@Injectable({ providedIn: 'root' })
export class OffersService extends BaseApiService {
  list(): Observable<Offer[]> {
    return this.get<Offer[]>(API_ENDPOINTS.adminOffers);
  }

  create(payload: CreateOfferPayload): Observable<Offer> {
    return this.post<Offer>(API_ENDPOINTS.offers, payload);
  }

  update(id: string, payload: UpdateOfferPayload): Observable<Offer> {
    return this.patch<Offer>(`${API_ENDPOINTS.offers}/${id}`, payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`${API_ENDPOINTS.offers}/${id}`);
  }
}
