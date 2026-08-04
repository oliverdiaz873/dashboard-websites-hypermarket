import type { SortDirection } from '@core/enums/sort-direction';

/** Acción configurable de fila. La tabla solo la muestra y emite `actionClicked`; el padre resuelve. */
export interface TableAction<T> {
  id: string;
  label: string;
  icon: string;
  visible?: (row: T) => boolean;
  disabled?: (row: T) => boolean;
}

export type TableBadgeTone = 'ok' | 'low' | 'out';

/** Badge de celda: label + tono visual. Devuelto por `TableColumn.badge` o `null` para ocultarlo. */
export interface TableBadge {
  label: string;
  tone: TableBadgeTone;
}

export interface TableColumn<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  /** Formateador opcional para celdas que no son el valor crudo. */
  cell?: (row: T) => string;
  /** Renderiza un badge en la celda en lugar del valor/`cell` cuando devuelve un valor. */
  badge?: (row: T) => TableBadge | null | undefined;
  /** Oculta la columna en pantallas pequeñas (responsive). */
  hideOnMobile?: boolean;
}

export interface TableSort {
  key: string;
  direction: SortDirection;
}

export interface TableActionEvent<T> {
  actionId: string;
  row: T;
}

export interface PageSizeOption {
  value: number;
  label: string;
}
