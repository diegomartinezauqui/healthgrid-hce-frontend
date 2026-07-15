# HealthGrid HCE — Frontend

> **Sistema de Historia Clínica Electrónica (HCE)** para la gestión integral de pacientes en entornos clínicos.

---

## 📋 Descripción del Proyecto

HealthGrid HCE es una aplicación web de gestión de historias clínicas electrónicas. Permite a los profesionales de la salud registrar pacientes, crear episodios clínicos, documentar evoluciones médicas, emitir recetas, solicitar estudios y gestionar internaciones y pases entre servicios.

**Estado actual**: Prototipo funcional con estado en memoria (sin backend conectado). La interfaz está completa y lista para integrar con el backend FastAPI.

---

## 🛠 Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| **React** | 19.x | Librería de UI |
| **Vite** | 8.x | Bundler y dev server |
| **react-hook-form** | 7.x | Formularios con validación |
| **react-icons** | 5.x | Iconografía (Feather Icons + Font Awesome) |
| **sweetalert2** | 11.x | Alertas y confirmaciones |
| **CSS Vanilla** | — | Estilos modulares por componente |

---

## 🚀 Instalación y Ejecución

```bash
# Clonar el repositorio
git clone https://github.com/diegomartinezauqui/healthgrid-hce-frontend.git

# Entrar al directorio del proyecto
cd healthgrid-hce-frontend/healthgrid-hce-frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

La app se levanta por defecto en `http://localhost:5174/`.

---

## 📁 Estructura del Proyecto

```
src/
├── App.jsx                  # Componente raíz — Estado global y navegación
├── App.css                  # Estilos globales de layout
├── main.jsx                 # Entry point de React + Vite
├── index.css                # Reset CSS y fuentes base
│
├── components/
│   └── Sidebar.jsx          # Barra lateral de navegación (iconos SVG, logo)
│
├── pages/
│   ├── Home.jsx             # Dashboard principal con búsqueda de pacientes
│   ├── PacienteDetalle.jsx  # Vista de ficha médica y episodios del paciente
│   ├── NuevaFichaMedica.jsx # Modal/formulario de registro/edición de paciente
│   ├── NuevoEpisodio.jsx    # Formulario de creación de episodio clínico
│   ├── EpisodioDetalle.jsx  # Vista detallada del episodio con sub-tabs
│   ├── NuevaEvolucion.jsx   # Formulario de nueva evolución clínica
│   ├── EvolucionDetalle.jsx # Vista de lectura de una evolución
│   ├── NuevaReceta.jsx      # Formulario de prescripción médica
│   ├── NuevoPedidoEstudio.jsx      # Formulario de pedido de estudio
│   ├── PedidoEstudioDetalle.jsx    # Vista detallada de un estudio
│   ├── SolicitarInternacion.jsx    # Formulario de solicitud de internación
│   └── NuevaSolicitudPase.jsx      # Formulario de solicitud de pase/derivación
│
└── styles/
    ├── Sidebar.css
    ├── PacienteDetalle.css
    ├── NuevaFichaMedica.css
    ├── NuevoEpisodio.css
    ├── EpisodioDetalle.css
    ├── NuevaEvolucion.css
    ├── EvolucionDetalle.css
    ├── NuevaReceta.css
    ├── NuevoPedidoEstudio.css
    ├── PedidoEstudioDetalle.css
    ├── SolicitarInternacion.css
    └── NuevaSolicitudPase.css
```

---

## 🏗 Arquitectura y Flujo de Datos

### Estado Global

El estado de la aplicación vive **exclusivamente en `App.jsx`** mediante `useState`. No se usa Context API, Redux, ni Zustand por ahora. Toda la data es volátil (se pierde al recargar).

