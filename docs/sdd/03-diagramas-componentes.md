# 03 - Diagramas de Componentes UML

Este documento describe la organización modular interna de **Proyecto CV** y las interfaces entre componentes de frontend, borde de seguridad, API REST y adaptadores de persistencia.

---

## 1. Arquitectura de Componentes del Monorepo Orientado a Servicios

> **Estado:** Reorganizada en `pnpm workspaces` (`apps/web`, `services/*`, `packages/*`) con fronteras validadas por `eslint.config.mjs` (Fase 1); la vista `/studio` interactiva corresponde a Fase 2 sobre los servicios ya existentes.

```mermaid
flowchart TB
    subgraph ClientLayer["«boundary» Capa Cliente (Navegador)"]
        PublicWeb["«component» Public CV Viewer (/, /u/[slug])"]
        LoginUI["«component» Auth UI (/login)"]
        AdminUI["«component» Control Center CMS (/admin/*)"]
        StudioUI["«component» Studio IDE (/studio - Fase 2)"]
    end

    subgraph AppWeb["«component» Frontend & API Gateway (apps/web/src)"]
        ProxyGuard["«component» Edge Route Guard (proxy.ts)"]
        GatewayAPI["«component» Thin REST Mounts (/api/**)"]
    end

    subgraph Microservices["services/*/src (Microservicios Lógicos Independientes)"]
        ApiAuth["«component» @cv/api-auth (routes, services, repos, edge.ts)"]
        ApiCv["«component» @cv/api-cv (profile, career, showcase)"]
        ApiCerts["«component» @cv/api-certifications (certificados PDF)"]
        MediaVault["«component» @cv/media-vault (StorageProvider, magic bytes, assets)"]
        ApiStudio["«component» @cv/api-studio (CanvasSchemaV1, template-engine)"]
        ApiContact["«component» @cv/api-contact (honeypot, rate limit, inbox)"]
    end

    subgraph KernelPkgs["packages/*/src (Kernel Compartido)"]
        Contracts["«component» @cv/contracts"]
        Core["«component» @cv/core (env, http, rate-limit, locale)"]
        DbPkg["«component» @cv/database (PrismaClient Singleton)"]
    end

    subgraph DataNodes["Almacenamiento Externo"]
        PgDB[("«database» PostgreSQL 16")]
        DiskFS[("«database» File System ./storage/uploads")]
    end

    AdminUI -->|Navegación protegida| ProxyGuard
    StudioUI -->|Navegación protegida| ProxyGuard
    ProxyGuard -->|@cv/api-auth/edge| ApiAuth

    PublicWeb -->|SSR getPrimaryPublishedShowcase| ApiCv
    LoginUI --> GatewayAPI
    AdminUI --> GatewayAPI
    StudioUI --> GatewayAPI
    PublicWeb --> GatewayAPI

    GatewayAPI --> ApiAuth
    GatewayAPI --> ApiCv
    GatewayAPI --> ApiCerts
    GatewayAPI --> MediaVault
    GatewayAPI --> ApiStudio
    GatewayAPI --> ApiContact

    ApiCerts -->|validatePdfBuffer + StorageProvider| MediaVault

    ApiAuth --> Core
    ApiAuth --> DbPkg
    ApiCv --> Contracts
    ApiCv --> Core
    ApiCv --> DbPkg
    ApiCerts --> Contracts
    ApiCerts --> Core
    ApiCerts --> DbPkg
    MediaVault --> Core
    MediaVault --> DbPkg
    ApiStudio --> Core
    ApiStudio --> DbPkg
    ApiContact --> Core
    ApiContact --> DbPkg

    DbPkg -->|SQL / TCP 5432| PgDB
    MediaVault -->|I/O seguro sin traversal| DiskFS
```

### Mapa de Paquetes, Servicios y Contratos Verificados

