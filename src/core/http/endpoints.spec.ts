import { API_ENDPOINTS } from './endpoints';

describe('API_ENDPOINTS', () => {
  it('refleja las rutas base del backend Express', () => {
    expect(API_ENDPOINTS).toEqual({
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
      customers: '/admin/customers',
      contacts: '/contact',
      stats: '/admin/stats',
      auditLogs: '/admin/audit-logs',
      search: '/search',
    });
  });

  it('ningún endpoint termina con barra', () => {
    for (const endpoint of Object.values(API_ENDPOINTS)) {
      expect(endpoint.endsWith('/')).toBe(false);
    }
  });
});
