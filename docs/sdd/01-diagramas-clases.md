# 01 - Diagramas de Clases UML

Este documento modela la estructura estática del sistema en tres planos complementarios:
1. **Dominio y Persistencia** (`packages/database/prisma/schema.prisma`)
2. **Almacenamiento, Seguridad y Validación Binaria** (`services/media-vault/src/`, `services/api-auth/src/`)
3. **Lienzo Visual, Plantillas Seguras e Internacionalización** (`services/api-studio/src/`, `packages/contracts/src/`, `packages/core/src/`)

---

## 1. Modelo de Dominio y Persistencia (Prisma ORM -> PostgreSQL 16)

> **Estado:** Implementado en [schema.prisma](../../packages/database/prisma/schema.prisma).

```mermaid
classDiagram
    direction TB

    class UserRole {
        <<enumeration>>
        OWNER
        USER
        ADMIN
    }

    class AssetKind {
        <<enumeration>>
        CERT_PDF
        IMAGE
        FONT
        CODE_BUNDLE
        OTHER
    }

    class LayoutStatus {
        <<enumeration>>
        DRAFT
        PUBLISHED
        ARCHIVED
    }

    class User {
        <<entity>>
        +UUID id
        +String email
        +String passwordHash
        +String name
        +UserRole role
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Profile {
        <<entity>>
        +UUID id
        +UUID userId
        +String slug
        +Boolean isPrimary
        +String defaultLocale
        +Json localizedInfo
        +Json socialLinks
        +Json themeConfig
        +UUID avatarAssetId
        +DateTime createdAt
        +DateTime updatedAt
    }

    class Experience {
        <<entity>>
        +UUID id
        +UUID profileId
        +String company
        +String location
        +Json roleI18n
        +Json summaryI18n
        +Json highlightsI18n
        +List~String~ tags
        +Date startDate
        +Date endDate
        +Boolean isCurrent
        +Int sortOrder
        +Boolean isVisible
    }

    class Education {
        <<entity>>
        +UUID id
        +UUID profileId
        +String institution
        +String location
        +Json degreeI18n
        +Json summaryI18n
        +Date startDate
        +Date endDate
        +Boolean isCurrent
        +Int sortOrder
        +Boolean isVisible
    }

    class Project {
        <<entity>>
        +UUID id
        +UUID profileId
        +Json titleI18n
        +Json summaryI18n
        +List~String~ tags
        +String demoUrl
        +String repoUrl
        +UUID coverAssetId
        +Int year
        +Boolean isFeatured
        +Int sortOrder
        +Boolean isVisible
    }

    class Skill {
        <<entity>>
        +UUID id
        +UUID profileId
        +String name
        +String category
        +Int level
        +Float years
        +Int sortOrder
        +Boolean isVisible
    }

    class Certification {
        <<entity>>
        +UUID id
        +UUID profileId
        +UUID fileAssetId
        +Json titleI18n
        +String issuer
        +Date issueDate
        +Date expiryDate
        +String category
        +String credentialId
        +String verifyUrl
        +List~String~ skills
        +Boolean allowDownload
        +Int sortOrder
        +Boolean isVisible
    }

    class FileAsset {
        <<entity>>
        +UUID id
        +UUID userId
        +String storageKey
        +String originalName
        +String mimeType
        +Int sizeBytes
        +String sha256
        +AssetKind kind
        +DateTime createdAt
    }

    class PageLayout {
        <<entity>>
        +UUID id
        +UUID profileId
        +LayoutStatus status
        +Int version
        +Json canvasSchema
        +DateTime publishedAt
        +DateTime createdAt
        +DateTime updatedAt
    }

    class ContactMessage {
        <<entity>>
        +UUID id
        +UUID profileId
        +String senderName
        +String senderEmail
        +String company
        +String subject
        +String message
        +Boolean isRead
        +DateTime createdAt
    }

    User "1" --> "0..*" Profile : owns
    User "1" --> "0..*" FileAsset : uploads
    User ..> UserRole : uses

    Profile "1" *-- "0..*" Experience : experiences
    Profile "1" *-- "0..*" Education : educations
    Profile "1" *-- "0..*" Project : projects
    Profile "1" *-- "0..*" Skill : skills
    Profile "1" *-- "0..*" Certification : certifications
    Profile "1" *-- "0..*" PageLayout : pageLayouts
    Profile "1" *-- "0..*" ContactMessage : contactMessages

    FileAsset "0..1" <-- "0..1" Profile : avatarAsset
    FileAsset "0..1" <-- "0..1" Project : coverAsset
    FileAsset "0..1" <-- "0..1" Certification : fileAsset
    FileAsset ..> AssetKind : classifies
    PageLayout ..> LayoutStatus : tracks
```

---

## 2. Subsistema de Almacenamiento, Seguridad y Validación Binaria

> **Estado:** Implementado en [services/media-vault](../../services/media-vault/src/index.ts), [services/api-auth](../../services/api-auth/src/index.ts) y [packages/core](../../packages/core/src/index.ts).

