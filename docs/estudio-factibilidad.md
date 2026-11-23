# Estudio de Factibilidad
## Sistema Web de CV Interactivo con Constructor Visual de Lienzo Libre

**Versión:** 1.0  
**Fecha:** 2026-11-20  
**Estado:** Aprobado  
**Documentos relacionados:** [Documento de Visión y Alcance](./vision-y-alcance.md) · [Especificación de Requisitos (SRS)](./srs/README.md)

---

## 1. Resumen Ejecutivo y Dictamen

| Dimensión | Evaluación | Conclusión |
| :--- | :--- | :--- |
| **Factibilidad Técnica** | **Alta (Viable)** | El stack elegido (`Next.js 16 + TypeScript + PostgreSQL 16 + Prisma 6 + Docker`) está probado, la Fase 1 ya compila y pasa pruebas unitarias en el entorno local (`Node.js v24`, `pnpm`, `Docker`, `Git`). Los riesgos de Fase 2/3 (motor de lienzo libre e integración PDF con React 19) tienen mitigaciones concretas. |
| **Factibilidad Económica** | **Muy Alta (Viable)** | El 100% de las herramientas y librerías base son *open source* (costo de licenciamiento **$0 USD**). La ejecución local es gratuita y el despliegue en producción para uso personal puede operar en rangos de bajo costo o capas gratuitas iniciales, sin costos de reescritura para crecer a multi-usuario. |
| **Factibilidad Operativa** | **Alta (Viable)** | Separar la gestión de datos (`/admin`), el constructor visual (`/studio`) con móvil automático por orden y el flujo `Borrador / Publicado` hace que el sistema sea mantenible por una sola persona en el día a día, con operación sencilla mediante Docker y respaldos estándar. |

**Dictamen General:** El proyecto es **técnica, económica y operativamente factible** para avanzar a las Fases 2, 3 y 4 conforme al roadmap del SRS.

---

## 2. Factibilidad Técnica

### 2.1 Capacidad del Entorno Local Verificado
Se comprobó la disponibilidad de las herramientas base en la estación de trabajo del proyecto (`Windows`):
- **Runtime y gestor de paquetes:** `Node.js v24.19.0`, `npm 11.17.0`, `pnpm 12.4.1`.
- **Contenedores y control de versiones:** `Docker 29.7.2` (CLI instalada; requiere iniciar Docker Desktop al ejecutar la BD) y `Git 2.55.0`.
- **Estado de la base técnica (Fase 1):** Esquema Prisma validado (`pnpm db:validate`), compilación estricta TypeScript (`tsc --noEmit`), suite unitaria Vitest (`6` archivos / `17` pruebas en `services/*/tests/`), linter con fronteras arquitectónicas (`eslint .`) y compilación de producción (`next build`) verificados correctamente.

### 2.2 Viabilidad por Componente Crítico

