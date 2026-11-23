# ADR-008: Flujo Editorial `Draft / Published` y Versionado de Layouts

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RF-BUILDER-05`, `HU-07`, `CU-02`

## Contexto
Mientras el propietario experimenta moviendo bloques, probando código o ajustando la versión móvil en `/studio`, el enlace público del CV puede estar siendo consultado por reclutadores.

## Alternativas Consideradas
1. **Guardar y publicar directamente sobre el único registro activo:** Cualquier prueba intermedia o bloque incompleto queda expuesto en vivo a visitantes.
2. **Estados explícitos `DRAFT`, `PUBLISHED` y `ARCHIVED` en `PageLayout`:** Separa el espacio de trabajo del snapshot público y conserva historial para revertir.

## Decisión
Modelar `PageLayout` con enum `LayoutStatus` (`DRAFT`, `PUBLISHED`, `ARCHIVED`) y `version` incremental (`packages/database/prisma/schema.prisma`, `services/api-studio/src/routes/layout.routes.ts` expuesto en `apps/web/src/app/api/admin/layout/route.ts`), ejecutando la publicación dentro de una transacción atómica que archiva el `PUBLISHED` previo y promueve el nuevo snapshot.

## Consecuencias
- **Positivas:** Ediciones seguras con autoguardado sin afectar producción hasta pulsar **Publicar**, más capacidad de rollback a versiones anteriores.
- **Negativas / Mitigación:** Incrementa ligeramente la cantidad de filas en `page_layouts` con el tiempo; mitigado consultando solo las últimas versiones o limpiando snapshots `ARCHIVED` antiguos si es necesario.
