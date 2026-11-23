# 02 - Wireframes Detallados (Desktop y Mobile)

Planos estructurales de todas las vistas del sistema, integrando las mejoras definidas tras la validación del prototipo (`Control Center Left Rail`, `Studio IDE Split` con `{{cv.*}}` y carga de fuentes, flujo 3 pasos en Bóveda PDF y formato ATS-friendly).

---

## W-01: Página Pública Interactiva (`/` y `/u/[slug]`)

*Trazabilidad:* `RF-PUB-01..04`, `RF-CERT-03..05`, `HU-04`, `HU-08`, `HU-09`, `HU-10`, `ADR-002`, `ADR-010`

### W-01A Desktop (`1440px` — Top Navigation + Spine Lateral)
```text
+---------------------------------------------------------------------------------+
| [●] ALEX RIVERA         TRAYECTORIA  PROYECTOS  CERTIFICADOS  CONTACTO |ES|EN|T|ATS|
+---------------------------------------------------------------------------------+
|   Atmósfera: (●)Obsidian  ( )Void  ( )Cobalt  ( )Indigo     [Studio] [Export ATS]|
|---------------------------------------------------------------------------------|
|   +-----------------------------------------------------------------------+  ●  |
|   | 00 // DOSSIER                            [● DISPONIBLE PARA RETOS]    |  |  |
|   | Alex Rivera                                                           |  ○  |
|   | Arquitecto Full-Stack & Sistemas Distribuidos (Fraunces Italic)       |  |  |
|   | --------------------------------------------------------------------- |  ○  |
|   | EXP: 6+ AÑOS | PROYECTOS: 14 | BÓVEDA PDF: 4 CERTS | REMOTO / UTC-5   |  |  |
|   +-----------------------------------------------------------------------+  ○  |
|                                                                              |  |
|   +--------------------------------------+  +-----------------------------+  ○  |
|   | 01 // TRAYECTORIA (Exp & Educación)  |  | 02 // STACK TÉCNICO         | (S) |
|   | ● 2024-Act Staff Eng · Obsidian  [v] |  | [Todos][Backend][Cloud]     | (p) |
|   |   - Reducción p95 en 42%...          |  | TypeScript / Next.js  [95%] | (i) |
|   | ● 2021-2024 Senior Dev · FinCore [>] |  | PostgreSQL / Prisma   [90%] | (n) |
|   +--------------------------------------+  +-----------------------------+ (e) |
|                                                                                 |
|   +-----------------------------------------------------------------------+     |
|   | 03 // PORTAFOLIO  Filtrar: [Todos] [Next.js] [PostgreSQL] [Docker]    |     |
|   | [Card Proyecto 1 (Demo/Repo)]  [Card Proyecto 2]  [Card Proyecto 3]   |     |
|   +-----------------------------------------------------------------------+     |
|                                                                                 |
|   +-----------------------------------------------------------------------+     |
|   | 04 // BÓVEDA CERTIFICACIONES PDF   [Todas][Cloud][Sec]  [Buscar...]   |     |
|   | [AWS Solutions Architect · 2026 | VER PDF | VERIFICAR] [CKA · VER PDF]|     |
|   +-----------------------------------------------------------------------+     |
|                                                                                 |
|   +-----------------------------------------------------------------------+     |
|   | 05 // CONTACTO DIRECTO (Rate Limit + Honeypot oculto)                 |     |
|   | [Nombre] [Correo] [Empresa] [Asunto] [Mensaje...]    [Enviar Mensaje] |     |
|   +-----------------------------------------------------------------------+     |
+---------------------------------------------------------------------------------+
```

### W-01B Mobile (`390px` — Apilado Configurable `mobile.order` / `mobile.visible`)
```text
+-----------------------------------+
| [●] ALEX RIVERA      [ES|EN] [ATS]|
+-----------------------------------+
| +-------------------------------+ |
| | 00 // MOBILE ORDER: 1         | |
| | Alex Rivera                   | |
| | Arquitecto Full-Stack         | |
| | [● Disponible para retos]     | |
| +-------------------------------+ |
| +-------------------------------+ |
| | 01 // MOBILE ORDER: 2         | |
| | Staff Engineer · Obsidian     | |
| | 2024 - ACT                    | |
| +-------------------------------+ |
| +-------------------------------+ |
| | 02 // MOBILE ORDER: 3         | |
| | Skills [Todos][Backend]       | |
| +-------------------------------+ |
| +-------------------------------+ |
| | 03 // BÓVEDA PDF              | |
| | AWS Architect [Abrir VisorPDF]| |
| +-------------------------------+ |
| [        CONTACTO DIRECTO       ] |
+-----------------------------------+
```

