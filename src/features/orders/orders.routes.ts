import type { Routes } from '@angular/router';

import { roleGuard, type RoleRoute } from '@core/guards/role.guard';

export const ordersRoutes: Routes = [
  {
    path: '',
    title: 'Pedidos',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/orders/pages/orders-page/orders-page.component').then(
        (m) => m.OrdersPageComponent,
      ),
  },
  {
    path: ':id',
    title: 'Detalle del pedido',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/orders/pages/order-detail-page/order-detail-page.component').then(
        (m) => m.OrderDetailPageComponent,
      ),
  },
];
