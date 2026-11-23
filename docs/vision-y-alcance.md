# Documento de Visión y Alcance
## Sistema Web de CV Interactivo con Constructor Visual de Lienzo Libre

**Versión:** 1.0  
**Fecha:** 2026-11-20  
**Estado:** Aprobado  
**Documentos relacionados:** [Especificación de Requisitos (SRS)](./srs/README.md)

---

## 1. Planteamiento del Problema y Oportunidad

### 1.1 Situación Actual y Problema
Quien desea presentar su trayectoria profesional hoy suele enfrentar dos limitaciones opuestas:
1. **CVs estáticos en PDF:** No ofrecen interactividad (filtros por tecnología, línea de tiempo explorable, animaciones, contacto directo) y obligan a adjuntar por separado o enlazar externamente decenas de certificados que caducan, rompen enlaces o dificultan su verificación inmediata.
2. **Constructores web genéricos o portafolios programados a mano:** Los constructores comerciales encierran la información en plantillas rígidas de terceros y cobran por funciones básicas; por otro lado, programar un portafolio estático a mano dificulta actualizar datos rápido, mantener versiones bilingües (`ES`/`EN`) o regenerar un PDF limpio cuando un reclutador lo solicita.

### 1.2 Oportunidad y Solución Propuesta
Construir un **sistema de software propio e integral** compuesto por dos caras conectadas sobre una única base de datos persistente:
- **Página Pública Interactiva:** Un CV web profesional, intuitivo, bilingüe (`ES`/`EN`), adaptable a modo claro/oscuro, con filtros en tiempo real, visor modal integrado para certificaciones en PDF, formulario de contacto y exportación automática a PDF compatible con filtros ATS.
- **Panel Privado y Constructor Visual (CMS + Studio):** Un entorno autenticado donde el propietario gestiona su información profesional, resguarda sus certificados en PDF y diseña su página desde cero sobre un **lienzo libre interactivo conectado a sus datos** (*Data-Driven Freeform Canvas*).

### 1.3 Declaración de Posición del Producto
> **Para** profesionales que desean proyectar una marca personal interactiva y verificable frente a reclutadores y clientes,  
> **el Sistema Web de CV Interactivo** es una **plataforma web full-stack auto-hospedable**  
> **que** permite editar datos profesionales bilingües, custodiar certificaciones reales en PDF y diseñar la página pública desde cero sobre un lienzo visual libre.  
> **A diferencia de** los CVs estáticos en PDF o constructores genéricos cerrados,  
> **nuestro producto** combina libertad creativa de diseño en escritorio, orden inteligente en móviles, visor PDF sin salir de la página, exportación ATS automática y control total sobre los datos con arquitectura lista para escalar a multi-usuario.

---

## 2. Objetivos del Proyecto y Criterios de Éxito

### 2.1 Objetivos del Sistema

| ID | Objetivo | Alineación Técnica / SRS |
| :--- | :--- | :--- |
| **OBJ-01** | **Autonomía total de diseño desde cero:** Permitir componer y reorganizar la página del CV mediante un lienzo visual intuitivo sin editar código fuente tras el despliegue. | `RF-BUILDER-01..06` |
| **OBJ-02** | **Persistencia estructurada y bilingüe:** Guardar de forma confiable perfil, experiencia, educación, proyectos y habilidades en Español e Inglés (`ES`/`EN`). | `RF-DATA-01..05` |
| **OBJ-03** | **Custodia y exhibición integrada de certificaciones PDF:** Almacenar archivos PDF validados y permitir previsualizarlos en un visor modal dentro del mismo CV web. | `RF-CERT-01..05` |
| **OBJ-04** | **Seguridad y control de acceso:** Proteger todo el backoffice, el constructor y la gestión de activos mediante inicio de sesión seguro y aislamiento por propietario. | `RF-AUTH-01..03`, `RNF-SEC-01..05` |
| **OBJ-05** | **Experiencia pública interactiva y compatible con reclutamiento:** Ofrecer filtros dinámicos, tema claro/oscuro, contacto directo y exportación automática del CV a PDF limpio (ATS-friendly). | `RF-PUB-01..04` |
| **OBJ-06** | **Escalabilidad Multi-Tenant sin deuda técnica:** Operar en modo personal en la entrega inicial manteniendo `user_id`, `slug` (`/u/[slug]`) y `StorageProvider` listos para múltiples usuarios futuros. | `RF-AUTH-03`, `RNF-PERF-04`, `RNF-MAINT-02` |

