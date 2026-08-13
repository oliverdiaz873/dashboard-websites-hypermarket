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
    path: ':id',
    title: 'Detalle de cliente',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/customers/pages/customer-detail-page/customer-detail-page.component').then(
        (m) => m.CustomerDetailPageComponent,
      ),
  },
];
