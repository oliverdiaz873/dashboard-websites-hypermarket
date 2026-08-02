import type { NavigationItem } from '../models/navigation-item';

/**
 * Navegación principal del dashboard. Las rutas son de FRONTEND (UI) y no deben
 * depender de `API_ENDPOINTS` (contrato del backend): son responsabilidades
 * distintas y pueden divergir sin acoplarse.
 */
export const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
  { label: 'Productos', icon: 'inventory_2', route: '/products' },
  { label: 'Categorías', icon: 'category', route: '/categories' },
  { label: 'Marcas', icon: 'local_offer', route: '/brands' },
  { label: 'Ofertas', icon: 'sale', route: '/offers' },
  { label: 'Inventario', icon: 'warehouse', route: '/inventory' },
  { label: 'Pedidos', icon: 'receipt_long', route: '/orders' },
  { label: 'Clientes', icon: 'group', route: '/users' },
  { label: 'Contactos', icon: 'mail', route: '/contacts' },
  { label: 'Estadísticas', icon: 'bar_chart', route: '/stats' },
  { label: 'Configuración', icon: 'settings', route: '/settings' },
] as const;
