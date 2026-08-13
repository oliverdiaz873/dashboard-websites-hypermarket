import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';

import type { ContactMessage } from '../models/contact-message.model';
import type { ContactMessageStatus } from '../constants/contact.constants';

@Injectable({ providedIn: 'root' })
export class ContactsService extends BaseApiService {
  list(): Observable<ContactMessage[]> {
    return this.get<ContactMessage[]>(API_ENDPOINTS.adminContact);
  }

  getById(id: string): Observable<ContactMessage> {
    return this.get<ContactMessage>(`${API_ENDPOINTS.adminContact}/${id}`);
  }

  updateStatus(id: string, status: ContactMessageStatus): Observable<ContactMessage> {
    return this.patch<ContactMessage>(`${API_ENDPOINTS.adminContact}/${id}`, { status });
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`${API_ENDPOINTS.adminContact}/${id}`);
  }
}
