import type { Routes } from '@angular/router';

import { roleGuard, type RoleRoute } from '@core/guards/role.guard';

export const categoriesRoutes: Routes = [
  {
    path: '',
    title: 'Categorías',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/categories/pages/categories-page/categories-page.component').then(
        (m) => m.CategoriesPageComponent,
      ),
  },
];
