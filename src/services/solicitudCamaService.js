// src/services/solicitudCamaService.js
import api from './api';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const cleanCoreId = (core_patient_id) =>
  String(core_patient_id).replace('core-', '').replace(/^0+/, '');

/**
 * Servicio de solicitudes de cama (internación / pase) — integración M6 (Camas).
 * Persiste la solicitud y su estado en el backend; el "Simular ingreso M6"
 * resuelve la solicitud (aceptada con cama / rechazada).
 */
export const solicitudCamaService = {
  /**
   * Crea una solicitud. data: { tipo: 'internacion'|'pase', prioridad, sector, motivo }
   */
  crear: async (core_patient_id, id_episodio, data) => {
    if (useMocks) {
      return { id_solicitud: Date.now(), estado: 'pendiente', ...data };
    }
    const cleanId = cleanCoreId(core_patient_id);

    // Mapear sector al enum exacto del backend (UTI / Guardia_Observacion / Sala_Comun)
    const sec = String(data.sector || '').toLowerCase();
    let mappedSector = 'Sala_Comun';
    if (sec.includes('uti') || sec.includes('uci') || sec === 'uti') {
      mappedSector = 'UTI';
    } else if (sec.includes('guardia') || sec === 'guardia_observacion') {
      mappedSector = 'Guardia_Observacion';
    } else if (sec === 'sala_comun') {
      mappedSector = 'Sala_Comun';
    }

    return await api.post(
      `/patients/${cleanId}/episodes/${id_episodio}/solicitudes-cama`,
      {
        tipo: data.tipo || 'internacion',
        prioridad: data.prioridad || 'Media',
        sector: mappedSector,
        motivo: data.motivo || null,
        cama_solicitada_id: data.cama_solicitada_id || null,
        cama_destino_solicitada_id: data.cama_destino_solicitada_id || null
      }
    );
  },

  /**
   * Crea una reserva de cirugía urgente de forma síncrona pasando por el Proxy de HCE (M1).
   */
  crearCirugiaUrgente: async (core_patient_id, id_episodio, data) => {
    if (useMocks) {
      return {
        mensaje: "Reserva urgente creada (Mock)",
        reserva: {
          id: 999,
          cama_id: 12,
          paciente_id: 10500,
          prioridad: "URGENTE",
          estado: "RESERVADA",
          fecha_hora_inicio: new Date(data.fecha_hora_inicio).toISOString(),
          fecha_hora_fin_estimada: new Date(data.fecha_hora_fin_estimada).toISOString(),
          observaciones: data.diagnostico || "Urgencia quirúrgica",
          created_at: new Date().toISOString()
        },
        reservas_desplazadas: []
      };
    }
    const cleanId = cleanCoreId(core_patient_id);
    return await api.post(
      `/patients/${cleanId}/episodes/${id_episodio}/cirugias-urgentes`,
      {
        medico_cirujano_id: parseInt(data.medico_cirujano_id, 10) || 45,
        fecha_hora_inicio: new Date(data.fecha_hora_inicio).toISOString(),
        fecha_hora_fin_estimada: new Date(data.fecha_hora_fin_estimada).toISOString(),
        diagnostico: data.diagnostico || '',
        hospital_id: data.hospital_id || "1",
        specialty_id: parseInt(data.specialty_id, 10) || 3
      }
    );
  },

  /**
   * Lista las solicitudes del episodio + la cama actual del paciente.
   * Devuelve { solicitudes: [], cama_actual: {...}|null, internado: bool }.
   */
  listar: async (core_patient_id, id_episodio) => {
    if (useMocks || !id_episodio) return { solicitudes: [], cama_actual: null, internado: false };
    try {
      const cleanId = cleanCoreId(core_patient_id);
      const data = await api.get(
        `/patients/${cleanId}/episodes/${id_episodio}/solicitudes-cama`
      );
      return {
        solicitudes: Array.isArray(data?.solicitudes) ? data.solicitudes : [],
        cama_actual: data?.cama_actual || null,
        internado: !!data?.internado,
      };
    } catch (error) {
      console.error(`[SolicitudCamaService] Error al listar solicitudes del episodio ${id_episodio}:`, error);
      return { solicitudes: [], cama_actual: null, internado: false };
    }
  },

  /**
   * Resuelve (simula M6). decision: 'aceptada' (requiere cama) | 'rechazada'.
   */
  resolver: async (id_solicitud, { decision, cama, habitacion, motivo_rechazo }) => {
    if (useMocks) return { id_solicitud, estado: decision, cama };
    return await api.post(`/solicitudes-cama/${id_solicitud}/resolver`, {
      decision,
      cama: cama || null,
      habitacion: habitacion || null,
      motivo_rechazo: motivo_rechazo || null,
    });
  },

  cancelar: async (id_solicitud) => {
    if (useMocks) return { id_solicitud, estado: 'cancelada' };
    return await api.post(`/solicitudes-cama/${id_solicitud}/cancelar`, {});
  },
};