```
App.jsx (estado central)
├── pacientes[]              ← Array de objetos paciente
│   ├── episodios[]          ← Cada paciente tiene N episodios
│   │   ├── evolucionesData[]
│   │   ├── recetasData[]
│   │   ├── estudiosData[]
│   │   └── solicitudesPaseData[]
│   ├── consideraciones[]
│   ├── antecedentes[]
│   └── observaciones
├── vistaActual              ← 'home' | 'detalle'
└── pacienteActualIndex      ← Índice del paciente activo
```

### Funciones de Mutación (definidas en App.jsx)

| Función | Propósito |
|---|---|
| `guardarPaciente(data)` | Crea un paciente nuevo y navega a su detalle |
| `actualizarPaciente(idx, data)` | Edita la ficha de un paciente existente |
| `agregarEpisodio(idx, data)` | Añade un episodio al paciente |
| `agregarEvolucion(pIdx, eIdx, data)` | Registra una evolución en un episodio |
| `darDeAlta(pIdx, eIdx)` | Cierra un episodio (estado → 'cerrado') |
| `agregarReceta(pIdx, eIdx, data)` | Crea una receta médica |
| `cambiarEstadoReceta(pIdx, eIdx, rIdx)` | Alterna estado vigente/vencida |
| `agregarEstudio(pIdx, eIdx, data)` | Registra un pedido de estudio |
| `agregarSolicitudPase(pIdx, eIdx, data)` | Crea una solicitud de pase |

### Navegación

La navegación es manual mediante `vistaActual`:
- `'home'` → Renderiza `<Home />`
- `'detalle'` → Renderiza `<PacienteDetalle />` con el paciente seleccionado

No se usa React Router. La navegación interna dentro de PacienteDetalle se maneja con estados locales (`tabActiva`, `subVistaEpisodio`, etc.).

---

## 🎨 Sistema de Diseño

### Paleta de Colores

| Color | Hex | Uso |
|---|---|---|
| Verde Oscuro (primario) | `#11352A` | Headers, botones, bordes de búsqueda |
| Verde Corporativo | `#259A5E` | Acentos, badges activos, tabs activas |
| Fondo General | `#F4F7F6` | Background de las páginas |
| Blanco | `#FFFFFF` | Cards, contenedores |
| Gris Borde | `#E0E0E0` | Bordes sutiles |
| Rojo Solicitar | `#C0392B` | Botón "Solicitar Internación" |

### Tipografía

- **Cuerpo**: `sans-serif` (system font stack)
- **Títulos del banner**: `Georgia, "Times New Roman", serif`
- **Sidebar logo**: Serif + ícono EKG SVG

### Iconografía

Se utiliza **react-icons** con dos familias:
- `react-icons/fi` (Feather Icons) — Para la mayoría de iconos UI
- `react-icons/fa` (Font Awesome) — Para iconos específicos como `FaBed`

**Iconos clave usados**:
- `FiUser` → Datos personales
- `FiActivity` → Resumen clínico / Evoluciones
- `FiAlertTriangle` → Consideraciones
- `FiClipboard` → Antecedentes / Episodios vacíos
- `FiEdit3` / `FiEdit2` → Observaciones / Editar ficha
- `FiCheckCircle` → Dar de alta
- `FiBed` / `FaBed` → Solicitar internación
- `FiPlusCircle` → Botones "Nuevo"
- `FiCalendar`, `FiCreditCard`, `FiFileText` → Metadata del paciente
- `FiLayers` → Pedidos de estudio
- `FiSend` → Solicitudes de pase

### Componentes UI Recurrentes

- **Barra de búsqueda unificada**: Input + botón con ícono de lupa, borde `#11352A`, border-radius `8-10px`. Presente en Home (header y body) y PacienteDetalle.
- **Tabs tipo clipboard**: Border-radius `8px`, fondo verde `#259A5E` cuando activa, gris `#E0E4E2` cuando inactiva.
- **Sub-tabs tipo pill/segmented control**: Contenedor gris `#F0F4F2` con tabs internas que se iluminan en blanco con sombra al estar activas.
- **Empty states**: Ícono grande gris + texto principal + subtexto de ayuda.
- **Formularios modales**: Construidos con `react-hook-form`, confirmación con `SweetAlert2`.

