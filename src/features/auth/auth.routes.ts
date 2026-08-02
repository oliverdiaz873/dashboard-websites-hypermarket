import type { Routes } from '@angular/router';

import { LoginPageComponent } from './pages/login/login-page.component';

/** Rutas públicas de autenticación (fuera del shell autenticado). */
export const authRoutes: Routes = [
  {
    path: '',
    component: LoginPageComponent,
    title: 'Inicia sesión',
  },
];
