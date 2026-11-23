# 03 - Estructuras JSONB, Índices y Reglas de Acceso

Este documento especifica los contratos internos de las columnas `JSONB` utilizadas por PostgreSQL y documenta todos los índices físicos declarados en [schema.prisma](../../packages/database/prisma/schema.prisma).

---

## 1. Contratos Internos de Columnas `JSONB`

### 1.1 Textos y Listas Localizadas (`*_i18n`)
Aplicado en `experiences.role_i18n`, `experiences.summary_i18n`, `experiences.highlights_i18n`, `educations.degree_i18n`, `educations.summary_i18n`, `projects.title_i18n`, `projects.summary_i18n` y `certifications.title_i18n`.

- **`localizedTextSchema` / `optionalLocalizedTextSchema`:**
  ```json
  {
    "es": "Arquitecto de Software Full-Stack",
    "en": "Full-Stack Software Architect"
  }
  ```
  - Para campos obligatorios (`role_i18n`, `degree_i18n`, `title_i18n`), al menos `es` o `en` debe contener texto no vacío (máx. 4,000 caracteres).
  - En lectura, `resolveLocalizedText()` ([packages/core/src/locale.ts](../../packages/core/src/locale.ts)) aplica fallback al `default_locale` del perfil o al idioma alterno si falta traducción.
- **`localizedListSchema` (`experiences.highlights_i18n`):**
  ```json
  {
    "es": ["Reducción de latencia p95 en 42 %"],
    "en": ["Reduced p95 latency by 42%"]
  }
  ```

---

### 1.2 Metadatos del Perfil (`profiles.localized_info`, `social_links`, `theme_config`)

Verificados contra `profileUpdateSchema` en [profile.schema.ts](../../services/api-cv/src/schemas/profile.schema.ts) y [seed.ts](../../packages/database/prisma/seed.ts):

- **`profiles.localized_info`:**
  ```json
  {
    "fullName": "Propietario CV",
    "headline": { "es": "Ingeniero de Software Full-Stack", "en": "Full-Stack Software Engineer" },
    "bio": { "es": "...", "en": "..." },
    "location": "Ciudad de México / Remoto",
    "availabilityBadge": { "es": "Disponible para nuevos retos", "en": "Open to new opportunities" },
    "publicEmail": "admin@proyecto-cv.local"
  }
  ```
- **`profiles.social_links`:**
  ```json
  {
    "linkedin": "https://linkedin.com/in/...",
    "github": "https://github.com/...",
    "website": "https://...",
    "x": "https://x.com/..."
  }
  ```
- **`profiles.theme_config` (Estética *Obsidian & Bone*):**
  ```json
  {
    "preset": "ryoku-obsidian",
    "light": { "primary": "#171513", "accent": "#ce5e32", "background": "#f3efe9", "surface": "#faf8f4" },
    "dark": { "primary": "#cdc4ba", "accent": "#ce5e32", "background": "#000000", "surface": "#0a0a0a" }
  }
  ```

---

### 1.3 Esquema de Lienzo Visual (`page_layouts.canvas_schema`)

Validado en servidor mediante `canvasSchemaV1` antes de persistir `DRAFT` o `PUBLISHED`:

```json
{
  "version": 1,
  "canvasSettings": {
    "desktopWidth": 1200,
    "minHeight": 1600,
    "gridSize": 8,
    "snapToGrid": true
  },
  "nodes": [
    {
      "id": "widget-hero-1",
      "type": "widget_hero",
      "label": "Hero Profesional",
      "desktop": { "x": 48, "y": 108, "w": 1104, "h": 280, "zIndex": 1 },
      "mobile": { "order": 1, "visible": true },
      "style": {
        "backgroundColor": "#0a0a0a",
        "textColor": "#cdc4ba",
        "borderRadius": 20,
        "padding": 28,
        "shadow": "md",
        "animation": "fade-up"
      },
      "props": {
        "showAvailabilityBadge": true,
        "showSocialLinks": true
      }
    }
  ]
}
```

