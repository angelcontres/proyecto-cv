# 02 - Modelo de Vistas 4+1 (Kruchten)

El modelo **4+1** describe la arquitectura desde cinco perspectivas complementarias: **Lógica**, **Procesos**, **Desarrollo**, **Física (Despliegue)** y **Escenarios (+1)**.

---

## 1. Vista Lógica

Representa la descomposición estructural del dominio y las abstracciones principales que resuelven los requisitos funcionales sin acoplar la presentación visual a los datos persistidos.

```mermaid
classDiagram
    class User {
        +UUID id
        +String email
        +UserRole role
    }
    class Profile {
        +UUID id
        +String slug
        +Boolean isPrimary
        +Json localizedInfo
        +Json themeConfig
    }
    class CareerEntities {
        <<Experience, Education, Project, Skill>>
        +Boolean isVisible
        +Int sortOrder
    }
    class Certification {
        +UUID id
        +Json titleI18n
        +String category
        +Boolean allowDownload
    }
    class FileAsset {
        +UUID id
        +AssetKind kind
        +String storageKey
        +String sha256
    }
    class PageLayout {
        +UUID id
        +LayoutStatus status
        +Int version
        +Json canvasSchema
    }
    class StorageProvider {
        <<interface>>
        +put(key, content)
        +read(key)
        +exists(key)
        +remove(key)
    }

    User "1" --> "1..*" Profile : owns
    User "1" --> "0..*" FileAsset : uploads
    Profile "1" --> "0..*" CareerEntities : aggregates
    Profile "1" --> "0..*" Certification : showcases
    Profile "1" --> "0..*" PageLayout : versions
    Certification "0..1" --> "0..1" FileAsset : references
    StorageProvider <|.. LocalStorageProvider : implements
```

### Principios de la Vista Lógica
- **Desacoplamiento Datos vs. Lienzo:** `CareerEntities` y `Certification` no dependen de `PageLayout`; el renderizador público hidrata los widgets (`widget_hero`, `widget_projects`, `widget_certifications`, `widget_cert_spotlight`) e interpola variables `{{cv.*}}` en nodos `custom_code` al momento de servir la vista.
- **Estado Bilingüe Universal:** Todos los campos editoriales se modelan como `{ es, en }` y se resuelven con respaldo (*fallback*) determinístico en `packages/core/src/locale.ts`.

---

## 2. Vista de Procesos (Concurrencia y Flujos Dinámicos)

### 2.1 Flujo Seguro de Subida y Entrega de Certificaciones PDF (`CU-01`)

```mermaid
sequenceDiagram
    actor Owner as Propietario
    participant UI as Control Center (/admin/certifications)
    participant API as POST /api/admin/certifications
    participant Val as validatePdfBuffer()
    participant Store as StorageProvider
    participant DB as PostgreSQL (Prisma)

    Owner->>UI: Arrastra PDF y completa metadatos
    UI->>API: multipart/form-data (file + metadata JSON)
    API->>API: requireAuthenticatedContext() + Zod safeParse
    API->>Val: Verifica extension, <=10MB, magic bytes %PDF- y SHA-256
    alt PDF inválido
        Val-->>API: ok: false
        API-->>UI: 400 Bad Request (sin escribir en disco ni BD)
    else PDF válido
        API->>Store: put("certifications/uuid.pdf", buffer)
        API->>DB: $transaction (create FileAsset + create Certification)
        alt Fallo en transacción DB
            API->>Store: remove("certifications/uuid.pdf") (rollback limpio)
            API-->>UI: 500 Error
        else Éxito
            API-->>UI: 201 Created (item + fileAsset)
        end
    end
```

### 2.2 Flujo de Edición en Studio IDE, Plantillas `{{cv.*}}` y Publicación (`CU-02`)

```mermaid
sequenceDiagram
    actor Owner as Propietario
    participant Studio as Studio IDE (/studio)
    participant Engine as renderCvTemplate()
    participant LayoutAPI as PUT /api/admin/layout
    participant DB as PostgreSQL (PageLayout)
    participant Pub as Vista Pública (/)

    Owner->>Studio: Arrastra bloques / edita custom_code (.html/.css)
    Studio->>Engine: Interpola {{cv.*}} + sanitiza HTML + monta Shadow DOM
    Studio->>LayoutAPI: Autoguardado debounced (publish: false)
    LayoutAPI->>LayoutAPI: Valida canvasSchemaV1 con Zod
    LayoutAPI->>DB: Actualiza registro status = DRAFT
    Owner->>Studio: Pulsa "Publicar"
    Studio->>LayoutAPI: PUT (publish: true)
    LayoutAPI->>DB: $transaction: ARCHIVED anterior -> nuevo PUBLISHED (version+1)
    Pub->>DB: Lee layout PUBLISHED + entidades isVisible = true
```

---

## 3. Vista de Desarrollo (Organización en Monorepo por Servicios)

