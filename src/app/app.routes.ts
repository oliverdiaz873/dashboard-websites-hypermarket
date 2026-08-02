import { Routes } from '@angular/router';

import { AdminLayoutComponent } from '@layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@features/dashboard/dashboard-page.component').then(
            (m) => m.DashboardPageComponent,
          ),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('@features/not-found/not-found-page.component').then((m) => m.NotFoundPageComponent),
  },
];
