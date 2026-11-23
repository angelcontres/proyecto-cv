# Diseño de APIs y Contratos OpenAPI
## Sistema Web de CV Interactivo con Constructor Visual y Bóveda PDF

**Versión:** 1.0  
**Fecha:** 2026-11-21  
**Especificación Formal:** [openapi.yaml](./openapi.yaml) (**OpenAPI 3.1.0**)  
**Documentos relacionados:** [SRS](../srs/README.md) · [SAD](../sad/README.md) · [ADRs](../adr/README.md) · [SDD](../sdd/README.md) · [Modelo de Datos](../modelo-datos/README.md) · [Diseño UI/UX](../ui-ux/README.md)

---

## 1. Inventario de Endpoints vs. Código Fuente

La especificación cubre las **33 operaciones HTTP implementadas** distribuidas en **20 archivos `route.ts`** dentro del gateway `apps/web/src/app/api/**` delegando en los microservicios `services/*`, además de 2 endpoints planificados de Fases 2–3 anotados con `x-implemented: false`.

| Ruta | Métodos | Estado | Esquema `Zod` / Validador | Servicio & Montaje Gateway |
| :--- | :--- | :--- | :--- | :--- |
| `/api/health` | `GET` | Implementado (Fase 1) | — | [health/route.ts](../../apps/web/src/app/api/health/route.ts) |
| `/api/auth/login` | `POST` | Implementado (Fase 1) | `loginSchema` + `checkRateLimit` | `@cv/api-auth` · [login/route.ts](../../apps/web/src/app/api/auth/login/route.ts) |
| `/api/auth/logout` | `POST` | Implementado (Fase 1) | — | `@cv/api-auth` · [logout/route.ts](../../apps/web/src/app/api/auth/logout/route.ts) |
| `/api/auth/me` | `GET` | Implementado (Fase 1) | `getServerSession()` | `@cv/api-auth` · [me/route.ts](../../apps/web/src/app/api/auth/me/route.ts) |
| `/api/contact` | `POST` | Implementado (Fase 1) | `contactMessageSchema` + *honeypot* + `checkRateLimit` | `@cv/api-contact` · [contact/route.ts](../../apps/web/src/app/api/contact/route.ts) |
| `/api/assets/[id]` | `GET` | Implementado (Fase 1) | Control `isOwner \|\| certification.isVisible` | `@cv/media-vault` · [assets/[id]/route.ts](../../apps/web/src/app/api/assets/[id]/route.ts) |
| `/api/admin/profile` | `GET`, `PUT` | Implementado (Fase 1) | `profileUpdateSchema` (`409` en conflicto `slug`) | `@cv/api-cv` · [profile/route.ts](../../apps/web/src/app/api/admin/profile/route.ts) |
| `/api/admin/experiences` | `GET`, `POST` | Implementado (Fase 1) | `experienceSchema` | `@cv/api-cv` · [experiences/route.ts](../../apps/web/src/app/api/admin/experiences/route.ts) |
| `/api/admin/experiences/[id]` | `PATCH`, `DELETE` | Implementado (Fase 1) | `experienceSchema` | `@cv/api-cv` · [experiences/[id]/route.ts](../../apps/web/src/app/api/admin/experiences/[id]/route.ts) |
| `/api/admin/educations` | `GET`, `POST` | Implementado (Fase 1) | `educationSchema` | `@cv/api-cv` · [educations/route.ts](../../apps/web/src/app/api/admin/educations/route.ts) |
| `/api/admin/educations/[id]` | `PATCH`, `DELETE` | Implementado (Fase 1) | `educationSchema` | `@cv/api-cv` · [educations/[id]/route.ts](../../apps/web/src/app/api/admin/educations/[id]/route.ts) |
| `/api/admin/projects` | `GET`, `POST` | Implementado (Fase 1) | `projectSchema` | `@cv/api-cv` · [projects/route.ts](../../apps/web/src/app/api/admin/projects/route.ts) |
| `/api/admin/projects/[id]` | `PATCH`, `DELETE` | Implementado (Fase 1) | `projectSchema` | `@cv/api-cv` · [projects/[id]/route.ts](../../apps/web/src/app/api/admin/projects/[id]/route.ts) |
| `/api/admin/skills` | `GET`, `POST` | Implementado (Fase 1) | `skillSchema` | `@cv/api-cv` · [skills/route.ts](../../apps/web/src/app/api/admin/skills/route.ts) |
| `/api/admin/skills/[id]` | `PATCH`, `DELETE` | Implementado (Fase 1) | `skillSchema` | `@cv/api-cv` · [skills/[id]/route.ts](../../apps/web/src/app/api/admin/skills/[id]/route.ts) |
| `/api/admin/certifications` | `GET`, `POST` | Implementado (Fase 1) | `multipart/form-data`: `certificationMetadataSchema` + `validatePdfBuffer()` | `@cv/api-certifications` + `@cv/media-vault` · [certifications/route.ts](../../apps/web/src/app/api/admin/certifications/route.ts) |
| `/api/admin/certifications/[id]` | `PATCH`, `DELETE` | Implementado (Fase 1) | `certificationMetadataSchema` + limpieza en `StorageProvider` | `@cv/api-certifications` · [certifications/[id]/route.ts](../../apps/web/src/app/api/admin/certifications/[id]/route.ts) |
| `/api/admin/messages` | `GET` | Implementado (Fase 1) | `requireAuthenticatedContext()` | `@cv/api-contact` · [messages/route.ts](../../apps/web/src/app/api/admin/messages/route.ts) |
| `/api/admin/messages/[id]` | `PATCH`, `DELETE` | Implementado (Fase 1) | `{ isRead: boolean }` | `@cv/api-contact` · [messages/[id]/route.ts](../../apps/web/src/app/api/admin/messages/[id]/route.ts) |
| `/api/admin/layout` | `GET`, `PUT` | Implementado (Fase 1) | `canvasSchemaV1` + `{ publish: boolean }` | `@cv/api-studio` · [layout/route.ts](../../apps/web/src/app/api/admin/layout/route.ts) |
| `/api/admin/assets` | `POST` | Planificado (Fase 2) | `validateFontBuffer()` / imágenes / código | Extensión en `@cv/media-vault` |
| `/api/export/pdf` | `GET` | Planificado (Fase 3) | Query `?locale=es\|en` | Exportador ATS desacoplado del lienzo |

