import { getContactStatusLabel, CONTACT_STATUS_OPTIONS } from './contact.constants';

describe('contact.constants', () => {
  it('mapea las etiquetas de estado', () => {
    expect(getContactStatusLabel('pending')).toBe('Pendiente');
    expect(getContactStatusLabel('read')).toBe('Leído');
    expect(getContactStatusLabel('answered')).toBe('Respondido');
  });

  it('ofrece las opciones del filtro con sus etiquetas', () => {
    expect(CONTACT_STATUS_OPTIONS).toEqual([
      { value: 'pending', label: 'Pendiente' },
      { value: 'read', label: 'Leído' },
      { value: 'answered', label: 'Respondido' },
    ]);
  });
});
