import type { AuditAction } from '../constants/audit-log.constants';

export type { AuditAction } from '../constants/audit-log.constants';

/** Contrato de un registro de auditoría tal y como lo devuelve GET /admin/audit-logs. */
export interface AuditLog {
  id: string;
  userId?: string;
  userName?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  success: boolean;
  details?: unknown;
  createdAt: Date;
}

/** Contrato de consulta de listado, espejo del backend (docs: GET /api/admin/audit-logs). */
export interface AuditLogQuery {
  page: number;
  limit: number;
  q?: string;
  userId?: string;
  action?: AuditAction | '';
  entity?: string;
  entityId?: string;
  from?: string;
  to?: string;
}