---

## 2. Convenciones Transversales de Diseño REST

### 2.1 Autenticación y Aislamiento *Multi-Tenant*
- Todas las rutas `/api/admin/*` exigen sesión mediante `requireAuthenticatedContext()` ([guards.service.ts](../../services/api-auth/src/services/guards.service.ts)), el cual lee la cookie `HttpOnly` `cv_session` (JWT `HS256`, vigencia 7 días) y resuelve `profileId` perteneciente a `session.userId`.
- Si falta la cookie o expiró, responde `401 Unauthorized`. Si el usuario no posee perfil creado, responde `404 Not Found`.
- Todas las operaciones por `{id}` filtran por `{ id, profileId: auth.ctx.profileId }` para evitar *IDOR* entre tenants.

### 2.2 Formato Uniforme de Errores y Validación (`Zod`)
Definido en [packages/core/src/http.ts](../../packages/core/src/http.ts):
- **Error de validación o JSON malformado (`400 Bad Request`):**
  ```json
  {
    "error": "Datos de entrada inválidos.",
    "details": {
      "company": ["La empresa es obligatoria."]
    }
  }
  ```
- **Error general (`401`, `403`, `404`, `409`, `429`):**
  ```json
  {
    "error": "Descripción legible del problema."
  }
  ```

### 2.3 Control de Frecuencia (*Rate Limiting*) y Anti-Spam
Implementado en [packages/core/src/rate-limit.ts](../../packages/core/src/rate-limit.ts):
- `POST /api/auth/login`: máximo **8 intentos cada 15 minutos** por clave `login:<ip>:<email>` (reseteado al autenticar con éxito).
- `POST /api/contact`: máximo **5 mensajes cada 10 minutos** por clave `contact:<ip>`. Además, si el campo oculto `websiteHoneypot` llega poblado, el servidor responde `201 { "ok": true }` sin persistir el mensaje.
- Al superar cualquier límite, la API retorna `429 Too Many Requests` con cabecera estándar `Retry-After` en segundos.

### 2.4 Cargas y Entregas Binarias Seguras
- **`POST /api/admin/certifications`**: recibe `multipart/form-data` con campo obligatorio `metadata` (JSON en texto plano) y archivo opcional `file`. Valida extensión `.pdf`, MIME, tamaño (`<= MAX_PDF_SIZE_MB`) y firma binaria `%PDF-` mediante `validatePdfBuffer()`, calculando huella `sha256`.
- **`GET /api/assets/[id]`**: permite acceso al propietario (`session.userId === asset.userId`) o al público únicamente cuando la certificación asociada tiene `isVisible = true`. Las descargas (`?download=1`) solo emiten `Content-Disposition: attachment` si es propietario o `certification.allowDownload = true`. Incluye `X-Content-Type-Options: nosniff`.
