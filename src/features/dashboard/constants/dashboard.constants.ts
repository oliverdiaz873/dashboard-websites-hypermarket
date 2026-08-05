/** Rangos de análisis para las series temporales (selector 7/30/90 días). */
export const DASHBOARD_RANGES = [7, 30, 90] as const;

export type DashboardRange = (typeof DASHBOARD_RANGES)[number];

export const DEFAULT_RANGE: DashboardRange = 30;

/** Limite por defecto para el endpoint de top productos. */
export const DEFAULT_TOP_PRODUCTS_LIMIT = 5;

/** Paleta usada por los gráficos (Chart.js). */
export const CHART_COLORS = {
  brand: '#2563eb',
  revenue: '#2563eb',
  completed: '#16a34a',
  pending: '#d97706',
  confirmed: '#4f46e5',
  processing: '#0ea5e9',
  shipped: '#7c3aed',
  cancelled: '#dc2626',
  categoryPalette: ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  processing: 'Procesando',
  shipped: 'Enviado',
  completed: 'Completado',
  cancelled: 'Cancelado',
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending: CHART_COLORS.pending,
  confirmed: CHART_COLORS.confirmed,
  processing: CHART_COLORS.processing,
  shipped: CHART_COLORS.shipped,
  completed: CHART_COLORS.completed,
  cancelled: CHART_COLORS.cancelled,
};
