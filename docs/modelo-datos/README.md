# Modelo de Datos (Diagrama Entidad-Relación y Diccionario de Datos)
## Sistema Web de CV Interactivo con Constructor Visual y Bóveda PDF

**Versión:** 1.0  
**Fecha:** 2026-11-21  
**Motor de Base de Datos:** PostgreSQL 16 (`postgres:16-alpine`)  
**ORM y Esquema Fuente:** Prisma 6 ([schema.prisma](../../packages/database/prisma/schema.prisma)) · Contratos `Zod` por servicio (`@cv/contracts`, `@cv/api-cv`, `@cv/api-certifications`, `@cv/api-studio`, `@cv/api-contact`) · Datos Iniciales ([seed.ts](../../packages/database/prisma/seed.ts))  
**Documentos relacionados:** [SRS](../srs/README.md) · [SAD](../sad/README.md) · [ADRs](../adr/README.md) · [SDD](../sdd/README.md) · [Diseño de APIs](../api/README.md) · [Diseño UI/UX](../ui-ux/README.md)

---

## Índice de Documentos

| Archivo | Alcance |
| :--- | :--- |
| [01 - Diagrama Entidad-Relación (ER)](./01-diagrama-entidad-relacion.md) | Diagrama ER físico/lógico completo de las 10 tablas, cardinalidades exactas, llaves (`PK`, `FK`, `UK`) y matriz de acciones referenciales (`CASCADE` / `SET NULL`). |
| [02 - Diccionario de Datos](./02-diccionario-de-datos.md) | Especificación columna por columna de las **10 tablas** y **3 enumeraciones** (`UserRole`, `AssetKind`, `LayoutStatus`) con tipos PostgreSQL, nulabilidad, valores por defecto y reglas `Zod`. |
| [03 - Estructuras JSONB e Índices](./03-estructuras-jsonb-e-indices.md) | Esquemas internos de campos `JSONB` (`localized_info`, `social_links`, `theme_config`, `*_i18n`, `canvas_schema`), catálogo de los 9 índices compuestos/FK y reglas de aislamiento multi-tenant. |

---

## Inventario General del Esquema

| Tabla Física (`@@map`) | Modelo Prisma | Dominio | Rol Principal |
| :--- | :--- | :--- | :--- |
| `users` | `User` | Identidad y Tenant | Credenciales (`bcrypt`), rol y propiedad raíz de perfiles y activos. |
| `profiles` | `Profile` | Identidad y Tenant | Perfil público/privado (`slug` único), configuración bilingüe, enlaces sociales y tema. |
| `experiences` | `Experience` | Trayectoria Profesional | Historial laboral bilingüe ordenado (`sort_order`) con etiquetas técnicas. |
| `educations` | `Education` | Trayectoria Profesional | Formación académica y grados bilingües ordenados cronológicamente. |
| `projects` | `Project` | Portafolio | Proyectos destacados con enlaces a demo/repo y portada binaria opcional. |
| `skills` | `Skill` | Competencias | Matriz de habilidades técnicas categorizadas con nivel (1–100) y años. |
| `certifications` | `Certification` | Bóveda de Certificados | Metadatos verificables y enlace 1:1 opcional a su respaldo PDF (`file_asset_id`). |
| `file_assets` | `FileAsset` | Custodia Binaria | Metadatos e integridad (`sha256`, `storage_key`) de PDFs, imágenes, fuentes y código. |
| `page_layouts` | `PageLayout` | Constructor Studio | Versionado editorial (`DRAFT` / `PUBLISHED` / `ARCHIVED`) del árbol `canvas_schema`. |
| `contact_messages` | `ContactMessage` | Interacción Pública | Bandeja de entrada de mensajes de reclutadores/visitantes recibidos desde el CV. |

---

## Principios de Modelado

1. **Separación Datos Estructurados vs. Presentación Visual ([ADR-002](../adr/ADR-002-data-driven-freeform-canvas.md), [ADR-003](../adr/ADR-003-postgresql-jsonb-prisma.md)):** las tablas de carrera y certificaciones mantienen estructura relacional estricta (filtros, ordenación, exportación ATS), mientras la composición espacial libre reside en `page_layouts.canvas_schema` (`JSONB`).
2. **Aislamiento *Multi-Tenant Ready* ([ADR-004](../adr/ADR-004-multi-tenant-ready-single-tenant.md)):** todas las entidades de dominio cuelgan de `profile_id` (y los activos de `user_id`), exigiendo propiedad explícita en las consultas autenticadas.
3. **Bilingüismo por Contrato `JSONB`:** los textos traducibles (`*_i18n` y `localized_info`) evitan tablas satélite redundantes manteniendo validación estricta `es`/`en` en `Zod`.
