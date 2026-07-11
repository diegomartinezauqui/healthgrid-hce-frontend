# 🏥 Health Grid — Historia Clínica Electrónica (Frontend)

> Sistema integrado de gestión de historias clínicas electrónicas, desarrollado para la materia **Desarrollo de Aplicaciones II**.

[![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Descripción

HealthGrid HCE es el módulo frontend del sistema **Health Grid**. Permite a profesionales de la salud gestionar el ciclo de vida clínico completo de un paciente:

- 📝 **Ficha Médica** — Registro y edición de datos personales, antecedentes, consideraciones y observaciones.
- 📂 **Episodios Clínicos** — Creación, seguimiento y alta de episodios ambulatorios e internados.
- 📊 **Evoluciones** — Documentación cronológica de cada consulta dentro de un episodio.
- 💊 **Recetas** — Prescripciones médicas con control de estado (vigente / vencida).
- 🔬 **Pedidos de Estudios** — Órdenes de laboratorio e imágenes con seguimiento de estado.
- 🏥 **Solicitud de Internación** — Formulario de pedido de cama e internación.
- 🔄 **Solicitudes de Pase** — Derivaciones entre servicios u hospitales.

---

## 🛠 Stack Tecnológico

| Tecnología | Versión | Uso |
|---|---|---|
| [React](https://react.dev/) | 19.x | Librería de interfaces de usuario |
| [Vite](https://vitejs.dev/) | 8.x | Bundler y servidor de desarrollo (HMR) |
| [react-hook-form](https://react-hook-form.com/) | 7.x | Gestión y validación de formularios |
| [react-icons](https://react-icons.github.io/react-icons/) | 5.x | Iconografía (Feather Icons + Font Awesome) |
| [SweetAlert2](https://sweetalert2.github.io/) | 11.x | Alertas, confirmaciones y feedback al usuario |
| CSS Vanilla | — | Estilos modulares por componente (convención BEM) |

---

## 🚀 Instalación y Ejecución

### Prerrequisitos

- **Node.js** v18 o superior ([descargar](https://nodejs.org/))

```bash
node -v   # Verificar versión instalada
```

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/diegomartinezauqui/healthgrid-hce-frontend.git

# 2. Entrar al directorio del proyecto
cd healthgrid-hce-frontend/healthgrid-hce-frontend

# 3. Instalar dependencias
npm install

# 4. Levantar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5174/`.
Vite soporta **Hot Module Replacement (HMR)**, por lo que cualquier cambio se refleja en tiempo real.

---

## 📁 Estructura del Proyecto

```
healthgrid-hce-frontend/
├── src/
│   ├── App.jsx                     # Componente raíz — Estado global y navegación
│   ├── App.css                     # Estilos del layout principal
│   ├── main.jsx                    # Entry point (React + Vite)
│   ├── index.css                   # Reset CSS y fuentes base
│   │
│   ├── components/
│   │   └── Sidebar.jsx             # Barra lateral de navegación
│   │
│   ├── pages/
│   │   ├── Home.jsx                # Dashboard con búsqueda y registro
│   │   ├── PacienteDetalle.jsx     # Ficha médica + episodios del paciente
│   │   ├── NuevaFichaMedica.jsx    # Formulario de registro/edición
│   │   ├── NuevoEpisodio.jsx       # Crear episodio clínico
│   │   ├── EpisodioDetalle.jsx     # Detalle del episodio (sub-tabs)
│   │   ├── NuevaEvolucion.jsx      # Formulario de evolución
│   │   ├── EvolucionDetalle.jsx    # Vista de lectura de evolución
│   │   ├── NuevaReceta.jsx         # Formulario de prescripción
│   │   ├── NuevoPedidoEstudio.jsx  # Formulario de pedido de estudio
│   │   ├── PedidoEstudioDetalle.jsx# Vista detallada de estudio
│   │   ├── SolicitarInternacion.jsx# Solicitud de internación
│   │   └── NuevaSolicitudPase.jsx  # Solicitud de pase/derivación
│   │
│   └── styles/                     # Un .css por cada componente (BEM)
│       ├── Sidebar.css
│       ├── PacienteDetalle.css
│       ├── EpisodioDetalle.css
│       └── ... (12 archivos)
│
├── CHANGELOG.md                    # Bitácora de cambios del proyecto
├── package.json
└── vite.config.js
```

---

## 🏗 Arquitectura

### Estado Global

El estado vive en `App.jsx` mediante `useState`. Toda la data es **volátil** (se pierde al recargar) hasta que se integre con el backend.

```
App.jsx
├── pacientes[]
│   ├── episodios[]
│   │   ├── evolucionesData[]
│   │   ├── recetasData[]
│   │   ├── estudiosData[]
│   │   └── solicitudesPaseData[]
│   ├── consideraciones[]
│   ├── antecedentes[]
│   └── observaciones
├── vistaActual → 'home' | 'detalle'
└── pacienteActualIndex
```

### Navegación

No se usa React Router. La vista se controla con `vistaActual` en `App.jsx`:
- `'home'` → `<Home />`
- `'detalle'` → `<PacienteDetalle />`

La navegación interna (tabs, sub-vistas) se maneja con estados locales en cada componente.

---

## 🎨 Identidad Visual

| Elemento | Valor |
|---|---|
| **Verde Oscuro (primario)** | `#11352A` |
| **Verde Corporativo** | `#259A5E` |
| **Fondo General** | `#F4F7F6` |
| **Rojo Internación** | `#C0392B` |
| **Iconografía** | `react-icons/fi` (Feather) + `react-icons/fa` |
| **Logo** | Tipografía serif + ícono EKG SVG |

---

## 🗺 Roadmap

- [ ] **Integración API** — Conectar con backend FastAPI + PostgreSQL
- [ ] **Autenticación** — JWT para login y permisos
- [ ] **React Router** — Navegación por URLs
- [ ] **Upload de archivos** — Adjuntos en Pedidos de Estudios
- [ ] **Testing** — Vitest + validaciones con Zod

---

## 📝 Changelog

Consultá el archivo [`CHANGELOG.md`](healthgrid-hce-frontend/CHANGELOG.md) para ver la bitácora completa de cambios del proyecto.

---

## 👥 Equipo — Desarrollo de Aplicaciones II

Proyecto académico desarrollado como parte del sistema integrado **Health Grid**.
