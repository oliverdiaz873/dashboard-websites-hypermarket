import { InjectionToken } from '@angular/core';

import type { CustomerDataSource } from './customer-data-source';
import { MockCustomerDataSource } from './mock-customer-data-source';

/**
 * Fuente de clientes (Dependency Inversion). Por defecto arranca con el mock en
 * memoria para no depender del backend. Para consumir el backend real se registra
 * `ApiCustomerDataSource` desde el composition root (`src/app/app.config.ts`),
 * sin tocar servicios, stores ni componentes.
 */
export const CUSTOMER_DATA_SOURCE = new InjectionToken<CustomerDataSource>('CUSTOMER_DATA_SOURCE', {
  providedIn: 'root',
  factory: () => new MockCustomerDataSource(),
});
