# 01 - Requisitos Funcionales (RF)

Priorización basada en MoSCoW:
- **Must:** Obligatorio para el MVP funcional.
- **Should:** Muy recomendado e incluido en el alcance objetivo del producto.
- **Could:** Mejora de valor agregado o extensión futura.

---

## Módulo 1: Autenticación, Sesión y Control de Acceso (`RF-AUTH`)

### `RF-AUTH-01` Inicio de sesión privado del propietario
- **Prioridad:** Must
- **Descripción:** El sistema debe proporcionar una pantalla de inicio de sesión (`/login`) para autenticar al propietario mediante correo electrónico y contraseña antes de acceder a cualquier ruta de administración o edición (`/admin/*`, `/studio/*`, `/api/admin/*`).
- **Reglas de negocio:**
  - Las contraseñas nunca se almacenan en texto plano; deben encriptarse con algoritmo seguro (`bcrypt` con factor de costo >= 12 o `Argon2id`).
  - La sesión debe mantenerse mediante token JWT firmado o sesión en servidor dentro de una cookie `HttpOnly`, `SameSite=Lax` y `Secure` en producción.
- **Criterios de aceptación:**
  1. Si un usuario no autenticado intenta acceder a `/admin` o `/studio`, es redirigido a `/login`.
  2. Al ingresar credenciales válidas, inicia sesión y es redirigido al panel principal de administración.
  3. Al ingresar credenciales inválidas, recibe un mensaje genérico sin revelar si el correo existe.

### `RF-AUTH-02` Cierre de sesión y protección contra fuerza bruta
- **Prioridad:** Must
- **Descripción:** El propietario debe poder cerrar sesión de forma explícita y los endpoints de autenticación deben mitigar ataques automatizados.
- **Reglas de negocio:**
  - Implementar limitación de intentos (rate limiting) por IP/correo en `/api/auth/login`.
  - Permitir cambiar la contraseña actual desde la configuración de cuenta verificando la contraseña vigente.
- **Criterios de aceptación:**
  1. Al cerrar sesión, la cookie se invalida y las rutas privadas dejan de ser accesibles inmediatamente.
  2. Superar el umbral de intentos fallidos devuelve estado HTTP `429 Too Many Requests`.

### `RF-AUTH-03` Soporte de arquitectura Multi-Tenant (Single-Tenant activo en Fase 1)
- **Prioridad:** Should
- **Descripción:** El sistema operará en modo personal por defecto mediante la variable de entorno `ALLOW_SIGNUP=false`, pero toda entidad persistida estará asociada a `user_id` y `profile_id`.
- **Criterios de aceptación:**
  1. Con `ALLOW_SIGNUP=false`, el registro público está deshabilitado y el CV principal se sirve en `/`.
  2. Ninguna consulta de API de edición devuelve o modifica registros que no pertenezcan al `user_id` autenticado.

---

## Módulo 2: Gestión de Datos Profesionales del CV y Multi-Idioma (`RF-DATA`)

### `RF-DATA-01` Gestión del Perfil Profesional
- **Prioridad:** Must
- **Descripción:** El propietario debe poder crear, consultar y actualizar su información de perfil principal: nombre completo, titular profesional, biografía/resumen, fotografía/avatar, ubicación, correo de contacto visible, estado de disponibilidad (ej. *"Disponible para proyectos"*), `slug` público y enlaces sociales (LinkedIn, GitHub, Web, X, etc.).
- **Criterios de aceptación:**
  1. Los cambios guardados persisten en PostgreSQL y se reflejan en el widget *Hero / Perfil* del constructor y de la vista pública.
  2. Las URLs sociales y correo son validados antes de guardar.

### `RF-DATA-02` Gestión de Experiencia Laboral y Educación
- **Prioridad:** Must
- **Descripción:** El propietario debe poder administrar registros cronológicos de experiencia laboral y formación académica.
- **Campos requeridos:** Institución/empresa, cargo/título, modalidad/ubicación, fecha de inicio, fecha de fin (o indicador *"Actualmente"*), descripción, lista de logros destacados, etiquetas tecnológicas, orden manual y bandera `isVisible`.
- **Criterios de aceptación:**
  1. Se pueden crear, editar, reordenar, ocultar temporalmente y eliminar registros.
  2. No se permite guardar una fecha de fin anterior a la fecha de inicio.