| Componente / Requisito | Enfoque Técnico Elegido | Nivel de Riesgo | Análisis y Mitigación |
| :--- | :--- | :--- | :--- |
| **Persistencia y modelo Multi-Tenant Ready** | PostgreSQL 16 (`JSONB` + relacional) + Prisma ORM (`user_id`, `profile_id`, `slug`). | **Bajo** | Ya validado en `packages/database/prisma/schema.prisma`. Permite consultas indexadas rápidas y evolución sin migraciones destructivas. |
| **Autenticación y Seguridad PDF** | Cookies `HttpOnly` JWT (`jose`), `bcryptjs`, rate limiting, validación `%PDF-` + `SHA-256` + `StorageProvider`. | **Bajo** | Implementado y cubierto con pruebas unitarias por servicio en Fase 1 (`auth.test.ts`, `validators.test.ts`, `storage.test.ts`). |
| **Constructor Visual de Lienzo Libre (Fase 2)** | Estado tipado con `Zustand` + validación `Zod` (`canvasSchemaV1`) + eventos Pointer nativos o librería compatible con React 19 para `drag/resize` y guías magnéticas. | **Medio** | **Riesgo:** Algunas librerías antiguas de drag/resize en npm no declaran compatibilidad formal con React 19.<br>**Mitigación:** Implementar un motor ligero propio con Pointer Events HTML5/CSS (`pointerdown/move/up`) + `snap-to-grid`, o verificar compatibilidad React 19 antes de adoptar paquetes externos. |
| **Visor Modal PDF en Web (Fase 3)** | `pdfjs-dist` directo (canvas/viewer controlado) o visor integrado sobre `/api/assets/[id]`. | **Medio** | **Riesgo:** Envoltorios React de terceros pueden tener desfase de *peer dependencies* con React 19 o configuración de *Web Worker* en Next.js 16 Turbopack.<br>**Mitigación:** Usar `pdfjs-dist` encapsulado en un componente cliente aislado con worker servido estáticamente (o `<iframe>` con fallback controlado cuando aplique). |
| **Exportador ATS a PDF (Fase 3)** | Generador PDF vectorial en servidor/cliente (`@react-pdf/renderer` o `pdf-lib` / `pdfkit`). | **Medio** | **Riesgo:** `@react-pdf/renderer` debe verificarse contra React 19; si presenta incompatibilidad de reconciliador, `pdfkit` o `pdf-lib` en Route Handler Node.js generan PDFs vectoriales ATS-friendly sin depender de la versión de React. |
| **Responsividad Móvil** | Lienzo libre en Desktop + apilado vertical configurable por `mobile.order` y `mobile.visible`. | **Bajo** | Evita colisiones de coordenadas en pantallas pequeñas y reduce a la mitad el esfuerzo de implementación y mantenimiento frente a dos lienzos manuales. |

---

## 3. Factibilidad Económica

### 3.1 Costos de Licenciamiento y Herramientas de Desarrollo
Todo el ecosistema tecnológico seleccionado utiliza licencias *Open Source* permisivas (MIT / Apache 2.0 / PostgreSQL License):
- **Framework y UI:** Next.js, React, TypeScript, Tailwind CSS, Lucide Icons — **$0 USD**.
- **Base de datos y ORM:** PostgreSQL 16 (Docker), Prisma ORM — **$0 USD**.
- **Calidad y pruebas:** Vitest, ESLint, Zod — **$0 USD**.
- **Desarrollo local:** Corre íntegramente en el equipo local del propietario sin requerir suscripciones ni servicios externos pagados.

### 3.2 Escenarios Estimados de Operación en Producción
*(Los rangos siguientes son estimaciones referenciales para dimensionar la operación; el costo exacto dependerá del proveedor elegido al momento de desplegar).*

| Escenario | Infraestructura | Costo Estimado | Cuándo Conviene |
| :--- | :--- | :--- | :--- |
| **A. Desarrollo / Auto-hospedado local** | PC del propietario + Docker Compose + `./storage/uploads`. | **$0 / mes** | Construcción completa, pruebas y portafolio personal en red local o túnel controlado. |
| **B. Uso Personal en Producción (VPS Económico)** | 1 VPS Linux básico (Docker con Next.js + PostgreSQL + volumen local) + dominio propio. | **Bajo** *(~costo de 1 VPS básico + dominio anual)* | Control total de archivos PDF en disco, sin límites de almacenamiento por proveedor SaaS ni *cold starts*. |
| **C. Nube Administrada (PaaS + BD + Object Storage)** | Hosting Next.js (ej. Vercel/Railway/Fly) + PostgreSQL administrado + S3 / Cloudflare R2. | **Capa gratuita inicial a costo mensual bajo** | Máxima disponibilidad y CDN global sin administrar sistema operativo ni parches de servidor. |
| **D. Futuro Multi-Usuario (SaaS)** | Escalamiento horizontal de app + PostgreSQL + Storage S3/R2 por demanda. | **Proporcional a usuarios y GB de PDFs** | Si se activa `ALLOW_SIGNUP=true`; la interfaz `StorageProvider` permite migrar de disco local a S3/R2 sin refactorizar lógica de negocio. |