Muestra la organización física en `pnpm workspaces` y sus reglas de dependencia unidireccionales verificadas por `eslint.config.mjs` (`apps/web` -> `services/*` -> `packages/*`):

```text
proyecto-cv/
├── apps/
│   └── web/                      # @cv/web: Frontend Next.js + API Gateway delgado
│       ├── next.config.ts
│       └── src/
│           ├── proxy.ts          # Guarda Edge delegando en @cv/api-auth/edge
│           ├── components/       # Componentes UI cliente reutilizables
│           └── app/              # Páginas SSR/UI + montajes REST delgados /api/*
├── services/                     # Microservicios lógicos aislados por dominio
│   ├── api-auth/src/             # @cv/api-auth: login/logout/me, JWT, bcrypt, guards
│   ├── api-cv/src/               # @cv/api-cv: perfil, carrera, portafolio, showcase SSR
│   ├── api-certifications/src/   # @cv/api-certifications: bóveda de certificados PDF
│   ├── media-vault/src/          # @cv/media-vault: StorageProvider, magic-bytes, /assets
│   ├── api-studio/src/           # @cv/api-studio: CanvasSchemaV1, Draft/Published, {{cv.*}}
│   └── api-contact/src/          # @cv/api-contact: anti-spam honeypot + bandeja CMS
│       # Estructura interna estándar de cada servicio:
│       # ├── index.ts (única puerta pública), routes/, repositories/, schemas/, tests/
├── packages/                     # Kernel técnico compartido (dependencia hacia abajo)
│   ├── contracts/src/            # @cv/contracts: primitivas Zod e interfaces comunes
│   ├── core/src/                 # @cv/core: env, HTTP helpers, rate-limit, i18n
│   └── database/                 # @cv/database: schema.prisma, seed.ts y cliente Prisma
└── docs/                         # SRS, SAD, ADRs, SDD, Modelo de Datos, APIs y UI/UX
```

---

## 4. Vista Física / Despliegue

### 4.1 Topología Local de Desarrollo (Activa en Fase 1)

```mermaid
flowchart LR
    DEV["Navegador Local (localhost:3000)"] -->|"HTTP"| NODE["Node.js v24 + Next.js Dev/Prod Server"]
    NODE -->|"Prisma TCP :5432"| DOCKERPG["Contenedor Docker: postgres:16-alpine"]
    DOCKERPG --> VOL1[("Volumen Docker: postgres_data")]
    NODE -->|"LocalStorageProvider"| VOL2[("Carpeta Local: ./storage/uploads")]
```

### 4.2 Topología Objetivo en Producción (VPS o Nube)

```mermaid
flowchart LR
    USER["Visitante / Propietario"] -->|"HTTPS / TLS 1.3"| REV["Proxy Inverso (Nginx / Caddy / Edge CDN)"]
    REV -->|"HTTP interno :3000"| APP["Contenedor App (Next.js Standalone)"]
    APP -->|"TLS / Red Privada :5432"| PGPROD[("PostgreSQL 16 (Volumen / Administrado)")]
    APP -->|"HTTPS S3 API / Volumen"| S3[("Object Storage (S3 / Cloudflare R2 / MinIO)")]
```

---

## 5. Vista de Escenarios (+1)

Valida que las cuatro vistas anteriores satisfacen los escenarios críticos del sistema:

| Escenario | Vistas Involucradas | Atributo de Calidad Verificado |
| :--- | :--- | :--- |
| **E1: Visitante intenta acceder a `/admin` o `/api/admin/*` sin cookie válida** | Desarrollo (`proxy.ts`, `guards.ts`) + Procesos | **Seguridad (`RNF-SEC-01`):** Edge redirige a `/login` y API responde `401 Unauthorized` antes de tocar la BD. |
| **E2: Propietario sube un `.exe` o `.html` renombrado a `.pdf`** | Lógica (`validatePdfBuffer`) + Procesos (`CU-01`) | **Seguridad (`RNF-SEC-02`):** La inspección de *magic bytes* (`%PDF-`) rechaza el archivo con `400`; no se escribe en disco. |
| **E3: Propietario sube código HTML personalizado con `{{cv.profile.fullName}}` e intenta `<script>`** | Lógica (`template-engine.ts`) + Procesos (`CU-02`) | **Seguridad (`RNF-SEC-03`):** `renderCvTemplate` elimina `<script>`/`on*=`, escapa caracteres HTML en variables e instala el CSS en Shadow DOM aislado. |
| **E4: Migración de disco local a Cloudflare R2 / AWS S3 en producción** | Lógica (`StorageProvider`) + Física | **Portabilidad (`RNF-MAINT-02`):** Se implementa `S3StorageProvider` y se cambia `STORAGE_PROVIDER` sin modificar rutas API ni base de datos. |
| **E5: Activación de registro multi-usuario en fase futura** | Lógica (`userId`, `slug`) + Física | **Escalabilidad (`OBJ-06`):** Se habilita `ALLOW_SIGNUP=true` y ruta `/u/[slug]` reutilizando los índices y guardas por `userId` ya existentes. |
