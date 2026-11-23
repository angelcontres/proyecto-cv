# 02 - Diccionario de Datos

Especificación completa de enumeraciones y columnas físicas de las **10 tablas** definidas en [schema.prisma](../../packages/database/prisma/schema.prisma), junto con las reglas de validación distribuidas por dominio en `packages/contracts/src/` y `services/*/src/schemas/`.

---

## 1. Enumeraciones (`ENUM`)

### `UserRole` (`"UserRole"`)
| Valor | Uso en el Sistema |
| :--- | :--- |
| `OWNER` | Valor por defecto (`@default(OWNER)`). Propietario principal de la instancia CV (asignado por `packages/database/prisma/seed.ts`). |
| `USER` | Rol estándar reservado para escalado futuro *multi-tenant* (`ALLOW_SIGNUP=true`). |
| `ADMIN` | Rol administrativo reservado para operación global de plataforma. |

### `AssetKind` (`"AssetKind"`)
| Valor | Tipo de Archivo / Propósito | Validación Binaria Asociada |
| :--- | :--- | :--- |
| `CERT_PDF` | Valor por defecto (`@default(CERT_PDF)`). Certificados y diplomas PDF en bóveda. | `validatePdfBuffer()` (`%PDF-`, MIME `application/pdf`, `MAX_PDF_SIZE_MB`). |
| `IMAGE` | Avatares de perfil (`avatar_asset_id`) y portadas de proyectos (`cover_asset_id`). | Reservado para subida de imágenes Fase 2. |
| `FONT` | Fuentes personalizadas subidas en Studio (`.woff2`, `.ttf`, `.otf`). | `validateFontBuffer()` (`wOF2`, `OTTO`, TTF). |
| `CODE_BUNDLE` | Paquetes o archivos fuente HTML/CSS subidos para bloques `custom_code`. | Sanitización segura vía `sanitizeCustomHtml()`. |
| `OTHER` | Activos auxiliares genéricos. | Validación base de almacenamiento. |

### `LayoutStatus` (`"LayoutStatus"`)
| Valor | Estado Editorial en `page_layouts` |
| :--- | :--- |
| `DRAFT` | Valor por defecto (`@default(DRAFT)`). Borrador editable activo en `/studio`. |
| `PUBLISHED` | Versión vigente renderizada al público en `/` (consulta `orderBy version DESC`). |
| `ARCHIVED` | Snapshot histórico previo conservado automáticamente al publicar una versión nueva. |

---

## 2. Tablas del Esquema PostgreSQL

### 2.1 Tabla `users` (Modelo `User`)
Almacena cuentas de usuario autenticable del sistema.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador único del usuario. |
| `email` | `email` | `text` | NO | — | `UK`; validación email trim lowercase en `loginSchema` | Correo de acceso único. |
| `password_hash` | `passwordHash` | `text` | NO | — | Hash `bcryptjs` (factor 12 en seed; mínimo 8–128 chars en input `loginSchema`) | Contraseña cifrada irreversiblemente. |
| `name` | `name` | `text` | NO | — | No vacío | Nombre visible del usuario en `/admin`. |
| `role` | `role` | `"UserRole"` | NO | `OWNER` | Enum `UserRole` | Rol asignado a la cuenta. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Fecha de creación de la cuenta. |
| `updated_at` | `updatedAt` | `timestamp(3)` | NO | `@updatedAt` | Automático | Última modificación del registro. |

---