### `RF-DATA-03` Gestión de Portafolio de Proyectos
- **Prioridad:** Must
- **Descripción:** El propietario debe poder documentar proyectos relevantes para exhibir en el CV interactivo.
- **Campos requeridos:** Título, resumen corto y descripción extendida, stack tecnológico (tags), URL de demo en vivo, URL de repositorio, imagen de vista previa, fecha/año, indicador `featured` (destacado) y `isVisible`.
- **Criterios de aceptación:**
  1. Las etiquetas tecnológicas permiten filtrar proyectos desde la vista pública.
  2. Los proyectos marcados como ocultos no aparecen en la página pública ni en el PDF exportado.

### `RF-DATA-04` Gestión de Habilidades y Competencias (`Skills`)
- **Prioridad:** Must
- **Descripción:** El propietario debe poder registrar sus habilidades técnicas y blandas organizadas por categoría (ej. *Frontend, Backend, DevOps, Bases de Datos, Soft Skills*) con nivel de dominio y años de experiencia opcionales.
- **Criterios de aceptación:**
  1. Cada habilidad se asocia a una categoría para habilitar filtros interactivos en el CV público.
  2. Se puede ajustar el orden de presentación y visibilidad.

### `RF-DATA-05` Soporte Multi-Idioma Nativo (`ES` / `EN`)
- **Prioridad:** Should
- **Descripción:** El sistema debe soportar contenido bilingüe (Español `es` e Inglés `en`) tanto para los datos profesionales (`RF-DATA-01..04`, `RF-CERT-02`) como para textos libres del lienzo.
- **Reglas de negocio:**
  - Cada campo traducible se estructura con claves `{ es: string, en: string }`.
  - Si un campo no tiene traducción en el idioma seleccionado por el visitante, se aplica respaldo (*fallback*) al idioma por defecto del perfil para evitar textos vacíos.
- **Criterios de aceptación:**
  1. El editor muestra pestañas o campos paralelos `ES` / `EN` e indica visualmente traducciones pendientes.
  2. El cambio de idioma en la página pública actualiza textos del CV, etiquetas de interfaz y el PDF exportado.

---

## Módulo 3: Repositorio y Visor de Certificaciones en PDF (`RF-CERT`)

### `RF-CERT-01` Subida y validación segura de archivos PDF
- **Prioridad:** Must
- **Descripción:** El propietario debe poder subir archivos PDF reales correspondientes a sus diplomas y certificaciones.
- **Reglas de negocio:**
  - Validar extensión `.pdf`, cabecera MIME `application/pdf` y firma binaria real (`%PDF-`) en los primeros bytes del archivo.
  - Tamaño máximo configurable (por defecto `10 MB`).
  - Generar un nombre/clave interno UUID y calcular hash `SHA-256` para integridad y evitar colisiones o path traversal.
- **Criterios de aceptación:**
  1. Un archivo no-PDF renombrado a `.pdf` es rechazado con error `400 Bad Request`.
  2. Un PDF válido queda almacenado vía `StorageProvider` y vinculado en la tabla `file_assets`.

### `RF-CERT-02` Metadatos y clasificación de certificaciones
- **Prioridad:** Must
- **Descripción:** Cada certificación vinculada a un PDF debe permitir editar metadatos: título (`ES`/`EN`), entidad emisora (ej. *AWS, Google, Coursera*), fecha de emisión, fecha de expiración opcional, ID de credencial, URL de verificación oficial, categoría, habilidades relacionadas, bandera `isVisible` y bandera `allowDownload`.
- **Criterios de aceptación:**
  1. Al eliminar una certificación o reemplazar su PDF, el archivo huérfano se limpia de forma segura del almacenamiento.
  2. Si `allowDownload` es `false`, la interfaz pública oculta el botón de descarga del PDF original y solo permite vista previa controlada.

