import {
  ADJUSTMENT_REASON_LABELS,
  ADJUSTMENT_REASON_OPTIONS,
  INVENTORY_ADJUSTMENT_REASONS,
  INVENTORY_MOVEMENT_TYPES,
  INVENTORY_SORT_FIELD_LABELS,
  INVENTORY_SORT_FIELDS,
  INVENTORY_SORT_OPTIONS,
  INVENTORY_STATUSES,
  INVENTORY_STATUS_LABELS,
  INVENTORY_STATUS_OPTIONS,
  MOVEMENT_TYPE_LABELS,
} from './inventory.constants';

describe('inventory.constants', () => {
  it('tiene un label para cada motivo de ajuste', () => {
    for (const value of INVENTORY_ADJUSTMENT_REASONS) {
      expect(ADJUSTMENT_REASON_LABELS[value]).toBeTruthy();
    }
  });

  it('tiene un label para cada tipo de movimiento', () => {
    for (const value of INVENTORY_MOVEMENT_TYPES) {
      expect(MOVEMENT_TYPE_LABELS[value]).toBeTruthy();
    }
  });

  it('tiene un label para cada estado y campo de orden', () => {
    for (const value of INVENTORY_STATUSES) {
      expect(INVENTORY_STATUS_LABELS[value]).toBeTruthy();
    }
    for (const value of INVENTORY_SORT_FIELDS) {
      expect(INVENTORY_SORT_FIELD_LABELS[value]).toBeTruthy();
    }
  });

  it('deriva las opciones de status y orden desde los enums', () => {
    expect(INVENTORY_STATUS_OPTIONS.map((o) => o.value)).toEqual([...INVENTORY_STATUSES]);
    expect(INVENTORY_SORT_OPTIONS.map((o) => o.value)).toEqual([...INVENTORY_SORT_FIELDS]);
    expect(INVENTORY_SORT_OPTIONS[0]).toEqual({ value: 'stock', label: 'Stock' });
  });

  it('deriva las opciones de motivo de ajuste con su label', () => {
    expect(ADJUSTMENT_REASON_OPTIONS).toEqual(
      INVENTORY_ADJUSTMENT_REASONS.map((value) => ({
        value,
        label: ADJUSTMENT_REASON_LABELS[value],
      })),
    );
  });
});
