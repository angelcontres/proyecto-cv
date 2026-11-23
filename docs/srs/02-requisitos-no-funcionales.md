# 02 - Requisitos No Funcionales (RNF)

---

## 1. Seguridad (`RNF-SEC`)

| ID | Requisito | Criterio Verificable |
| :--- | :--- | :--- |
| **RNF-SEC-01** | Protección de credenciales y sesiones | Las contraseñas se almacenan con hash `bcrypt` (>= 12 rounds) o `Argon2id`. Las sesiones usan cookies `HttpOnly`, `SameSite=Lax` y secret criptográfico de >= 32 bytes (`AUTH_SECRET`). |
| **RNF-SEC-02** | Validación estricta de cargas binarias (PDFs, imágenes, fuentes y código) | Toda subida valida extensión, tamaño máximo, MIME type real mediante inspección de *magic bytes* (`%PDF-`, cabeceras PNG/JPEG/WEBP, firmas `wOF2`/`OTTO`/TTF para fuentes) y asigna rutas internas por UUID sin usar nombres de usuario en el filesystem. |
| **RNF-SEC-03** | Prevención de XSS e inyección en código y plantillas | El motor de variables `{{cv.*}}` opera sin `eval`/`new Function` aplicando escape HTML automático en toda interpolación; los bloques `custom_code` (escritos o subidos en `.html`/`.css`) sanitizan `<script>`, manejadores inline `on*=` y URLs `javascript:`, aislando su DOM/CSS en Shadow DOM o sandbox controlado sin `allow-same-origin`. Todas las entradas de API y el `canvas_schema` se validan estrictamente con `Zod` y `Prisma ORM`. |
| **RNF-SEC-04** | Control de acceso en archivos servidos | Los archivos almacenados viven fuera de `public/` y se entregan mediante endpoints controlados (`/api/assets/[id]`) con cabecera `X-Content-Type-Options: nosniff` y validación de visibilidad/autorización. |
| **RNF-SEC-05** | Protección CSRF y Rate Limiting | Acciones de mutación autenticadas verifican origen/sesión; los endpoints `/api/auth/login` y `/api/contact` aplican limitación de frecuencia por IP. |

---

## 2. Rendimiento y Escalabilidad (`RNF-PERF`)

| ID | Requisito | Criterio Verificable |
| :--- | :--- | :--- |
| **RNF-PERF-01** | Tiempo de carga inicial del CV público | La página pública publicada renderizada desde servidor (SSR/RSC) alcanza First Contentful Paint `< 1.5s` en condiciones normales de red. |
| **RNF-PERF-02** | Fluidez del Constructor Visual | Las operaciones de arrastrar y redimensionar elementos en el lienzo se mantienen a `~60 fps` usando estado local optimista en memoria (`Zustand`) y persistencia asíncrona con `debounce` (`800ms`). |
| **RNF-PERF-03** | Carga eficiente de certificaciones | El listado de certificaciones solo descarga metadatos livianos inicialmente; el binario PDF se descarga bajo demanda únicamente cuando el visitante abre el visor modal. |
| **RNF-PERF-04** | Preparación Multi-Tenant sin deuda de esquema | Índices compuestos en `user_id`, `profile_id` y `slug` desde la migración inicial en PostgreSQL. |

---

## 3. Usabilidad y Accesibilidad (`RNF-UX`)

| ID | Requisito | Criterio Verificable |
| :--- | :--- | :--- |
| **RNF-UX-01** | Productividad en el editor | El Studio soporta atajos de teclado estándar (`Ctrl+Z` deshacer, `Ctrl+Y`/`Ctrl+Shift+Z` rehacer, `Ctrl+S` guardar borrador, `Delete` eliminar nodo seleccionado, flechas para mover `1px`/`10px` con `Shift`). |
| **RNF-UX-02** | Feedback inmediato al usuario | Todas las operaciones asíncronas (subida de PDF, guardado, publicación, envío de contacto) muestran estados claros de carga, éxito o error legible en español. |
| **RNF-UX-03** | Accesibilidad básica (WCAG AA) | Contraste adecuado tanto en tema claro como oscuro; cierre con `Escape` y foco atrapado en modales (especialmente en el visor PDF); respeto automático de `prefers-reduced-motion`. |

---

## 4. Compatibilidad y Diseño Adaptable (`RNF-COMP`)

| ID | Requisito | Criterio Verificable |
| :--- | :--- | :--- |
| **RNF-COMP-01** | Navegadores modernos | Soporte completo en versiones actuales de Chrome, Edge, Firefox y Safari (Desktop y Mobile). |
| **RNF-COMP-02** | Diseño adaptable garantizado | En Desktop (`>= 1024px`) se respeta la composición libre del lienzo; en Tablet/Mobile (`< 1024px`) se activa la vista apilada responsiva según el orden configurado sin desbordamiento horizontal (`overflow-x`). |

---

## 5. Mantenibilidad, Portabilidad y Calidad (`RNF-MAINT`)

| ID | Requisito | Criterio Verificable |
| :--- | :--- | :--- |
| **RNF-MAINT-01** | Tipado estricto y validado | `TypeScript` en modo `strict: true` sin errores en compilación (`tsc --noEmit`) y validación compartida con `Zod`. |
| **RNF-MAINT-02** | Desacoplamiento de almacenamiento | La persistencia binaria implementa una interfaz `StorageProvider` (`put`, `getStream`, `delete`) con implementación local lista para sustituirse por S3/R2 mediante configuración. |
| **RNF-MAINT-03** | Portabilidad de entorno | Infraestructura local encapsulada en `docker-compose.yml` + variables documentadas en `.env.example`, ejecutable de forma reproducible en Windows/Linux/macOS. |
| **RNF-MAINT-04** | Pruebas automatizadas | Suite de pruebas unitarias e integración (`Vitest`) para lógica crítica (autenticación, validación de PDFs, esquemas de lienzo, resolución i18n, almacenamiento) y pruebas E2E (`Playwright`) en Fase 4. |
