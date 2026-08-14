export const API_ENDPOINTS = {
  auth: '/auth',
  users: '/users',
  products: '/products',
  categories: '/categories',
  brands: '/brands',
  inventory: '/inventory',
  inventoryMovements: '/inventory-movements',
  offers: '/offers',
  adminOffers: '/admin/offers',
  orders: '/orders',
  adminOrders: '/admin/orders',
  customers: '/admin/customers',
  contacts: '/contact',
  adminContact: '/admin/contact',
  stats: '/admin/stats',
  auditLogs: '/admin/audit-logs',
  search: '/search',
  adminSearch: '/admin/search',
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
