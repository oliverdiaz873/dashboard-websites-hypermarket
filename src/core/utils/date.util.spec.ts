import {
  formatDate,
  formatDateShort,
  formatDateTime,
  formatRelativeTime,
  toIsoString,
} from './date.util';

describe('date util', () => {
  const date = new Date('2026-08-02T12:00:00.000Z');

  it('formatDate devuelve fecha formateada', () => {
    const out = formatDate(date, 'es-DO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    expect(out).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('formatDateShort y formatDateTime devuelven texto', () => {
    expect(formatDateShort(date)).toMatch(/2026/);
    expect(formatDateTime(date)).toMatch(/2026/);
  });

  it('formatRelativeTime devuelve texto relativo', () => {
    const now = date.getTime();
    expect(formatRelativeTime(date, now)).toMatch(/\S/);
    expect(formatRelativeTime(new Date(now - 60_000), now)).toMatch(/\S/);
  });

  it('toIsoString devuelve ISO o vacío para fechas inválidas', () => {
    expect(toIsoString(date)).toBe('2026-08-02T12:00:00.000Z');
    expect(toIsoString('not-a-date')).toBe('');
  });

  it('maneja fechas inválidas', () => {
    expect(formatDate('not-a-date')).toBe('');
  });
});