```mermaid
classDiagram
    direction LR

    class StorageProvider {
        <<interface>>
        +put(storageKey: String, content: Buffer) Promise~StoredObject~
        +read(storageKey: String) Promise~Buffer~
        +exists(storageKey: String) Promise~Boolean~
        +remove(storageKey: String) Promise~void~
    }

    class StoredObject {
        <<dto>>
        +String storageKey
        +Int sizeBytes
    }

    class LocalStorageProvider {
        -String baseDir
        +constructor(baseDir: String)
        -resolveSafePath(storageKey: String) String
        +put(storageKey: String, content: Buffer) Promise~StoredObject~
        +read(storageKey: String) Promise~Buffer~
        +exists(storageKey: String) Promise~Boolean~
        +remove(storageKey: String) Promise~void~
    }

    class StorageFactory {
        <<module>>
        -StorageProvider cachedProvider
        +getStorageProvider() StorageProvider
    }

    class SessionPayload {
        <<dto>>
        +String userId
        +String email
        +String name
        +String role
    }

    class AuthenticatedContext {
        <<dto>>
        +SessionPayload session
        +String profileId
    }

    class AuthSessionService {
        <<module>>
        +String SESSION_COOKIE_NAME
        +signSessionToken(payload: SessionPayload) Promise~String~
        +verifySessionToken(token: String) Promise~SessionPayload~
        +getServerSession() Promise~SessionPayload~
        +setSessionCookie(payload: SessionPayload) Promise~void~
        +clearSessionCookie() Promise~void~
    }

    class AuthGuards {
        <<module>>
        +requireAuthenticatedContext() Promise~AuthenticatedContext~
    }

    class RateLimiter {
        <<module>>
        -Map~String, RateLimitEntry~ buckets
        +checkRateLimit(key, maxRequests, windowMs, now) RateLimitResult
        +resetRateLimit(key) void
    }

    class PdfValidator {
        <<module>>
        -Buffer PDF_MAGIC_BYTES
        +sanitizeFileName(rawName: String) String
        +validatePdfBuffer(params) PdfValidationResult
    }

    class FontValidator {
        <<module>>
        -Buffer WOFF2_MAGIC
        -Buffer OTF_MAGIC
        -Buffer TTF_MAGIC_1
        -Buffer TTF_MAGIC_2
        +validateFontBuffer(params) FontValidationResult
    }

    StorageProvider <|.. LocalStorageProvider : implements
    StorageProvider ..> StoredObject : returns
    StorageFactory ..> LocalStorageProvider : instantiates
    StorageFactory --> StorageProvider : provides

    AuthGuards ..> AuthSessionService : calls getServerSession
    AuthGuards ..> AuthenticatedContext : returns
    AuthSessionService ..> SessionPayload : signs/verifies HS256
    FontValidator ..> PdfValidator : reuses sanitizeFileName
```

---

## 3. Subsistema de Lienzo Visual, Plantillas Seguras e i18n

> **Estado:** Esquemas e interpolación implementados en [services/api-studio](../../services/api-studio/src/index.ts) y [packages/core](../../packages/core/src/locale.ts).

```mermaid
classDiagram
    direction TB

    class CanvasSchemaV1 {
        <<dto>>
        +Int version
        +CanvasSettings canvasSettings
        +List~CanvasNode~ nodes
    }

    class CanvasSettings {
        <<valueObject>>
        +Int desktopWidth
        +Int minHeight
        +Int gridSize
        +Boolean snapToGrid
    }

    class CanvasNode {
        <<dto>>
        +String id
        +CanvasNodeType type
        +String label
        +DesktopFrame desktop
        +MobileLayout mobile
        +NodeStyle style
        +Record props
    }

    class DesktopFrame {
        <<valueObject>>
        +Float x
        +Float y
        +Float w
        +Float h
        +Int zIndex
    }

    class MobileLayout {
        <<valueObject>>
        +Int order
        +Boolean visible
    }

    class NodeStyle {
        <<valueObject>>
        +String backgroundColor
        +String textColor
        +Float borderRadius
        +Float padding
        +String shadow
        +String animation
    }

    class CanvasNodeType {
        <<enumeration>>
        free_text
        free_image
        free_card
        free_button
        free_badge
        free_divider
        custom_code
        widget_hero
        widget_timeline
        widget_projects
        widget_skills
        widget_certifications
        widget_cert_spotlight
        widget_contact
        widget_controls
    }

    class TemplateEngine {
        <<service>>
        -Set FORBIDDEN_KEYS
        +escapeHtml(value) String
        +sanitizeCustomHtml(rawHtml) String
        +renderCvTemplate(rawHtml, context: CvTemplateContext) String
    }

    class CvTemplateContext {
        <<dto>>
        +ProfileContext profile
        +StatsContext stats
        +List experiences
        +List projects
        +List skills
        +List certifications
    }

    class LocaleResolver {
        <<module>>
        +resolveLocalizedText(value: LocalizedText, locale, fallback) String
        +resolveLocalizedList(value: LocalizedList, locale, fallback) List~String~
    }

    CanvasSchemaV1 *-- "1" CanvasSettings : settings
    CanvasSchemaV1 *-- "0..200" CanvasNode : nodes
    CanvasNode *-- "1" DesktopFrame : desktop
    CanvasNode *-- "1" MobileLayout : mobile
    CanvasNode *-- "1" NodeStyle : style
    CanvasNode ..> CanvasNodeType : typed by

    TemplateEngine ..> CvTemplateContext : interpolates cv.* context
```
