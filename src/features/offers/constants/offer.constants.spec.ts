import { getOfferDiscountPercentage, formatPrice, toLocalDatetimeInput } from './offer.constants';

describe('offer.constants', () => {
  it('getOfferDiscountPercentage redondea el porcentaje', () => {
    expect(getOfferDiscountPercentage({ originalPrice: 100, discountPrice: 80 })).toBe(20);
    expect(getOfferDiscountPercentage({ originalPrice: 150, discountPrice: 75 })).toBe(50);
    expect(getOfferDiscountPercentage({ originalPrice: 10, discountPrice: 3 })).toBe(70);
  });

  it('getOfferDiscountPercentage devuelve 0 ante valores inválidos', () => {
    expect(getOfferDiscountPercentage({ originalPrice: 0, discountPrice: 0 })).toBe(0);
    expect(getOfferDiscountPercentage({ originalPrice: 100, discountPrice: 0 })).toBe(100);
    expect(getOfferDiscountPercentage({ originalPrice: 100, discountPrice: 100 })).toBe(0);
  });

  it('formatPrice formatea con separador de miles y decimales', () => {
    expect(formatPrice(1000)).toBe('RD$1,000.00');
    expect(formatPrice(80.5)).toBe('RD$80.50');
  });

  it('toLocalDatetimeInput convierte ISO al formato datetime-local local', () => {
    const iso = '2026-01-15T10:30:00.000Z';
    const value = toLocalDatetimeInput(iso);
    expect(value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    const date = new Date(iso);
    expect(value).toBe(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`,
    );
  });
});
