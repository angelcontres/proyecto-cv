# 03 - Historias de Usuario y Casos de Uso

---

## 1. Historias de Usuario Priorizadas

### Épica 1: Acceso Seguro y Administración Base

- **HU-01 — Inicio de sesión protegido**
  - **Como** propietario del CV
  - **Quiero** iniciar sesión con mi correo y contraseña en una pantalla privada
  - **Para** ser el único autorizado para modificar mis datos, certificaciones y el diseño de mi página.
  - *Escenario Gherkin:*
    - **Dado** que no tengo una sesión activa
    - **Cuando** navego a `/admin` o `/studio`
    - **Entonces** el sistema me redirige a `/login` y solo me permite entrar tras validar mis credenciales.

- **HU-02 — Edición estructurada de mi carrera en Español e Inglés**
  - **Como** propietario del CV
  - **Quiero** gestionar mi perfil, experiencia, educación, proyectos y habilidades en español e inglés
  - **Para** que mi información quede persistida de forma confiable y alimente tanto la web como el PDF exportable.

### Épica 2: Gestión Documental de Certificaciones PDF

- **HU-03 — Subir y catalogar certificados en PDF**
  - **Como** propietario del CV
  - **Quiero** subir los archivos PDF de mis certificaciones junto con su entidad emisora, fecha, ID de credencial, categoría y enlace de verificación
  - **Para** conservarlos organizados en mi sistema y mostrarlos profesionalmente en mi CV web.
  - *Escenario Gherkin:*
    - **Dado** que estoy autenticado en `/admin/certifications`
    - **Cuando** subo un archivo válido `.pdf` menor a 10 MB con título y emisor
    - **Entonces** el sistema valida la firma binaria del PDF, lo guarda en el almacenamiento configurado y lo registra en base de datos.

- **HU-04 — Visualizar certificaciones sin salir de la página**
  - **Como** reclutador que visita el CV
  - **Quiero** hacer clic en una certificación y ver el documento PDF dentro de un visor modal interactivo
  - **Para** verificar los logros del candidato sin interrumpir mi navegación ni descargar archivos innecesarios.

### Épica 3: Constructor Visual de Lienzo Libre

- **HU-05 — Diseñar la página desde cero sobre un lienzo interactivo**
  - **Como** propietario del CV
  - **Quiero** empezar con un lienzo limpio, arrastrar elementos libres (textos, imágenes, tarjetas) y widgets conectados a mis datos, redimensionarlos y ordenar sus capas
  - **Para** construir una página web única e intuitiva con total libertad visual.

- **HU-06 — Previsualizar y ajustar el orden en Móvil sin dañar el diseño Desktop**
  - **Como** propietario del CV
  - **Quiero** cambiar a vista Mobile en el editor y reordenar o ocultar bloques para teléfono
  - **Para** que mi página luzca limpia en celulares mientras conserva mi composición libre en computadoras.

- **HU-07 — Trabajar en borrador y publicar versiones**
  - **Como** propietario del CV
  - **Quiero** guardar mis cambios en borrador mientras experimento y publicarlos solo cuando esté listo
  - **Para** evitar que los reclutadores vean una página a medio construir.

- **HU-11 — Subir código fuente HTML/CSS con variables conectadas a mis datos**
  - **Como** propietario con perfil técnico
  - **Quiero** subir mis propios archivos `.html` y `.css` (o editarlos en el IDE integrado) usando variables como `{{cv.profile.fullName}}` o `{{#each cv.projects}}`
  - **Para** que mi código personalizado se renderice en vivo usando automáticamente la información real de mi base de datos y mi idioma activo.

- **HU-12 — Subir fuentes tipográficas personalizadas**
  - **Como** propietario del CV
  - **Quiero** subir archivos de fuente `.woff2`, `.ttf` u `.otf` desde el panel de tema
  - **Para** darle a mi página de CV una identidad visual verdaderamente única.

### Épica 4: Interactividad Pública, Exportación y Contacto

- **HU-08 — Filtrar proyectos, habilidades y certificaciones**
  - **Como** reclutador
  - **Quiero** filtrar por tecnología o categoría, alternar idioma (`ES`/`EN`) y cambiar entre tema claro/oscuro
  - **Para** encontrar rápidamente si el perfil coincide con la vacante que busco.

