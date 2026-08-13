import type { SortDirection } from '@core/enums/sort-direction';

import type { CustomerSortField } from '../constants/customers.constants';

/**
 * Estado de cuenta de un cliente. El dashboard bloquea/desbloquea `active`/
 * `blocked`; `pending` (registro incompleto, correo sin verificar) se muestra y
 * filtra pero no ofrece acciones de mutación.
 */
export type CustomerStatus = 'active' | 'blocked' | 'pending';

export interface CustomerAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/** Contrato del cliente tal y como lo devuelve GET /admin/customers. */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  /** URL opcional del avatar. Sin avatar, la UI renderiza iniciales generadas. */
  avatar?: string;
  address?: CustomerAddress;
  status: CustomerStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Detalle completo del cliente (GET /admin/customers/:id). Se usa en fase 2
 * (customer-detail-page), cuando exista integración con pedidos y actividad.
 */
export interface CustomerDetail extends Customer {
  lastLoginAt?: Date;
  orderCount: number;
  totalSpent: number;
}

/** KPIs del módulo de clientes (GET /admin/customers/stats). */
export interface CustomerStats {
  total: number;
  active: number;
  blocked: number;
  pending: number;
  newThisMonth: number;
}

/** Contrato de consulta de listado, espejo del backend (GET /admin/customers). */
export interface CustomerQuery {
  page: number;
  limit: number;
  q?: string;
  status?: CustomerStatus | '';
  sortBy?: CustomerSortField;
  sortOrder?: SortDirection;
}

/** Payload de PATCH /admin/customers/:id. Los cambios de estado van por `/status`. */
export interface UpdateCustomerPayload {
  name?: string;
  email?: string;
  phone?: string;
  address?: CustomerAddress;
}
