export const ORDER_STATUSES = ['pending', 'processing', 'completed', 'cancelled'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_SORT_FIELDS = ['createdAt', 'updatedAt', 'subtotal', 'status'] as const;

export type OrderSortField = (typeof ORDER_SORT_FIELDS)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  processing: 'En proceso',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const ORDER_SORT_FIELD_LABELS: Record<OrderSortField, string> = {
  createdAt: 'Creadas',
  updatedAt: 'Actualizadas',
  subtotal: 'Total',
  status: 'Estado',
};

export const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Fallido',
  refunded: 'Reembolsado',
};

/** Transiciones de estado permitidas para admin (espejo del backend). */
export const ADMIN_ORDER_TRANSITIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const hasOrderStatusTransition = (status: OrderStatus): boolean =>
  ADMIN_ORDER_TRANSITIONS[status].length > 0;

export const getOrderStatusTransitions = (
  status: OrderStatus,
): { value: OrderStatus; label: string }[] =>
  ADMIN_ORDER_TRANSITIONS[status].map((value) => ({
    value,
    label: ORDER_STATUS_LABELS[value],
  }));

export const ORDER_STATUS_OPTIONS = ORDER_STATUSES.map((value) => ({
  value,
  label: ORDER_STATUS_LABELS[value],
}));

export const ORDER_SORT_OPTIONS = ORDER_SORT_FIELDS.map((value) => ({
  value,
  label: ORDER_SORT_FIELD_LABELS[value],
}));

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [20, 50, 100];