---

## 📐 Convenciones de Código

### Nombrado de Archivos
- **Pages**: `PascalCase.jsx` (ej: `NuevaEvolucion.jsx`)
- **Components**: `PascalCase.jsx` (ej: `Sidebar.jsx`)
- **Styles**: Mismo nombre que su componente, en `src/styles/` (ej: `NuevaEvolucion.css`)

### CSS
- Un archivo CSS por componente/page
- Nomenclatura BEM: `.bloque__elemento--modificador`
- Ejemplo: `.ep-detalle__subtab--activa`, `.detalle-btn--editar`

### IDs Únicos
- Los registros nuevos usan `Date.now()` como ID temporal
- **Importante**: Esto deberá migrar a UUIDs del backend cuando se integre la API

### Formularios
- Todos usan `react-hook-form` con `useForm()` y validaciones nativas (`required`, etc.)
- Feedback al usuario mediante `Swal.fire()` de SweetAlert2

---

## 🗺 Roadmap / Próximos Pasos

### Integración Backend (Prioridad Alta)
- [ ] Conectar con API FastAPI mediante `axios` o `fetch`
- [ ] Reemplazar funciones de estado local por llamadas HTTP en el flujo de laboratorio
- [ ] Consumir solo HCE para laboratorio, sin llamadas directas a M4
- [ ] Implementar autenticación JWT con `Authorization: Bearer <token>` en requests protegidas
- [ ] Cargar catálogos de laboratorio desde `GET /api/v1/m4/estudios`
- [ ] Consultar analitos solo como detalle complementario desde `GET /api/v1/m4/analitos?categoria=...`
- [ ] Crear órdenes de laboratorio con `POST /api/v1/pacientes/{id_paciente}/ordenes/laboratorio`
- [ ] Listar órdenes del paciente con `GET /api/v1/pacientes/{id_paciente}/ordenes`
- [ ] Ver resultados puntuales con `GET /api/v1/ordenes/{id_orden}/resultado?tipo_estudio=Laboratorio`
- [ ] Consultar historial cronológico con `GET /api/v1/pacientes/{id_paciente}/historial/resultados`
- [ ] Persistir datos en PostgreSQL

### Mejoras UI/UX
- [ ] Implementar React Router para navegación con URLs
- [ ] Agregar loading states y skeleton screens
- [ ] Manejo de errores global
- [ ] Selector de estudios de laboratorio con detalle de analitos opcional
- [ ] Lista de órdenes del paciente con estado y vista de resultado
- [ ] Historial cronológico de resultados de laboratorio

### Testing
- [ ] Tests unitarios con Vitest
- [ ] Tests de integración para formularios
- [ ] Validación con Zod (migrar desde validaciones básicas de RHF)

---

## ⚠️ Notas Importantes para Desarrolladores

1. **Estado volátil**: Todo vive en memoria. Al recargar la página se pierde toda la data. Esto es intencional hasta que se conecte el backend.

2. **Sin routing**: No hay React Router. La navegación se maneja con condicionales en `App.jsx`. Si necesitás agregar una nueva vista, modificá `vistaActual` y agregá el condicional correspondiente.

3. **CSS modular manual**: Cada componente tiene su propio `.css`. No se usa CSS Modules ni Tailwind. Respetá la convención BEM existente.

4. **Emojis eliminados**: Se migraron todos los emojis a `react-icons`. No uses emojis para iconos en UI, usá siempre componentes de `react-icons/fi` o `react-icons/fa`.

5. **SweetAlert2 para feedback**: Las confirmaciones de acciones destructivas (dar de alta, etc.) y los mensajes de éxito usan SweetAlert2, **no** `alert()` ni `window.confirm()`.

---

## 👥 Equipo

Para consultas sobre este proyecto, referirse al historial de cambios en `CHANGELOG.md`.
