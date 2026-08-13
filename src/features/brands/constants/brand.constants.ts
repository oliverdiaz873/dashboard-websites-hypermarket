export const BRAND_STATUS_FILTERS = ['all', 'active', 'inactive'] as const;

export type BrandStatusFilter = (typeof BRAND_STATUS_FILTERS)[number];

export const BRAND_STATUS_OPTIONS = [
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
] as const;
