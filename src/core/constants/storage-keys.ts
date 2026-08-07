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
  ordersPageSize: `${STORAGE_PREFIX}.orders.page-size`,
  ordersSortBy: `${STORAGE_PREFIX}.orders.sort-by`,
  ordersSortOrder: `${STORAGE_PREFIX}.orders.sort-order`,
  customersPageSize: `${STORAGE_PREFIX}.customers.page-size`,
  customersSortBy: `${STORAGE_PREFIX}.customers.sort-by`,
  customersSortOrder: `${STORAGE_PREFIX}.customers.sort-order`,
  customerForm: `${STORAGE_PREFIX}.customers.form-draft`,
  auditLogsPageSize: `${STORAGE_PREFIX}.audit-logs.page-size`,
  dashboardRange: `${STORAGE_PREFIX}.dashboard.range`,
} as const;

export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];
