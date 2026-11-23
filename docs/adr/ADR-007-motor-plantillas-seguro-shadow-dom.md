# ADR-007: Motor Seguro de Variables `{{cv.*}}` y Shadow DOM para Código Subido

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RF-BUILDER-07`, `RF-BUILDER-08`, `RNF-SEC-03`, `HU-11`

## Contexto
El propietario desea escribir o subir código fuente propio (`.html` / `.css`) desde un IDE enfocado dentro del Studio para renderizarlo en el lienzo, e inyectar variables conectadas en tiempo real a los datos de su CV (`{{cv.profile.fullName}}`, `{{#each cv.projects}}`, etc.).

## Alternativas Consideradas
1. **Inyección directa con `dangerouslySetInnerHTML` + `eval` o motor completo tipo Handlebars sin restricción:** Introduce riesgo grave de XSS (almacenado si se abre multi-usuario o mediante datos externos en contacto/campos) y permite que el CSS personalizado rompa el resto de la aplicación.
2. **Prohibir código personalizado:** Restringe la capacidad creativa y técnica solicitada por el usuario.
3. **Motor propio lógico-mínimo (`renderCvTemplate`) + Shadow DOM / Sandbox:** Escapa automáticamente toda variable interpolada, elimina etiquetas/atributos ejecutables (`<script>`, `on*=`, `javascript:`) y encapsula el CSS dentro de Shadow DOM heredando variables del tema (`--paper`, `--ink`, `--sun`).

## Decisión
Implementar `renderCvTemplate`, `sanitizeCustomHtml` y `escapeHtml` en `services/api-studio/src/engine/template-engine.ts` (cubiertos por pruebas en `services/api-studio/tests/studio-engine.test.ts`), combinados con renderizado encapsulado en Shadow DOM (y opción de `<iframe sandbox>` sin `allow-same-origin` para máxima contención si se habilita multi-usuario).

## Justificación
- Permite usar plantillas HTML/CSS propias conectadas a la BD en Español/Inglés con seguridad garantizada contra XSS y fugas de CSS.

## Consecuencias
- **Positivas:** Experiencia tipo IDE potente sin sacrificar estabilidad visual ni seguridad.
- **Negativas / Mitigación:** No permite JavaScript imperativo arbitrario dentro de bloques `custom_code`; se compensa ofreciendo interactividad rica en los widgets nativos y animaciones CSS puras dentro del bloque.
