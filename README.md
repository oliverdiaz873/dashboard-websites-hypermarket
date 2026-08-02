# dashboard-websites-hypermarket

Dashboard administrativo del ecommerce **Hipermercado Superior**. Exclusivo para
administradores, construido sobre la API REST del backend
(`backend-advanced-websites-hypermarket-express-mongodb`).

> **Project Status**
>
> - **Current Phase:** `Phase 2 — Admin Layout & Application Shell` ✅ (cerrada)
> - **Completed:** `Phase 0 — Init` · `Phase 1 — Core` · `Phase 2 — Admin Layout`
> - **Upcoming:** `Phase 3 — Authentication` · `Phase 4+ — Productos, Órdenes,
Estadísticas…`
>
> **Phase 2 — Admin Layout & Application Shell** — responsive shell, dark theme
> runtime, sidebar navigation, accesibilidad, loading indicator e integración de
> Signals.

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

### Phase 2 — Admin Layout & Application Shell

El shell del dashboard vive en `layouts/admin-layout` y compone el `Sidebar`,
`Topbar`, `Breadcrumb` y el `RouterOutlet`. Se definió con un `SidebarStore`
(@ngrx/signals) que gestiona colapso, drawer móvil y viewport
(`mobile`/`tablet`/`desktop`):

- **Desktop (≥1200px):** sidebar fijo, colapsable a 72px (preferencia persistida
  en `localStorage`).
- **Tablet (768–1199px):** sidebar siempre colapsado.
- **Mobile (<768px):** sidebar como drawer overlay con backdrop, cerrado con
  `Escape` y con `FocusTrap` del CDK.

La detección de viewport usa `BreakpointObserver` del CDK (solo comportamiento),
mientras que el CSS aplica la variante Tailwind `desktop:` sobre el breakpoint
personalizado `--breakpoint-desktop: 75rem` (1200px).

- **Navegación** (`core/constants/navigation.ts`): `NAVIGATION_ITEMS` con rutas
  UI desacopladas de los endpoints HTTP (`core/http/endpoints.ts`), permitiendo
  rutas de UI como `/contacts` frente a una API `/contact`.
- **Tema** (`core/services/theme-manager.service.ts`): resuelve
  `light`/`dark`/`system` a un único valor aplicado como `data-theme` en
  `<html>`, con una sola suscripción a `matchMedia`. El modo **dark es completo**:
  paleta oscura en `_variables.scss`, override de variables CSS `--hs-*` en
  `[data-theme='dark']` y tema M3 oscuro vía `mat.theme(theme-type: dark)`.
- **Componentes shared** (`shared/components/`): `sidebar`, `topbar`,
  `breadcrumb`, `page-header`, `loading-overlay` y `empty-state`, todos
  standalone con `OnPush`.
- **Rutas:** `app.routes.ts` monta `AdminLayoutComponent` como shell con
  `dashboard` lazy y un **404 real** lazy (`not-found`) en `**`.
- **Carga:** `LoadingStore` global no bloqueante mostrado como barra superior
  fija (`pointer-events-none`).

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