### 2.2 Tabla `profiles` (Modelo `Profile`)
Perfil profesional raíz que agrupa toda la información del CV y configuración visual/bilingüe.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador único del perfil. |
| `user_id` | `userId` | `uuid` (`@db.Uuid`) | NO | — | `FK -> users.id` (`ON DELETE CASCADE`), `IDX` | Propietario del perfil (aislamiento tenant). |
| `slug` | `slug` | `text` | NO | — | `UK`; regex `^[a-z0-9-]+$`, 2–64 chars (`profileUpdateSchema`) | Identificador público URL (`/u/[slug]` y `PRIMARY_PROFILE_SLUG`). |
| `is_primary` | `isPrimary` | `boolean` | NO | `false` | Booleano | Marca el perfil principal renderizado en `/`. |
| `default_locale` | `defaultLocale` | `text` | NO | `"es"` | Enum Zod `"es" \| "en"` | Idioma de respaldo y carga inicial del perfil. |
| `localized_info` | `localizedInfo` | `jsonb` | NO | `{}` | Validado por `profileUpdateSchema.localizedInfo` | Nombre, titular bilingüe, bio, ubicación, badge disponibilidad y correo público. |
| `social_links` | `socialLinks` | `jsonb` | NO | `{}` | URLs `http/https` validadas por `safeUrlSchema` | Enlaces a LinkedIn, GitHub, sitio web y X. |
| `theme_config` | `themeConfig` | `jsonb` | NO | `{}` | Configuración de preset/paleta (ver doc 03) | Tokens visuales del tema (ej. `ryoku-obsidian`). |
| `avatar_asset_id` | `avatarAssetId` | `uuid` (`@db.Uuid`) | SÍ | `null` | `UK`, `FK -> file_assets.id` (`ON DELETE SET NULL`) | Imagen de avatar vinculada al perfil. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Marca temporal de creación. |
| `updated_at` | `updatedAt` | `timestamp(3)` | NO | `@updatedAt` | Automático | Marca temporal de actualización. |

---

### 2.3 Tabla `experiences` (Modelo `Experience`)
Registros de experiencia laboral asociados a un perfil.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador único de experiencia. |
| `profile_id` | `profileId` | `uuid` (`@db.Uuid`) | NO | — | `FK -> profiles.id` (`ON DELETE CASCADE`), `IDX compuesto` | Perfil propietario. |
| `company` | `company` | `text` | NO | — | Trim, 1–140 chars (`experienceSchema`) | Nombre de empresa u organización. |
| `location` | `location` | `text` | SÍ | `null` | Máx. 120 chars | Ciudad, país o modalidad remota. |
| `role_i18n` | `roleI18n` | `jsonb` | NO | — | `localizedTextSchema` (al menos `es` o `en`, máx. 4000) | Cargo o rol traducido. |
| `summary_i18n` | `summaryI18n` | `jsonb` | NO | — | `optionalLocalizedTextSchema` | Descripción general bilingüe. |
| `highlights_i18n` | `highlightsI18n` | `jsonb` | NO | `{}` | `localizedListSchema` (listas de logros máx. 300 chars c/u) | Viñetas de logros clave en `es`/`en`. |
| `tags` | `tags` | `text[]` | NO | `[]` | Máx. 20 etiquetas, 1–40 chars c/u | Tecnologías o áreas del puesto. |
| `start_date` | `startDate` | `date` (`@db.Date`) | NO | — | Formato input `YYYY-MM-DD` | Fecha de inicio del puesto. |
| `end_date` | `endDate` | `date` (`@db.Date`) | SÍ | `null` | `>= startDate` si `isCurrent` es `false` | Fecha de finalización (nula si es actual). |
| `is_current` | `isCurrent` | `boolean` | NO | `false` | Booleano | Indica trabajo actual. |
| `sort_order` | `sortOrder` | `integer` | NO | `0` | Entero `0..9999` | Prioridad manual de despliegue. |
| `is_visible` | `isVisible` | `boolean` | NO | `true` | Booleano | Controla publicación en vista pública y ATS. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Fecha de creación. |
| `updated_at` | `updatedAt` | `timestamp(3)` | NO | `@updatedAt` | Automático | Última modificación. |

---

