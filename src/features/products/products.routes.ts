import type { Routes } from '@angular/router';

import { roleGuard, type RoleRoute } from '@core/guards/role.guard';

export const productsRoutes: Routes = [
  {
    path: '',
    title: 'Products',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/products/pages/products-page/products-page.component').then(
        (m) => m.ProductsPageComponent,
      ),
  },
];
