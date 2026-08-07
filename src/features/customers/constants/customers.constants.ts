import type { CustomerStatus } from '../models/customer.model';

export const CUSTOMER_STATUSES = ['active', 'blocked', 'pending'] as const;

export const CUSTOMER_STATUS_LABELS: Record<CustomerStatus, string> = {
  active: 'Activo',
  blocked: 'Bloqueado',
  pending: 'Pendiente',
};

export const CUSTOMER_STATUS_OPTIONS = CUSTOMER_STATUSES.map((value) => ({
  value,
  label: CUSTOMER_STATUS_LABELS[value],
}));

export const CUSTOMER_SORT_FIELDS = ['name', 'email', 'createdAt'] as const;

export type CustomerSortField = (typeof CUSTOMER_SORT_FIELDS)[number];

export const CUSTOMER_SORT_FIELD_LABELS: Record<CustomerSortField, string> = {
  name: 'Nombre',
  email: 'Correo',
  createdAt: 'Registro',
};

export const CUSTOMER_SORT_OPTIONS = CUSTOMER_SORT_FIELDS.map((value) => ({
  value,
  label: CUSTOMER_SORT_FIELD_LABELS[value],
}));

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [20, 50, 100];

/**
 * Eventos de auditoría del módulo de clientes (fase 2). Se dejan definidos como
 * placeholders para que `CustomersService` los referencie sin acoplarse a la
 * implementación del registro de auditoría.
 */
export const ADMIN_CREATE_CUSTOMER = 'admin.create_customer' as const;
export const ADMIN_UPDATE_CUSTOMER = 'admin.update_customer' as const;
export const ADMIN_BLOCK_CUSTOMER = 'admin.block_customer' as const;
export const ADMIN_UNBLOCK_CUSTOMER = 'admin.unblock_customer' as const;

export const CUSTOMER_AUDIT_EVENTS = {
  create: ADMIN_CREATE_CUSTOMER,
  update: ADMIN_UPDATE_CUSTOMER,
  block: ADMIN_BLOCK_CUSTOMER,
  unblock: ADMIN_UNBLOCK_CUSTOMER,
} as const;
