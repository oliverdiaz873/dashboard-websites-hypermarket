// -----------------------------------------------------------------------------
// environment.ts — Entorno BASE
// -----------------------------------------------------------------------------
// Archivo base que `@env/environment` resuelve por defecto. Durante el build se
// sustituye por `fileReplacements` (ver angular.json): `environment.development.ts`
// en desarrollo y `environment.production.ts` en el build de producción.
// Este archivo NO se usa directamente en ningún build real: mantiene valores
// de desarrollo como fallback/local.
// -----------------------------------------------------------------------------
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:3000/api',
} as const;
