# ADR-003: Persistencia Híbrida Relacional + JSONB con PostgreSQL 16 y Prisma ORM

- **Estado:** Aceptado
- **Fecha:** 2026-11-21
- **Requisitos relacionados:** `RF-DATA-01..05`, `RF-BUILDER-05`, `RNF-PERF-04`, `RNF-MAINT-03`

## Contexto
El sistema maneja datos fuertemente relacionales (usuarios, perfiles, experiencias, certificaciones, activos binarios con integridad referencial) junto con estructuras altamente dinámicas (árbol de nodos del lienzo visual `canvasSchema` y campos localizados `i18n`).

## Alternativas Consideradas
1. **SQLite:** Cero configuración inicial, pero carece de tipo `JSONB` indexable nativo, arreglos `String[]` y escalabilidad concurrente para producción multi-usuario.
2. **MongoDB / NoSQL:** Cómodo para el JSON del lienzo, pero débil en integridad referencial entre certificaciones, archivos binarios y usuarios.
3. **PostgreSQL 16 (Docker Compose) + Prisma ORM (`^6.19.3`):** Combina relaciones estrictas con columnas `Json` (`JSONB`) y arreglos nativos.

## Decisión
Utilizar **PostgreSQL 16** ejecutado localmente vía **Docker Compose** (`docker-compose.yml`) y modelado con **Prisma ORM 6**.

## Justificación
- `JSONB` permite almacenar `canvasSchema` y campos `{ es, en }` sin crear decenas de tablas de traducción rígidas.
- Las transacciones atómicas (`prisma.$transaction`) garantizan consistencia al crear `FileAsset` + `Certification` o al archivar versiones `PUBLISHED` -> `ARCHIVED`.

## Consecuencias
- **Positivas:** Esquema validado estáticamente, cliente TypeScript autogenerado e infraestructura portable.
- **Negativas / Mitigación:** Requiere Docker Desktop o instancia PostgreSQL activa para correr migraciones y pruebas HTTP en vivo; el build y las pruebas unitarias se diseñaron para correr desacoplados sin requerir BD encendida.
