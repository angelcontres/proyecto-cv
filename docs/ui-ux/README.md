# Diseño UI/UX: Wireframes, Mockups y Guía de Estilo
## Fase 2 (Diseño) — Sistema Web de CV Interactivo

**Versión:** 1.0  
**Fecha:** 2026-11-21  
**Estado:** Listo para revisión de diseño y aprobación previa a la implementación de interfaces (Fases 2–3)  
**Prototipo Vivo Navegable:** [docs/prototipo/index.html](../prototipo/index.html) · [Wireframes Base v1.1](../prototipo-wireframes.md)  
**Documentos relacionados:** [SRS](../srs/README.md) · [SAD](../sad/README.md) · [ADR-010 (Sistema Visual)](../adr/ADR-010-sistema-visual-y-arquitectura-ux.md) · [SDD](../sdd/README.md) · [Modelo de Datos](../modelo-datos/README.md) · [APIs (OpenAPI)](../api/README.md)

---

## Índice de Diseño UI/UX

| Documento | Contenido | Trazabilidad |
| :--- | :--- | :--- |
| [01 - Guía de Estilo (*Obsidian & Bone*)](./01-guia-de-estilo.md) | Sistema completo de *Design Tokens* (paletas oscura, *Bone Paper* y 4 atmósferas), tríada tipográfica, retícula, movimiento, accesibilidad WCAG AA y catálogo de componentes base. | `apps/web/src/app/globals.css`, `layout.tsx`, `ADR-010` |
| [02 - Wireframes Detallados](./02-wireframes.md) | Planos estructurales de baja/media fidelidad para Desktop (`1440px`) y Mobile (`390px`), cubriendo `/`, `/login`, `/admin/*`, `/studio` (incluyendo *Split IDE* + `{{cv.*}}`), Visor PDF y Exportación ATS. | `RF-PUB-*`, `RF-AUTH-*`, `RF-DATA-*`, `RF-BUILDER-*`, `RF-CERT-*` |
| [03 - Mockups y Flujos Visuales](./03-mockups-y-flujos.md) | Mockups vectoriales SVG de alta fidelidad embebidos (`docs/ui-ux/mockups/*.svg`), matriz de estados de interfaz (`Empty`, `Loading`, `Error`, `Success`) y checklist de revisión pre-implementación. | `docs/prototipo/index.html` |

---

## Arquitectura de 3 Superficies UX

Para evitar mezclar patrones cognitivos opuestos en una misma pantalla, el sistema separa sus interfaces en tres paradigmas definidos en [ADR-010](../adr/ADR-010-sistema-visual-y-arquitectura-ux.md):

1. **Superficie Pública (`/`, `/u/[slug]`):** Navegación superior (*Top Nav*) + *Spine* lateral de progreso para lectura continua editorial del reclutador/visitante, con alternador `ES | EN`, selector claro/oscuro, filtros en tiempo real, Visor Modal PDF seguro y descarga de CV ATS.
2. **Superficie Control Center CMS (`/admin/*`):** Rail lateral izquierdo agrupado (`256px`–`272px`) + barra de contexto superior + flujo guiado de 3 pasos para carga PDF y enlace directo **`Colocar en Studio`** (`widget_cert_spotlight`).
3. **Superficie Studio IDE (`/studio`):** Espacio *edge-to-edge* de 4 zonas (*Top Action Bar*, *Left Dock +Insertar/Capas/Fuentes*, *Freeform Canvas Stage + Split IDE HTML/CSS/JSON*, *Right Inspector*) orientado a edición espacial con grilla de `8px` y renderizado aislado Shadow DOM.
