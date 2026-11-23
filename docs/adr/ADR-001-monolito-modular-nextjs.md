# ADR-001: Monolito Modular Full-Stack con Next.js App Router y TypeScript

- **Estado:** Aceptado (Evolucionado estructuralmente por [ADR-011](./ADR-011-monorepo-servicios-pnpm-workspace.md))
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RNF-PERF-01`, `RNF-MAINT-01`, `RNF-MAINT-03`

## Contexto
El sistema requiere dos experiencias muy distintas: una página pública de CV con carga rápida e indexable (SSR/SEO), y un panel administrativo + constructor visual interactivo con endpoints seguros para autenticación, CRUD relacional, subida binaria de PDFs y generación de documentos.

## Alternativas Consideradas
1. **SPA (React + Vite) + Backend separado (NestJS o FastAPI):** Aísla ambos procesos pero duplica repositorios/contratos de tipos, requiere configurar CORS, proxy inverso en desarrollo y dos pipelines de despliegue.
2. **Arquitectura de Microservicios distribuidos desde el inicio:** Latencia de red y complejidad operativa elevada para una plataforma que inicia en modo personal.
3. **Monolito Modular Orientado a Servicios en Monorepo `pnpm` (`ADR-011`):** Mantiene despliegue unificado en Next.js 16 (App Router) + TypeScript `strict`, pero separa físicamente Frontend (`apps/web/src`), 6 microservicios lógicos independientes (`services/*/src`) y paquetes compartidos (`packages/*`).

## Decisión
Adoptar un **Monolito Modular en Next.js 16 (App Router) con TypeScript estricto** organizado en **`pnpm workspaces` por servicios** conforme a [ADR-011](./ADR-011-monorepo-servicios-pnpm-workspace.md): `apps/web/src` (UI y Gateway delgado) y `services/{api-auth,api-cv,api-certifications,media-vault,api-studio,api-contact}/src`.

## Justificación
- Reduce a cero la fricción entre cliente, servidor y base de datos al compartir exactamente los mismos esquemas `Zod` y tipos `Prisma`.
- Permite renderizar `/` directamente desde el servidor (SSR/RSC) cumpliendo `FCP < 1.5s`.
- Simplifica la puesta en marcha local y futura contenedorización en producción.

## Consecuencias
- **Positivas:** Un solo `package.json`, compilación y verificación unificada (`tsc`, `vitest`, `eslint`, `next build`), despliegue simple.
- **Negativas / Mitigación:** Un pico de procesamiento pesado (ej. generación masiva de PDFs en futuro multi-usuario) competiría con peticiones web; se mitiga manteniendo desacoplada la lógica por dominio dentro de `services/*/src` para poder mover cada servicio a workers o contenedores dedicados si escala.
