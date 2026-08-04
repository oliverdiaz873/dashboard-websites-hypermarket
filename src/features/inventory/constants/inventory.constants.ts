export const INVENTORY_ADJUSTMENT_REASONS = [
  'initial_stock',
  'manual_correction',
  'damaged_products',
  'supplier_adjustment',
  'inventory_count',
] as const;

export type AdjustmentReason = (typeof INVENTORY_ADJUSTMENT_REASONS)[number];

export const INVENTORY_MOVEMENT_TYPES = [
  'increase',
  'decrease',
  'set',
  'min_stock_change',
] as const;

export type InventoryMovementType = (typeof INVENTORY_MOVEMENT_TYPES)[number];

export const INVENTORY_STATUSES = ['out-of-stock', 'low-stock', 'ok'] as const;

export type InventoryStatus = (typeof INVENTORY_STATUSES)[number];

export const INVENTORY_SORT_FIELDS = ['stock', 'minStock', 'updatedAt', 'createdAt'] as const;

export type InventorySortField = (typeof INVENTORY_SORT_FIELDS)[number];

/** Labels derivados de los enums: única fuente de verdad, sin strings mágicos en componentes. */
export const ADJUSTMENT_REASON_LABELS: Record<AdjustmentReason, string> = {
  initial_stock: 'Stock inicial',
  manual_correction: 'Corrección manual',
  damaged_products: 'Productos dañados',
  supplier_adjustment: 'Ajuste de proveedor',
  inventory_count: 'Conteo de inventario',
};

export const MOVEMENT_TYPE_LABELS: Record<InventoryMovementType, string> = {
  increase: 'Aumento',
  decrease: 'Disminución',
  set: 'Corrección',
  min_stock_change: 'Cambio de mínimo',
};

export const INVENTORY_STATUS_LABELS: Record<InventoryStatus, string> = {
  'out-of-stock': 'Agotado',
  'low-stock': 'Bajo',
  ok: 'En stock',
};

export const INVENTORY_SORT_FIELD_LABELS: Record<InventorySortField, string> = {
  stock: 'Stock',
  minStock: 'Mínimo',
  updatedAt: 'Actualizados',
  createdAt: 'Creados',
};

export const ADJUST_OPERATION_LABELS: Record<'increase' | 'decrease' | 'set', string> = {
  increase: 'Aumentar',
  decrease: 'Disminuir',
  set: 'Fijar',
};

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [20, 50, 100];

export const ADJUSTMENT_REASON_OPTIONS = INVENTORY_ADJUSTMENT_REASONS.map((value) => ({
  value,
  label: ADJUSTMENT_REASON_LABELS[value],
}));

export const INVENTORY_STATUS_OPTIONS = INVENTORY_STATUSES.map((value) => ({
  value,
  label: INVENTORY_STATUS_LABELS[value],
}));

export const INVENTORY_SORT_OPTIONS = INVENTORY_SORT_FIELDS.map((value) => ({
  value,
  label: INVENTORY_SORT_FIELD_LABELS[value],
}));
