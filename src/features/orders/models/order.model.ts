import type { OrderSortField, OrderStatus, PaymentStatus } from '../constants/orders.constants';
import type { SortDirection } from '@core/enums/sort-direction';

export type { OrderSortField, OrderStatus, PaymentStatus } from '../constants/orders.constants';

/** Snapshot de un item dentro de la orden (contrato del backend). */
export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  changedAt: Date;
  by?: string;
  note?: string;
}

export interface OrderShippingAddress {
  label?: string;
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  reference?: string;
}

/** Snapshot compacto del cliente resuelto por el backend en lectura. */
export interface OrderCustomerSnapshot {
  id: string;
  name: string;
  email: string;
}

/** Contrato de una orden administrada tal y como la devuelve GET /admin/orders. */
export interface AdminOrder {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress?: OrderShippingAddress;
  totalItems: number;
  subtotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  statusHistory?: OrderStatusHistoryEntry[];
  customer?: OrderCustomerSnapshot;
  createdAt: Date;
  updatedAt: Date;
}

/** Contrato de consulta de listado, espejo del backend (docs: GET /api/admin/orders). */
export interface OrderQuery {
  page: number;
  limit: number;
  q?: string;
  status?: OrderStatus | '';
  sortBy?: OrderSortField;
  sortOrder?: SortDirection;
}

/** Payload de PATCH /admin/orders/:id/status. */
export interface ChangeOrderStatusPayload {
  status: OrderStatus;
  note?: string;
}
