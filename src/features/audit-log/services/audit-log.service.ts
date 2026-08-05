import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BaseApiService } from '@core/http/services/base-api.service';
import { API_ENDPOINTS } from '@core/http/endpoints';
import type { PaginatedResponse } from '@core/models/paginated-response';

import type { AuditLog, AuditLogQuery } from '../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditLogService extends BaseApiService {
  list(query: AuditLogQuery): Observable<PaginatedResponse<AuditLog[]>> {
    return this.getPaginated<AuditLog[]>(API_ENDPOINTS.auditLogs, {
      params: this.toParams(query),
    });
  }

  getById(id: string): Observable<AuditLog> {
    return this.get<AuditLog>(`${API_ENDPOINTS.auditLogs}/${id}`);
  }

  private toParams(query: AuditLogQuery): Record<string, string | number> {
    const params: Record<string, string | number> = {
      page: query.page,
      limit: query.limit,
    };
    if (query.q) params['q'] = query.q;
    if (query.userId) params['userId'] = query.userId;
    if (query.action) params['action'] = query.action;
    if (query.entity) params['entity'] = query.entity;
    if (query.entityId) params['entityId'] = query.entityId;
    if (query.from) params['from'] = query.from;
    if (query.to) params['to'] = query.to;
    return params;
  }
}