### 2.4 Tabla `educations` (Modelo `Education`)
Historial de formación académica del perfil.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador único académico. |
| `profile_id` | `profileId` | `uuid` (`@db.Uuid`) | NO | — | `FK -> profiles.id` (`ON DELETE CASCADE`), `IDX compuesto` | Perfil propietario. |
| `institution` | `institution` | `text` | NO | — | 1–160 chars (`educationSchema`) | Universidad o institución educativa. |
| `location` | `location` | `text` | SÍ | `null` | Máx. 120 chars | Ubicación de la institución. |
| `degree_i18n` | `degreeI18n` | `jsonb` | NO | — | `localizedTextSchema` | Título o programa cursado en `es`/`en`. |
| `summary_i18n` | `summaryI18n` | `jsonb` | NO | `{}` | `optionalLocalizedTextSchema` | Detalles, menciones o enfoque bilingüe. |
| `start_date` | `startDate` | `date` (`@db.Date`) | NO | — | Formato `YYYY-MM-DD` | Fecha de inicio de estudios. |
| `end_date` | `endDate` | `date` (`@db.Date`) | SÍ | `null` | `>= startDate` salvo `isCurrent=true` | Fecha de egreso/graduación. |
| `is_current` | `isCurrent` | `boolean` | NO | `false` | Booleano | Indica estudios en curso. |
| `sort_order` | `sortOrder` | `integer` | NO | `0` | Entero `0..9999` | Orden manual en línea de tiempo. |
| `is_visible` | `isVisible` | `boolean` | NO | `true` | Booleano | Visibilidad pública. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Fecha de creación. |
| `updated_at` | `updatedAt` | `timestamp(3)` | NO | `@updatedAt` | Automático | Última modificación. |

---

### 2.5 Tabla `projects` (Modelo `Project`)
Proyectos técnicos y casos de estudio del portafolio.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador único del proyecto. |
| `profile_id` | `profileId` | `uuid` (`@db.Uuid`) | NO | — | `FK -> profiles.id` (`ON DELETE CASCADE`), `IDX compuesto` | Perfil propietario. |
| `title_i18n` | `titleI18n` | `jsonb` | NO | — | `localizedTextSchema` (`projectSchema`) | Título bilingüe del proyecto. |
| `summary_i18n` | `summaryI18n` | `jsonb` | NO | — | `optionalLocalizedTextSchema` | Resumen arquitectónico/resultados en `es`/`en`. |
| `tags` | `tags` | `text[]` | NO | `[]` | Máx. 20 tags de 1–40 chars | Stack utilizado (filtrable en web pública). |
| `demo_url` | `demoUrl` | `text` | SÍ | `null` | URL `http/https` (`safeUrlSchema`) | Enlace a demo en vivo. |
| `repo_url` | `repoUrl` | `text` | SÍ | `null` | URL `http/https` (`safeUrlSchema`) | Enlace a repositorio de código fuente. |
| `cover_asset_id` | `coverAssetId` | `uuid` (`@db.Uuid`) | SÍ | `null` | `UK`, `FK -> file_assets.id` (`ON DELETE SET NULL`) | Imagen de portada opcional en bóveda. |
| `year` | `year` | `integer` | SÍ | `null` | Entero `1990..2100` | Año de realización o lanzamiento. |
| `is_featured` | `isFeatured` | `boolean` | NO | `false` | Booleano | Destacado en sección principal / filtros. |
| `sort_order` | `sortOrder` | `integer` | NO | `0` | Entero `0..9999` | Orden de aparición. |
| `is_visible` | `isVisible` | `boolean` | NO | `true` | Booleano | Visibilidad pública. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Fecha de creación. |
| `updated_at` | `updatedAt` | `timestamp(3)` | NO | `@updatedAt` | Automático | Última modificación. |

---

