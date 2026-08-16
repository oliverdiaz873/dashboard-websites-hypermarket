// -----------------------------------------------------------------------------
// environment.production.ts — Entorno de PRODUCCIÓN (build --configuration production)
// -----------------------------------------------------------------------------
// Se sustituye a environment.ts durante el build de producción vía
// `fileReplacements` (ver angular.json → test: options / build: configurations.production).
//
// ADVERTENCIA: `apiBaseUrl` NO es una URL de producción válida. La app Angular
// no lee variables de entorno en tiempo de build; el valor real del API
// desplegado debe configurarse AQUÍ antes del build de producción (o inyectarse
// por el sistema CI/CD del hosting). Véase `.env.example` → `DASHBOARD_API_BASE_URL`.
// El valor `''` (fallback/local) hace que las peticiones vayan al mismo origen;
// solo debe usarse en despliegues donde el API se sirve same-origin.
// -----------------------------------------------------------------------------
export const environment = {
  production: true,
  apiBaseUrl: '',
} as const;
