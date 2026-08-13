import type { ContactMessageStatus } from '../constants/contact.constants';

export type { ContactMessageStatus } from '../constants/contact.constants';

/** Contrato de un mensaje de contacto tal y como lo devuelve GET /api/admin/contact. */
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactMessageStatus;
  createdAt: string;
  updatedAt: string;
}