### 3.3 Análisis Costo-Beneficio
- **Ahorro frente a plataformas SaaS de portafolios:** Elimina suscripciones recurrentes por funciones bloqueadas (dominio personalizado, múltiples idiomas, subida de PDFs o exportación sin marcas de agua).
- **Retorno cualitativo y profesional:** Tener un producto propio que además demuestra habilidades de arquitectura, seguridad y diseño interactivo aporta valor directo frente a reclutadores técnicos.
- **Protección de inversión:** Al diseñar `user_id`, `slug` y `StorageProvider` desde la Fase 1, no existe costo oculto de reescritura si el proyecto evoluciona de CV personal a servicio multi-usuario.

---

## 4. Factibilidad Operativa

### 4.1 Adopción y Facilidad de Uso
- **Para el propietario:**
  - La curva de aprendizaje se mantiene baja al separar **qué datos existen** (`/admin`: formularios claros para perfil, experiencia, proyectos, habilidades y certificaciones PDF) de **cómo se ven** (`/studio`: lienzo visual con vista previa y controles `Undo/Redo`).
  - El flujo **Borrador -> Publicado** elimina el miedo a cometer errores en vivo: el CV público permanece intacto mientras se diseñan cambios.
  - En móvil, la reorganización automática por orden evita tener que ajustar coordenadas dos veces cada vez que se agrega un elemento.
- **Para el reclutador / visitante:**
  - Acceso sin registro ni fricciones en `/`.
  - Carga rápida, filtros inmediatos, visor modal integrado de certificados y descarga en un clic de CV ATS en Español o Inglés.

### 4.2 Operación, Mantenimiento y Continuidad

| Aspecto Operativo | Procedimiento Requerido | Complejidad |
| :--- | :--- | :--- |
| **Arranque local** | Iniciar Docker Desktop y ejecutar `docker compose up -d && pnpm dev`. | **Baja** |
| **Respaldo de información (Backup)** | Respaldo periódico de PostgreSQL (`pg_dump`) y respaldo del directorio `./storage/uploads` (donde residen los PDFs). | **Baja** |
| **Actualización de datos del CV** | Directo desde `/admin` vía navegador; no requiere intervención técnica ni despliegues. | **Muy Baja** |
| **Seguridad operacional** | Rotar `AUTH_SECRET` en `.env` de producción, mantener `ALLOW_SIGNUP=false` en modo personal y habilitar HTTPS en el proxy inverso del despliegue. | **Baja** |
| **Monitoreo básico** | Endpoint de salud `/api/health` disponible para checks de disponibilidad en contenedores o balanceadores. | **Baja** |

---

## 5. Matriz de Riesgos Consolidada y Plan de Mitigación

| Riesgo | Categoría | Impacto | Probabilidad | Mitigación Planificada |
| :--- | :--- | :--- | :--- | :--- |
| Incompatibilidad de librerías de terceros con React 19 (lienzo o PDF). | Técnico | Medio | Media | Priorizar implementación nativa ligera para drag/resize y `pdfjs-dist` / `pdfkit` desacoplados si algún wrapper de React falla. |
| Pérdida de PDFs subidos por fallo de disco o eliminación accidental del contenedor. | Operativo | Alto | Baja | Definir volumen persistente externo para `./storage/uploads` y respaldos conjuntos BD + uploads; en producción migrar `StorageProvider` a S3/R2. |
| Uso excesivo de disco o abusos en formulario de contacto público. | Operativo / Económico | Medio | Media | Límite de 10 MB por PDF (`MAX_PDF_SIZE_MB`) solo para propietario autenticado; rate limiting + honeypot ya activos en `/api/contact`. |
| Docker Desktop detenido al intentar desarrollar localmente. | Operativo | Bajo | Media | Documentado en `README.md`; el build y pruebas unitarias ya funcionan desacoplados de la BD activa. |

---

## 6. Conclusión

El proyecto cuenta con **viabilidad sólida en las tres dimensiones** (técnica, económica y operativa). La Fase 1 ya demostró la coherencia del stack en el entorno real del equipo, por lo que el riesgo remanente se concentra únicamente en la selección cuidadosa de las piezas cliente de las Fases 2 y 3 (motor de lienzo libre, visor `PDF.js` y generador ATS PDF), para las cuales ya existen alternativas probadas y desacopladas.
