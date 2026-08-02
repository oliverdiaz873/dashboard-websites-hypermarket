// -----------------------------------------------------------------------------
// environment.ts — Entorno de PRODUCCIÓN
// -----------------------------------------------------------------------------
// Este archivo se usa en el build de producción. La URL de la API es un
// placeholder: sustituir por la URL real cuando el backend esté desplegado.
// -----------------------------------------------------------------------------
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:3000/api',
} as const;
