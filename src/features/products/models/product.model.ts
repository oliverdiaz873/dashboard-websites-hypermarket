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