### `RF-CERT-03` Visor Modal Integrado de Certificaciones PDF
- **Prioridad:** Must
- **Descripción:** Al seleccionar una certificación en la página pública (o previsualizar en el admin), se abrirá un modal interactivo con el documento PDF renderizado dentro de la misma página.
- **Criterios de aceptación:**
  1. El visor permite navegar entre páginas (si el certificado tiene más de 1 página), hacer zoom in/out y consultar los metadatos (emisor, fecha, ID, enlace de verificación).
  2. Los archivos se sirven a través de un endpoint controlado (`/api/assets/[id]`) que verifica que la certificación esté publicada y visible.

### `RF-CERT-04` Filtrado y búsqueda de certificaciones
- **Prioridad:** Should
- **Descripción:** La galería/widget de certificaciones debe permitir al visitante filtrar por categoría o habilidad y buscar por título o entidad emisora.
- **Criterios de aceptación:**
  1. Al seleccionar una categoría o escribir en el buscador, la lista se actualiza en tiempo real sin recargar la página.

---

## Módulo 4: Constructor Visual de Lienzo Libre / Studio (`RF-BUILDER`)

### `RF-BUILDER-01` Espacio de trabajo de diseño desde cero
- **Prioridad:** Must
- **Descripción:** El sistema proveerá un entorno visual (`/studio`) compuesto por: barra superior de acciones (Guardar, Vista Desktop/Mobile, Preview, Publicar, Historial), panel izquierdo (catálogo de elementos y árbol de capas), área central (lienzo interactivo) y panel derecho (inspector de propiedades y estilos).
- **Criterios de aceptación:**
  1. El propietario puede partir de un lienzo completamente vacío o insertar bloques base y construir su diseño libremente.
  2. El estado del editor se autoguarda con `debounce` o mediante botón manual de guardado en el borrador (`draft`).

### `RF-BUILDER-02` Manipulación directa sobre el Lienzo Desktop
- **Prioridad:** Must
- **Descripción:** En la vista Desktop, el propietario podrá arrastrar, soltar, posicionar libremente en coordenadas `(x, y)`, redimensionar `(w, h)`, reordenar profundidad de capas (`zIndex`) y alinear elementos mediante guías magnéticas y ajuste opcional a rejilla (`snap-to-grid`).
- **Criterios de aceptación:**
  1. Todo cambio de posición, tamaño o propiedad soporta deshacer/rehacer (`Undo/Redo`) mediante botones y atajos `Ctrl+Z` / `Ctrl+Y`.
  2. Se pueden mover elementos con flechas del teclado para ajustes finos y eliminar/duplicar con atajos estándar.

### `RF-BUILDER-03` Catálogo Dual: Elementos Libres y Widgets Conectados a Datos
- **Prioridad:** Must
- **Descripción:** El constructor ofrecerá dos familias de nodos combinables en el mismo lienzo:
  - **Elementos libres:** Texto enriquecido (bilingüe), Imagen/Avatar, Tarjeta/Contenedor visual, Botón/Enlace, Insignia (`Badge`), Separador/Línea.
  - **Widgets dinámicos conectados a Capa 1:**
    - *Hero de Perfil* (foto, nombre, titular, estado, redes).
    - *Línea de Tiempo Interactiva* (Experiencia y Educación).
    - *Grid de Proyectos* (con filtros por tecnología).
    - *Matriz de Habilidades* (con filtros por categoría y barras/niveles).
    - *Galería de Certificaciones* (con apertura directa del Visor Modal PDF).
    - *Tarjeta PDF Destacada (`widget_cert_spotlight`)* (permite fijar un certificado, diploma o documento extra individual en cualquier posición del lienzo).
    - *Formulario de Contacto* (para reclutadores).
    - *Barra de Controles del Visitante* (cambio `Claro/Oscuro`, cambio `ES/EN`, botón *Descargar CV PDF*).
- **Criterios de aceptación:**
  1. Al actualizar un registro en Capa 1 (ej. agregar una certificación), el widget conectado en el lienzo y en la página pública muestra el nuevo dato sin tener que rediseñar el lienzo.
  2. Los elementos libres permiten editar su contenido y estilo directamente desde el inspector o edición inline.

