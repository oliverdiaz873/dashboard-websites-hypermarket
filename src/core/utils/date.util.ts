const DEFAULT_LOCALE = 'es-DO';

export function formatDate(
  value: Date | string | number,
  locale: string = DEFAULT_LOCALE,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = toDate(value);
  return date ? new Intl.DateTimeFormat(locale, options).format(date) : '';
}

export function formatDateShort(
  value: Date | string | number,
  locale: string = DEFAULT_LOCALE,
): string {
  return formatDate(value, locale, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(
  value: Date | string | number,
  locale: string = DEFAULT_LOCALE,
): string {
  return formatDate(value, locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(
  value: Date | string | number,
  now: number = Date.now(),
  locale: string = DEFAULT_LOCALE,
): string {
  const date = toDate(value);
  if (!date) return '';

  const diffSeconds = Math.round((date.getTime() - now) / 1000);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  const abs = Math.abs(diffSeconds);

  if (abs < 60) return rtf.format(diffSeconds, 'second');
  const minutes = Math.round(diffSeconds / 60);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) return rtf.format(months, 'month');
  return rtf.format(Math.round(months / 12), 'year');
}

export function toIsoString(value: Date | string | number): string {
  const date = toDate(value);
  return date ? date.toISOString() : '';
}

function toDate(value: Date | string | number): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
