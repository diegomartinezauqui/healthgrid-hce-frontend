// src/services/salaEsperaService.js
import api from './api';
import { getAgendaDelDia, actualizarEstadoTurno, salaEsperaMock } from './mockSalaEspera';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
const ID_MEDICO_ACTUAL = 42;
const ID_SEDE_ACTUAL = 3;

// Mapeadores para aislar el modelo del backend respecto a las pantallas del frontend
const mapPrioridadToTriage = (prioridad) => {
  if (prioridad === 3) return 'Rojo';
  if (prioridad === 2) return 'Amarillo';
  return 'Verde';
};

const mapTriageToPrioridad = (triage) => {
  if (triage === 'Rojo') return 3;
  if (triage === 'Amarillo') return 2;
  return 1;
};

const mapEstadoToFrontend = (estado) => {
  if (!estado) return estado;
  const normalized = estado.toString().trim().toLowerCase();
  if (normalized === 'esperando') return 'En espera';
  if (normalized === 'atendiendo' || normalized === 'atendido') return 'En atención';
  if (normalized === 'finalizado') return 'Atendido';
  return estado; // 'En triage', 'Ausente'
};

const mapTipoAtencion = (tipoAtencion, idTurnoM2) => {
  if (!tipoAtencion) {
    return idTurnoM2 ? 'Consultorio' : 'Guardia';
  }
  const mapa = {
    consultorio: 'Consultorio',
    guardia: 'Guardia',
    cirugia: 'Cirugía',
    demanda_espontanea: 'Demanda Espontánea'
  };
  return mapa[tipoAtencion.toString().trim().toLowerCase()] || tipoAtencion;
};

const mapTurnoRealToFrontend = (turnoReal) => {
  // Manejo de la información de paciente que manda el backend
  const idPacienteRaw = turnoReal.id_paciente;
  const stringId = typeof idPacienteRaw === 'string' && idPacienteRaw.startsWith('core-') 
    ? idPacienteRaw 
    : `core-00${idPacienteRaw}`;

  const pacienteObj = turnoReal.paciente || {};
  const datosPersonales = pacienteObj.datos_personales || {};
  const nombre = datosPersonales.nombre || '';
  const apellido = datosPersonales.apellido || '';
  const nombreApellido = `${nombre} ${apellido}`.trim() || `Paciente #${idPacienteRaw}`;
  const dni = datosPersonales.dni || '—';

  return {
    id_espera: turnoReal.id_espera,
    estado: mapEstadoToFrontend(turnoReal.estado),
    nivel_triage: mapPrioridadToTriage(turnoReal.prioridad),
    motivo: turnoReal.motivo || '-',
    hora_llegada: turnoReal.fecha_llegada,
    horario_turno: turnoReal.fecha_turno,
    tipo_atencion: mapTipoAtencion(turnoReal.tipo_atencion, turnoReal.id_turno_m2),
    sector: turnoReal.id_turno_m2 ? 'Cardiología' : 'Clínica Médica', // Fallbacks visuales
    consultorio: turnoReal.consultorio,
    paciente: {
      core_patient_id: stringId,
      nombreApellido,
      dni
    }
  };
};


export const salaEsperaService = {
  /**
   * Obtiene la lista de pacientes de la sala de espera para el médico actual.
   */
  listar: async () => {
    if (useMocks) {
      await new Promise(r => setTimeout(r, 150)); // Simulación latencia
      return getAgendaDelDia('prof-001');
    }

    try {
      const data = await api.get('/sala-espera', {
        params: { id_medico: ID_MEDICO_ACTUAL, id_sede: ID_SEDE_ACTUAL }
      });
      return Array.isArray(data) ? data.map(mapTurnoRealToFrontend) : [];
    } catch (error) {
      console.error('[SalaEsperaService] Error al listar turnos:', error);
      throw error;
    }
  },

  /**
   * Actualiza el triage y motivo de consulta de un turno.
   */
  actualizarPrioridad: async (id_espera, nivel_triage, motivo = '-') => {
    if (useMocks) {
      const turno = salaEsperaMock.find(t => t.id_espera === id_espera);
      if (turno) {
        turno.nivel_triage = nivel_triage;
        if (motivo) turno.motivo = motivo;
        localStorage.setItem('healthgrid_sala_espera', JSON.stringify(salaEsperaMock));
      }
      return true;
    }

    try {
      const prioridad = mapTriageToPrioridad(nivel_triage);
      await api.patch(`/sala-espera/${id_espera}/prioridad`, { prioridad, motivo });
      return true;
    } catch (error) {
      console.error('[SalaEsperaService] Error al clasificar prioridad:', error);
      throw error;
    }
  },

  /**
   * Cambia el estado a llamado asignando consultorio.
   */
  llamarPaciente: async (id_espera, consultorio = 104) => {
    if (useMocks) {
      actualizarEstadoTurno(id_espera, 'Llamado', consultorio);
      return true;
    }

    try {
      await api.patch(`/sala-espera/${id_espera}/llamar`, { consultorio });
      return true;
    } catch (error) {
      console.error('[SalaEsperaService] Error al llamar paciente:', error);
      throw error;
    }
  },

  /**
   * Cambia el estado a En atención y vincula el episodio.
   */
  atenderPaciente: async (id_espera, id_episodio = null) => {
    if (useMocks) {
      actualizarEstadoTurno(id_espera, 'En atención');
      return true;
    }

    try {
      const body = id_episodio ? { id_episodio } : {};
      const response = await api.patch(`/sala-espera/${id_espera}/atender`, body);
      return mapTurnoRealToFrontend(response);
    } catch (error) {
      console.error('[SalaEsperaService] Error al iniciar atención:', error);
      throw error;
    }
  },

  /**
   * Libera al paciente anterior volviendo su estado a Esperando en la sala.
   */
  suspenderPaciente: async (id_espera) => {
    if (useMocks) {
      actualizarEstadoTurno(id_espera, 'En espera');
      return true;
    }

    try {
      // Para suspender en la API, actualizamos la prioridad a normal (estado Esperando)
      await api.patch(`/sala-espera/${id_espera}/prioridad`, { prioridad: 1 });
      return true;
    } catch (error) {
      console.error('[SalaEsperaService] Error al suspender paciente anterior:', error);
      return false;
    }
  },

  /**
   * Cambia el estado a Ausente.
   */
  marcarAusente: async (id_espera) => {
    if (useMocks) {
      actualizarEstadoTurno(id_espera, 'Ausente');
      return true;
    }

    try {
      await api.patch(`/sala-espera/${id_espera}/ausente`);
      return true;
    } catch (error) {
      console.error('[SalaEsperaService] Error al marcar ausente:', error);
      throw error;
    }
  },

  /**
   * Cambia el estado del registro a Finalizado al concluir la atención médica.
   */
  finalizarPaciente: async (id_espera) => {
    if (useMocks) {
      actualizarEstadoTurno(id_espera, 'Atendido');
      return true;
    }

    try {
      await api.patch(`/sala-espera/${id_espera}/finalizar`);
      return true;
    } catch (error) {
      console.error('[SalaEsperaService] Error al finalizar paciente:', error);
      throw error;
    }
  }
};