### `RF-BUILDER-04` Comportamiento Móvil Automático Configurable
- **Prioridad:** Must
- **Descripción:** Para garantizar usabilidad perfecta en teléfonos sin duplicar el trabajo de diseño manual, el modo Mobile reorganiza automáticamente los nodos del lienzo en una columna vertical responsiva.
- **Capacidades en vista Mobile del Studio:**
  - Vista previa exacta en ancho móvil (ej. `390px`).
  - Posibilidad de reordenar la secuencia vertical de los bloques (`mobile.order`) y ocultar elementos decorativos específicos en móvil (`mobile.visible`).
- **Criterios de aceptación:**
  1. Ningún elemento se superpone de forma ilegible en pantallas móviles.
  2. Cambiar el orden en móvil no altera las coordenadas libres `(x, y)` diseñadas para Desktop.

### `RF-BUILDER-05` Sistema de Borrador, Publicación y Versionado (`Draft / Published`)
- **Prioridad:** Must
- **Descripción:** Los cambios en el constructor se guardan inicialmente en un layout con estado `draft`. La página pública solo renderiza el layout con estado `published`.
- **Criterios de aceptación:**
  1. El propietario puede experimentar en el editor y abrir una vista previa privada sin afectar lo que ven los reclutadores.
  2. Al presionar **Publicar**, se crea/actualiza la versión publicada y se conserva un historial de versiones previas para poder restaurar alguna si se desea.

### `RF-BUILDER-06` Configuración Global de Tema y Estilos
- **Prioridad:** Should
- **Descripción:** El editor permitirá definir la identidad visual global: paleta de colores (primario, acento, fondo, superficie) tanto para modo Claro como Oscuro, fuente principal/títulos, radio de bordes y nivel de animaciones.
- **Criterios de aceptación:**
  1. Los tokens de tema se aplican consistentemente a los widgets y elementos del lienzo en tiempo real.

### `RF-BUILDER-07` IDE Integrado de Código y Bloques Personalizados (`custom_code`)
- **Prioridad:** Should
- **Descripción:** El Studio integrará un modo enfocado de código (modos `Diseño` | `Split IDE` | `</> Código`) para insertar bloques de código personalizado (`HTML + CSS` con Shadow DOM aislado heredando tokens del tema) y editar directamente el esquema `canvas.json` con validación en vivo y snippets reutilizables.
- **Reglas de negocio:**
  - Los bloques `custom_code` se sanitizan en servidor/cliente eliminando ejecución arbitraria de `<script>` inseguro y encapsulan su CSS para no alterar estilos globales ni comprometer la seguridad.
- **Criterios de aceptación:**
  1. Al insertar un bloque `custom_code` o escribir en `component.html` / `styles.css`, la vista previa en el artboard y en la vista lateral del IDE se actualiza en vivo.
  2. La pestaña `canvas.json` valida la sintaxis JSON y el esquema `Zod` antes de aplicar cambios al lienzo.

### `RF-BUILDER-08` Subida de Código Fuente (`.html`/`.css`) y Motor de Variables de Datos (`{{cv.*}}`)
- **Prioridad:** Should
- **Descripción:** El propietario podrá subir archivos de código fuente (`.html` y `.css`, o paquete de plantilla) directamente desde el Studio IDE para renderizarlos en el lienzo, e inyectar variables dinámicas conectadas a sus datos reales en el idioma activo (`ES`/`EN`) mediante interpolación segura `{{cv.*}}` y bucles `{{#each cv.*}}...{{/each}}`.
- **Variables soportadas:**
  - Perfil: `{{cv.profile.fullName}}`, `{{cv.profile.headline}}`, `{{cv.profile.bio}}`, `{{cv.profile.location}}`, `{{cv.profile.email}}`, `{{cv.profile.availability}}`.
  - Métricas: `{{cv.stats.projectsCount}}`, `{{cv.stats.certificationsCount}}`, `{{cv.stats.skillsCount}}`, `{{cv.stats.experiencesCount}}`.
  - Colecciones: `{{#each cv.experiences}}`, `{{#each cv.projects}}`, `{{#each cv.skills}}`, `{{#each cv.certifications}}`.
