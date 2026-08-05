export interface CategorySubcategory {
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: CategorySubcategory[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryPayload {
  name: string;
  subcategories: CategorySubcategory[];
}

export type UpdateCategoryPayload = CreateCategoryPayload;
