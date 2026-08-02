import { NAVIGATION_ITEMS } from './navigation';

describe('NAVIGATION_ITEMS', () => {
  it('define al menos una entrada con label, icon y route', () => {
    expect(NAVIGATION_ITEMS.length).toBeGreaterThan(0);
    for (const item of NAVIGATION_ITEMS) {
      expect(item.label).toBeTruthy();
      expect(item.icon).toBeTruthy();
      expect(item.route).toMatch(/^\//);
    }
  });

  it('tiene rutas únicas', () => {
    const routes = NAVIGATION_ITEMS.map((item) => item.route);
    expect(new Set(routes).size).toBe(routes.length);
  });
});
