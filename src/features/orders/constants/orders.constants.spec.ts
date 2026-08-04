import {
  ADMIN_ORDER_TRANSITIONS,
  hasOrderStatusTransition,
  ORDER_SORT_FIELD_LABELS,
  ORDER_SORT_FIELDS,
  ORDER_SORT_OPTIONS,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_LABELS,
} from './orders.constants';

describe('orders.constants', () => {
  it('tiene un label para cada estado y campo de orden', () => {
    for (const value of ORDER_STATUSES) {
      expect(ORDER_STATUS_LABELS[value]).toBeTruthy();
    }
    for (const value of ORDER_SORT_FIELDS) {
      expect(ORDER_SORT_FIELD_LABELS[value]).toBeTruthy();
    }
  });

  it('tiene un label para cada estado de pago', () => {
    for (const value of ['pending', 'paid', 'failed', 'refunded'] as const) {
      expect(PAYMENT_STATUS_LABELS[value]).toBeTruthy();
    }
  });

  it('deriva las opciones de status y orden desde los enums', () => {
    expect(ORDER_STATUS_OPTIONS.map((o) => o.value)).toEqual([...ORDER_STATUSES]);
    expect(ORDER_SORT_OPTIONS.map((o) => o.value)).toEqual([...ORDER_SORT_FIELDS]);
    expect(ORDER_SORT_OPTIONS[0]).toEqual({ value: 'createdAt', label: 'Creadas' });
  });

  it('define las transiciones de estado permitidas para admin', () => {
    expect(ADMIN_ORDER_TRANSITIONS.pending).toEqual(['processing', 'cancelled']);
    expect(ADMIN_ORDER_TRANSITIONS.processing).toEqual(['completed', 'cancelled']);
    expect(ADMIN_ORDER_TRANSITIONS.completed).toEqual([]);
    expect(ADMIN_ORDER_TRANSITIONS.cancelled).toEqual([]);
  });

  it('hasOrderStatusTransition detecta si hay un destino válido', () => {
    expect(hasOrderStatusTransition('pending')).toBe(true);
    expect(hasOrderStatusTransition('processing')).toBe(true);
    expect(hasOrderStatusTransition('completed')).toBe(false);
    expect(hasOrderStatusTransition('cancelled')).toBe(false);
  });
});
