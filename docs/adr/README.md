# Registro de Decisiones Arquitectónicas (ADRs)
## Sistema Web de CV Interactivo

**Formato:** Basado en MADR (*Markdown Architectural Decision Records*)  
**Fecha de actualización:** 2026-11-21  
**Documentos relacionados:** [Documento de Arquitectura (SAD)](../sad/README.md) · [Diseño Detallado (SDD)](../sdd/README.md) · [Modelo de Datos](../modelo-datos/README.md) · [APIs (OpenAPI)](../api/README.md) · [Diseño UI/UX](../ui-ux/README.md) · [SRS](../srs/README.md) · [Matriz de Trazabilidad](../matriz-trazabilidad.md)

---

## Índice de Decisiones

| ID | Título | Estado | Impacto / Alcance |
| :--- | :--- | :--- | :--- |
| [ADR-001](./ADR-001-monolito-modular-nextjs.md) | Monolito Modular Full-Stack con Next.js App Router y TypeScript | Aceptado | Arquitectura base y despliegue |
| [ADR-002](./ADR-002-data-driven-freeform-canvas.md) | Arquitectura Dual "Data-Driven Freeform Canvas" y Móvil por Apilado | Aceptado | Studio `/studio` y Vista Pública `/` |
| [ADR-003](./ADR-003-postgresql-jsonb-prisma.md) | Persistencia Híbrida Relacional + JSONB con PostgreSQL 16 y Prisma ORM | Aceptado | Base de datos y modelo |
| [ADR-004](./ADR-004-multi-tenant-ready-single-tenant.md) | Diseño Multi-Tenant Ready operando en Single-Tenant inicial | Aceptado | Seguridad, rutas y escalabilidad |
| [ADR-005](./ADR-005-autenticacion-jwt-httponly-proxy.md) | Sesiones `HttpOnly` JWT (`jose`), `bcryptjs`, Rate Limit y Proxy Edge | Aceptado | Seguridad y control de acceso |
| [ADR-006](./ADR-006-custodia-activos-storage-provider.md) | Abstracción `StorageProvider`, Validación de *Magic Bytes* y Entrega Controlada | Aceptado | PDFs de certificaciones y fuentes |
| [ADR-007](./ADR-007-motor-plantillas-seguro-shadow-dom.md) | Motor Seguro de Variables `{{cv.*}}` y Shadow DOM para Código Subido | Aceptado | Studio IDE y seguridad XSS |
| [ADR-008](./ADR-008-flujo-editorial-draft-published.md) | Flujo Editorial `Draft / Published` y Versionado de Layouts | Aceptado | Publicación segura sin interrupciones |
| [ADR-009](./ADR-009-exportacion-pdf-ats-friendly.md) | Exportación Automática de CV en Formato ATS-Friendly Independiente del Lienzo | Aceptado | Reclutamiento y bilingüismo |
| [ADR-010](./ADR-010-sistema-visual-y-arquitectura-ux.md) | Estética Editorial "Obsidian & Bone" y Separación UX (Público / Hub / IDE) | Aceptado | Experiencia de usuario e interfaz |
| [ADR-011](./ADR-011-monorepo-servicios-pnpm-workspace.md) | Organización en Monorepo Orientado a Servicios (`apps/web` + `services/*/src` + `packages/*`) | Aceptado | Desacoplamiento y fronteras ESLint |
