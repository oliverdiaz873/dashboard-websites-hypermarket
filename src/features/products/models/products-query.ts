import { PRODUCT_SORT_FIELDS, type ProductSortField } from '../constants/products.constants';
import type { ProductStatus } from './product.model';
import type { SortDirection } from '@core/enums/sort-direction';

/** Contrato de consulta del catálogo administrativo (GET /api/admin/products). */
export interface ProductsQuery {
  page: number;
  limit: number;
  q?: string;
  category?: string;
  brand?: string;
  status?: ProductStatus;
  sortBy?: ProductSortField;
  sortOrder?: SortDirection;
}

export type { ProductSortField };
export { PRODUCT_SORT_FIELDS };