---

## W-02: Acceso Privado (`/login`)

*Trazabilidad:* `RF-AUTH-01`, `RF-AUTH-02`, `HU-01`, `ADR-005`

```text
+-----------------------------------------------------------------------+
|                                                                       |
|                +-----------------------------------+                  |
|                |  00 // AUTENTICACIÓN              |                  |
|                |  Acceso Privado                   |                  |
|                |  Sesión HttpOnly JWT · Rate Limit |                  |
|                |                                   |                  |
|                |  Correo electrónico               |                  |
|                |  [ admin@proyecto-cv.local      ] |                  |
|                |  Contraseña                       |                  |
|                |  [ •••••••••••••                ] |                  |
|                |  [! Error 401/429 si aplica     ] |                  |
|                |  [       Entrar al Panel        ] |                  |
|                |  -------------------------------- |                  |
|                |  <- Volver a página pública (/)   |                  |
|                +-----------------------------------+                  |
|                                                                       |
+-----------------------------------------------------------------------+
```

---

## W-03: Control Center CMS (`/admin/*`) — Left Rail Agrupado + Flujo 3 Pasos PDF

*Trazabilidad:* `RF-DATA-01..05`, `RF-CERT-01..03`, `HU-02`, `HU-03`, `ADR-010`

```text
+-------------------+-------------------------------------------------------------+
| CONTROL CENTER    | Control Center / 03 Bóveda PDF  | [● Publicado v2] [Studio] |
| Alex Rivera       |-------------------------------------------------------------|
| mi-cv · 1-Tenant  | SUBIDA SEGURA EN 3 PASOS (%PDF- + SHA-256)                  |
|                   | +-----------------+ +------------------+ +----------------+ |
| GENERAL           | | PASO 01 ARCHIVO | | PASO 02 METADATO | | PASO 03 DESTINO| |
| [ ] 00 Resumen    | | Arrastra PDF    | | Título ES / EN   | | [x] Visible CV | |
|                   | | < 10 MB         | | Emisor · Cat.    | | [x] Descarga   | |
| CONTENIDO DEL CV  | | ✓ %PDF- válido  | | Credential ID    | | [GUARDAR CERT] | |
| [ ] 01 Identidad  | +-----------------+ +------------------+ +----------------+ |
| [ ] 02 Carrera    |-------------------------------------------------------------|
|                   | ARCHIVOS EN BÓVEDA (GET /api/admin/certifications)          |
| BÓVEDA & MENSAJES | +---------------------------------------------------------+ |
| [x] 03 Bóveda PDF | | [PDF] AWS Solutions Architect · SHA256: 9f4c...a812     | |
| [ ] 04 Bandeja  1 | |       [📌 Colocar en Studio] [Previsualizar] [Editar]   | |
|                   | +---------------------------------------------------------+ |
| SISTEMA           |                                                             |
| [ ] 05 Acceso     | EN BÓVEDA MENSAJES (/admin/messages - Split View):         |
|                   | +--------------------+------------------------------------+ |
| [Abrir Studio ->] | | [●] Reclutador A   | Asunto: Entrevista Staff Engineer  | |
| [Ver Público]     | | [ ] Reclutador B   | De: hr@empresa.com · [Marcar leído]| |
+-------------------+--------------------+------------------------------------+---+
```

---

## W-04: Constructor Visual Studio IDE (`/studio`) — 4 Zonas + *Split IDE* + Fuentes

*Trazabilidad:* `RF-BUILDER-01..09`, `HU-05`, `HU-06`, `HU-07`, `ADR-002`, `ADR-007`

