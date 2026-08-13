export const OFFER_ACTIVE_FILTERS = ['all', 'active', 'inactive'] as const;

export type OfferActiveFilter = (typeof OFFER_ACTIVE_FILTERS)[number];

export const OFFER_ACTIVE_OPTIONS = [
  { value: 'active', label: 'Activas' },
  { value: 'inactive', label: 'Inactivas' },
] as const;

export const getOfferDiscountPercentage = (offer: {
  originalPrice: number;
  discountPrice: number;
}): number => {
  if (!offer.originalPrice) return 0;
  return Math.round(((offer.originalPrice - offer.discountPrice) / offer.originalPrice) * 100);
};

export const formatPrice = (value: number): string =>
  new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP' }).format(value);

export const toLocalDatetimeInput = (value?: string | null): string => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};
