import type { Routes } from '@angular/router';

import { roleGuard, type RoleRoute } from '@core/guards/role.guard';

export const auditLogRoutes: Routes = [
  {
    path: '',
    title: 'Auditoría',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/audit-log/pages/audit-log-page/audit-log-page.component').then(
        (m) => m.AuditLogPageComponent,
      ),
  },
];