### W-04A Desktop (`Diseño | Split IDE | </> Código`)
```text
+----------------------------------------------------------------------------------+
| mi-cv / [● DRAFT v1] | [Diseño|Split IDE|</>] [Desktop|Mob] [75%|100%] [⊞8px] | [Publicar]|
+-------------------+---------------------------------------------+----------------+
| [+Insertar|≡Capas]| [HUD Nodo: Duplicar | ↑Frente | 🔒 | 🗑]    | [Diseño|Cont.|Tema]|
| [Buscar bloque]   | 0    160   320   480   640   800   960px    |                |
|                   | +-----------------------------------------+ | X:[24] Y:[224] |
| Primitivos        | | widget_hero (X:24 Y:16 W:912 H:140)     | | W:[912] H:[200]|
| [</> Código][Aa]  | +-----------------------------------------+ | zIndex: [2]    |
| [□ Card][↗ Botón] | | [SELECTED] custom_code (SHADOW DOM)     | | Radio: [2px]   |
|                   | | Certs: 04 ({{cv.stats.certsCount}})     | | Padding: [24]  |
| Widgets Datos     | +-----------------------------------------+ | Anim: [fade-up]|
| [00 widget_hero]  |---------------------------------------------|                |
| [01 timeline]     | [<> component.html][# styles.css][{ } json] | [↑ Subir       |
| [02 projects]     | [↑ Subir .html/.css] [Shadow DOM Activo]    |  .html/.css]   |
| [03 certs]        | Variables CV: [fullName] [certsCount] [#each]|                |
| [04 spotlight]    | 01 | <div class="kpi-grid">                 | Apilado Móvil: |
|                   | 02 |   <h4>{{cv.stats.certificationsCount}} | [x] visible    |
| Fuente Custom     | 03 | </div>                                 | Orden: [3]     |
| [↑ .woff2/.ttf]   |                                             |                |
+-------------------+---------------------------------------------+----------------+
| Artboard: 960x920px · Nodos: 6 · Sel: custom_code | Ctrl+Z Deshacer · Flechas 8px |
+----------------------------------------------------------------------------------+
```

### W-04B Studio Vista Mobile (`390px` — Reordenamiento de Apilado)
```text
+-------------------------------------------------------------------------------+
| Studio / Vista Mobile (390px) · Reordenamiento de Apilado                     |
+-----------------------------+-------------------------------------------------+
| CAPAS EN MÓVIL (mobile)     |       ARTBOARD MÓVIL (390px)                    |
| [↑][↓] 1. widget_hero   [x] |       +-------------------------------+         |
| [↑][↓] 2. timeline      [x] |       | Hero Profesional (1 columna)  |         |
| [↑][↓] 3. custom_code   [x] |       +-------------------------------+         |
| [↑][↓] 4. skills        [x] |       | Línea de Tiempo               |         |
| [↑][↓] 5. cert_vault    [x] |       +-------------------------------+         |
| [↑][↓] 6. banner_deco   [ ] |       | custom_code (Shadow DOM)      |         |
| (Oculto solo en móvil)      |       +-------------------------------+         |
+-----------------------------+-------------------------------------------------+
```

---

## W-05: Modales Superpuestos y Documento Exportado ATS

*Trazabilidad:* `RF-CERT-04`, `RF-EXPORT-01..03`, `ADR-006`, `ADR-009`

```text
+-----------------------------------+     +-----------------------------------+
| VISOR MODAL PDF (/api/assets/id)  |     | HOJA PDF ATS-FRIENDLY (FASE 3)    |
| AWS Certified Architect       [X] |     | ALEX RIVERA                       |
|-----------------------------------|     | Full-Stack Software Architect     |
| [< Pág 1/1 >] [- 100% +] [Descarg]|     |-----------------------------------|
|-----------------------------------|     | EXPERIENCIA PROFESIONAL           |
| +-------------------------------+ |     | Staff Engineer - Obsidian (2024-) |
| |   Render vectorial PDF.js     | |     | • Reducción de latencia p95 42%   |
| |   inline · nosniff            | |     | HABILIDADES TÉCNICAS              |
| |   Sin exponer ruta de disco   | |     | TypeScript, Next.js, PostgreSQL   |
| +-------------------------------+ |     | EDUCACIÓN Y CERTIFICACIONES       |
+-----------------------------------+     +-----------------------------------+
```
