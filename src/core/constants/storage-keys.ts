export const STORAGE_PREFIX = 'hs';

export const STORAGE_KEYS = {
  theme: `${STORAGE_PREFIX}.theme`,
  sidebarCollapsed: `${STORAGE_PREFIX}.sidebar-collapsed`,
  authToken: `${STORAGE_PREFIX}.auth-token`,
  productsPageSize: `${STORAGE_PREFIX}.products.page-size`,
  productsSortBy: `${STORAGE_PREFIX}.products.sort-by`,
  productsSortOrder: `${STORAGE_PREFIX}.products.sort-order`,
  inventoryPageSize: `${STORAGE_PREFIX}.inventory.page-size`,
  inventorySortBy: `${STORAGE_PREFIX}.inventory.sort-by`,
  inventorySortOrder: `${STORAGE_PREFIX}.inventory.sort-order`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