### 2.2 Criterios de Éxito Medibles
- **Agilidad de actualización:** Agregar una nueva experiencia o certificación PDF y reflejarla en la web sin tocar código ni redesplegar.
- **Integridad de archivos:** 100% de los PDFs subidos validados por firma binaria (`%PDF-`), límite de tamaño (10 MB) y hash `SHA-256`.
- **Responsividad garantizada:** Diseño libre en Desktop (`>= 1024px`) y apilado limpio sin desbordamiento horizontal en dispositivos móviles.
- **Seguridad de acceso:** Cero rutas privadas (`/admin/*`, `/studio/*`, `/api/admin/*`) accesibles sin sesión JWT válida.
- **Rendimiento público:** Carga inicial rápida (`FCP < 1.5s`) y descarga de binarios PDF bajo demanda al abrir cada certificado.

---

## 3. Stakeholders (Partes Interesadas)

| Stakeholder | Categoría | Rol / Interés Principal | Necesidades y Expectativas Clave |
| :--- | :--- | :--- | :--- |
| **Propietario / Creador del CV** | Primario (Sponsor y Usuario Admin) | Gestiona su carrera, certificaciones y diseña la página pública. | Editor sencillo e intuitivo, libertad visual desde cero, seguridad de acceso, borradores previos antes de publicar y exportación ATS confiable. |
| **Reclutadores y Hiring Managers** | Primario (Usuario Público) | Evalúan idoneidad técnica, trayectoria y credenciales del candidato. | Lectura rápida, filtros por habilidad/tecnología, verificación directa de certificados PDF sin descargas forzadas, descarga de CV ATS y formulario de contacto simple. |
| **Clientes Potenciales / Pares Técnicos** | Secundario (Usuario Público) | Revisan proyectos, stack y calidad visual del portafolio. | Interfaz atractiva, animaciones fluidas, modo claro/oscuro, cambio de idioma y enlaces directos a demos/repositorios. |
| **Operador / Responsable de Despliegue** | Secundario (Técnico) | Levanta, respalda y mantiene la infraestructura (`Docker`, `PostgreSQL`, `Storage`). | Configuración reproducible por variables de entorno, migraciones limpias, almacenamiento desacoplado de S3/disco local y logs claros. |
| **Sistemas ATS (Applicant Tracking Systems)** | Indirecto (Sistema Externo) | Procesan el CV descargado en formato PDF. | PDF vectorial con texto seleccionable y estructura cronológica estándar independiente de los efectos visuales de la web. |
| **Futuros Usuarios Registrados (SaaS)** | Futuro (Multi-Tenant) | Profesionales externos si se habilita el registro público. | Aislamiento estricto de datos y archivos propios bajo su ruta `/u/[slug]`. |

---

## 4. Alcance del Producto: Qué Entra y Qué No

### 4.1 Qué SÍ Entra en el Alcance (*In-Scope*)

#### Fase 1 — Cimientos, Seguridad, Datos y Certificaciones PDF *(Implementada en código base)*
- Autenticación privada con cookie `HttpOnly` JWT, hashing `bcrypt` y rate limiting.
- Esquema PostgreSQL + Prisma preparado para multi-usuario (`User`, `Profile`, `Experience`, `Education`, `Project`, `Skill`, `Certification`, `FileAsset`, `PageLayout`, `ContactMessage`).
- Panel administrativo (`/admin`) y API REST para gestionar perfil bilingüe, carrera, habilidades y bandeja de mensajes.
- Subida, validación binaria (`%PDF-`), almacenamiento local abstraído (`StorageProvider`) y entrega controlada de PDFs de certificaciones (`/api/assets/[id]`).

#### Fase 2 — Constructor Visual de Lienzo Libre (*Studio*)
- Espacio `/studio` para crear la página pública desde cero combinando elementos libres (`texto`, `imagen`, `tarjeta`, `botón`, `insignia`, `separador`) y widgets conectados a datos reales.
- Manipulación directa en Desktop: arrastrar, posicionar libremente, redimensionar, controlar capas (`zIndex`), guías magnéticas e historial `Undo/Redo`.
- Vista Mobile con apilado vertical automático y configuración de orden/visibilidad por bloque.
- IDE integrado de código (`Diseño` / `Split IDE` / `</> Código`), subida de código fuente (`.html`/`.css`) con motor seguro de variables (`{{cv.*}}`, `{{#each ...}}`) y subida de tipografías personalizadas (`.woff2`/`.ttf`/`.otf`).
- Configuración global de tema (`Claro`/`Oscuro`), tipografías y flujo `Borrador -> Publicado` con historial de versiones.

