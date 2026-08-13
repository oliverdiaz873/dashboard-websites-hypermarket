export const CONTACT_STATUSES = ['pending', 'read', 'answered'] as const;

export type ContactMessageStatus = (typeof CONTACT_STATUSES)[number];

export const CONTACT_STATUS_LABELS: Record<ContactMessageStatus, string> = {
  pending: 'Pendiente',
  read: 'Leído',
  answered: 'Respondido',
};

export const getContactStatusLabel = (status: ContactMessageStatus): string =>
  CONTACT_STATUS_LABELS[status] ?? status;

export const CONTACT_STATUS_OPTIONS = CONTACT_STATUSES.map((value) => ({
  value,
  label: CONTACT_STATUS_LABELS[value],
}));
