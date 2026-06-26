// src/utils/helpers.js

/**
 * Sectores / servicios de destino para solicitudes de internación y pase de cama.
 * Lista única compartida por ambos formularios para que no diverjan.
 */
export const SECTORES_DESTINO = [
  'Piso 1 — Clínica General',
  'Piso 2 — Clínica Médica',
  'Piso 3 — Cirugía',
  'Piso 4 — Pediatría',
  'UCI — Unidad de Cuidados Intensivos',
  'UTI — Unidad de Terapia Intensiva',
  'Guardia — Observación',
  'Quirófano',
  'Maternidad',
  'Cardiología',
  'Neurología',
  'Traumatología',
];

/**
 * Deriva el número de Historia Clínica a partir del core_patient_id.
 * El HC del paciente es su id numérico (ej: "core-002" → "2"). El backend no
 * persiste un numeroHistoriaClinica aparte, así que el id ES la HC.
 * @param {string|number} corePatientId
 * @returns {string}
 */
export const formatearNumeroHC = (corePatientId) => {
  if (corePatientId === null || corePatientId === undefined || corePatientId === '') return '—';
  const limpio = String(corePatientId).replace('core-', '').replace(/^0+/, '');
  return limpio || '—';
};

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {string} fechaNacimiento 
 * @returns {number|string}
 */
export const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return '—';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

/**
 * Formatea una fecha a DD/MM/YYYY
 * @param {string|Date} fecha 
 * @returns {string}
 */
export const formatearFecha = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/**
 * Formatea una fecha a DD de [Nombre Mes] de YYYY
 * @param {string|Date} fecha 
 * @returns {string}
 */
export const formatearFechaLarga = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

/**
 * Formatea una fecha a DD [Mes corto] YYYY · HH:mm hs
 * @param {string|Date} fecha 
 * @returns {string}
 */
export const formatearFechaCorta = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = d.toLocaleDateString('es-ES', { month: 'short' });
  const anio = d.getFullYear();
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} ${mes} ${anio} · ${hora} hs`;
};

/**
 * Formatea fecha y hora completa en español de Argentina
 * @param {string|Date} fecha 
 * @returns {string}
 */
export const formatearFechaHoraLarga = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = d.toLocaleDateString('es-ES', { month: 'long' });
  const anio = d.getFullYear();
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} de ${mes} de ${anio}, ${hora} hs`;
};

/**
 * Devuelve la etiqueta amigable para los tipos de consulta
 * @param {string} tipo 
 * @returns {string}
 */
export const tipoConsultaLabel = (tipo) => {
  const mapa = {
    consulta_control: 'Consulta de Control',
    consulta_urgencia: 'Consulta de Urgencia',
    interconsulta: 'Interconsulta',
    control_laboratorio: 'Control de Laboratorio',
    seguimiento: 'Seguimiento',
    otro: 'Otro',
  };
  return mapa[tipo] || tipo || 'Consulta';
};

/**
 * Devuelve la etiqueta en mayúscula para tipos de consideración o antecedente
 * @param {string} tipo 
 * @returns {string}
 */
export const capitalizarTipo = (tipo) => {
  if (!tipo) return '';
  const mapa = {
    alergia: 'Alergia',
    implante: 'Implante',
    condicion: 'Condición',
    contraindicacion: 'Contraindicación',
    quirurgico: 'Quirúrgico',
    familiar: 'Familiar',
    patologico: 'Patológico',
    habito: 'Hábito',
    internacion: 'Internación',
    otro: 'Otro',
  };
  return mapa[tipo] || tipo;
};

/**
 * Obtiene las iniciales de un nombre completo (ej: "Juan Pérez" -> "JP")
 * @param {string} nombre 
 * @returns {string}
 */
export const obtenerIniciales = (nombre) => {
  if (!nombre) return '??';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[partes.length - 1][0] + partes[0][0]).toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
};

/**
 * Obtiene las iniciales del nombre de un profesional, filtrando prefijos médicos
 * @param {string} nombre 
 * @returns {string}
 */
export const obtenerInicialesProfesional = (nombre) => {
  if (!nombre) return '??';
  const partes = nombre.replace(/^(Dr\.|Dra\.)\s*/i, '').split('—')[0].trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
};

/**
 * Limpia y devuelve solo el nombre del profesional
 * @param {string} profesional 
 * @returns {string}
 */
export const obtenerNombreProfesional = (profesional) => {
  if (!profesional) return 'Profesional';
  return profesional.split('—')[0].replace(/^(Dr\.|Dra\.)\s*/i, '').trim();
};

/**
 * Devuelve la especialidad o rol del profesional si existe tras el guión largo (—)
 * @param {string} profesional 
 * @returns {string}
 */
export const obtenerRolProfesional = (profesional) => {
  if (!profesional) return '';
  const partes = profesional.split('—');
  return partes.length > 1 ? partes[1].trim() : '';
};
