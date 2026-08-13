import {
  ADMIN_BLOCK_CUSTOMER,
  ADMIN_UNBLOCK_CUSTOMER,
  ADMIN_UPDATE_CUSTOMER,
  CUSTOMER_AUDIT_EVENTS,
  CUSTOMER_SORT_OPTIONS,
  CUSTOMER_STATUS_LABELS,
  CUSTOMER_STATUS_OPTIONS,
} from './customers.constants';

describe('customers.constants', () => {
  it('expone etiquetas de estado en español', () => {
    expect(CUSTOMER_STATUS_LABELS.active).toBe('Activo');
    expect(CUSTOMER_STATUS_LABELS.blocked).toBe('Bloqueado');
    expect(CUSTOMER_STATUS_LABELS.pending).toBe('Pendiente');
  });

  it('incluye las opciones de estado del filtro', () => {
    expect(CUSTOMER_STATUS_OPTIONS).toEqual([
      { value: 'active', label: 'Activo' },
      { value: 'blocked', label: 'Bloqueado' },
      { value: 'pending', label: 'Pendiente' },
    ]);
  });

  it('incluye los campos de orden del listado', () => {
    expect(CUSTOMER_SORT_OPTIONS.map((o) => o.value)).toEqual(['name', 'email', 'createdAt']);
  });

  it('define los placeholders de auditoría del módulo', () => {
    expect(ADMIN_UPDATE_CUSTOMER).toBe('admin.update_customer');
    expect(ADMIN_BLOCK_CUSTOMER).toBe('admin.block_customer');
    expect(ADMIN_UNBLOCK_CUSTOMER).toBe('admin.unblock_customer');
    expect(CUSTOMER_AUDIT_EVENTS).toEqual({
      update: ADMIN_UPDATE_CUSTOMER,
      block: ADMIN_BLOCK_CUSTOMER,
      unblock: ADMIN_UNBLOCK_CUSTOMER,
    });
  });
});
