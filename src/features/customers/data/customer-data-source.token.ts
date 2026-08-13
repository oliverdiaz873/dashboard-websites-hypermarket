import { InjectionToken } from '@angular/core';

import type { CustomerDataSource } from './customer-data-source';

/**
 * Fuente de clientes (Dependency Inversion). Se resuelve en el composition root
 * (`src/app/app.config.ts`) con `ApiCustomerDataSource` (backend Express), de
 * forma que servicios, stores y componentes no conocen la implementación.
 * No tiene default: si alguien lo inyecta sin proveerlo, es un error de wiring.
 */
export const CUSTOMER_DATA_SOURCE = new InjectionToken<CustomerDataSource>('CUSTOMER_DATA_SOURCE', {
  providedIn: 'root',
  factory: () => {
    throw new Error('CUSTOMER_DATA_SOURCE debe registrarse en el composition root.');
  },
});
