# 📂 Guía Funcional de Vistas y Componentes — HealthGrid HCE

Este documento detalla el propósito, los campos de datos y la interactividad de cada vista (pantalla) y formulario del frontend de **HealthGrid - Historia Clínica Electrónica**. Sirve como guía de referencia funcional para desarrolladores, testers e integraciones con el backend.

---

## Índice de Vistas y Formularios

1. [🏠 Home / Dashboard de Búsqueda](#1-home--dashboard-de-búsqueda)
2. [👤 PacienteDetalle (Vista Principal del Paciente)](#2-pacientedetalle-vista-principal-del-paciente)
3. [📝 NuevaFichaMedica (Registro / Edición de Paciente)](#3-nuevafichamedica-registro--edición-de-paciente)
4. [📂 EpisodioDetalle (Gestión de Episodios Médicos)](#4-episodiodetalle-gestión-de-episodios-médicos)
5. [📈 NuevaEvolucion (Registro Clínico)](#5-nuevaevolucion-registro-clínico)
6. [🔍 EvolucionDetalle (Lectura de Evolución)](#6-evoluciondetalle-lectura-de-evolución)
7. [💊 NuevaReceta (Prescripción Médica)](#7-nuevareceta-prescripción-médica)
8. [🔬 NuevoPedidoEstudio (Orden de Estudios)](#8-nuevopedidoestudio-orden-de-estudios)
9. [📊 PedidoEstudioDetalle (Lectura de Resultados)](#9-pedidoestudiodetalle-lectura-de-resultados)
10. [🏥 SolicitarInternacion (Pedido de Internación)](#10-solicitarinternacion-pedido-de-internación)
11. [🔄 NuevaSolicitudPase (Traslado de Cama / Sector)](#11-nuevasolicitudpase-traslado-de-cama--sector)

---

## 1. Home / Dashboard de Búsqueda

* **Archivo:** `src/pages/Home.jsx`
* **Propósito:** Es la pantalla de inicio del portal clínico. Centraliza el acceso a las historias clínicas existentes y sirve como punto de partida para registrar nuevos pacientes.
* **Funcionalidad:**
  * **Búsqueda Reactiva (Live Search):** Permite buscar pacientes ingresando los primeros dígitos o letras del **DNI, Nombre o Número de Historia Clínica**. Filtra instantáneamente y muestra los resultados en un listado sin necesidad de presionar la tecla "Enter" ni cliquear el botón de lupa.
  * **Listado de Resultados:** Muestra tarjetas de pacientes con su nombre, DNI, número de HC, estado de actividad clínico (ej. *Activo*) y un avatar circular con sus iniciales.
  * **Acceso Rápido:** Al hacer clic en un paciente del listado de búsqueda, el sistema navega inmediatamente a la vista de `PacienteDetalle`.
  * **Acceso a Alta:** Contiene un botón prominente `+ NUEVA FICHA MÉDICA` que abre el formulario de registro para pacientes que no figuran en el sistema.

---

## 2. PacienteDetalle (Vista Principal del Paciente)

* **Archivo:** `src/pages/PacienteDetalle.jsx` y `src/styles/PacienteDetalle.css`
* **Propósito:** Panel unificado del expediente clínico de un paciente seleccionado. Se divide en dos pestañas principales estructuradas bajo el diseño de un **portapapeles médico (Clipboard)**.
* **Funcionalidad:**
  * **Cabecera del Expediente:** Muestra de forma fija la información demográfica clave del paciente (Nombre, Edad calculada automáticamente a partir de la fecha de nacimiento, DNI, Nro. de Historia Clínica) con íconos vectoriales claros para cada dato.
  * **Búsqueda Rápida en Topbar:** Un buscador superior reactivo que permite buscar y saltar directamente a otro paciente mediante un menú desplegable de sugerencias rápidas, sin tener que volver a la pantalla de inicio.
  * **Pestaña "Ficha Médica" (Activa por defecto):**
    * **Resumen Clínico Básico:** Bloque que resalta el grupo sanguíneo y las alertas médicas urgentes (Alergias o condiciones de riesgo con etiquetas coloreadas).
    * **Datos Personales:** Información de contacto (Teléfono, Correo, Domicilio) y Contacto de Emergencia con su relación familiar.
    * **Consideraciones Médicas:** Tabla de Alergias, Implantes, Condiciones y Contraindicaciones con sus respectivas reacciones.
    * **Antecedentes:** Historial Quirúrgico, Patológico, Familiar, Hábitos y registros de Internación previos.
    * **Observaciones:** Notas clínicas generales escritas por los profesionales.
  * **Acciones de Cabecera:**
    * `Actualizar / Editar Ficha`: Abre el modal `NuevaFichaMedica` precargado con los datos del paciente actual.
    * `Nuevo Registro`: Vuelve automáticamente a la pantalla de inicio (`Home`) con el formulario de nueva ficha médica abierto e iniciado.

---

## 3. NuevaFichaMedica (Registro / Edición de Paciente)

* **Archivo:** `src/pages/NuevaFichaMedica.jsx`
* **Propósito:** Formulario de captura estructurado para dar de alta a un paciente o actualizar los datos del mismo.
* **Funcionalidad:**
  * **Uso de React Hook Form:** Controla el estado local del formulario de manera limpia y eficiente.
  * **Campos Básicos:** DNI, Historia Clínica, Nombre y Apellido, Fecha de Nacimiento (con selector de calendario), Sexo (dropdown), Teléfono, Correo, Domicilio, Grupo Sanguineo (dropdown), Contacto de Emergencia y Observaciones generales.
  * **Formularios Dinámicos (Field Arrays):**
    * **Consideraciones:** Permite agregar múltiples filas con dropdown de tipo (Alergia, Implante, Condición, Contraindicación), descripción de la misma y el detalle de la reacción.
    * **Antecedentes:** Permite agregar múltiples filas dinámicas especificando el tipo (Quirúrgico, Patológico, Familiar, Hábito, Internación, Otro), descripción, fecha del suceso y observaciones.
  * **Modos de Operación:** Funciona de forma dual. Si recibe `datosIniciales`, se inicializa en modo edición (precargando la ficha actual); de lo contrario, se abre con todos los campos en blanco listos para registrar.

---

## 4. EpisodioDetalle (Gestión de Episodios Médicos)

* **Archivo:** `src/pages/EpisodioDetalle.jsx` y `src/styles/EpisodioDetalle.css`
* **Propósito:** Componente contenedor de las actividades y registros clínicos vinculados a un episodio específico (una internación o un ciclo de consultas ambulatorias).
* **Funcionalidad:**
  * **Detalle del Episodio:** Muestra el número de episodio, fecha de apertura, estado (abierto/cerrado), motivo de consulta e indicador de tipo (Ambulatorio / Internado).
  * **Barra de Sub-pestañas "Pill-Style":** Control segmentado interactivo con sombras suaves para navegar entre las distintas áreas del episodio:
    1. **Evoluciones:** Historial de notas diarias o de control del médico.
    2. **Recetas:** Prescripciones farmacológicas indicadas.
    3. **Pedidos de Estudio:** Exámenes diagnósticos ordenados.
    4. **Solicitudes de Pase:** Derivaciones de sector/cama (solo visible y habilitado si el episodio es de tipo **internado**).
  * **Acciones del Episodio:**
    * **Dar de Alta:** Botón para cerrar el episodio asignando una fecha de alta (utiliza confirmación de *SweetAlert2*).
    * **Solicitar Internación:** Abre el modal para derivar a un paciente ambulatorio hacia internación.
    * **Nuevo Registro (Evolución, Receta, Pedido, Pase):** Botones dinámicos según la sub-pestaña seleccionada para abrir sus respectivos formularios de carga.
  * **Estados Vacíos (Empty States):** Si el episodio no tiene registros cargados en alguna sub-pestaña, renderiza una interfaz limpia con un ícono ilustrativo descriptivo (ej: una ampolla para recetas vacías o un estetoscopio para evoluciones) sugiriendo al profesional iniciar una carga.

---

## 5. NuevaEvolucion (Registro Clínico)

* **Archivo:** `src/pages/NuevaEvolucion.jsx`
* **Propósito:** Formulario modal para ingresar la evolución diaria o el estado clínico actual del paciente dentro de un episodio.
* **Funcionalidad:**
  * **Campos del Formulario:**
    * **Tipo de Consulta:** Dropdown con opciones (Consulta de Control, Consulta de Urgencia, Interconsulta, Control de Laboratorio, Seguimiento, Otro).
    * **Fecha y Hora:** Selector temporal autocompletado con la hora actual del sistema.
    * **Profesional Firmante:** Campo pre-completado con el nombre del médico activo (ej. *Dr. Santiago Rossi — Jefe de Guardia*).
    * **Subjetivo / Objetivo (Motivo y Estado):** Textarea detallado para que el médico describa los síntomas y el estado físico actual del paciente.
    * **Diagnóstico:** Campo de texto para indicar el juicio clínico o patología detectada.
    * **Plan y Tratamiento:** Área de indicaciones, reposo o terapias indicadas.
    * **Observaciones Adicionales:** Notas de control secundarias.
  * **Feedback Visual:** Al guardar con éxito, dispara una alerta animada de *SweetAlert2* de 2 segundos que confirma el registro del evento en la historia clínica.

---

## 6. EvolucionDetalle (Lectura de Evolución)

* **Archivo:** `src/pages/EvolucionDetalle.jsx`
* **Propósito:** Pantalla de visualización estática tipo "documento firmado" que permite leer en detalle una evolución previamente registrada.
* **Funcionalidad:**
  * **Visualización de Contrato:** Presenta los campos ordenados en bloques limpios que simulan una hoja membretada de evolución de guardia.
  * **Firma del Profesional:** Resalta al final del documento el nombre, cargo y fecha/hora exacta en la que el profesional realizó y guardó la evolución en el sistema, garantizando la trazabilidad.

---

## 7. NuevaReceta (Prescripción Médica)

* **Archivo:** `src/pages/NuevaReceta.jsx` y `src/styles/NuevaReceta.css`
* **Propósito:** Formulario dinámico para la prescripción de fármacos y tratamientos farmacológicos a pacientes.
* **Funcionalidad:**
  * **Medicamentos Dinámicos:** Permite prescribir varios medicamentos en una sola receta. Posee un botón `+ Agregar Medicamento` que añade dinámicamente un par de campos: *Nombre/Dosis* y *Indicaciones* (frecuencia, vía y duración).
  * **Vincular Evolución:** Permite asociar opcionalmente la receta a una de las evoluciones médicas registradas previamente en el episodio actual, facilitando la auditoría clínica.
  * **Campos de Control:** Fecha de emisión y observaciones complementarias de la receta.
  * **Validación:** Impide guardar si no se ingresó al menos un medicamento válido.

---

## 8. NuevoPedidoEstudio (Orden de Estudios)

* **Archivo:** `src/pages/NuevoPedidoEstudio.jsx`
* **Propósito:** Formulario para ordenar estudios de diagnóstico médico complementarios.
* **Funcionalidad:**
  * **Campos:**
    * **Tipo de Estudio:** Dropdown para clasificar la orden (Laboratorio, Imágenes, Cardiología, Neurología, Otro).
    * **Fecha de Solicitud:** Selector de fecha y hora pre-completado.
    * **Evolución Asociada:** Selector para vincular la orden con la consulta o evolución que motivó la solicitud del estudio.
    * **Descripción:** Cuadro de texto amplio para detallar los estudios específicos (ej: *Hemograma completo, Rx de tórax frente y perfil*).
    * **Estado Inicial:** Se inicializa por defecto como `Pendiente`.
  * **Guardado:** Notifica el registro con confirmación visual mediante SweetAlert2.

---

## 9. PedidoEstudioDetalle (Lectura de Resultados)

* **Archivo:** `src/pages/PedidoEstudioDetalle.jsx`
* **Propósito:** Visualización de la orden de estudio clínico y, si está completado, visualización de los resultados e informes cargados por los servicios de apoyo (Laboratorio, Diagnóstico por Imágenes).
* **Funcionalidad:**
  * **Estado de la Orden:** Muestra de forma destacada el estado del estudio (`Pendiente` o `Completado`).
  * **Datos del Informe (Modo Completado):**
    * Código externo de referencia del laboratorio o centro de imágenes.
    * Profesional Bioquímico/Médico especialista firmante del resultado.
    * Fecha de carga del informe.
    * **Informe Textual:** Cuadro con la transcripción completa de los resultados del estudio.
    * **Archivos Adjuntos:** Sección preparada para mostrar documentos o imágenes médicas vinculadas (preparado para integrarse con repositorios de archivos).

---

## 10. SolicitarInternacion (Pedido de Internación)

* **Archivo:** `src/pages/SolicitarInternacion.jsx` y `src/styles/SolicitarInternacion.css`
* **Propósito:** Formulario modal de urgencia para derivar y solicitar la internación en cama de un paciente que actualmente se encuentra bajo consulta ambulatoria.
* **Funcionalidad:**
  * **Campos:**
    * **Sector de Destino:** Dropdown con sectores de internación (UCI, UTI, Guardia-Observación, Maternidad, Pisos de Clínica Médica/General/Cirugía, etc.).
    * **Prioridad y Motivo:** Textarea para justificar clínicamente la necesidad de cama (ej. *Criterio de neumonía grave, requerimiento de oxigenoterapia*).
    * **Fecha y Hora Sugerida:** Selector temporal de la derivación.
  * **Confirmación Destructiva/Estado:** Dispara una alerta SweetAlert2 con color de marca verde y actualiza el estado del paciente o episodio para habilitar el traslado.

---

## 11. NuevaSolicitudPase (Traslado de Cama / Sector)

* **Archivo:** `src/pages/NuevaSolicitudPase.jsx` y `src/styles/NuevaSolicitudPase.css`
* **Propósito:** Solicitar el traslado físico de un paciente internado de una cama/sector a otro (por ejemplo, pase de terapia intensiva a sala común).
* **Funcionalidad:**
  * **Campos:**
    * **Sector de Destino:** Dropdown con sectores habilitados en la clínica (Piso 3 - Cirugía, UTI, Guardia, etc.).
    * **Prioridad / Motivo del Pase:** Campo requerido donde el profesional detalla la causa clínica del traslado (ej: *Post-operatorio inmediato, mejoría del cuadro general*).
    * **Fecha/Hora Sugerida:** Cuándo se requiere realizar el traslado físico del paciente.
  * **Validación:** El campo de motivo cuenta con validaciones activas mediante react-hook-form para evitar solicitudes vacías o incompletas.
