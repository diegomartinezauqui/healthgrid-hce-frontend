# Changelog — HealthGrid HCE Frontend

Registro cronológico de cambios realizados en el proyecto. Este archivo sirve como bitácora para que cualquier desarrollador (o IA asistente) tenga contexto de qué se modificó y por qué.

---

## [2026-05-16] — Refinamiento de UI: Tabs, Iconos y Subtabs

### Cambios
- **Tabs de Ficha Médica / Episodios**: Rediseño completo al estilo "clipboard clip" con bordes redondeados. Tab activa en verde `#259A5E`, inactiva en gris `#E0E4E2`. Se agregaron íconos `FiClipboard` y `FiFolder`.
- **Sub-tabs de Episodio (Evoluciones, Recetas, etc.)**: Migración de estilo underline a **pill/segmented control** con fondo `#F0F4F2` y tab activa en blanco con sombra.
- **Empty states**: Cada sub-tab ahora muestra un ícono diferenciado cuando no hay registros:
  - Evoluciones → `FiActivity`
  - Recetas → `FiFileText`
  - Pedidos de Estudios → `FiLayers`
  - Solicitudes de Pase → `FiSend`
- **Botones de episodio**: Reemplazados emojis por React Icons:
  - "Dar de Alta" → `FiCheckCircle`
  - "Solicitar Internación" → `FaBed`
  - Todos los "+" de botones de crear → `FiPlusCircle`
- **Reemplazo masivo de emojis en PacienteDetalle**: Edad (`FiCalendar`), DNI (`FiCreditCard`), HC (`FiFileText`), y todos los títulos de sección (`FiUser`, `FiActivity`, `FiAlertTriangle`, `FiClipboard`, `FiEdit3`).
- **Instalación de `react-icons`** como nueva dependencia del proyecto.

### Archivos Modificados
- `src/pages/PacienteDetalle.jsx` — Import de react-icons, reemplazo de emojis, tabs clipboard, botones con íconos
- `src/pages/EpisodioDetalle.jsx` — Import de react-icons, botones con íconos, empty states con íconos
- `src/styles/PacienteDetalle.css` — CSS de tabs clipboard, `.detalle-card__icono`, `.detalle-btn__icon`, `.detalle-tab__icon`
- `src/styles/EpisodioDetalle.css` — CSS de subtabs pill, `.ep-detalle__vacio-icono`
- `package.json` — Agregado `react-icons: ^5.6.0`

---

## [2026-05-15] — Barras de Búsqueda Unificadas

### Cambios
- **Barra de búsqueda principal (Home)**: Cambio de color naranja `#fc8134` a verde oscuro `#11352A`. Reducción de tamaño (padding, font-size, border-width).
- **Barra de búsqueda del header (Home)**: Rediseño del input simple a wrapper con botón de lupa SVG integrado, mismo estilo verde oscuro.
- **Barra de búsqueda en PacienteDetalle**: Eliminado emoji 🔍, reemplazado por el diseño unificado con `.detalle-topbar__search-wrapper` y `.detalle-topbar__search-btn`.

### Archivos Modificados
- `src/pages/Home.jsx` — Ambas barras de búsqueda actualizadas
- `src/pages/PacienteDetalle.jsx` — Barra del header reemplazada
- `src/styles/PacienteDetalle.css` — Nuevas clases para search wrapper y search button

---

## [2026-05-04] — Módulos de Internación y Solicitudes de Pase

### Cambios
- **Solicitar Internación**: Nuevo formulario (`SolicitarInternacion.jsx`) con campos de motivo, tipo de cama, servicio destino, prioridad y observaciones. Botón rojo `#C0392B` en EpisodioDetalle.
- **Solicitudes de Pase**: Nueva sub-tab en EpisodioDetalle con tabla de solicitudes y formulario `NuevaSolicitudPase.jsx`. Función `agregarSolicitudPase` en App.jsx.
- **Sidebar**: Rediseño del logo con tipografía serif y EKG SVG. Eliminación de barra de búsqueda redundante. Agregado de iconos de navegación lateral para otras áreas (Farmacia, Laboratorio, Imágenes, etc.).
- **Home**: Rediseño del banner "Portal Clínico" con círculos decorativos concéntricos y tipografía serif.

