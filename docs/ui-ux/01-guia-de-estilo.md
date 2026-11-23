# 01 - Guía de Estilo (*Design System* "Obsidian & Bone")

Este documento unifica los tokens visuales reales ya configurados en [globals.css](../../apps/web/src/app/globals.css), las tipografías cargadas en [layout.tsx](../../apps/web/src/app/layout.tsx) y las variantes cromáticas validadas en [docs/prototipo/index.html](../prototipo/index.html).

---

## 1. Paleta de Colores y Tokens CSS

### 1.1 Tema Base: Oscuro Editorial (*Obsidian / Amaterasu*, por defecto)

| Token (`globals.css`) | Token Prototipo | Valor Hex / RGBA | Uso Semántico |
| :--- | :--- | :--- | :--- |
| `--bg` | `--paper` | `#000000` | Fondo principal del viewport y lienzo oscuro |
| `--surface` | `--paper-raised` | `#0a0a0a` | Paneles contenedores, tarjetas Hero, Rail CMS, Modales |
| `--surface-soft` | `--paper-soft` | `#121212` | Sub-bloques, filas activas, barras KPI y botones suaves |
| `--text` | `--ink` | `#cdc4ba` | Tinta primaria cálida (hueso) para títulos y cuerpo |
| `--text-dim` | `--ink-dim` | `#b0a9a0` | Subtítulos, párrafos secundarios y etiquetas activas |
| `--muted` | `--ink-muted` | `#958f87` | Metadatos, fechas, empresas e subtítulos en cursiva |
| `--faint` | `--ink-faint` | `#6f6962` | Numeración de línea IDE, placeholders y rótulos de grupo |
| `--border` | `--line` | `rgba(205, 196, 186, 0.24)` | Bordes *hairline* estructurales (`1px solid`) |
| `--border-soft` | `--line-soft` | `rgba(205, 196, 186, 0.12)` | Divisores internos suaves entre filas y secciones |
| `--border-strong` | `--line-strong` | `rgba(205, 196, 186, 0.44)` | Estados hover, enfoque de inputs y bordes enfatizados |
| `--accent` | `--sun` | `#ce5e32` | Acento focal (*Terracota Amaterasu*): CTA publicar, indicadores activos, numeración `00 //` |

### 1.2 Modo Claro ("Bone Paper" `.light`)

| Token (`globals.css`) | Valor Hex / RGBA | Uso Semántico |
| :--- | :--- | :--- |
| `--bg` | `#f3efe9` | Fondo papel hueso cálido |
| `--surface` | `#faf8f4` | Tarjetas elevadas claras |
| `--surface-soft` | `#ebe5dc` / `#e8e1d6` | Badges, cabeceras de tabla y resaltados |
| `--text` | `#171513` | Tinta carbón de alto contraste |
| `--text-dim` | `#3d3833` | Texto secundario legible |
| `--muted` | `#655e57` | Metadatos y fechas |
| `--border` | `rgba(23, 21, 19, 0.20)` | Líneas finas en tema claro |
| `--accent` | `#ce5e32` | Acento mantenido para consistencia de marca |

### 1.3 Atmósferas Alternativas (`data-accent` configurables en Studio / Vista Pública)

| Atmósfera | Fondo (`--paper`) | Superficie (`--paper-raised`) | Tinta (`--ink`) | Acento (`--sun`) |
| :--- | :--- | :--- | :--- | :--- |
| **Amaterasu** *(Default)* | `#000000` | `#0a0a0a` | `#cdc4ba` | `#ce5e32` |
| **Void** *(Verde Mineral)* | `#05110a` | `#0a1911` | `#c1cac4` | `#6daf8c` |
| **Cobalt** *(Azul Técnico)* | `#030f19` | `#081824` | `#bfc9d1` | `#6ea5cf` |
| **Indigo** *(Índigo Profundo)* | `#0b0c1b` | `#131527` | `#c4c6d2` | `#9299d3` |

---

## 2. Sistema Tipográfico

Configurado con `next/font/google` en [layout.tsx](../../apps/web/src/app/layout.tsx) y expuesto vía variables CSS:

