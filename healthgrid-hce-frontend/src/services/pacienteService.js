// src/services/pacienteService.js
import api from './api';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

export const pacienteService = {
  /**
   * Obtiene la ficha médica de un paciente desde el backend de HCE.
   */
  obtenerFicha: async (core_patient_id) => {
    if (useMocks) {
      // Retorna null para indicarle a la UI que use el mock local
      return null;
    }

    try {
      // Limpia el prefijo "core-" y ceros a la izquierda (ej: "core-001" -> "1")
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      const data = await api.get(`/pacientes/${cleanId}/ficha-medica`);
      console.log(`[PacienteService] Ficha médica recuperada del backend para paciente ${core_patient_id}:`, JSON.stringify(data, null, 2));
      return data;
    } catch (error) {
      console.error(`[PacienteService] Error al obtener ficha médica de ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Crea una ficha médica completa en el backend de HCE de forma atómica.
   */
  crearFichaCompleta: async (core_patient_id, data) => {
    if (useMocks) return true;

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');

      // Capitalizar strings (ej: 'quirurgico' -> 'Quirurgico')
      const capitalize = (str) => {
        if (!str) return 'Otro';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
      };

      // Formatear antecedentes (filtrando los vacíos)
      const antecedentes = (data.antecedentes || [])
        .filter(a => a.tipo || a.nombreDescripcion)
        .map(a => ({
          tipo: capitalize(a.tipo),
          descripcion: a.nombreDescripcion || '-',
          fecha_suceso: a.fecha || null,
          observaciones: a.observaciones || ''
        }));

      // Formatear alertas_clinicas (filtrando las vacías)
      const alertas_clinicas = (data.consideraciones || [])
        .filter(c => c.tipo || c.descripcion)
        .map(c => ({
          tipo: capitalize(c.tipo),
          severidad: 'Media',
          descripcion: c.descripcion + (c.detalleReaccion ? ` (Reacción: ${c.detalleReaccion})` : '')
        }));

      const payload = {
        ficha_medica: {
          grupo_sanguineo: data.grupoSanguineo || 'O+',
          peso_kg: data.peso_kg ? parseFloat(data.peso_kg) : null,
          altura_cm: data.altura_cm ? parseFloat(data.altura_cm) : null,
          observaciones_generales: data.observaciones || ''
        },
        antecedentes,
        alertas_clinicas
      };

      const response = await api.post(`/pacientes/${cleanId}/ficha-completa`, payload);
      return response;
    } catch (error) {
      console.error(`[PacienteService] Error al crear ficha completa para ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Cierra un episodio médico (Dar de alta).
   */
  cerrarEpisodio: async (core_patient_id, id_episodio) => {
    if (useMocks) return true;

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      await api.patch(`/patients/${cleanId}/episodes/${id_episodio}`, {
        estado: 'closed'
      });
      return true;
    } catch (error) {
      console.error(`[PacienteService] Error al cerrar episodio ${id_episodio} para ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de episodios de un paciente desde el backend de HCE.
   */
  obtenerEpisodios: async (core_patient_id) => {
    if (useMocks) return null;

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      const response = await api.get(`/patients/${cleanId}/episodes`);
      console.log(`[PacienteService] Respuesta cruda de episodios desde el backend para paciente ${core_patient_id}:`, JSON.stringify(response, null, 2));
      
      if (response && Array.isArray(response.episodios)) {
        const mapped = response.episodios.map(ep => {
          const mappedEp = {
            id: ep.id_episodio,
            id_episodio: ep.id_episodio,
            tipoEpisodio: ep.tipo,
            estado: ep.estado === 'open' ? 'abierto' : 'cerrado',
            id_sede: ep.id_sede,
            fechaApertura: ep.fecha_apertura,
            fechaAlta: ep.fecha_cierre,
            medico: ep.id_medico_responsable,
            evolucionesData: [],
            recetasData: [],
            estudiosData: [],
            solicitudesPaseData: [],
            solicitudesInternacionData: []
          };
          console.log(`[PacienteService] Episodio #${ep.id_episodio} - Mapeando estado backend '${ep.estado}' -> frontend '${mappedEp.estado}'`);
          return mappedEp;
        });
        console.log(`[PacienteService] Lista total de episodios mapeados para paciente ${core_patient_id}:`, mapped);
        return mapped;
      }
      console.warn(`[PacienteService] La respuesta de episodios no contiene un array válido de episodios para ${core_patient_id}:`, response);
      return [];
    } catch (error) {
      console.error(`[PacienteService] Error al obtener episodios de ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene la lista de evoluciones registradas en un episodio clínico.
   */
  obtenerEvoluciones: async (core_patient_id, id_episodio) => {
    if (useMocks) return null;

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      const response = await api.get(`/patients/${cleanId}/episodes/${id_episodio}/evoluciones`);
      if (response && Array.isArray(response.evoluciones)) {
        return response.evoluciones.map(ev => {
          const parts = (ev.contenido || '').split('\n');
          return {
            id: ev.id_evolucion,
            id_evolucion: ev.id_evolucion,
            fecha: ev.fecha,
            profesional: `Profesional #${ev.id_profesional}`,
            rol: 'Médico',
            diagnostico: '',
            subjetivo: parts[0] || '',
            objetivo: parts[1] || '',
            analisis: parts[2] || '',
            plan: '',
            es_notificable: false
          };
        });
      }
      return [];
    } catch (error) {
      console.error(`[PacienteService] Error al obtener evoluciones del episodio ${id_episodio}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todas las recetas de un paciente.
   */
  obtenerRecetas: async (core_patient_id) => {
    if (useMocks) return null;

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      const response = await api.get('/recetas', { params: { id_paciente: cleanId } });
      if (response && Array.isArray(response.data)) {
        return response.data.map(rec => ({
          id: rec.id_receta,
          id_receta: rec.id_receta,
          id_evolucion: rec.id_evolucion,
          estado: rec.estado === 'Dispensada' ? 'vencida' : 'vigente',
          fecha: rec.fecha_creacion || new Date().toISOString(),
          medicamentos: Array.isArray(rec.items) ? rec.items.map((item, idx) => ({
            id: item.id_receta_item || idx,
            medicamento: item.medicamento,
            presentacion: item.presentacion,
            dosis: item.dosis,
            duracion: item.duracion,
            indicaciones: item.indicaciones
          })) : []
        }));
      }
      return [];
    } catch (error) {
      console.error(`[PacienteService] Error al obtener recetas de ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Registra un antecedente para el paciente.
   */
  guardarAntecedente: async (core_patient_id, antecedente) => {
    if (useMocks) return true;

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      await api.post(`/pacientes/${cleanId}/antecedentes`, {
        tipo: antecedente.tipo,
        nombreDescripcion: antecedente.nombreDescripcion,
        fecha: antecedente.fecha || null,
        observaciones: antecedente.observaciones || ''
      });
      return true;
    } catch (error) {
      console.error(`[PacienteService] Error al guardar antecedente para ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Registra una evolución médica en un episodio clínico.
   */
  guardarEvolucion: async (id_episodio, evolucion) => {
    if (useMocks) return true;

    try {
      await api.post(`/episodes/${id_episodio}/evoluciones`, {
        descripcion: evolucion.subjetivo + '\n' + evolucion.objetivo + '\n' + evolucion.analisis,
        diagnostico: evolucion.plan,
        es_notificable: evolucion.es_notificable || false
      });
      return true;
    } catch (error) {
      console.error(`[PacienteService] Error al guardar evolución en episodio ${id_episodio}:`, error);
      throw error;
    }
  },

  /**
   * Registra una receta digital (prescripción de fármaco).
   */
  emitirReceta: async (receta) => {
    if (useMocks) return true;

    try {
      await api.post('/recetas', {
        id_episodio: receta.id_episodio,
        medicamento: receta.medicamento,
        presentacion: receta.presentacion,
        dosis: receta.dosis,
        duracion: receta.duracion,
        indicaciones: receta.indicaciones
      });
      return true;
    } catch (error) {
      console.error('[PacienteService] Error al emitir receta digital:', error);
      throw error;
    }
  },

  /**
   * Obtiene los datos demográficos/personales de un paciente desde la caché local del backend.
   */
  obtenerDatosPersonales: async (core_patient_id) => {
    if (useMocks) return null;

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      const response = await api.get(`/pacientes/${cleanId}`);
      if (response && response.datos_personales) {
        const dp = response.datos_personales;
        return {
          core_patient_id,
          nombreApellido: `${dp.nombre || ''} ${dp.apellido || ''}`.trim() || `Paciente #${cleanId}`,
          dni: dp.dni || '—',
          fechaNacimiento: dp.fecha_nacimiento || '',
          sexo: dp.genero || '—',
          telefono: dp.telefono || '—',
          direccion: dp.direccion || '—',
          obraSocial: dp.obra_social || 'Particular'
        };
      }
      return null;
    } catch (error) {
      console.error(`[PacienteService] Error al obtener datos demográficos de ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Listar todos los pacientes cacheados de la base de datos de desarrollo.
   */
  listarPacientes: async () => {
    if (useMocks) return [];

    try {
      const response = await api.get('/pacientes');
      if (Array.isArray(response)) {
        return response.map(p => {
          const dp = p.datos_personales || {};
          const cleanId = p.id_paciente;
          const core_patient_id = `core-00${cleanId}`;
          return {
            id: cleanId,
            core_patient_id,
            nombreApellido: `${dp.nombre || ''} ${dp.apellido || ''}`.trim() || `Paciente #${cleanId}`,
            dni: dp.dni || '—',
            fechaNacimiento: dp.fecha_nacimiento || '',
            sexo: dp.genero || '—',
            telefono: dp.telefono || '—',
            direccion: dp.direccion || '—',
            obraSocial: dp.obra_social || 'Particular',
            consideraciones: [], // Datos clínicos se cargarán desde /ficha-medica
            antecedentes: [],
            episodios: []
          };
        });
      }
      return [];
    } catch (error) {
      console.error('[PacienteService] Error al listar pacientes cacheados:', error);
      throw error;
    }
  }
};

