# ADR-011: Organización en Monorepo Orientado a Servicios (`apps/web` + `services/*/src` + `packages/*`)

- **Estado:** Aceptado (Evoluciona estructuralmente [ADR-001](./ADR-001-monolito-modular-nextjs.md))
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RNF-MAINT-01`, `RNF-MAINT-02`, `RNF-MAINT-03`, `RNF-SEG-01`

## Contexto
La estructura inicial de Fase 1 concentraba todo en un único directorio `src/` organizado por capas técnicas horizontales (`src/lib/validation/schemas.ts` monolítico con esquemas de todos los dominios, `src/lib/db/prisma` importado directamente desde `src/app/api/**` y `src/app/page.tsx`). Con el crecimiento previsto hacia Fases 2 y 3 (Studio IDE, bóveda de fuentes, exportación ATS PDF), este acoplamiento generaba riesgo de código espagueti y dificultaba aislar dominios como si fueran microservicios.

## Alternativas Consideradas
1. **Mantener un único `src/` reorganizado por `src/modules/*`:** Reduce acoplamiento en un mismo paquete, pero sigue compartiendo una sola raíz de dependencias y compilación.
2. **Desplegar 6 servidores HTTP separados desde el día 1 en puertos distintos:** Aísla procesos físicos, pero introduce complejidad innecesaria de CORS, cookies `HttpOnly` multi-puerto y orquestación en desarrollo local.
3. **Monorepo Orientado a Servicios con `pnpm workspaces` (Elegida):** Separa físicamente Frontend + API Gateway (`apps/web/src`), **6 microservicios lógicos** con su propio `package.json`, `src/` y `tests/` (`services/{api-auth,api-cv,api-certifications,media-vault,api-studio,api-contact}`) y **3 paquetes núcleo** (`packages/{contracts,core,database}`), ensamblados en Next.js con verificación automática de fronteras en ESLint (`no-restricted-imports`).

## Decisión
Reorganizar todo el repositorio en un **Monorepo `pnpm` Orientado a Servicios**:
- **`apps/web/` (`@cv/web`):** Frontend puro Next.js (`src/app/`, `src/components/`, `src/proxy.ts`) y montajes REST delgados en `src/app/api/**` (3–8 líneas por archivo), con prohibición expresa en ESLint de importar `@cv/database` o `@prisma/client`.
- **`services/*/`:** Microservicios lógicos independientes por dominio:
  - `@cv/api-auth`: login/logout/me, sesiones `HttpOnly` JWT, `bcryptjs`, verificación Edge (`@cv/api-auth/edge`) y guardas multi-tenant.
  - `@cv/api-cv`: perfil, experiencias, educación, proyectos, habilidades y lecturas públicas (`getPrimaryPublishedShowcase`, `getAdminOverviewCounts`).
  - `@cv/api-certifications`: metadatos bilingües y ciclo transaccional de certificados coordinando con `@cv/media-vault`.
  - `@cv/media-vault`: `StorageProvider`, `LocalStorageProvider`, validadores de *magic bytes* (`%PDF-`, `.woff2`/`.ttf`/`.otf`) y entrega segura `/api/assets/[id]`.
  - `@cv/api-studio`: esquema `canvasSchemaV1`, ciclos `DRAFT`/`PUBLISHED`/`ARCHIVED` y motor seguro `renderCvTemplate()` (`{{cv.*}}`).
  - `@cv/api-contact`: formulario anti-spam (*honeypot* + rate limit) y bandeja CMS.
- **`packages/*/`:** Kernel técnico (`@cv/contracts`, `@cv/core`, `@cv/database`).

## Justificación
- Elimina el archivo único monolítico de esquemas y el acceso directo a base de datos desde la UI o rutas HTTP.
- Permite trabajar y probar cada servicio de forma aislada (`services/<servicio>/tests/`), con la claridad visual y mental de una arquitectura de microservicios.
- Prepara extracción real sin fricción: mover `@cv/media-vault` o un futuro exportador ATS a un contenedor HTTP/worker separado solo requiere exponer sus rutas ya aisladas en `routes/`.

## Consecuencias
- **Positivas:** Fronteras verificadas mecánicamente vía `eslint .` (`no-restricted-imports`), 100 % de tests unitarios ubicados dentro de su servicio, un único puerto en desarrollo (`pnpm dev`) sin problemas de CORS ni cookies.
- **Negativas / Mitigación:** Al existir múltiples `package.json`, los imports entre workspace packages deben resolverse mediante `pnpm install` + `transpilePackages` en `apps/web/next.config.ts` y `paths` en `tsconfig.json`.
