# 04 - Diagramas de Despliegue UML

Este documento detalla la topología física actual de ejecución local y la topología objetivo de producción en la nube, junto con las variables de configuración reales del sistema.

---

## 1. Topología de Desarrollo Local (Configuración Actual)

> **Fuente verificada:** [docker-compose.yml](../../docker-compose.yml), [package.json](../../package.json), [packages/core/src/env.ts](../../packages/core/src/env.ts), [.env.example](../../.env.example).

```mermaid
flowchart TB
    subgraph ClientNode["«device» Navegador Web Local"]
        Browser["«artifact» Chrome / Edge / Firefox (HTTPS/HTTP localhost:3000)"]
    end

    subgraph HostWindows["«device» Host Desarrollador (Windows OS - C:\\Users\\OMEN\\proyecto-cv)"]
        subgraph NodeExec["«executionEnvironment» Node.js v24 + pnpm Workspaces (Puerto 3000)"]
            NextApp["«artifact» @cv/web + 6 Servicios (@cv/api-*, @cv/media-vault) + proxy.ts"]
            PrismaRuntime["«artifact» Prisma Client v6.19"]
            LocalStore["«artifact» LocalStorageProvider"]
            NextApp --> PrismaRuntime
            NextApp --> LocalStore
        end

        subgraph LocalDisk["«device» Disco Local Host"]
            UploadDir[("«database» ./storage/uploads (certifications/*.pdf, fonts)")]
        end

        subgraph DockerEngine["«executionEnvironment» Docker Desktop / Engine"]
            subgraph PgContainer["«container» proyecto-cv-postgres (postgres:16-alpine)"]
                PgServer[("«database» PostgreSQL 16 DB: proyecto_cv (TCP 5432)")]
                HealthPg["«artifact» healthcheck: pg_isready -U postgres"]
            end
            PgVol[("«database» Volumen Docker: postgres_data (/var/lib/postgresql/data)")]
            PgServer --- PgVol
        end
    end

    Browser -->|HTTP TCP 3000| NextApp
    PrismaRuntime -->|TCP localhost:5432| PgServer
    LocalStore -->|POSIX / NTFS File I/O| UploadDir
```

---

## 2. Topología Objetivo de Producción *(Escenario Contenedorizado)*

> **Base arquitectónica:** [ADR-001](../adr/ADR-001-monolito-modular-nextjs.md) y [ADR-006](../adr/ADR-006-custodia-activos-storage-provider.md).

```mermaid
flowchart LR
    subgraph EndUsers["«device» Clientes Externos"]
        Recruiter["«artifact» Navegador Reclutador / Visitante"]
        AdminBrowser["«artifact» Navegador Propietario (/admin, /studio)"]
    end

    subgraph EdgeNet["«executionEnvironment» Reverse Proxy / CDN"]
        TlsProxy["«component» TLS Termination + Reverse Proxy (HTTPS 443)"]
    end

    subgraph AppCluster["«executionEnvironment» Contenedor Aplicación (Docker / PaaS)"]
        NextProd["«artifact» Next.js Standalone Server (Puerto 3000, NODE_ENV=production)"]
        HealthProbe["«artifact» Health Probe GET /api/health"]
        StorageAdapter["«interface» StorageProvider (local o S3/R2)"]
        NextProd --- HealthProbe
        NextProd --> StorageAdapter
    end

    subgraph ManagedData["Servicios Gestionados / Red Privada"]
        ManagedPg[("«database» PostgreSQL 16 Gestionado (TLS / TCP 5432)")]
        ObjectBucket[("«database» Object Storage S3 / Cloudflare R2 (HTTPS 443)")]
    end

    Recruiter -->|HTTPS 443| TlsProxy
    AdminBrowser -->|HTTPS 443| TlsProxy
    TlsProxy -->|HTTP interno 3000| NextProd
    NextProd -->|SQL sobre TLS 5432| ManagedPg
    StorageAdapter -->|Put/Get privado por STORAGE_PROVIDER| ObjectBucket
```

---

## 3. Matriz de Configuración y Requisitos de Despliegue

> **Fuente verificada:** [.env.example](../../.env.example) y [packages/core/src/env.ts](../../packages/core/src/env.ts).

| Variable de Entorno | Valor por Defecto / Ejemplo | Rol en el Despliegue | Restricción / Validación en Código |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/proyecto_cv?schema=public` | Cadena de conexión PostgreSQL para Prisma ORM | Requerida por `packages/database/prisma/schema.prisma`. |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | `postgres` / `postgres` / `proyecto_cv` / `5432` | Inicialización del contenedor `proyecto-cv-postgres` | Consumidas por `docker-compose.yml`. |
| `AUTH_SECRET` | Secreto de desarrollo en dev | Clave simétrica `HS256` para firmar/verificar cookies `cv_session` | En producción (`NODE_ENV=production`) exige **>= 32 caracteres**; si falta, `getEnvConfig()` lanza error. |
| `ALLOW_SIGNUP` | `"false"` | Bandera operativa *Single-Tenant* vs *Multi-Tenant* | Evaluada como booleano estricto (`=== "true"`). |
| `PRIMARY_PROFILE_SLUG` | `"mi-cv"` | *Slug* del perfil principal servido en `/` | Respaldo automático en `getEnvConfig()`. |
| `STORAGE_PROVIDER` | `"local"` | Selección de adaptador para `getStorageProvider()` | Actualmente admite `"local"`; otros proveedores lanzan error explícito hasta implementar el adaptador S3/R2. |
| `STORAGE_LOCAL_DIR` | `"./storage/uploads"` | Directorio base de `LocalStorageProvider` | Resuelto con `path.resolve()` bloqueando accesos fuera del directorio raíz. |
| `MAX_PDF_SIZE_MB` | `"10"` | Límite máximo de archivo PDF (en MB) | Convertido a bytes (`>= 1 MB`) para `validatePdfBuffer()`. |
| `SEED_ADMIN_*` | `admin@proyecto-cv.local` / `AdminPassword123!` | Credenciales iniciales para `pnpm db:seed` | Utilizadas únicamente al ejecutar el script de *seed*. |
