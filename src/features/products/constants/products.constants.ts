export const PRODUCT_SORT_FIELDS = ['name', 'price', 'createdAt', 'updatedAt'] as const;

export type ProductSortField = (typeof PRODUCT_SORT_FIELDS)[number];

export const DEFAULT_PAGE_SIZE = 20;

export const PAGE_SIZE_OPTIONS = [20, 50, 100];

export const PRODUCT_STATUS_OPTIONS = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
] as const;

export const PRODUCT_ACTION_PENDING_LABEL = 'Coming in Phase 5';
