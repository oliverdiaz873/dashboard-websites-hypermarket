import type { Routes } from '@angular/router';

import { roleGuard, type RoleRoute } from '@core/guards/role.guard';

export const inventoryRoutes: Routes = [
  {
    path: '',
    title: 'Inventario',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/inventory/pages/inventory-page/inventory-page.component').then(
        (m) => m.InventoryPageComponent,
      ),
  },
  {
    path: ':id/movements',
    title: 'Historial de movimientos',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/inventory/pages/inventory-movements-page/inventory-movements-page.component').then(
        (m) => m.InventoryMovementsPageComponent,
      ),
  },
];
