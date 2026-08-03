export type ProductStatus = 'active' | 'inactive';

export interface ProductCategoryEmbed {
  name: string;
  slug: string;
}

export interface ProductBrandEmbed {
  name: string;
  slug: string;
}

/** Contrato del Producto tal y como lo devuelve GET /products (id en vez de _id, sin internals). */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  categoryId: string;
  category: ProductCategoryEmbed;
  brandId?: string;
  brand?: ProductBrandEmbed;
  unit?: string;
  unitQuantity?: number;
  status: ProductStatus;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Payload de creación (POST /products).
 * `stock`/`minStock` solo aplican en create: el backend crea el inventario aquí.
 * El SKU se auto-genera en backend si se omite.
 */
export interface CreateProductPayload {
  name: string;
  price: number;
  image: string;
  categoryId: string;
  sku?: string;
  brandId?: string;
  unit?: string;
  unitQuantity?: number;
  description?: string;
  status?: ProductStatus;
  isAvailable?: boolean;
  stock?: number;
  minStock?: number;
}

/**
 * Payload de actualización (PATCH /products/:id). Partial.
 * `stock`/`minStock` NO se envían aquí: el inventario es gestionado por el
 * módulo de inventario (futuro). `brandId: null` limpia la marca del producto.
 */
export interface UpdateProductPayload {
  name?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  sku?: string;
  brandId?: string | null;
  unit?: string;
  unitQuantity?: number;
  description?: string;
  status?: ProductStatus;
  isAvailable?: boolean;
}
