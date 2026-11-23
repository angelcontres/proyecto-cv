# Especificación de Requisitos de Software (SRS)
## Sistema Web de CV Interactivo con Constructor Visual de Lienzo Libre

**Versión:** 1.1 (Aprobada)  
**Fecha:** 2026-11-20  
**Alcance inicial:** Uso personal (Single-Tenant) con arquitectura preparada para escalar a Multi-Usuario (Multi-Tenant Ready)

---

## Índice del SRS

0. [Documento de Visión y Alcance](../vision-y-alcance.md)
0b. [Estudio de Factibilidad (Técnica, Económica y Operativa)](../estudio-factibilidad.md)
0c. [Matriz de Trazabilidad de Requisitos (RTM)](../matriz-trazabilidad.md)
0d. [Prototipo y Wireframes del Sistema](../prototipo-wireframes.md)
0e. [Documento de Arquitectura de Software (SAD)](../sad/README.md)
0f. [Registro de Decisiones Arquitectónicas (ADRs)](../adr/README.md)
0g. [Documento de Diseño Detallado (SDD — UML)](../sdd/README.md)
0h. [Modelo de Datos (Diagrama ER y Diccionario de Datos)](../modelo-datos/README.md)
0i. [Diseño de APIs y Contrato OpenAPI](../api/README.md)
0j. [Diseño UI/UX (Wireframes, Mockups y Guía de Estilo)](../ui-ux/README.md)
1. [01 - Requisitos Funcionales](./01-requisitos-funcionales.md)
2. [02 - Requisitos No Funcionales](./02-requisitos-no-funcionales.md)
3. [03 - Historias de Usuario y Casos de Uso](./03-historias-usuario-y-casos-de-uso.md)
4. [04 - Modelo de Datos y Arquitectura Técnica](./04-modelo-datos-y-arquitectura.md)

---

## 1. Visión General y Propósito

El objetivo del sistema es sustituir el paradigma estático de "subir un PDF tradicional de CV" por una **plataforma web completa** compuesta por:

1. **Página Pública del CV (Portafolio Interactivo):** Una web profesional, altamente interactiva, animada, bilingüe (`ES`/`EN`), con tema claro/oscuro, filtros dinámicos, visor integrado de certificaciones en PDF, formulario de contacto y exportación automática del CV a PDF.
2. **Frontend de Administración y Constructor Visual (Studio / CMS):** Un panel protegido con inicio de sesión que permite administrar toda la información profesional, subir y catalogar certificaciones PDF, y construir visualmente la página pública desde cero sobre un **lienzo libre interactivo**.

---

## 2. Solución al Desafío Central: "Data-Driven Freeform Canvas"

El sistema resuelve la tensión entre la **libertad visual de un lienzo libre tipo Canva/Figma** y la **interactividad basada en datos estructurados** mediante una arquitectura en dos capas sincronizadas:

- **Capa 1 — Repositorio Estructurado de Carrera:** Almacena de forma normalizada y bilingüe (`ES`/`EN`) el perfil profesional, experiencia laboral, educación, proyectos, habilidades y certificaciones con sus archivos PDF asociados.
- **Capa 2 — Lienzo Visual Interactivo:** Permite posicionar libremente en vista Desktop (`x, y, w, h, zIndex`) tanto **elementos libres** (textos enriquecidos, imágenes, tarjetas, botones, insignias, divisores) como **widgets conectados a la Capa 1** (Línea de Tiempo, Grid de Proyectos, Matriz de Skills, Galería de Certificaciones con Visor PDF, Formulario de Contacto y Barra de Utilidades).

Esta separación garantiza que:
- El diseño web sea 100% personalizable desde cero en Desktop y se reorganice de forma inteligente y configurable por orden en Móvil.
- Los filtros, traducciones `ES`/`EN`, visor de PDFs y generación automática de un CV PDF limpio (compatible con filtros ATS) funcionen siempre con datos consistentes.

---

## 3. Actores del Sistema

| Actor | Tipo | Responsabilidades Principales |
| :--- | :--- | :--- |
| **Propietario / Administrador** | Autenticado | Inicia sesión, gestiona sus datos profesionales y traducciones, sube y administra PDFs de certificaciones, diseña su página en el constructor visual, gestiona borradores/publicaciones y revisa mensajes de contacto. |
| **Visitante / Reclutador** | Público (Anónimo) | Navega el CV publicado, alterna idioma (`ES`/`EN`) y tema (`Claro`/`Oscuro`), filtra proyectos/habilidades/certificaciones, previsualiza PDFs en modal, descarga el CV ATS en PDF y envía mensajes de contacto. |
| **Usuario Registrado (Fase Futura)** | Autenticado (Multi-Tenant) | Gestiona su propio perfil aislado bajo su `user_id` y publica su CV en `/u/[slug]`. |

---

## 4. Decisiones de Diseño Confirmadas

| Decisión | Resolución Aprobada |
| :--- | :--- |
| **Alcance de Usuarios** | Uso personal inmediato (`ALLOW_SIGNUP=false`) con esquema de base de datos e IDs preparados (`user_id`, `slug`) para habilitar multi-usuario futuro sin refactorizar el modelo. |
| **Comportamiento del Lienzo en Móvil** | Lienzo libre total en Desktop (`x, y, w, h, zIndex`) + reorganización inteligente automática en Móvil (apilado vertical responsivo con orden y visibilidad configurables desde el editor). |
| **Exportación CV en PDF** | El botón **"Descargar CV en PDF"** genera automáticamente un documento limpio, bien paginado y compatible con sistemas ATS a partir de los datos estructurados en el idioma activo (`ES`/`EN`). |
| **Base de Datos y Almacenamiento** | **PostgreSQL + Docker Compose + Prisma ORM**, con almacenamiento local de PDFs tras una interfaz `StorageProvider` lista para migrar a S3/R2 en producción. |

---

## 5. Roadmap por Fases

1. **Fase 1 — Base del Sistema, Seguridad, Datos del CV y Certificaciones PDF:** Configuración Next.js + TypeScript + PostgreSQL/Docker + Prisma, autenticación segura, CRUD de datos profesionales bilingües y subida/validación segura de PDFs.
2. **Fase 2 — Constructor Visual de Lienzo Libre (Studio):** Editor interactivo desde cero con `drag & drop`, redimensionamiento, capas, guías magnéticas, `Undo/Redo`, vista Desktop/Mobile, temas y flujo `Draft / Published`.
3. **Fase 3 — Página Pública Interactiva, Visor Modal PDF y Exportación ATS:** Renderizado público animado, filtros en vivo, visor modal PDF.js para certificados, exportador automático de CV en PDF y formulario de contacto con bandeja privada.
4. **Fase 4 — Pruebas E2E, Hardening y Preparación Multi-Usuario:** Cobertura automatizada con Playwright/Vitest, optimización de rendimiento y activación opcional del enrutamiento `/u/[slug]`.
