import type {
  AdjustmentReason,
  InventoryMovementType,
  InventorySortField,
  InventoryStatus,
} from '../constants/inventory.constants';
import type { SortDirection } from '@core/enums/sort-direction';

export type {
  AdjustmentReason,
  InventoryMovementType,
  InventorySortField,
  InventoryStatus,
} from '../constants/inventory.constants';

/** Snapshot compacto del producto resuelto por el backend en lectura (batch findByIds). */
export interface InventoryProductSnapshot {
  name: string;
  sku: string;
  image?: string;
  unit?: string;
}

/** Contrato del inventario tal y como lo devuelve GET /inventory. */
export interface Inventory {
  id: string;
  productId: string;
  product?: InventoryProductSnapshot;
  stock: number;
  reservedStock: number;
  availableStock: number;
  minStock?: number;
  status?: InventoryStatus;
  updatedAt: Date;
}

/** Contrato de consulta de listado, espejo del backend (docs: GET /api/inventory). */
export interface InventoryQuery {
  page: number;
  limit: number;
  q?: string;
  status?: InventoryStatus | '';
  sortBy?: InventorySortField;
  sortOrder?: SortDirection;
}

export type InventoryAdjustOperation = 'increase' | 'decrease' | 'set';

/** Payload de POST /inventory/:id/adjust. */
export interface AdjustPayload {
  operation: InventoryAdjustOperation;
  quantity: number;
  reason: AdjustmentReason;
}

/** Payload de PATCH /inventory/:id/min-stock. */
export interface MinStockPayload {
  minStock: number;
  reason: AdjustmentReason;
}

/** Contrato de un movimiento de inventario (GET /inventory/:id/movements). */
export interface InventoryMovement {
  id: string;
  inventoryId: string;
  productId: string;
  orderId?: string;
  type: InventoryMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  previousReservedStock: number;
  newReservedStock: number;
  reason: AdjustmentReason;
  createdBy?: string;
  createdAt: Date;
}
