# Documentación Técnica: HealthGrid HCE Frontend

Esta documentación describe la arquitectura, la estructura de datos, el flujo de navegación y los aspectos clave del frontend de la aplicación **HealthGrid - Historia Clínica Electrónica (HCE)**. Está dirigida al equipo de desarrollo con el objetivo de facilitar la comprensión del sistema actual y guiar la futura integración con el Backend.

---

## 1. Arquitectura y Stack Tecnológico

El proyecto está concebido como una **Single Page Application (SPA)** de alto rendimiento y diseño clínico premium.

* **Core:** React 19.2 (utiliza el runtime de JSX moderno).
* **Herramientas de Construcción:** Vite 8.0.
* **Gestor de Paquetes:** pnpm.
* **Manejo de Formularios:** `react-hook-form` (para inputs dinámicos y validaciones de cliente).
* **Librería de Iconos:** `react-icons` (paquetes Feather Icons `Fi` y FontAwesome `Fa`).
* **Mensajes e Interacciones:** `sweetalert2` (modales de confirmación y feedback).
* **Estilos:** CSS de vainilla modularizado por páginas y componentes.

---

## 2. Estructura de Directorios

El código fuente se organiza de la siguiente manera dentro de la carpeta `src/`:

```text
src/
├── assets/          # Recursos estáticos (imágenes, logos)
├── components/      # Componentes reutilizables globales
│   └── Sidebar.jsx  # Barra de navegación lateral fija
├── pages/           # Vistas y páginas principales
│   ├── Home.jsx                 # Dashboard de búsqueda e inicio de paciente
│   ├── PacienteDetalle.jsx      # Panel unificado del paciente (Ficha + Episodios)
│   ├── EpisodioDetalle.jsx      # Detalle de un episodio médico (Evoluciones, Recetas, etc.)
│   ├── EvolucionDetalle.jsx     # Visualización individual de una evolución
│   ├── PedidoEstudioDetalle.jsx # Resultados y metadatos de un estudio médico
│   ├── NuevaFichaMedica.jsx     # Formulario de alta/edición de datos del paciente
│   ├── NuevoEpisodio.jsx        # Apertura de episodio clínico (Ambulatorio/Internado)
│   ├── NuevaEvolucion.jsx       # Registro de evolución médica diaria o de control
│   ├── NuevaReceta.jsx          # Emisión de recetas (dinámico por medicamentos)
│   ├── NuevoPedidoEstudio.jsx   # Orden de estudios clínicos (laboratorio, imágenes, etc.)
│   ├── SolicitarInternacion.jsx # Modal para derivar paciente a internación
│   └── NuevaSolicitudPase.jsx   # Solicitud de traslado de cama o sector
├── styles/          # Hojas de estilo CSS asociadas a componentes y páginas
├── App.jsx          # Estado en memoria global y enrutador base
├── main.jsx         # Punto de entrada de la aplicación
└── index.css        # Estilos globales y reset
```

---

## 3. Flujo de Datos y Estado Global (Mock en Memoria)

