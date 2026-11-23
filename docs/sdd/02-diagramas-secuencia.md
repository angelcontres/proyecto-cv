# 02 - Diagramas de Secuencia UML

Estos diagramas describen las interacciones temporales exactas entre actores, borde de seguridad, API REST, validadores, almacenamiento y PostgreSQL.

---

## 1. Autenticación y Acceso Protegido (`/login`, `/admin`, `/studio`)

> **Código asociado:** [apps/web/src/app/api/auth/login/route.ts](../../apps/web/src/app/api/auth/login/route.ts), [apps/web/src/proxy.ts](../../apps/web/src/proxy.ts), [services/api-auth](../../services/api-auth/src/index.ts), [packages/core/src/rate-limit.ts](../../packages/core/src/rate-limit.ts).

```mermaid
sequenceDiagram
    actor Owner as Propietario
    participant UI as Browser (/login)
    participant Proxy as apps/web/src/proxy.ts (Edge)
    participant LoginAPI as POST /api/auth/login
    participant Limiter as checkRateLimit()
    participant DB as PostgreSQL (users)
    participant Crypto as bcryptjs + jose JWT

    Owner->>UI: Navega a /admin o /studio sin cookie
    UI->>Proxy: GET /admin (sin cv_session válida)
    Proxy->>Proxy: jwtVerify(token, AUTH_SECRET, HS256)
    Proxy-->>UI: 307 Redirect /login?next=/admin

    Owner->>UI: Ingresa email y contraseña
    UI->>LoginAPI: POST /api/auth/login (JSON)
    LoginAPI->>LoginAPI: parseAndValidate(loginSchema)
    LoginAPI->>Limiter: checkRateLimit("login:ip:email", 8, 15m)
    alt Límite excedido
        Limiter-->>LoginAPI: allowed = false
        LoginAPI-->>UI: 429 Too Many Requests + Retry-After
    else Permitido
        LoginAPI->>DB: prisma.user.findUnique(email)
        DB-->>LoginAPI: User(id, passwordHash, role)
        LoginAPI->>Crypto: verifyPassword(password, passwordHash)
        alt Credenciales inválidas
            Crypto-->>LoginAPI: false
            LoginAPI-->>UI: 401 Credenciales inválidas
        else Credenciales válidas
            Crypto-->>LoginAPI: true
            LoginAPI->>Limiter: resetRateLimit(rateKey)
            LoginAPI->>Crypto: signSessionToken(SessionPayload, 7d)
            Crypto-->>LoginAPI: JWT HS256
            LoginAPI-->>UI: 200 OK + Set-Cookie cv_session (HttpOnly, SameSite=lax)
            UI->>Proxy: GET /admin (con cookie cv_session)
            Proxy->>Proxy: jwtVerify() == true
            Proxy-->>UI: Permite render SSR de /admin
        end
    end
```

---

## 2. Subida Segura de Certificación y Archivo PDF (`POST /api/admin/certifications`)

> **Código asociado:** [apps/web/src/app/api/admin/certifications/route.ts](../../apps/web/src/app/api/admin/certifications/route.ts), [services/api-certifications](../../services/api-certifications/src/index.ts), [services/media-vault](../../services/media-vault/src/index.ts).

```mermaid
sequenceDiagram
    actor Owner as Propietario
    participant AdminUI as /admin/certifications
    participant API as POST /api/admin/certifications
    participant Guard as requireAuthenticatedContext()
    participant PdfVal as validatePdfBuffer()
    participant Storage as LocalStorageProvider
    participant DB as PostgreSQL ($transaction)

    Owner->>AdminUI: Adjunta PDF + metadatos bilingües
    AdminUI->>API: POST multipart/form-data (metadata, file)
    API->>Guard: Verifica sesión y profileId propietario
    alt No autenticado
        Guard-->>API: 401 Unauthorized
        API-->>AdminUI: 401
    else Autenticado
        API->>API: JSON.parse(metadata) + certificationMetadataSchema.safeParse()
        API->>PdfVal: Valida buffer, extensión .pdf, MIME, maxPdfBytes, magic bytes "%PDF-"
        alt PDF inválido o corrupto
            PdfVal-->>API: { ok: false, error }
            API-->>AdminUI: 400 Bad Request
        else PDF válido
            PdfVal-->>API: { ok: true, sha256, sizeBytes, sanitizedOriginalName }
            API->>Storage: put("certifications/uuid.pdf", buffer)
            Storage->>Storage: resolveSafePath() (bloquea path traversal)
            Storage-->>API: StoredObject
            API->>DB: $transaction: create FileAsset + create Certification
            alt Error en transacción SQL
                DB-->>API: Exception
                API->>Storage: remove(uploadedKey) (limpieza compensatoria)
                API-->>AdminUI: 500 Internal Error
            else Transacción confirmada
                DB-->>API: Certification + FileAsset
                API-->>AdminUI: 201 Created
            end
        end
    end
```