### 2.6 Tabla `skills` (Modelo `Skill`)
Habilidades y herramientas agrupadas por categoría.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador único de habilidad. |
| `profile_id` | `profileId` | `uuid` (`@db.Uuid`) | NO | — | `FK -> profiles.id` (`ON DELETE CASCADE`), `IDX compuesto` | Perfil propietario. |
| `name` | `name` | `text` | NO | — | 1–80 chars (`skillSchema`) | Nombre de tecnología o competencia. |
| `category` | `category` | `text` | NO | — | 1–60 chars (`skillSchema`) | Categoría para agrupación y filtros (ej. Backend, Cloud). |
| `level` | `level` | `integer` | NO | `80` | Entero `1..100` | Nivel porcentual de dominio. |
| `years` | `years` | `double precision` (`Float`) | SÍ | `null` | Flotante `0..60` | Años de experiencia con la habilidad. |
| `sort_order` | `sortOrder` | `integer` | NO | `0` | Entero `0..9999` | Orden dentro de la categoría. |
| `is_visible` | `isVisible` | `boolean` | NO | `true` | Booleano | Visibilidad pública. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Fecha de creación. |
| `updated_at` | `updatedAt` | `timestamp(3)` | NO | `@updatedAt` | Automático | Última modificación. |

---

### 2.7 Tabla `certifications` (Modelo `Certification`)
Certificaciones profesionales, credenciales verificables y enlace a su respaldo PDF.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador único de certificación. |
| `profile_id` | `profileId` | `uuid` (`@db.Uuid`) | NO | — | `FK -> profiles.id` (`ON DELETE CASCADE`), `IDX compuesto` | Perfil propietario. |
| `file_asset_id` | `fileAssetId` | `uuid` (`@db.Uuid`) | SÍ | `null` | `UK`, `FK -> file_assets.id` (`ON DELETE SET NULL`) | Referencia 1:1 opcional al archivo PDF en `file_assets`. |
| `title_i18n` | `titleI18n` | `jsonb` | NO | — | `localizedTextSchema` (`certificationMetadataSchema`) | Nombre del certificado en `es`/`en`. |
| `issuer` | `issuer` | `text` | NO | — | 1–140 chars | Entidad emisora (AWS, Google, Universidad, etc.). |
| `issue_date` | `issueDate` | `date` (`@db.Date`) | NO | — | Formato `YYYY-MM-DD` | Fecha de emisión. |
| `expiry_date` | `expiryDate` | `date` (`@db.Date`) | SÍ | `null` | Formato `YYYY-MM-DD` | Fecha de vencimiento (si aplica). |
| `category` | `category` | `text` | NO | — | 1–80 chars | Categoría temática para filtros y `widget_certifications`. |
| `credential_id` | `credentialId` | `text` | SÍ | `null` | Máx. 120 chars | Código alfanumérico oficial de verificación. |
| `verify_url` | `verifyUrl` | `text` | SÍ | `null` | URL `http/https` (`safeUrlSchema`) | URL externa de validación ante la entidad emisora. |
| `skills` | `skills` | `text[]` | NO | `[]` | Máx. 20 tags de 1–40 chars | Habilidades acreditadas por el certificado. |
| `allow_download` | `allowDownload` | `boolean` | NO | `true` | Booleano | Controla si `/api/assets/[id]?download=1` responde `attachment` a visitantes públicos. |
| `sort_order` | `sortOrder` | `integer` | NO | `0` | Entero `0..9999` | Orden de prioridad en vista pública. |
| `is_visible` | `isVisible` | `boolean` | NO | `true` | Booleano | Controla tanto la tarjeta en web pública como el acceso público en `/api/assets/[id]`. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Fecha de creación. |
| `updated_at` | `updatedAt` | `timestamp(3)` | NO | `@updatedAt` | Automático | Última modificación. |

---

