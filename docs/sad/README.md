# Documento de Arquitectura de Software (SAD)
## Sistema Web de CV Interactivo con Constructor Visual y Bóveda PDF

**Versión:** 1.0  
**Fecha:** 2026-11-21  
**Estado:** Aprobado (Base Fase 1 completada · Guía para Fase 2–4)  
**Documentos relacionados:** [Visión y Alcance](../vision-y-alcance.md) · [Estudio de Factibilidad](../estudio-factibilidad.md) · [SRS](../srs/README.md) · [SDD (UML)](../sdd/README.md) · [Modelo de Datos](../modelo-datos/README.md) · [APIs (OpenAPI)](../api/README.md) · [UI/UX](../ui-ux/README.md) · [Matriz de Trazabilidad](../matriz-trazabilidad.md) · [Prototipo](../prototipo/index.html)

---

## Índice del SAD

1. [01 - Modelo C4 (Contexto, Contenedores, Componentes y Código)](./01-vistas-c4.md)
2. [02 - Vistas Arquitectónicas 4+1 (Kruchten)](./02-vistas-4-mas-1.md)
3. [03 - Stack Tecnológico, Atributos de Calidad y ADRs](./03-stack-y-decisiones-adr.md)
4. [Registro Completo de ADRs (ADR-001 a ADR-010)](../adr/README.md)

---

## 1. Propósito y Alcance Arquitectónico

Este documento describe la arquitectura de software del **Sistema Web de CV Interactivo**, un sistema full-stack que integra:
- Una **página pública interactiva** con estética editorial *Obsidian & Bone* (bilingüe `ES/EN`, tema claro/oscuro, filtros, visor PDF modal y exportación ATS).
- Un **Control Center CMS (`/admin`)** para gestionar información estructurada de carrera, fuentes personalizadas y certificaciones/documentos en PDF.
- Un **Constructor Visual Studio + IDE (`/studio`)** que combina lienzo libre Desktop / apilado móvil configurable, subida e inserción de código HTML/CSS aislado y variables dinámicas conectadas a datos reales (`{{cv.*}}`).

---

## 2. Estilo Arquitectónico Principal

El sistema sigue el estilo de **Monolito Modular Orientado a Servicios (*Bounded Contexts* sobre `pnpm workspaces`)**, ejecutado en **Next.js App Router + TypeScript `strict`** ([ADR-011](../adr/ADR-011-monorepo-servicios-pnpm-workspace.md)):

1. **Separación física Frontend + Servicios + Núcleo Compartido:**
   - **Frontend & API Gateway (`apps/web/src`):** interfaz pública (`/`), `/login`, Control Center (`/admin/*`), Studio (`/studio`), proxy Edge (`apps/web/src/proxy.ts`) y montajes REST delgados en `apps/web/src/app/api/**` con prohibición de acceso directo a base de datos.
   - **6 Microservicios Lógicos (`services/*/src`):** `api-auth`, `api-cv`, `api-certifications`, `media-vault`, `api-studio` y `api-contact`, cada uno con su propio `package.json`, `schemas/`, `repositories/`, `routes/` y pruebas en `services/*/tests/`.
   - **Paquetes Base (`packages/*`):** `contracts`, `core` y `database` (`Prisma 6`), bajo reglas automáticas `no-restricted-imports` en `eslint.config.mjs`.
2. **Arquitectura Híbrida "Data-Driven Freeform Canvas":**
   - **Capa de Datos Estructurados** (tablas relacionales en PostgreSQL): fuente única de verdad para perfil, experiencias, educación, proyectos, habilidades, certificaciones y mensajes.
   - **Capa de Composición Visual** (`PageLayout.canvasSchema` en `JSONB`): describe posiciones libres Desktop `(x, y, w, h, zIndex)`, orden móvil `(order, visible)`, nodos `custom_code` y widgets enlazados.
3. **Aislamiento Multi-Tenant Ready desde el origen:** Aunque el modo operativo inicial es personal (`ALLOW_SIGNUP=false`), todas las consultas de dominio filtran por `userId` y `profileId`, y las rutas soportan `/u/[slug]`.
4. **Inversión de Dependencias en Almacenamiento (`StorageProvider`):** La persistencia binaria (PDFs de certificaciones, imágenes, tipografías personalizadas `.woff2`/`.ttf`/`.otf` y paquetes de código) se desacopla detrás de la interfaz `StorageProvider`, permitiendo iniciar en disco local (`./storage/uploads`) y migrar a S3/R2/MinIO sin alterar los casos de uso.
5. **Seguridad por Defecto (Defense in Depth):** Proxy Edge (`apps/web/src/proxy.ts` + `@cv/api-auth/edge`) + guardas en Server Components + validación de sesión/propiedad (`requireAuthenticatedContext`) + validación de *magic bytes* binarios + interpolación de plantillas sin `eval` y renderizado en Shadow DOM / sandbox.
