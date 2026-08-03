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
  {
    path: 'new',
    title: 'Nuevo producto',
    canActivate: [roleGuard],
    data: { roles: ['admin'], mode: 'create' } as RoleRoute['data'] & { mode: 'create' },
    loadComponent: () =>
      import('@features/products/pages/product-form/product-form-page.component').then(
        (m) => m.ProductFormPageComponent,
      ),
  },
  {
    path: ':id/edit',
    title: 'Editar producto',
    canActivate: [roleGuard],
    data: { roles: ['admin'], mode: 'edit' } as RoleRoute['data'] & { mode: 'edit' },
    loadComponent: () =>
      import('@features/products/pages/product-form/product-form-page.component').then(
        (m) => m.ProductFormPageComponent,
      ),
  },
];