| Rol | Familia | Variable CSS / Clase | Pesos / Estilo | Aplicación |
| :--- | :--- | :--- | :--- | :--- |
| **Display Editorial** | `Fraunces` | `--font-display` / `.font-display` | `300..700` + `italic` | Subtítulos expresivos, citas de Hero y énfasis editorial |
| **Interfaz y Lectura** | `Space Grotesk` | `--font-sans` (default `body`) | `300..700` | Títulos `H1/H2`, párrafos, botones UI y formularios CMS |
| **Técnica y Metadatos** | `Space Mono` | `--font-mono` / `.font-mono-tech` | `400`, `700` | Numeración `01 //`, coordenadas `X/Y/W/H`, códigos JSON/HTML, IDs de credenciales y fechas |

### Escala y Jerarquía Visual
- **Hero Display (`H1`):** `36px–48px` (`font-weight: 500–600`, `letter-spacing: -0.03em`).
- **Subtítulo Serif:** `22px–30px` (`Fraunces italic`, color `--muted`).
- **Encabezado de Sección Editorial:** código en `--accent` (`01 //`) + etiqueta mayúscula (`11px`, `letter-spacing: 0.18em–0.20em`) + regla horizontal `1px`.
- **Cuerpo UI / Lectura:** `14px` (`line-height: 1.5–1.65`).
- **Microetiquetas / Badges:** `10px–11px` en `Space Mono`, mayúsculas con `letter-spacing: 0.12em–0.18em`.
- **Fuentes Personalizadas (Studio):** las fuentes `.woff2`, `.ttf` u `.otf` validadas con `validateFontBuffer()` se inyectan mediante `@font-face` permitiendo anular la familia Display o Sans por perfil o bloque `custom_code`.

---

## 3. Geometría, Retícula y Movimiento

- **Radios de borde:**
  - Interfaz estructural (*shell*, botones, inputs, tarjetas base): **`2px`** (`rounded-[2px]`), reforzando el carácter técnico-arquitectónico.
  - Nodos dentro de `canvasSchemaV1` (Studio): personalizables entre **`0px` y `120px`** (`NodeStyle.borderRadius`, valores iniciales `12px–20px` en `services/api-studio/src/engine/defaults.ts` con preset editorializable a `2px`).
- **Sistema de Retícula Studio:**
  - Ancho base de artboard Desktop: `1200px` por defecto (`800..1920px`, vista compacta `960px` en prototipo).
  - Grilla magnética (*snap-to-grid*): **`8px`** (`gridSize: 8`, configurable `1..64px`), con desplazamiento fino por teclado en incrementos de `8px`.
- **Elevación sin sombras difusas:** jerarquía visual construida con contraste tonal (`#000000` -> `#0a0a0a` -> `#121212`) y bordes `1px` en lugar de *drop shadows* pesados.
- **Movimiento Intencional:**
  - `--snap: 90ms` para estados *hover/active* en botones e inputs.
  - `--move: 180ms` con curva `cubic-bezier(0.215, 0.61, 0.355, 1)` para subrayados de navegación y animaciones `fade-up` / `fade-in` / `scale-in`.
  - Respeta estrictamente `@media (prefers-reduced-motion: reduce)` anulando desplazamientos.

---

## 4. Catálogo de Componentes Atómicos y Accesibilidad

| Componente | Variantes | Reglas de Diseño y Accesibilidad |
| :--- | :--- | :--- |
| **Botón (`.btn`)** | Fantasma (borde `1px`), Sólido (`--bone` invertido), Acento (`--sun`), Tamaños `xs`/`sm`/`md` | Área interactiva mínima en móvil `>= 44px` de alto; `focus-visible` con anillo `--accent`; transición `90ms`. |
| **Tarjeta / Panel** | Contenedor `#0a0a0a` con borde `--border` (`2px` radio) | Contraste mínimo `>= 4.5:1` entre `#cdc4ba` / `#171513` y sus superficies respectivas. |
| **Tabla / Spec Row** | Filas separadas por `--border-soft` | Metadato clave alineado a izquierda en `Space Mono`, valor alineado a derecha o columna secundaria. |
| **Tabs / Filtros** | Subrayado animado o pastilla invertida activa | Navegables por teclado (`ArrowLeft`/`ArrowRight` o `Tab`), atributo `aria-pressed` / `aria-selected`. |
| **Toast / Alertas** | Borde lateral acento (`--accent` éxito/info, rojo contraste para errores `400/401/429`) | Región viva `aria-live="polite"` sin bloquear lectura ni interacción del lienzo. |
| **Visor Modal PDF** | Backdrop oscuro con panel centrado máximo `960px` | Trampa de foco, cierre con `Escape` y botón explícito `[X]`, bloqueo de scroll en `body`. |
