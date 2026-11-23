# ADR-010: Estética Editorial "Obsidian & Bone" y Separación UX (Público / Hub / IDE)

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RF-BUILDER-01`, `RF-BUILDER-06`, `RF-PUB-02`, `RNF-UX-01`, `RNF-UX-03`

## Contexto
Durante la fase de prototipado se detectaron dos necesidades claras de experiencia de usuario: evitar una estética genérica de plantilla SaaS azul/blanca (adoptando la inspiración arquitectónica de `ryoku.dev`), y resolver la duda organizativa de si mantener barra de navegación superior también en Administración y cómo estructurar el Studio con editor de código.

## Alternativas Consideradas
1. **Barra de navegación superior idéntica en Público, Admin y Studio:** En Admin choca con las pestañas internas de idiomas (`ES/EN`) y sub-secciones, dejando poco espacio al contenido.
2. **UX diferenciada por tarea manteniendo un mismo sistema visual (*Obsidian & Bone*):**
   - **Vista Pública (`/`):** Barra superior minimalista + *Spine* lateral de lectura continua.
   - **Control Center CMS (`/admin`):** Rail lateral izquierdo agrupado (`ryoku-hub` style) + barra contextual + workspace maestro-detalle.
   - **Constructor Visual (`/studio`):** Shell IDE *full-bleed* en 4 zonas con conmutador `Diseño | Split IDE | </> Código`.

## Decisión
Adoptar el preset **`ryoku-obsidian`** (`#000000`/`#0a0a0a`, tinta `#cdc4ba`, señal `#ce5e32`, variantes *Void/Cobalt/Indigo*, modo claro *Bone Paper* `#f3efe9`, tríada `Fraunces` + `Space Grotesk` + `Space Mono`) y la **separación UX por propósito** documentada y validada en `docs/prototipo/index.html`.

## Consecuencias
- **Positivas:** Identidad visual distintiva de alto nivel desde el primer arranque, cero colisión de pestañas en `/admin` y flujo natural en `/studio` tanto para diseño visual como para código.
- **Negativas / Mitigación:** Exige mantener consistencia de tokens CSS entre la vista pública, el CMS y el Studio; se centralizan en `globals.css`, `layout.tsx` y `Profile.themeConfig`.