- **HU-09 — Descargar el CV en PDF actualizado**
  - **Como** reclutador
  - **Quiero** presionar un botón para descargar el CV completo en PDF en el idioma actual
  - **Para** adjuntarlo fácilmente al sistema de seguimiento de candidatos (ATS) o compartirlo internamente.

- **HU-10 — Contactar directamente desde la página**
  - **Como** reclutador
  - **Quiero** enviar un mensaje desde el formulario de contacto del CV
  - **Para** iniciar un proceso de entrevista sin salir de la plataforma.

---

## 2. Casos de Uso Principales

### CU-01: Subida, Validación y Servicio Seguro de Certificado PDF

| Campo | Detalle |
| :--- | :--- |
| **Actor Principal** | Propietario (Autenticado) |
| **Precondiciones** | Sesión activa válida. |
| **Flujo Principal** | 1. El usuario abre el formulario de nueva certificación.<br>2. Adjunta archivo PDF y completa metadatos (`título ES/EN`, `emisor`, `fecha`, `categoría`, `allowDownload`).<br>3. El backend verifica sesión y tamaño (`<= 10 MB`).<br>4. El validador inspecciona *magic bytes* (`%PDF-`) y calcula `SHA-256`.<br>5. `StorageProvider` almacena el binario bajo clave UUID.<br>6. Prisma crea registros en `FileAsset` y `Certification` dentro de una transacción.<br>7. La UI muestra la tarjeta recién agregada con botón de vista previa. |
| **Flujos Alternos** | - **A1:** Archivo no es PDF real -> Retorna HTTP `400` con mensaje claro; no se escribe en disco ni en BD.<br>- **A2:** Fallo en transacción BD tras guardar archivo -> Se elimina el archivo recién subido para no dejar huérfanos. |

### CU-02: Edición en Lienzo Libre y Publicación (`Draft` -> `Published`)

| Campo | Detalle |
| :--- | :--- |
| **Actor Principal** | Propietario (Autenticado) |
| **Precondiciones** | Existencia de un perfil y borrador inicial (o lienzo vacío). |
| **Flujo Principal** | 1. El usuario abre `/studio`.<br>2. Selecciona elementos libres o widgets de datos desde la paleta izquierda.<br>3. Posiciona, redimensiona y estiliza nodos en Desktop; cambia a pestaña Mobile para ajustar el orden vertical.<br>4. El estado se guarda automáticamente en `PageLayout` con `status = DRAFT`.<br>5. El usuario revisa la vista previa privada.<br>6. Al pulsar **Publicar**, el servidor valida el `canvas_schema` con `Zod`, incrementa el número de versión y marca el nuevo snapshot como `PUBLISHED` (archivando el anterior como `ARCHIVED`). |
| **Flujos Alternos** | - **A1:** El usuario pulsa `Ctrl+Z` -> `Zustand` revierte el último cambio en memoria.<br>- **A2:** El usuario desea volver a una versión anterior -> Selecciona un snapshot archivado del historial y lo promueve a `DRAFT` o `PUBLISHED`. |

### CU-03: Consulta Pública, Visor Modal PDF y Exportación ATS

| Campo | Detalle |
| :--- | :--- |
| **Actor Principal** | Visitante / Reclutador |
| **Precondiciones** | Existe una versión `PUBLISHED` del perfil principal. |
| **Flujo Principal** | 1. El visitante accede a `/`.<br>2. El servidor carga el perfil, datos visibles y el layout `PUBLISHED`.<br>3. El visitante cambia idioma a `EN` y activa tema oscuro.<br>4. Filtra certificaciones por categoría y pulsa una tarjeta.<br>5. Se abre el modal PDF.js que solicita `/api/assets/[assetId]` y renderiza el certificado.<br>6. Pulsa **"Descargar CV en PDF"**; el endpoint genera el PDF ATS-friendly en inglés con los datos visibles vigentes. |
| **Flujos Alternos** | - **A1:** El dueño configuró `allowDownload = false` en un certificado -> El modal oculta el botón de descarga del PDF original y solo muestra visualización. |
