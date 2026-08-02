# dashboard-websites-hypermarket

Dashboard administrativo del ecommerce **Hipermercado Superior**. Exclusivo para
administradores, construido sobre la API REST del backend
(`backend-advanced-websites-hypermarket-express-mongodb`).

> **Project Status**
>
> - **Current Phase:** `Phase 1 — Core` ✅ (esta fase)
> - **Upcoming:** `Phase 2 — Authentication` · `Phase 3 — Dashboard Layout` ·
>   `Phase 4 — Shared Components` · `Phase 5+ — Productos, Órdenes, Estadísticas…`

---

## Arquitectura

Arquitectura **Feature-Based** preparada para crecer durante años. Cada dominio
de negocio vive en `features/` con sus componentes, y el código transversal se
reparte entre `core/` (singletons) y `shared/` (reutilizable).

```
src/
├─ app/                  # Shell de la aplicación (AppComponent, config, rutas)
├─ core/                 # Singletons de ámbito app-wide
│   ├─ config/           # Configuración de la app (AppConfig + APP_CONFIG)
│   ├─ guards/           # Route guards (auth, role)
│   ├─ interceptors/     # HTTP interceptors (JWT, loading, error)
│   ├─ services/         # Servicios singleton
│   ├─ state/            # Gestión de estado con Signals (@ngrx/signals)
│   ├─ http/             # Capa HTTP (config, endpoints, BaseApiService)
│   ├─ tokens/           # Injection tokens de la app (AUTH_TOKEN, …)
│   ├─ models/           # Modelos de dominio
│   ├─ constants/        # Constantes globales (storage keys, …)
│   ├─ enums/            # Enumeraciones de dominio
│   └─ utils/            # Utilidades puras
├─ shared/               # Componentes/directivas/pipes reutilizables
│   ├─ components/
│   ├─ directives/
│   ├─ pipes/
│   ├─ models/
│   ├─ constants/
│   └─ utils/
├─ features/             # Módulos de negocio (auth, products, orders, stats…)
├─ layouts/              # Layouts de la aplicación (admin-layout)
├─ assets/               # fonts/, images/, icons/
├─ environments/         # environment.ts + environment.development.ts
└─ styles/               # Design system SCSS (tokens, mixins, resets, …)
```

### Convenciones clave

- **Standalone Components** (sin NgModules salvo lo imprescindible).
- **Zoneless** (sin Zone.js) + **Angular Signals** para el estado.
- **Barrels (`index.ts`)**: se crean solo cuando una carpeta tiene elementos
  reales que exportar.
- Cada carpeta vacía de la estructura está marcada con `.gitkeep`.

---

## Tecnologías

| Tecnología            | Uso                                        |
| --------------------- | ------------------------------------------ |
| Angular **22**        | Framework (Standalone, Signals, Zoneless)  |
| TypeScript **strict** | Tipado estricto + `strictTemplates`        |
| Angular Material (M3) | Componentes de UI complejos                |
| Tailwind CSS **v4**   | Layout y utilidades (utility-first)        |
| SCSS                  | Tokens, mixins, resets y reglas globales   |
| RxJS                  | Programación reactiva (HTTP, streams)      |
| @ngrx/signals         | Estado global (stores de `core/state`)     |
| Jest 30               | Tests unitarios (`@angular-builders/jest`) |
| ESLint + Prettier     | Lint y formato                             |
| Husky + lint-staged   | Git hooks de calidad                       |

### Diseño del sistema de estilos

- **Tailwind** = layout, spacing, grid y composición visual.
- **Angular Material** = componentes complejos (dialogs, forms, overlays…).
- **SCSS parciales** (`src/styles/`) = tokens, resets, tipografía, animaciones.

| Archivo            | Responsabilidad                                                |
| ------------------ | -------------------------------------------------------------- |
| `_variables.scss`  | Tokens: colores, tipografía, spacing, radios, sombras, z       |
| `_mixins.scss`     | Mixins reutilizables (container, media, focus, card…)          |
| `_functions.scss`  | Funciones puras (rem, fluid, tint/shade, contrast)             |
| `_reset.scss`      | Reset CSS moderno                                              |
| `_typography.scss` | Jerarquía tipográfica base                                     |
| `_animations.scss` | Keyframes y clases de animación                                |
| `_utilities.scss`  | Utilidades propias que complementan a Tailwind                 |
| `styles.scss`      | Entry: parciales + tokens CSS (`--hs-*`) + tema M3 de Material |

Los tokens de `_variables.scss` se exponen a Tailwind v4 mediante el bloque
`@theme` de `src/tailwind.css`, de modo que utilidades como `bg-brand-600` o
`text-muted` nacen de la **misma fuente de verdad**. Tailwind se importa como
entry aparte (`src/tailwind.css`) porque el compilador Sass no resuelve
`@use 'tailwindcss'`.

### Backend

- API base en desarrollo: `http://localhost:3000/api` (Express + MongoDB).
- El CORS del backend ya permite `http://localhost:4200`.
- Configurable desde `src/environments/` (`apiBaseUrl`).

> **Nota sobre producción:** `environment.ts` contiene
> `apiBaseUrl: "http://localhost:3000/api"` **únicamente para desarrollo
> local** (actúa como placeholder). Antes del primer despliegue deberá
> configurarse la URL pública del backend en el entorno de producción.

---

## Requisitos

- **Node.js ≥ 22.22** (se recomienda la LTS 24.x) · npm 10+
- Angular CLI 22 (incluido como dependencia del proyecto)

## Scripts

| Comando                 | Descripción                           |
| ----------------------- | ------------------------------------- |
| `npm start`             | Servidor de desarrollo (`ng serve`)   |
| `npm run build`         | Build de producción (`ng build`)      |
| `npm run watch`         | Build en watch (development)          |
| `npm test`              | Tests unitarios en un solo run (Jest) |
| `npm run test:watch`    | Tests en modo watch                   |
| `npm run test:coverage` | Tests con reporte de cobertura        |
| `npm run lint`          | ESLint (Angular)                      |
| `npm run lint:fix`      | ESLint con autofix                    |
| `npm run format`        | Prettier (escribe)                    |
| `npm run format:check`  | Prettier (solo comprueba)             |

## Calidad en Git

El hook `pre-commit` de Husky ejecuta `lint-staged`, que aplica **Prettier** y
**ESLint (--fix)** sobre los archivos staged. Los **tests se ejecutan en
CI / Pull Requests / merge / release**, no en cada commit, para que los commits
sean rápidos.

## Alias de imports

| Alias         | Ruta                 |
| ------------- | -------------------- |
| `@core/*`     | `src/core/*`         |
| `@shared/*`   | `src/shared/*`       |
| `@features/*` | `src/features/*`     |
| `@layouts/*`  | `src/layouts/*`      |
| `@styles/*`   | `src/styles/*`       |
| `@env/*`      | `src/environments/*` |

Los mismos alias están espejados en `jest.config.js` (`moduleNameMapper`) y en
los `includePaths` de SCSS.
