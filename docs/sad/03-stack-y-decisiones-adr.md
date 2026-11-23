# 03 - Stack Tecnológico, Atributos de Calidad y ADRs

---

## 1. Catálogo del Stack Tecnológico (Verificado en `package.json`)

| Capa | Tecnología / Paquete | Versión Declarada | Rol Arquitectónico |
| :--- | :--- | :--- | :--- |
| **Framework Full-Stack** | `next` (App Router) + `react` / `react-dom` | `^16.4.6` / `^19.3.1` | Renderizado SSR/RSC, enrutamiento `/`, `/admin`, `/studio` y Route Handlers API. |
| **Lenguaje y Tipado** | `typescript` (`strict: true`) | `^5.9.3` | Seguridad de tipos de extremo a extremo (UI, API, Prisma y esquemas). |
| **Estilos e Iconografía** | `tailwindcss` + `@tailwindcss/postcss` + `lucide-react` | `^4.3.5` / `^1.76.0` | Sistema visual *Obsidian & Bone* (`Fraunces`, `Space Grotesk`, `Space Mono`). |
| **Validación y Contratos** | `zod` | `^3.25.76` | Validación estricta de formularios, APIs y árbol `canvasSchemaV1` (`JSONB`). |
| **ORM y Base de Datos** | `prisma` + `@prisma/client` + PostgreSQL 16 (Docker) | `^6.19.3` | Modelado relacional, migraciones, transacciones atómicas y consultas `JSONB`. |
| **Autenticación y Crypto** | `jose` (JWT HS256) + `bcryptjs` | `^6.2.18` / `^3.0.3` | Hashing seguro de contraseñas y firma/verificación de cookies `HttpOnly` (compatible con Edge y Node). |
| **Pruebas y Calidad** | `vitest` + `eslint` + `eslint-config-next` | `^4.0.0` / `^9.39.5` / `^16.4.6` | Pruebas unitarias rápidas, reglas React 19 / Next 16 y linting estático. |
| **Infraestructura Local** | Docker Compose (`postgres:16-alpine`) + `pnpm` | PostgreSQL 16 | Entorno reproducible de base de datos en un comando. |
| **Extensiones Planificadas (Fases 2–3)** | `Zustand`, `Framer Motion`, `pdfjs-dist` (`PDF.js`), `@react-pdf/renderer` o `pdfkit` | A incorporar en Fases 2–3 | Historial `Undo/Redo` del lienzo, transiciones intencionales, visor PDF modal y exportador ATS. |

---

## 2. Decisiones Arquitectónicas (ADRs)

> Consulta el [Índice completo MADR (ADR-001 a ADR-011)](../adr/README.md) para revisar las fichas detalladas de cada decisión arquitectónica (incluyendo `ADR-007` a `ADR-011` sobre motor de plantillas Shadow DOM, flujo `Draft/Published`, exportación PDF ATS, sistema visual/UX y monorepo orientado a servicios en `pnpm`). A continuación se presenta el resumen ejecutivo de los 6 pilares iniciales:

### ADR-01 (y ADR-011): Monolito Modular Orientado a Servicios en `pnpm workspaces`
- **Decisión:** Mantener un único despliegue Next.js 16 (App Router) con TypeScript estricto, pero organizado internamente en monorepo `pnpm` con Frontend/Gateway separado (`apps/web/src`), 6 servicios lógicos (`services/{api-auth,api-cv,api-certifications,media-vault,api-studio,api-contact}/src`) y núcleo compartido (`packages/{contracts,core,database}`).
- **Justificación:** Combina cero latencia de red y sesiones `HttpOnly` sin CORS en un único puerto, con fronteras estrictas verificadas en ESLint para evitar código espagueti y facilitar la extracción de cualquier servicio (ej. `media-vault` o futuro `pdf-export`) a contenedor dedicado.

### ADR-02: Arquitectura Dual "Data-Driven Freeform Canvas"
- **Decisión:** Separar los datos profesionales normalizados (tablas SQL) del documento visual `canvasSchema` (`JSONB`), y en móvil aplicar apilado vertical automático con orden/visibilidad configurables (`mobile.order`, `mobile.visible`) en vez de dos lienzos libres separados.
- **Justificación:** Resuelve el conflicto entre libertad creativa en escritorio (`x, y, w, h, zIndex`) y consistencia para filtros dinámicos, traducciones `ES/EN`, exportación ATS PDF limpia y legibilidad garantizada en teléfonos.

### ADR-03: Aislamiento Multi-Tenant Ready en Base de Datos (`userId`, `profileId`, `slug`)
- **Decisión:** Incluir `userId` y `profileId` como llaves obligatorias desde la primera migración y controlar el registro abierto mediante `ALLOW_SIGNUP=false`.
- **Justificación:** Habilita el uso personal inmediato sin fricción y evita migrar tablas o reescribir guardas de API si en el futuro se abre como plataforma multi-usuario (`/u/[slug]`).

### ADR-04: Motor Propio Seguro de Plantillas `{{cv.*}}` y Shadow DOM para Código Subido
- **Decisión:** Soportar nodos `custom_code` (escritos o subidos en `.html`/`.css`) mediante interpolación lógica-mínima sin `eval` (`services/api-studio/src/engine/template-engine.ts`) con escape HTML automático y renderizado en Shadow DOM / sandbox aislado.
- **Justificación:** Permite personalizar bloques desde cero con código propio conectado a datos reales de PostgreSQL sin abrir brechas XSS ni romper los estilos globales de la aplicación.

### ADR-05: Abstracción `StorageProvider` y Entrega Controlada por Endpoint
- **Decisión:** Almacenar PDFs, fuentes e imágenes fuera de `public/` bajo UUIDs internos tras `StorageProvider`, sirviéndolos desde `/api/assets/[id]` previa verificación de visibilidad/propiedad y validación previa de *magic bytes*.
- **Justificación:** Impide exposición directa de archivos privados o renombrados maliciosos, respeta la regla por certificado `allowDownload` y desacopla disco local de S3/R2.

### ADR-06: Estética Editorial "Obsidian & Bone" como Tema Insignia por Defecto
- **Decisión:** Adoptar una dirección visual arquitectónica de alto contraste (fondo `#000000`/`#0a0a0a`, tinta `#cdc4ba`, acento `#ce5e32`, variantes *Void/Cobalt/Indigo* y modo claro *Bone Paper*, tríada `Fraunces` + `Space Grotesk` + `Space Mono`) como preset por defecto (`ryoku-obsidian`), configurable por el usuario.
- **Justificación:** Diferencia el CV del promedio de plantillas SaaS genéricas y aporta rigor técnico inmediato desde el primer despliegue.
