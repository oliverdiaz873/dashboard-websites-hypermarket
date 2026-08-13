import type { Routes } from '@angular/router';

import { roleGuard, type RoleRoute } from '@core/guards/role.guard';

export const offersRoutes: Routes = [
  {
    path: '',
    title: 'Ofertas',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/offers/pages/offers-page/offers-page.component').then(
        (m) => m.OffersPageComponent,
      ),
  },
];