### 2.8 Tabla `file_assets` (Modelo `FileAsset`)
Registro maestro de custodia binaria fuera de `public/` para archivos subidos y servidos de forma controlada.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador expuesto en `/api/assets/[id]`. |
| `user_id` | `userId` | `uuid` (`@db.Uuid`) | NO | — | `FK -> users.id` (`ON DELETE CASCADE`), `IDX` | Usuario propietario autorizado siempre para lectura/descarga. |
| `storage_key` | `storageKey` | `text` | NO | — | `UK`; validado contra *path traversal* (`certifications/<uuid>.pdf`) | Clave interna relativa dentro de `StorageProvider`. |
| `original_name` | `originalName` | `text` | NO | — | Sanitizado (`sanitizeFileName`, máx. 120 chars `[a-zA-Z0-9._-]`) | Nombre seguro usado en cabecera `Content-Disposition`. |
| `mime_type` | `mimeType` | `text` | NO | — | Validado (ej. `application/pdf`) | Content-Type HTTP real al servir el binario. |
| `size_bytes` | `sizeBytes` | `integer` | NO | — | `> 0` y `<= MAX_PDF_SIZE_MB` | Tamaño exacto en bytes para cabecera `Content-Length`. |
| `sha256` | `sha256` | `text` | NO | — | Hash hexadecimal SHA-256 | Huella de integridad del archivo almacenado. |
| `kind` | `kind` | `"AssetKind"` | NO | `CERT_PDF` | Enum `AssetKind` | Clasificación del activo binario. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Fecha de ingesta del activo. |

---

### 2.9 Tabla `page_layouts` (Modelo `PageLayout`)
Almacena los documentos JSONB del lienzo visual libre en Studio con historial de publicaciones.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador único de versión de layout. |
| `profile_id` | `profileId` | `uuid` (`@db.Uuid`) | NO | — | `FK -> profiles.id` (`ON DELETE CASCADE`), `IDX compuesto` | Perfil dueño del diseño. |
| `status` | `status` | `"LayoutStatus"` | NO | `DRAFT` | Enum `LayoutStatus` (`DRAFT`, `PUBLISHED`, `ARCHIVED`) | Estado del ciclo de publicación editorial. |
| `version` | `version` | `integer` | NO | `1` | Incremental por transacción en `PUT /api/admin/layout` | Número de versión del layout. |
| `canvas_schema` | `canvasSchema` | `jsonb` | NO | — | Validado estrictamente por `canvasSchemaV1` (`Zod`) | Árbol completo de configuración de lienzo y hasta 200 nodos visuales. |
| `published_at` | `publishedAt` | `timestamp(3)` | SÍ | `null` | Asignado al publicar (`publish: true`) | Fecha/hora de publicación efectiva. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Creación del registro. |
| `updated_at` | `updatedAt` | `timestamp(3)` | NO | `@updatedAt` | Automático | Último autoguardado o edición. |

---

### 2.10 Tabla `contact_messages` (Modelo `ContactMessage`)
Mensajes enviados por visitantes o reclutadores desde el formulario público `/api/contact`.

| Columna Física | Campo Prisma | Tipo SQL (Prisma) | Nulo | Default / Generación | Restricciones y Validación | Descripción |
| :--- | :--- | :--- | :---: | :--- | :--- | :--- |
| `id` | `id` | `uuid` (`@db.Uuid`) | NO | `uuid()` | `PK` | Identificador único del mensaje. |
| `profile_id` | `profileId` | `uuid` (`@db.Uuid`) | NO | — | `FK -> profiles.id` (`ON DELETE CASCADE`), `IDX compuesto` | Perfil destinatario. |
| `sender_name` | `senderName` | `text` | NO | — | 2–120 chars (`contactMessageSchema`) | Nombre del remitente. |
| `sender_email` | `senderEmail` | `text` | NO | — | Email válido, máx. 160 chars | Correo de respuesta del remitente. |
| `company` | `company` | `text` | SÍ | `null` | Máx. 120 chars | Empresa u organización opcional. |
| `subject` | `subject` | `text` | NO | — | 2–160 chars | Asunto del mensaje. |
| `message` | `message` | `text` (`@db.Text`) | NO | — | 10–4000 chars (cuerpo protegido por *rate limit* + *honeypot*) | Contenido completo del mensaje. |
| `is_read` | `isRead` | `boolean` | NO | `false` | Actualizable vía `PATCH /api/admin/messages/[id]` | Estado de lectura en bandeja del CMS. |
| `created_at` | `createdAt` | `timestamp(3)` | NO | `now()` | Automático | Marca temporal de recepción. |
