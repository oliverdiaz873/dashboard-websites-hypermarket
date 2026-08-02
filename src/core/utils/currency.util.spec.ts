import { formatCurrency } from './currency.util';

describe('currency util', () => {
  it('formatea en USD/en-US de forma determinista', () => {
    expect(formatCurrency(10, 'USD', 'en-US')).toBe('$10.00');
    expect(formatCurrency(0, 'USD', 'en-US')).toBe('$0.00');
    expect(formatCurrency(-5, 'USD', 'en-US')).toBe('-$5.00');
  });

  it('usa locale y moneda por defecto (es-DO / DOP)', () => {
    const out = formatCurrency(1250.5);
    expect(out).toContain('1');
  });

  it('aplica opciones adicionales', () => {
    const out = formatCurrency(1, 'USD', 'en-US', { maximumFractionDigits: 0 });
    expect(out).toBe('$1');
  });
});
