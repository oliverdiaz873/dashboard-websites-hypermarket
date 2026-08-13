export type BrandStatus = 'active' | 'inactive';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  status: BrandStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBrandPayload {
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  status?: BrandStatus;
}

export type UpdateBrandPayload = Partial<CreateBrandPayload>;