### Archivos Creados
- `src/pages/SolicitarInternacion.jsx`
- `src/pages/NuevaSolicitudPase.jsx`
- `src/styles/SolicitarInternacion.css`
- `src/styles/NuevaSolicitudPase.css`

### Archivos Modificados
- `src/App.jsx` — Nueva función `agregarSolicitudPase`, prop drilling actualizado
- `src/pages/EpisodioDetalle.jsx` — Sub-tab de solicitudes de pase, botón de internación
- `src/styles/EpisodioDetalle.css` — Estilos para nueva sub-tab y botón rojo
- `src/components/Sidebar.jsx` — Rediseño completo del logo y navegación
- `src/styles/Sidebar.css` — Estilos actualizados
- `src/pages/Home.jsx` — Banner y búsqueda rediseñados

---

## [2026-05-04] — Módulo de Pedidos de Estudios + SweetAlert

### Cambios
- **Pedidos de Estudios**: Nuevo flujo completo — formulario de creación (`NuevoPedidoEstudio.jsx`), vista detallada (`PedidoEstudioDetalle.jsx`), y sub-tab integrada en EpisodioDetalle.
- **SweetAlert2**: Migración de `alert()` / `window.confirm()` nativos del navegador a SweetAlert2 para confirmaciones de alta de episodio y feedback de éxito.

### Archivos Creados
- `src/pages/NuevoPedidoEstudio.jsx`
- `src/pages/PedidoEstudioDetalle.jsx`
- `src/styles/NuevoPedidoEstudio.css`
- `src/styles/PedidoEstudioDetalle.css`

### Archivos Modificados
- `src/App.jsx` — Función `agregarEstudio`
- `src/pages/EpisodioDetalle.jsx` — Sub-tab de estudios
- `src/pages/NuevoEpisodio.jsx` — Migración a SweetAlert
- `src/pages/NuevaEvolucion.jsx` — Migración a SweetAlert
- `package.json` — Agregado `sweetalert2`

---

## [2026-05-04] — Módulo de Recetas

### Cambios
- **Recetas Médicas**: Formulario de creación (`NuevaReceta.jsx`) y sub-tab de recetas en EpisodioDetalle con listado, estado (vigente/vencida) y botón para cambiar estado.

### Archivos Creados
- `src/pages/NuevaReceta.jsx`
- `src/styles/NuevaReceta.css`

### Archivos Modificados
- `src/App.jsx` — Funciones `agregarReceta` y `cambiarEstadoReceta`
- `src/pages/EpisodioDetalle.jsx` — Sub-tab de recetas

---

## [2026-05-04] — Módulo HCE Completo (Core)

### Cambios
- **Fundación del sistema**: Implementación completa del flujo paciente → episodio → evolución.
- **Home**: Dashboard con barra de búsqueda y formulario de registro de paciente.
- **Ficha Médica**: Vista completa con datos personales, resumen clínico, consideraciones, antecedentes y observaciones. Modal de edición con `react-hook-form`.
- **Episodios**: Listado de episodios con creación, detalle, y dar de alta.
- **Evoluciones**: Formulario de evolución clínica y vista de lectura.

### Archivos Creados
- Todos los archivos base del proyecto (ver Estructura del Proyecto en README.md)

### Archivos Modificados
- `src/App.jsx` — Estado global completo, funciones de mutación

---

## [2026-05-03] — Setup Inicial

### Cambios
- Maqueta inicial de Home y Sidebar con estilos base.
- Proyecto creado con `create-vite` + React.

### Archivos Creados
- Scaffolding inicial de Vite + React
- `src/components/Sidebar.jsx`
- `src/pages/Home.jsx`

---

> **Nota**: Este changelog se actualiza manualmente con cada sesión de desarrollo significativa. Ante la duda, consultá el historial de commits con `git log --oneline`.