#### Límites Estructurales de `canvasSchemaV1`
- **`canvasSettings`**: `desktopWidth` (`800..1920`, default `1200`), `minHeight` (`600..20000`, default `1400`), `gridSize` (`1..64`, default `8`), `snapToGrid` (default `true`).
- **`nodes` (máx. 200 nodos)**:
  - **`type`** (15 valores enum en `canvasNodeTypeSchema`): `free_text`, `free_image`, `free_card`, `free_button`, `free_badge`, `free_divider`, `custom_code`, `widget_hero`, `widget_timeline`, `widget_projects`, `widget_skills`, `widget_certifications`, `widget_cert_spotlight`, `widget_contact`, `widget_controls`.
  - **`desktop`**: `x` (`0..5000`), `y` (`0..20000`), `w` (`40..2400`), `h` (`24..4000`), `zIndex` (`0..999`).
  - **`mobile`**: `order` (`0..9999`), `visible` (`true`/`false`).
  - **Bloque `custom_code` (`props`)**: contiene fuente HTML/CSS inyectada de forma aislada en Shadow DOM con interpolación `{{cv.*}}` ejecutada por `renderCvTemplate()` ([template-engine.ts](../../services/api-studio/src/engine/template-engine.ts)).

---

## 2. Catálogo de Índices en PostgreSQL

Todos los índices declarados en [schema.prisma](../../packages/database/prisma/schema.prisma):

| Tabla | Nombre / Definición Prisma | Columnas Indexadas | Tipo | Patrón de Consulta Optimizado |
| :--- | :--- | :--- | :--- | :--- |
| `users` | `@unique` | `(email)` | `UNIQUE` | Login por correo en `POST /api/auth/login`. |
| `profiles` | `@unique` | `(slug)` | `UNIQUE` | Enrutamiento público `/u/[slug]` y verificación de conflicto `409`. |
| `profiles` | `@unique` | `(avatar_asset_id)` | `UNIQUE` | Relación 1:1 opcional con `file_assets`. |
| `profiles` | `@@index([userId])` | `(user_id)` | `B-Tree` | `requireAuthenticatedContext()` buscando perfil principal de `session.userId`. |
| `experiences` | `@@index([profileId, sortOrder])` | `(profile_id, sort_order)` | `B-Tree` | Listado ordenado del historial laboral en CMS y SSR `/`. |
| `educations` | `@@index([profileId, sortOrder])` | `(profile_id, sort_order)` | `B-Tree` | Listado ordenado académico en CMS y SSR `/`. |
| `projects` | `@@index([profileId, sortOrder])` | `(profile_id, sort_order)` | `B-Tree` | Listado ordenado de proyectos en CMS y vista pública. |
| `projects` | `@unique` | `(cover_asset_id)` | `UNIQUE` | Relación 1:1 opcional de portada en `file_assets`. |
| `skills` | `@@index([profileId, category, sortOrder])` | `(profile_id, category, sort_order)` | `B-Tree` | Agrupación por categoría y orden en matriz de habilidades. |
| `certifications` | `@@index([profileId, category, sortOrder])` | `(profile_id, category, sort_order)` | `B-Tree` | Filtros por categoría y ordenamiento en Bóveda PDF. |
| `certifications` | `@unique` | `(file_asset_id)` | `UNIQUE` | Relación 1:1 opcional con respaldo binario PDF en `file_assets`. |
| `file_assets` | `@unique` | `(storage_key)` | `UNIQUE` | Prevención de colisiones de ruta en almacenamiento binario. |
| `file_assets` | `@@index([userId])` | `(user_id)` | `B-Tree` | Auditoría y consulta de propiedad por usuario. |
| `page_layouts` | `@@index([profileId, status])` | `(profile_id, status)` | `B-Tree` | Recuperación inmediata de `DRAFT` (Studio) y `PUBLISHED` (`/`). |
| `contact_messages` | `@@index([profileId, isRead, createdAt])` | `(profile_id, is_read, created_at)` | `B-Tree` | Bandeja `/admin/messages` ordenada por no leídos primero y fecha descendente. |
