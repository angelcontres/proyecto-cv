# ADR-009: Exportación Automática de CV en Formato ATS-Friendly Independiente del Lienzo

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RF-PUB-03`, `HU-09`, `CU-03`

## Contexto
Los visitantes/reclutadores necesitan poder descargar el CV completo en PDF desde la página pública, y la mayoría de procesos de selección corporativos procesan ese PDF mediante sistemas automatizados ATS (*Applicant Tracking Systems*).

## Alternativas Consideradas
1. **Imprimir o capturar en PDF el lienzo libre web (Playwright / `window.print`):** Los fondos oscuros, coordenadas libres `(x, y)` y tarjetas superpuestas suelen fragmentarse entre páginas y romper el orden de lectura de los parsers ATS.
2. **Generador PDF vectorial estructurado desde los datos vigentes en BD (`ES`/`EN`):** Produce un documento limpio, paginado, con texto seleccionable y jerarquía estándar independiente del diseño visual web.

## Decisión
Separar la generación del PDF descargable de la composición libre web, alimentando el exportador de Fase 3 directamente con las entidades visibles (`isVisible = true`) en el idioma actualmente seleccionado por el visitante (`ES` o `EN`), incluyendo un resumen estructurado de certificaciones.

## Consecuencias
- **Positivas:** La web conserva libertad visual total (incluso estética oscura *Obsidian*) mientras el PDF descargado es 100% legible por humanos y ATS.
- **Negativas / Mitigación:** El diseño del PDF exportado sigue una plantilla estructurada limpia y no replica bloques decorativos sueltos del lienzo; decisión confirmada explícitamente con el propietario.