| Paquete / Servicio | Punto de Entrada Público | Responsabilidad Principal |
| :--- | :--- | :--- |
| [apps/web/src/proxy.ts](../../apps/web/src/proxy.ts) | `@cv/api-auth/edge` | Intercepta `/admin/*` y `/studio/*` verificando firma JWT `HS256` de `cv_session`. |
| [services/api-auth/src/index.ts](../../services/api-auth/src/index.ts) | `handleLogin`, `handleLogout`, `handleMe`, `requireAuthenticatedContext` | Autenticación `bcryptjs`, cookies `HttpOnly` JWT y guardas multi-tenant. |
| [services/api-cv/src/index.ts](../../services/api-cv/src/index.ts) | `handleGetProfile`, `handleUpdateProfile`, `*Handlers`, `getPrimaryPublishedShowcase` | CRUD de perfil, experiencia, educación, proyectos, skills y lectura SSR pública. |
| [services/api-certifications/src/index.ts](../../services/api-certifications/src/index.ts) | `handleListCertifications`, `handleCreateCertification`, `handleUpdateCertification`, `handleDeleteCertification` | Gestión de credenciales PDF coordinando almacenamiento seguro con `@cv/media-vault`. |
| [services/media-vault/src/index.ts](../../services/media-vault/src/index.ts) | `LocalStorageProvider`, `validatePdfBuffer`, `validateFontBuffer`, `handleGetAsset` | Custodia binaria sin *path traversal*, verificación de *magic bytes* y descarga controlada `/api/assets/[id]`. |
| [services/api-studio/src/index.ts](../../services/api-studio/src/index.ts) | `canvasSchemaV1`, `renderCvTemplate`, `handleGetLayout`, `handleSaveLayout` | Versionado `DRAFT/PUBLISHED/ARCHIVED`, motor `{{cv.*}}` sin `eval()` y esquema del lienzo. |
| [services/api-contact/src/index.ts](../../services/api-contact/src/index.ts) | `handleSubmitPublicContact`, `handleListMessages`, `handleMarkMessageRead`, `handleDeleteMessage` | Formulario público anti-spam (*honeypot* + rate limit) y bandeja CMS. |
| [packages/database/src/index.ts](../../packages/database/src/index.ts) | `prisma`, enums Prisma | Cliente Prisma singleton y esquema relacional/`JSONB` único del monorepo. |

---

## 2. Componentes Frontend del Studio IDE, Bóveda PDF y Control Center *(Diseño Detallado Fase 2)*

> **Referencia de diseño validada:** [Prototipo Interactivo](../prototipo/index.html) y [Especificación Wireframes](../prototipo-wireframes.md).

```mermaid
flowchart LR
    subgraph StudioIDE["«component» Studio IDE (/studio - Arquitectura de 4 Zonas)"]
        TopBar["«component» TopActionBar (Draft/Published, Desktop/Mobile, Modo Diseño/Split/Código)"]
        Palette["«component» LeftWidgetPalette (Widgets + Bloques Libres + custom_code + Font Upload)"]
        Stage["«component» FreeformCanvasStage (Drag/Resize/Snap 8px + Reorden Móvil)"]
        CodeBench["«component» CodeWorkbenchIDE (Editor HTML/CSS, Upload .html/.css, Inserción {{cv.*}})"]
        ShadowHost["«component» ShadowPreviewHost (attachShadow mode:open + CSS aislado)"]
        Inspector["«component» PropertiesInspector (Coordenadas X/Y/W/H/Z, Estilo Obsidian/Bone/Cobalt)"]
    end

    subgraph ControlCenter["«component» Control Center CMS (/admin/*)"]
        LeftRail["«component» AdminSidebarNav (apps/web/src/app/admin/layout.tsx)"]
        VaultUpload["«component» CertPdfDropzone (3 pasos + enlace Colocar en Studio)"]
    end

    subgraph PublicModals["«component» Visor Público (/)"]
        PdfModal["«component» CertPdfModalViewer (/api/assets/[id])"]
        LivePreview["«component» PublicCanvasRenderer (Desktop libre / Mobile stack)"]
    end

    Palette -->|Añade CanvasNode| Stage
    Stage -->|Selecciona nodo| Inspector
    Inspector -->|Actualiza x/y/w/h/style/props| Stage
    Stage <-->|Sincroniza bloque custom_code| CodeBench
    CodeBench -->|renderCvTemplate(html, cv)| ShadowHost
    ShadowHost -->|Render aislado dentro de nodo| Stage
    TopBar -->|PUT /api/admin/layout| Stage

    VaultUpload -->|POST /api/admin/certifications| LeftRail
    VaultUpload -->|Pin widget_cert_spotlight| Stage
    Stage -->|Publica layout PUBLISHED| LivePreview
    LivePreview -->|Abre PDF inline| PdfModal
```
