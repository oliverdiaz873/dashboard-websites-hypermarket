/** Contrato de respuesta del endpoint de KPIs (GET /admin/stats/dashboard). */
export interface DashboardKpis {
  revenue: number;
  averageOrderValue: number;
  orders: number;
  completedOrders: number;
  pendingOrders: number;
  customers: number;
  newCustomers: number;
  lowStock: number;
  pendingContactMessages: number;
  growthPercent: number;
}

/** Punto de la serie de ingresos por día (GET /admin/stats/revenue). */
export interface RevenueTrendPoint {
  date: string;
  total: number;
}

/** Producto más vendido (GET /admin/stats/top-products). */
export interface TopProductStat {
  productId: string;
  name: string;
  quantity: number;
  revenue: number;
}

/** Ventas por categoría (GET /admin/stats/category-sales). */
export interface CategorySalesStat {
  category: string;
  slug: string;
  revenue: number;
  orders: number;
}

/** Resumen de inventario (GET /admin/stats/inventory-summary). */
export interface InventorySummary {
  inventoryValue: number;
  totalUnits: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/** Pedidos agrupados por estado (GET /admin/stats/orders-status). */
export interface StatsOrdersByStatus {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  completed: number;
  cancelled: number;
}

/** Contrato de query común para los endpoints de estadísticas. */
export interface StatsQuery {
  days?: number;
  from?: string;
  to?: string;
  categoryId?: string;
  productId?: string;
  storeId?: string;
  limit?: number;
}