Actualmente, **toda la información es volátil y reside en el estado del cliente** dentro de [App.jsx](file:///c:/Users/monti/Desktop/Desarrollo_de_apps_ii/healthgrid-hce-frontend/hce-frontend/healthgrid-hce-frontend/healthgrid-hce-frontend/src/App.jsx):

1. **`pacientes` (Array):** Almacena la lista de pacientes registrados con sus correspondientes historias clínicas, episodios, evoluciones, recetas y solicitudes.
2. **`vistaActual` (String):** Determina qué pantalla principal renderizar (`'home'` o `'detalle'`).
3. **`pacienteActualIndex` (Number):** El índice dentro del array `pacientes` que se está visualizando activamente.

Las operaciones de guardado y actualización se transmiten mediante **callbacks** desde `App.jsx` hacia los componentes hijos (`PacienteDetalle` -> `EpisodioDetalle` -> Modales de creación).

---

## 4. Esquema de Datos de Pacientes (Data Contracts)

Para el equipo del backend, la estructura de datos simulada en el frontend es la siguiente:

### Paciente
```json
{
  "id": 1717596280000,
  "fechaRegistro": "2026-06-05T22:21:00.000Z",
  "estado": "Activo",
  "dni": "28456123",
  "numeroHistoriaClinica": "482",
  "nombreApellido": "María Elena Martínez",
  "fechaNacimiento": "1980-04-12",
  "sexo": "femenino",
  "telefono": "+54 11 4823-9017",
  "correo": "maria.martinez@gmail.com",
  "domicilio": "Av. Santa Fe 3420, CABA",
  "grupoSanguineo": "O+",
  "contactoEmergencia": "Juan Pérez (Esposo) - 11-5555-4321",
  "observaciones": "Notas generales clínicas...",
  "consideraciones": [
    {
      "tipo": "alergia",
      "descripcion": "Penicilina",
      "detalleReaccion": "Shock anafiláctico"
    }
  ],
  "antecedentes": [
    {
      "tipo": "quirurgico",
      "nombreDescripcion": "Apendicectomía",
      "fecha": "2015-08-20",
      "observaciones": "Sin complicaciones"
    }
  ],
  "episodios": [] // Array de Episodios
}
```

### Episodio Clínico
```json
{
  "id": 1717596320000,
  "numero": 1,
  "tipoEpisodio": "ambulatorio", // "ambulatorio" | "internado"
  "estado": "abierto", // "abierto" | "cerrado"
  "fechaApertura": "2026-06-05T15:30:00.000Z",
  "fechaAlta": null,
  "motivo": "Control de hipertensión",
  "evolucionesData": [],      // Array de Evoluciones
  "recetasData": [],          // Array de Recetas
  "estudiosData": [],         // Array de Pedidos de Estudios
  "solicitudesPaseData": []   // Array de Solicitudes de Pase
}
```

---

## 5. Alertas de Integración con el Backend (Transición de Mock a API)

Al conectar esta interfaz a un servicio REST o GraphQL, se deben considerar los siguientes desafíos técnicos:

### ⚠️ Alerta 1: Latencia y Manejo de Estados de Carga (Async UX)
* **Estado actual:** El guardado y cierre de formularios es síncrono e instantáneo.
* **Alerta Backend:** Las llamadas de red introducen latencia (200ms - 2s). Se deben añadir indicadores visuales de carga (`loading spinners`), deshabilitar botones de envío (`disabled={isSubmitting}`) para evitar peticiones duplicadas, e implementar notificaciones de error si el servidor falla (ej: error 500 o fallas de conexión).

### ⚠️ Alerta 2: Cambio en la Estrategia de IDs
* **Estado actual:** El frontend genera IDs en caliente usando `Date.now()`.
* **Alerta Backend:** Los IDs deben ser provistos por el backend (UUID o autoincrementales de base de datos) al realizar el `POST`. La interfaz debe esperar la respuesta del servidor antes de renderizar la redirección o añadir el elemento a la lista local con su ID final.

### ⚠️ Alerta 3: Búsqueda y Paginación en Servidor
* **Estado actual:** Se asume que todos los datos están en memoria local.
* **Alerta Backend:** Con miles de historias clínicas, es imposible traer todo al cliente. La barra de búsqueda de pacientes en el Home debe consultar a un endpoint (ej: `GET /api/pacientes?search=DNI`). Se sugiere implementar un mecanismo de **Debounce** (tiempo de espera al escribir) en los inputs para evitar saturar al backend con peticiones en cada pulsación de tecla.

### ⚠️ Alerta 4: Autenticación, JWT e Identidad del Profesional
* **Estado actual:** El perfil del usuario firmante está hardcodeado en el sidebar (`Dr. Santiago Rossi`) y se autocompleta en el formulario de evoluciones.
* **Alerta Backend:** Se debe implementar un flujo de inicio de sesión (Login) para obtener un token JWT. Este token debe almacenarse de forma segura (ej. cookies HttpOnly o localStorage) y ser enviado en el encabezado `Authorization: Bearer <token>` de cada consulta API. Las firmas del profesional deben autocompletarse con los datos del JWT decodificado del usuario activo.

### ⚠️ Alerta 5: Formato de Fechas y Zonas Horarias
* **Estado actual:** Se mezclan cadenas ISO (`new Date().toISOString()`), formatos locales recortados (`YYYY-MM-DDTHH:mm`) y textos formateados.
* **Alerta Backend:** Se debe estandarizar el contrato de intercambio de fechas. Se recomienda usar siempre cadenas completas en formato **UTC (ISO 8601)** para las transferencias de red, y delegar el formateo visual localizado únicamente en los componentes de React utilizando librerías como `date-fns` o la API nativa `Intl.DateTimeFormat`.

### ⚠️ Alerta 6: Validación de Campos y Errores de Negocio
* **Estado actual:** La validación se realiza de forma simple en el cliente con `react-hook-form`.
* **Alerta Backend:** Ciertas reglas de negocio solo pueden validarse en la base de datos (por ejemplo, duplicidad de DNI o número de historia clínica). El frontend debe estar preparado para capturar errores de validación HTTP 400/422 y asociar el mensaje de error directamente al campo correspondiente en el formulario para guiar al usuario.

---

## 6. Próximos Pasos en el Desarrollo del Frontend

Para avanzar hacia la integración final con el backend, se sugieren las siguientes mejoras en el código:

1. **Centralización del Estado:** Migrar el estado de pacientes en `App.jsx` hacia un Contexto Global (`src/context/PacienteContext.jsx`) o Store de Zustand.
2. **Modularización de Utilidades:** Mover las funciones auxiliares de formato de fecha e iniciales a un archivo unificado `src/utils/helpers.js` para respetar el principio DRY.
3. **Capa de Servicios API:** Crear clientes HTTP dedicados utilizando Axios o Fetch (ej: `src/services/pacienteService.js`) que encapsulen las peticiones web y faciliten el cambio de mock a producción.
4. **Diseño de Hojas de Estilo:** Centralizar los colores del sistema en variables de CSS nativas en `index.css` para evitar el hardcodeo de códigos hexadecimales.
