# ADR-005: Sesiones `HttpOnly` JWT (`jose`), `bcryptjs`, Rate Limit y Proxy Edge

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RF-AUTH-01`, `RF-AUTH-02`, `RNF-SEC-01`, `RNF-SEC-05`

## Contexto
Todas las operaciones de edición de datos, subida de PDFs/fuentes/código y lectura de mensajes de reclutadores deben quedar protegidas detrás de autenticación robusta, funcionando tanto en el proxy Edge de Next.js 16 como en Route Handlers Node.js.

## Alternativas Consideradas
1. **Tokens en `localStorage`:** Vulnerables a robo si existiera algún vector XSS.
2. **Dependencia obligatoria de proveedor OAuth externo:** Añade fricción y dependencia de cuentas de terceros para despliegue local autónomo.
3. **JWT firmado (`HS256`) con `jose` dentro de cookie `HttpOnly` + `bcryptjs` (12 rounds) + Proxy Edge (`apps/web/src/proxy.ts` + `@cv/api-auth/edge`) + `requireAuthenticatedContext`:** Funciona 100% autónomo en local y producción.

## Decisión
Implementar autenticación propia dentro de `services/api-auth/` con `bcryptjs` (`password.service.ts`), tokens firmados con `jose` (`session.service.ts`) en cookie `HttpOnly`, `SameSite=Lax`, limitación de intentos (`packages/core/src/rate-limit.ts`) y doble barrera de verificación (Edge `apps/web/src/proxy.ts` + servidor `requireAuthenticatedContext`).

## Justificación
- `jose` utiliza WebCrypto y corre nativamente en Edge Runtime (`apps/web/src/proxy.ts` vía `@cv/api-auth/edge`) sin requerir consultar PostgreSQL en cada redirección de navegación.
- Las cookies `HttpOnly` nunca son legibles desde JavaScript del navegador.

## Consecuencias
- **Positivas:** Cero dependencias externas de auth, protección en profundidad en UI y API, defensa contra fuerza bruta (`429`).
- **Negativas / Mitigación:** El rate limiter actual en memoria es por instancia; si en el futuro se despliegan múltiples réplicas horizontales, deberá respaldarse con Redis sin cambiar la interfaz `checkRateLimit`.
