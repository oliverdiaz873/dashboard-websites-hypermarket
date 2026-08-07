export const API_ENDPOINTS = {
  auth: '/auth',
  users: '/users',
  products: '/products',
  categories: '/categories',
  brands: '/brands',
  inventory: '/inventory',
  inventoryMovements: '/inventory-movements',
  offers: '/offers',
  orders: '/orders',
  adminOrders: '/admin/orders',
  contacts: '/contact',
  stats: '/admin/stats',
  auditLogs: '/admin/audit-logs',
  search: '/search',
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
