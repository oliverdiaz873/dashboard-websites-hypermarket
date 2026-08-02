// -----------------------------------------------------------------------------
// environment.development.ts — Entorno de DESARROLLO
// -----------------------------------------------------------------------------
// Se sustituye a environment.ts durante `ng serve` (configuración development).
// Apunta al backend local de Express + MongoDB.
// -----------------------------------------------------------------------------
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000/api',
} as const;
