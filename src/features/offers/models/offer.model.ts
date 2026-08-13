/**
 * Contrato de una oferta admin (GET /api/admin/offers): `OfferData` del backend
 * más el nombre del producto unido (`productName`), necesario para el listado.
 */
export interface Offer {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  discountPrice: number;
  startDate: string;
  endDate?: string | null;
  isActive: boolean;
  title?: string;
}

/** Payload de creación (POST /api/offers). Las fechas se envían en ISO. */
export interface CreateOfferPayload {
  productId: string;
  originalPrice: number;
  discountPrice: number;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
  title?: string;
}

/** Payload de actualización (PATCH /api/offers/:id). Partial; `endDate: null` limpia la fecha. */
export interface UpdateOfferPayload {
  productId?: string;
  originalPrice?: number;
  discountPrice?: number;
  startDate?: string;
  endDate?: string | null;
  isActive?: boolean;
  title?: string;
}
