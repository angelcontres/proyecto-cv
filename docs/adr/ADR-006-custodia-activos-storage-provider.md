# ADR-006: Abstracción `StorageProvider`, Validación de *Magic Bytes* y Entrega Controlada

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RF-CERT-01`, `RF-CERT-03`, `RF-BUILDER-09`, `RNF-SEC-02`, `RNF-SEC-04`, `RNF-MAINT-02`

## Contexto
El sistema almacena PDFs de certificaciones/documentos extras y fuentes tipográficas (`.woff2`/`.ttf`/`.otf`) subidos por el usuario. Debe evitarse que archivos maliciosos disfrazados se ejecuten o expongan por rutas predecibles, respetando si un certificado permite descarga (`allowDownload`) y permitiendo migrar de disco local a la nube sin reescribir lógica.

## Alternativas Consideradas
1. **Guardar archivos directamente en `public/uploads/`:** Expone los archivos estáticamente sin control de visibilidad ni de `allowDownload`, y es vulnerable a sniffing MIME si se sube un HTML disfrazado.
2. **Almacenar binarios dentro de PostgreSQL (`BYTEA`):** Infla respaldos de BD y consume memoria en cada streaming.
3. **Almacenamiento privado tras `StorageProvider` + Validación binaria + Endpoint `/api/assets/[id]`:** Desacopla almacenamiento, valida cabeceras binarias reales y controla cabeceras HTTP de salida.

## Decisión
- Almacenar binarios fuera de `public/` (`./storage/uploads`) tras la interfaz `StorageProvider` (`services/media-vault/src/storage/provider.ts`, `local.ts`).
- Validar PDFs (`%PDF-`) en `services/media-vault/src/validators/pdf.validator.ts` y fuentes (`wOF2`, `OTTO`, TTF) en `font.validator.ts`, calculando `SHA-256` y usando claves UUID seguras contra path traversal.
- Servir únicamente vía `GET /api/assets/[id]` con `X-Content-Type-Options: nosniff` y verificación de visibilidad o sesión propietaria.

## Consecuencias
- **Positivas:** Control total sobre permisos/descargas, cero archivos huérfanos en fallos transaccionales y migración limpia a `S3StorageProvider`.
- **Negativas / Mitigación:** En despliegues con contenedores efímeros sin S3, el volumen `./storage/uploads` debe montarse de forma persistente (documentado en `README.md` y Factibilidad).
