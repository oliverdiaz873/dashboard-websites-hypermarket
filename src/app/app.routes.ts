import type { Routes } from '@angular/router';

import { authGuard } from '@core/guards/auth.guard';
import { roleGuard } from '@core/guards/role.guard';
import { AdminLayoutComponent } from '@layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@features/dashboard/dashboard.routes').then((m) => m.dashboardRoutes),
      },
      {
        path: 'stats',
        canActivate: [roleGuard],
        data: { roles: ['admin'] },
        loadComponent: () =>
          import('@features/stats/stats-page.component').then((m) => m.StatsPageComponent),
      },
      {
        path: 'products',
        loadChildren: () =>
          import('@features/products/products.routes').then((m) => m.productsRoutes),
      },
      {
        path: 'categories',
        loadChildren: () =>
          import('@features/categories/categories.routes').then((m) => m.categoriesRoutes),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('@features/inventory/inventory.routes').then((m) => m.inventoryRoutes),
      },
      {
        path: 'orders',
        loadChildren: () => import('@features/orders/orders.routes').then((m) => m.ordersRoutes),
      },
      {
        path: 'audit-logs',
        loadChildren: () =>
          import('@features/audit-log/audit-log.routes').then((m) => m.auditLogRoutes),
      },
    ],
  },
  {
    path: 'login',
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.authRoutes),
  },
  {
    path: '**',
    loadComponent: () =>
      import('@features/not-found/not-found-page.component').then((m) => m.NotFoundPageComponent),
  },
];
