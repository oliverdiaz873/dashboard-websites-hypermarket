import type { Routes } from '@angular/router';

import { roleGuard, type RoleRoute } from '@core/guards/role.guard';

export const customersRoutes: Routes = [
  {
    path: '',
    title: 'Clientes',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/customers/pages/customers-page/customers-page.component').then(
        (m) => m.CustomersPageComponent,
      ),
  },
  {
    // Fase 2: aquí se montará customer-detail-page cuando exista integración con
    // pedidos/analítica. Por ahora la ruta se conserva como redirect puro para que
    // los resultados de la búsqueda global no caigan en 404. Sin guards: Angular
    // ejecuta los redirects antes que `canActivate` (NG04014 si se mezclan).
    path: ':id',
    redirectTo: '/customers',
    pathMatch: 'full',
  },
];
