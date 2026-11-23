# Documento de Diseño Detallado (SDD)
## Sistema Web de CV Interactivo con Constructor Visual y Bóveda PDF

**Versión:** 1.0  
**Fecha:** 2026-11-21  
**Estado:** Alineado con el código base de Fase 1 + diseño objetivo de Fases 2–3  
**Documentos relacionados:** [SAD](../sad/README.md) · [ADRs](../adr/README.md) · [Modelo de Datos](../modelo-datos/README.md) · [APIs (OpenAPI)](../api/README.md) · [UI/UX](../ui-ux/README.md) · [SRS](../srs/README.md) · [Matriz de Trazabilidad](../matriz-trazabilidad.md) · [Prototipo](../prototipo/index.html)

---

## Índice del SDD

| Archivo | Contenido UML | Estado respecto al código actual |
| :--- | :--- | :--- |
| [01 - Diagramas de Clases](./01-diagramas-clases.md) | Entidades Prisma, contratos `canvasSchemaV1`, `StorageProvider`, seguridad y motor `template-engine` | 100 % verificado contra `packages/database/prisma/schema.prisma`, `packages/*` y `services/*` |
| [02 - Diagramas de Secuencia](./02-diagramas-secuencia.md) | Login + Proxy Edge, subida segura de PDFs, descarga controlada `/api/assets/[id]`, Studio `Draft/Published`, contacto y exportador ATS | Flujos 1–5 implementados en servicios Fase 1; flujo ATS marcado como Fase 3 |
| [03 - Diagramas de Componentes](./03-diagramas-componentes.md) | Descomposición del monorepo (`apps/web`, `services/*`, `packages/*`) y componentes frontend del Studio IDE | Capas Gateway/Servicios implementadas; componentes interactivos del Studio IDE detallados para Fase 2 |
| [04 - Diagramas de Despliegue](./04-diagramas-despliegue.md) | Topología local actual (`Node.js` + `Docker PostgreSQL 16` + `./storage/uploads`), topología producción y matriz `.env` | Basado en `docker-compose.yml`, `.env.example` y `packages/core/src/env.ts` |

---

## Convenciones de Notación

- **Diagramas de Clases (`classDiagram`)**: representan modelos de persistencia Prisma, interfaces TypeScript, *Data Transfer Objects* validados con `Zod` y módulos funcionales agrupados por responsabilidad.
- **Diagramas de Secuencia (`sequenceDiagram`)**: muestran paso a paso los intercambios síncronos/asíncronos entre navegador, borde (`apps/web/src/proxy.ts`), Gateway (`apps/web/src/app/api/**`), servicios (`services/*/src/`), almacenamiento binario y PostgreSQL.
- **Diagramas de Componentes y Despliegue (`flowchart`)**: emplean estereotipos UML estándar con comillas francesas (`«component»`, `«interface»`, `«boundary»`, `«database»`, `«device»`, `«executionEnvironment»`, `«container»`) para garantizar compatibilidad total en visores Markdown/Mermaid.
- **Trazabilidad explícita:** cada sección indica qué elementos ya existen en el repositorio y cuáles corresponden a extensiones planificadas de las **Fases 2 y 3**.
