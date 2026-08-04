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
  contacts: '/contact',
  stats: '/admin/stats',
} as const;

export type ApiEndpoint = (typeof API_ENDPOINTS)[keyof typeof API_ENDPOINTS];
