import { BRAND_STATUS_FILTERS, BRAND_STATUS_OPTIONS } from './brand.constants';

describe('brand.constants', () => {
  it('expone los filtros de estado esperados', () => {
    expect(BRAND_STATUS_FILTERS).toEqual(['all', 'active', 'inactive']);
  });

  it('BRAND_STATUS_OPTIONS ofrece las etiquetas de Activas/Inactivas', () => {
    expect(BRAND_STATUS_OPTIONS).toEqual([
      { value: 'active', label: 'Activas' },
      { value: 'inactive', label: 'Inactivas' },
    ]);
  });
});
