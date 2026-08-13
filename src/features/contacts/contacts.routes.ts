import type { Routes } from '@angular/router';

import { roleGuard, type RoleRoute } from '@core/guards/role.guard';

export const contactRoutes: Routes = [
  {
    path: '',
    title: 'Contactos',
    canActivate: [roleGuard],
    data: { roles: ['admin'] } as RoleRoute['data'],
    loadComponent: () =>
      import('@features/contacts/pages/contacts-page/contacts-page.component').then(
        (m) => m.ContactsPageComponent,
      ),
  },
];
