# Proyecto CV — Sistema Web de CV Interactivo

Plataforma web full-stack para diseñar, administrar y publicar un **CV profesional altamente interactivo** desde cero, con repositorio seguro de **certificaciones en PDF**, soporte bilingüe (`ES`/`EN`) y arquitectura preparada para escalar a multi-usuario.

## Documentación de Ingeniería

- [Documento de Visión y Alcance](./docs/vision-y-alcance.md) — Problema, objetivos, stakeholders y límites de alcance (*in-scope / out-of-scope*).
- [Estudio de Factibilidad](./docs/estudio-factibilidad.md) — Análisis de factibilidad técnica, económica, operativa y matriz de riesgos.
- [Matriz de Trazabilidad (RTM)](./docs/matriz-trazabilidad.md) — Trazabilidad bidireccional entre objetivos, requisitos (`RF`/`RNF`), historias de usuario, código y pruebas.
- [Prototipo y Wireframes](./docs/prototipo-wireframes.md) — Mapa de navegación, wireframes de pantallas y [prototipo HTML interactivo](./docs/prototipo/index.html).
- [Documento de Arquitectura (SAD)](./docs/sad/README.md) — Estilo arquitectónico, vistas **C4**, vistas **4+1**, stack y ADRs.
- [Registro de Decisiones Arquitectónicas (ADRs)](./docs/adr/README.md) — Bitácora MADR (`ADR-001` a `ADR-010`) con contexto, alternativas descartadas y justificación técnica.
- [Diseño Detallado (SDD)](./docs/sdd/README.md) — Diagramas UML de clases, secuencia, componentes y despliegue.
- [Modelo de Datos (ER y Diccionario)](./docs/modelo-datos/README.md) — Diagrama Entidad-Relación físico completo, diccionario de datos PostgreSQL y esquemas `JSONB`.
- [Diseño de APIs (OpenAPI 3.1)](./docs/api/README.md) — Especificación formal [openapi.yaml](./docs/api/openapi.yaml), contratos REST y políticas de seguridad.
- [Diseño UI/UX (Guía de Estilo, Wireframes y Mockups)](./docs/ui-ux/README.md) — *Design System Obsidian & Bone*, wireframes actualizados y mockups vectoriales listos para revisión pre-implementación.

Toda la especificación de requisitos está documentada en [`docs/srs/`](./docs/srs/README.md):
- [Requisitos Funcionales](./docs/srs/01-requisitos-funcionales.md)
- [Requisitos No Funcionales](./docs/srs/02-requisitos-no-funcionales.md)
- [Historias de Usuario y Casos de Uso](./docs/srs/03-historias-usuario-y-casos-de-uso.md)
- [Modelo de Datos y Arquitectura](./docs/srs/04-modelo-datos-y-arquitectura.md)

## Requisitos Previos

- **Node.js** `>= 22` y **pnpm**
- **Docker Desktop** (para levantar PostgreSQL 16 en local)

## Puesta en Marcha Local (Fase 1)

1. Copia el archivo de variables de entorno si aún no existe `.env`:
   ```powershell
   Copy-Item .env.example .env
   ```
2. Inicia Docker Desktop y levanta PostgreSQL:
   ```powershell
   docker compose up -d
   ```
3. Instala dependencias (si no se instalaron) y genera el cliente Prisma:
   ```powershell
   pnpm install
   pnpm db:generate
   ```
4. Aplica el esquema en PostgreSQL y carga el usuario propietario inicial:
   ```powershell
   pnpm db:push
   pnpm db:seed
   ```
5. Inicia el servidor de desarrollo:
   ```powershell
   pnpm dev
   ```
   - Sitio público: `http://localhost:3000`
   - Inicio de sesión / Panel Admin: `http://localhost:3000/login` (credenciales por defecto en `.env`: `admin@proyecto-cv.local` / `AdminPassword123!`).

## Comandos Útiles

- `pnpm test` — Ejecuta la suite de pruebas unitarias (`Vitest`).
- `pnpm typecheck` — Verifica tipos de TypeScript (`tsc --noEmit`).
- `pnpm lint` — Ejecuta ESLint.
- `pnpm build` — Genera el build de producción de Next.js.
- `pnpm db:validate` — Valida el esquema `packages/database/prisma/schema.prisma`.
