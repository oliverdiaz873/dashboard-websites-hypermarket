// -----------------------------------------------------------------------------
// environment.production.ts — Entorno de PRODUCCIÓN (build --configuration production)
// -----------------------------------------------------------------------------
// Se sustituye a environment.ts durante el build de producción vía
// `fileReplacements` (ver angular.json → test: options / build: configurations.production).
// Reemplazar `apiUrl` por la URL real antes del build de producción, o integrarlo
// con el sistema CI/CD del hosting.
// -----------------------------------------------------------------------------
export const environment = {
  production: true,
  apiBaseUrl: 'https://REPLACE_WITH_PRODUCTION_API/api',
} as const;
