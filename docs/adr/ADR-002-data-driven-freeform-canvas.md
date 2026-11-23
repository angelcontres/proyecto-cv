# ADR-002: Arquitectura Dual "Data-Driven Freeform Canvas" y Móvil por Apilado

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RF-BUILDER-01..04`, `RF-DATA-01..05`, `RNF-COMP-02`

## Contexto
El propietario desea construir su página desde cero de forma libre e interactiva (arrastrar, posicionar y dimensionar elementos tipo Canva/Figma), pero simultáneamente exige funcionalidades estructuradas: filtros en tiempo real de proyectos/habilidades/certificados, traducción `ES/EN`, visor modal PDF, legibilidad móvil y exportación automática a PDF.

## Alternativas Consideradas
1. **Lienzo libre puro sin datos estructurados:** Todo es texto/cajas sueltas en coordenadas `(x, y)` para Desktop y otro lienzo manual separado para Mobile. Rompe los filtros dinámicos, duplica el trabajo de traducción/mantenimiento y dificulta exportar un CV estructurado.
2. **Plantillas fijas sin constructor libre:** Limita la creatividad y no cumple el objetivo de diseñar la página desde cero.
3. **Modelo Dual Híbrido ("Data-Driven Freeform Canvas"):** Separar la **Capa 1 (Datos estructurados de carrera)** de la **Capa 2 (Lienzo visual)**, con posicionamiento libre en Desktop `(x, y, w, h, zIndex)` y apilado vertical inteligente configurable `(mobile.order, mobile.visible)` en Mobile.

## Decisión
Implementar el **Modelo Dual Híbrido** validado por `canvasSchemaV1` (`services/api-studio/src/schemas/canvas.schema.ts`), combinando elementos libres (`free_*`, `custom_code`) con widgets conectados a datos (`widget_hero`, `widget_timeline`, `widget_projects`, `widget_skills`, `widget_certifications`, `widget_cert_spotlight`, `widget_contact`, `widget_controls`).

## Justificación
- Preserva libertad creativa total en escritorio sin sacrificar filtros, traducciones ni consistencia de datos.
- Garantiza que la versión móvil nunca tenga elementos superpuestos o cortados, reduciendo a la mitad el esfuerzo de edición.

## Consecuencias
- **Positivas:** Actualizar un certificado o proyecto en el CMS actualiza automáticamente todos los widgets vinculados y el PDF exportable.
- **Negativas / Mitigación:** En pantallas móviles no se conserva la posición `(x, y)` exacta de escritorio; se compensa permitiendo reordenar bloques y ocultar elementos decorativos en la vista móvil del Studio.