#### Fase 3 — Página Pública Interactiva, Visor PDF y Exportación ATS
- Renderizado público fiel del diseño publicado en `/` (y preparado en `/u/[slug]`) con SEO/OpenGraph dinámico.
- Conmutador `Claro/Oscuro`, selector instantáneo `ES/EN`, animaciones de scroll, filtros en tiempo real y línea de tiempo interactiva.
- Visor modal PDF integrado con `PDF.js` (paginación, zoom, metadatos y control por certificado de si se permite descarga).
- Generación y descarga automática de CV completo en PDF compatible con ATS en el idioma activo.
- Formulario público de contacto con protección anti-spam (*honeypot* + rate limit).

#### Fase 4 — Verificación E2E, Hardening y Preparación Multi-Usuario
- Pruebas End-to-End (Playwright) sobre flujos críticos y empaquetado listo para despliegue en contenedor.
- Validación de aislamiento multi-perfil para habilitar `/u/[slug]` cuando se decida escalar.

---

### 4.2 Qué NO Entra en el Alcance (*Out-of-Scope*)

#### Exclusiones Temporales (Fuera de las Fases 1–4, evaluables como evolución futura)
- **Registro abierto de terceros, pasarela de pagos y planes SaaS:** En esta versión el registro público permanece cerrado (`ALLOW_SIGNUP=false`) para uso personal.
- **Recuperación automática de contraseña por SMTP / OAuth social:** La gestión inicial es de propietario único con credenciales configuradas y cambio autenticado.
- **Integración nativa con proveedores nube específicos (S3/R2/Cloudinary) o envío de correos salientes:** El código deja la abstracción `StorageProvider` lista, pero la configuración activa usa almacenamiento local y bandeja interna en base de datos.
- **Analítica avanzada propia de visitantes:** No se construirá un módulo de métricas tipo Google Analytics (mapas de calor, geografía, embudos).

#### Exclusiones Permanentes (No forman parte de la visión del sistema)
- **Suite de diseño gráfico vectorial complejo:** No sustituye a Photoshop/Illustrator (no incluye edición de fotos, pinceles, curvas Bézier ni efectos 3D avanzados).
- **Posicionamiento libre manual pixel-a-pixel separado para pantallas móviles:** Se descarta mantener dos lienzos libres independientes; la vista móvil usa reorganización vertical inteligente configurable por orden para garantizar legibilidad.
- **Extracción automática de texto por OCR/IA desde los PDFs de certificaciones:** Los metadatos (emisor, fecha, categoría, ID) se registran de forma estructurada para asegurar precisión total.
- **Colaboración multi-editor en tiempo real** (cursores simultáneos estilo Figma/Google Docs).
- **Red social de empleo o portal de vacantes entre empresas y candidatos.**

---

## 5. Restricciones, Supuestos y Dependencias

### 5.1 Restricciones
- **Stack definido:** Next.js (App Router) + React + TypeScript + Tailwind CSS + PostgreSQL + Prisma ORM + Docker Compose.
- **Límite binario inicial:** Archivos PDF de certificaciones limitados por configuración a `10 MB` por documento (`MAX_PDF_SIZE_MB`).
- **Seguridad documental:** Ningún binario subido se expone directamente en la carpeta `public/`; todo acceso pasa por endpoints controlados.

### 5.2 Supuestos
- El entorno de ejecución cuenta con Node.js (`>= 22`), `pnpm` y Docker Desktop (o instancia PostgreSQL 16 accesible por `DATABASE_URL`).
- El propietario proveerá archivos PDF legítimos y capturas válidas para sus certificaciones y proyectos.
- Los visitantes utilizan navegadores web modernos con soporte estándar para CSS moderno y JavaScript ES2022+.

### 5.3 Dependencias
- Disponibilidad del servicio PostgreSQL 16 (vía Docker Compose en local o servicio administrado en despliegue).
- Incorporación en Fase 2 y Fase 3 de las librerías de manipulación de lienzo, animaciones (`Framer Motion`) y renderizado/generación PDF (`react-pdf` / `@react-pdf/renderer`).