- **Criterios de aceptación:**
  1. Al subir archivos `.html` y `.css` válidos, el código se carga en el bloque `custom_code` y se renderiza al instante dentro del Shadow DOM aislado.
  2. Todas las variables `{{cv.*}}` se interpolan con escape HTML automático (sin `eval`) y cambian automáticamente si el usuario actualiza datos en `/admin` o alterna idioma `ES/EN`.

### `RF-BUILDER-09` Subida y Gestión de Fuentes Tipográficas Personalizadas
- **Prioridad:** Could
- **Descripción:** El propietario podrá subir sus propias fuentes tipográficas (`.woff2`, `.ttf`, `.otf`) desde el panel de Tema del Studio / Control Center para aplicarlas a títulos (`Display`), cuerpo (`Sans`) o código (`Mono`) en todo su CV.
- **Reglas de negocio:**
  - Validar extensión y firma binaria real (`wOF2`, `OTTO`, TTF) con límite configurable (5 MB por fuente).
  - Registrar en `FileAsset` con `kind = FONT` y servir vía `/api/assets/[id]` con regla `@font-face` dinámica.
- **Criterios de aceptación:**
  1. Al subir una fuente válida, queda disponible en el selector tipográfico del tema y se aplica en tiempo real en el lienzo y la página pública.
  2. Un archivo con firma binaria inválida es rechazado con error `400`.

---

## Módulo 5: Página Pública Interactiva, Exportación y Contacto (`RF-PUB`)

### `RF-PUB-01` Renderizado Público del CV y Enrutamiento
- **Prioridad:** Must
- **Descripción:** La ruta raíz `/` mostrará el CV publicado del perfil principal (y `/u/[slug]` quedará preparada para acceso por slug).
- **Criterios de aceptación:**
  1. Si aún no existe un diseño publicado, muestra una pantalla elegante de estado inicial con enlace directo al panel `/login` para el propietario.
  2. Genera metadatos dinámicos (`title`, `description`, `OpenGraph`) usando el nombre y titular del perfil.

### `RF-PUB-02` Interactividad para Visitantes
- **Prioridad:** Must
- **Descripción:** La página pública ofrecerá experiencia interactiva fluida:
  - Cambio instantáneo de tema `Claro / Oscuro` (respetando preferencia del sistema en la primera visita y guardando elección en `localStorage`).
  - Cambio instantáneo de idioma `ES / EN`.
  - Animaciones de entrada al hacer scroll y transiciones suaves (`Framer Motion`, respetando `prefers-reduced-motion`).
  - Filtros en vivo sobre Proyectos, Habilidades y Certificaciones, y expansión/colapso de detalles en la Línea de Tiempo.
- **Criterios de aceptación:**
  1. Todos los controles interactivos responden sin recargar la página completa.

### `RF-PUB-03` Exportación Automática del CV Completo a PDF (ATS-Friendly)
- **Prioridad:** Should
- **Descripción:** Al pulsar el botón de descarga, el sistema generará un PDF vectorial con texto seleccionable y estructura limpia (encabezado, resumen, experiencia, educación, proyectos destacados, habilidades y listado de certificaciones) en el idioma actualmente activo (`ES` o `EN`).
- **Criterios de aceptación:**
  1. El PDF generado incluye únicamente elementos marcados como visibles (`isVisible = true`).
  2. El texto del PDF es seleccionable y estructurado en orden lógico de lectura para compatibilidad con sistemas ATS.

### `RF-PUB-04` Formulario de Contacto y Bandeja de Mensajes
- **Prioridad:** Must
- **Descripción:** El widget de contacto permitirá a visitantes/reclutadores enviar un mensaje con nombre, correo, empresa (opcional), asunto y mensaje.
- **Reglas de negocio:**
  - Incluir campo oculto *honeypot* y limitación de envíos por IP para evitar spam.
  - Guardar mensajes en la tabla `contact_messages`.
  - Mostrar contador de mensajes no leídos y bandeja de gestión (marcar leído/no leído, eliminar) dentro del panel `/admin/messages`.
- **Criterios de aceptación:**
  1. Un envío válido almacena el mensaje en PostgreSQL y muestra confirmación visual al visitante.
  2. Si el campo honeypot viene relleno por un bot, la petición se descarta silenciosamente o se rechaza sin persistir basura.
