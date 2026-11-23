# ADR-004: Diseño Multi-Tenant Ready operando en Single-Tenant Inicial

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RF-AUTH-03`, `RF-PUB-01`, `OBJ-06`

## Contexto
El sistema será utilizado inicialmente solo por su creador (uso personal), pero existe el requisito explícito de que su arquitectura soporte escalar a múltiples usuarios registrados en el futuro sin reescribir la aplicación.

## Alternativas Consideradas
1. **Single-Tenant rígido (sin `userId` ni `slug`):** Más simple al inicio, pero obliga a migrar todas las tablas, APIs y rutas públicas cuando se agregue el segundo usuario.
2. **SaaS Multi-Usuario abierto desde el Día 1:** Añade flujos de registro público, verificación de correo y moderación innecesarios para el lanzamiento personal.
3. **Single-Tenant activo sobre esquema Multi-Tenant Ready:** Todas las entidades llevan `userId` / `profileId` / `slug`, las consultas exigen pertenencia al usuario autenticado y la bandera `ALLOW_SIGNUP=false` cierra el registro público.

## Decisión
Diseñar todas las tablas, índices y guardas (`requireAuthenticatedContext` en `services/api-auth/src/services/guards.service.ts`) bajo aislamiento estricto por `userId` y `profileId`, operando inicialmente con un único usuario propietario (`packages/database/prisma/seed.ts`) y `ALLOW_SIGNUP=false`.

## Justificación
- Permite experiencia personal directa en `/` y `/login` hoy.
- Habilita el modo multi-usuario en Fase 4/futura activando `ALLOW_SIGNUP=true` y exponiendo `/u/[slug]` sin migraciones destructivas.

## Consecuencias
- **Positivas:** Cero deuda técnica de escalabilidad multi-usuario y prevención de fugas entre perfiles por diseño.
- **Negativas / Mitigación:** Cada endpoint administrativo realiza una verificación adicional de propiedad (`profileId`); costo mínimo al usar índices compuestos en PostgreSQL.
