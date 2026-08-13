import type { Routes } from '@angular/router';

import { roleGuard, type RoleRoute } from '@core/guards/role.guard';

export const brandsRoutes: Routes = [
  {
    path: '',
    title: 'Marcas',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/brands/pages/brands-page/brands-page.component').then(
        (m) => m.BrandsPageComponent,
      ),
  },
];