---

## 3. Consulta y Descarga Controlada de PDF en Bóveda (`GET /api/assets/[id]`)

> **Código asociado:** [apps/web/src/app/api/assets/[id]/route.ts](../../apps/web/src/app/api/assets/[id]/route.ts), [services/media-vault](../../services/media-vault/src/index.ts), [services/api-auth](../../services/api-auth/src/index.ts).

```mermaid
sequenceDiagram
    actor Visitor as Visitante / Reclutador
    participant Viewer as Visor Modal PDF (/)
    participant AssetAPI as GET /api/assets/[id]
    participant DB as PostgreSQL (file_assets)
    participant Auth as getServerSession()
    participant Storage as LocalStorageProvider

    Visitor->>Viewer: Clic en "Ver PDF" o "Descargar"
    Viewer->>AssetAPI: GET /api/assets/{id} (?download=1 opcional)
    AssetAPI->>DB: findUnique(id) include certification(isVisible, allowDownload)
    alt Asset no existe
        DB-->>AssetAPI: null
        AssetAPI-->>Viewer: 404 Not Found
    else Asset encontrado
        AssetAPI->>Auth: getServerSession()
        AssetAPI->>AssetAPI: isOwner || certification.isVisible
        alt Acceso no permitido (privado y no propietario)
            AssetAPI-->>Viewer: 403 Acceso denegado
        else Permitido
            AssetAPI->>Storage: exists(storageKey) + read(storageKey)
            Storage-->>AssetAPI: Buffer PDF
            AssetAPI->>AssetAPI: Determina Content-Disposition (inline vs attachment si allowDownload)
            AssetAPI-->>Viewer: 200 OK (application/pdf, X-Content-Type-Options: nosniff)
            Viewer-->>Visitor: Renderiza PDF embebido en modal o inicia descarga
        end
    end
```

---

## 4. Edición en Studio IDE, Render Seguro `{{cv.*}}` y Publicación (`PUT /api/admin/layout`)

> **Código asociado:** [apps/web/src/app/api/admin/layout/route.ts](../../apps/web/src/app/api/admin/layout/route.ts), [services/api-studio/src/engine/template-engine.ts](../../services/api-studio/src/engine/template-engine.ts), [services/api-studio/src/schemas/canvas.schema.ts](../../services/api-studio/src/schemas/canvas.schema.ts).  
> **Nota:** El contenedor interactivo `/studio` en Next.js se implementa en Fase 2 sobre estos contratos y prototipo verificado.

```mermaid
sequenceDiagram
    actor Owner as Propietario
    participant Studio as Studio IDE (/studio)
    participant Engine as renderCvTemplate() + Shadow DOM
    participant LayoutAPI as /api/admin/layout
    participant Guard as requireAuthenticatedContext()
    participant DB as PostgreSQL (page_layouts)

    Owner->>Studio: Abre Studio IDE
    Studio->>LayoutAPI: GET /api/admin/layout
    LayoutAPI->>Guard: Verifica sesión y profileId
    LayoutAPI->>DB: Consulta último DRAFT, PUBLISHED e historial (max 10)
    DB-->>LayoutAPI: Registros o starterSchema por defecto
    LayoutAPI-->>Studio: { draft, published, history }

    Owner->>Studio: Edita bloque custom_code con {{cv.*}} o arrastra widgets
    Studio->>Engine: renderCvTemplate(rawHtml, CvTemplateContext)
    Engine->>Engine: sanitizeCustomHtml() -> resuelve bloques each y cv.* -> escapeHtml()
    Engine-->>Studio: HTML seguro inyectado en ShadowRoot (estilos CSS aislados)

    Owner->>Studio: Clic en "Guardar Borrador" o "Publicar" (publish=true)
    Studio->>LayoutAPI: PUT /api/admin/layout { canvasSchema, publish }
    LayoutAPI->>LayoutAPI: parseAndValidate(layoutSaveSchema / canvasSchemaV1)
    LayoutAPI->>DB: $transaction
    DB->>DB: Crea o actualiza registro DRAFT
    opt publish == true
        DB->>DB: updateMany PUBLISHED -> ARCHIVED
        DB->>DB: create PageLayout(status: PUBLISHED, version: nextVersion)
    end
    DB-->>LayoutAPI: { draft, published }
    LayoutAPI-->>Studio: 200 OK
```

---

## 5. Carga Pública del CV (`GET /`) y Envío de Contacto Anti-Spam (`POST /api/contact`)

> **Código asociado:** [apps/web/src/app/page.tsx](../../apps/web/src/app/page.tsx), [apps/web/src/app/api/contact/route.ts](../../apps/web/src/app/api/contact/route.ts), [services/api-contact](../../services/api-contact/src/index.ts).

```mermaid
sequenceDiagram
    actor Visitor as Reclutador / Visitante
    participant PublicPage as HomePage (/) SSR
    participant ContactAPI as POST /api/contact
    participant Limiter as checkRateLimit()
    participant DB as PostgreSQL

    Visitor->>PublicPage: GET /
    PublicPage->>DB: loadPrimaryPublishedProfile() (status=PUBLISHED, isVisible=true)
    DB-->>PublicPage: Profile + PageLayout + Experience + Skill + Certification
    PublicPage-->>Visitor: HTML SSR Obsidian & Bone con estado inicial

    Visitor->>ContactAPI: Envía formulario de contacto
    ContactAPI->>Limiter: checkRateLimit("contact:ip", 5, 10m)
    alt Excede 5 peticiones / 10 min
        Limiter-->>ContactAPI: allowed = false
        ContactAPI-->>Visitor: 429 Too Many Requests
    else Permitido
        ContactAPI->>ContactAPI: parseAndValidate(contactMessageSchema)
        alt websiteHoneypot no vacío (bot)
            ContactAPI-->>Visitor: 201 { ok: true } (descarte silencioso)
        else Humano válido
            ContactAPI->>DB: profile.findFirst(isPrimary) + contactMessage.create()
            DB-->>ContactAPI: Created
            ContactAPI-->>Visitor: 201 { ok: true }
        end
    end
```

---

## 6. Exportación de CV PDF en Formato ATS-Friendly *(Diseño Planificado — Fase 3)*

> **Estado:** Flujo objetivo definido por `RF-EXPORT-01..03` y `ADR-009` (pendiente de implementar el generador PDF en Fase 3).

```mermaid
sequenceDiagram
    actor Visitor as Reclutador / Propietario
    participant UI as Vista Pública (/)
    participant ExportAPI as GET /api/export/pdf?locale=es|en
    participant DB as PostgreSQL
    participant AtsGen as AtsPdfGenerator (Fase 3)

    Visitor->>UI: Clic en "Descargar CV ATS (ES/EN)"
    UI->>ExportAPI: GET /api/export/pdf?locale=en
    ExportAPI->>DB: Carga Profile + Experience + Education + Project + Skill + Certification visibles
    Note over ExportAPI,AtsGen: Ignora coordenadas libres (x, y) de PageLayout para preservar lectura ATS lineal
    DB-->>ExportAPI: Datos estructurados ordenados por sortOrder/fecha
    ExportAPI->>AtsGen: Renderiza documento monocromático 1 columna con texto seleccionable
    AtsGen-->>ExportAPI: Stream / Buffer PDF ATS
    ExportAPI-->>Visitor: 200 application/pdf (attachment, filename=CV-slug-en.pdf)
```
