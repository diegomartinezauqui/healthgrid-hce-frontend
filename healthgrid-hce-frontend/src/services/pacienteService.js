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
   * Registra/abre un nuevo episodio clínico para el paciente en el backend HCE.
   */
  crearEpisodio: async (core_patient_id, tipo, diagnosticoPrincipal = '') => {
    if (useMocks) {
      return {
        id_episodio: Date.now(),
        tipo: tipo || 'consulta-externa',
        estado: 'open',
        id_sede: 3,
        fecha_apertura: new Date().toISOString(),
        fecha_cierre: null,
        id_medico_responsable: 42
      };
    }

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      const payload = {
        tipo: tipo || 'consulta-externa',
        estado: 'open',
        id_sede: 3,
        diagnostico_principal: diagnosticoPrincipal || 'Nuevo episodio clínico'
      };

      const response = await api.post(`/patients/${cleanId}/episodes`, payload);
      return response;
    } catch (error) {
      console.error(`[PacienteService] Error al crear episodio para paciente ${core_patient_id}:`, error);
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
        // Ordenamos por fecha de apertura (de más antiguo a más nuevo) para asignar números correlativos coherentes
        const sorted = [...response.episodios].sort((a, b) => new Date(a.fecha_apertura) - new Date(b.fecha_apertura));
        const mapped = sorted.map((ep, index) => {
          const mappedEp = {
            id: ep.id_episodio,
            id_episodio: ep.id_episodio,
            numero: index + 1, // Asignamos número correlativo coherente
            tipoEpisodio: ep.tipo,
            estado: ep.estado === 'open' ? 'abierto' : 'cerrado',
            id_sede: ep.id_sede,
            fechaApertura: ep.fecha_apertura,
            fechaAlta: ep.fecha_cierre,
            medico: ep.id_medico_responsable,
            diagnosticoPrincipal: ep.diagnostico_principal || '',
            cantEvoluciones: ep.cant_evoluciones || 0,
            cantRecetas: ep.cant_recetas || 0,
            cantEstudios: ep.cant_estudios || 0,
            evolucionesData: [],
            recetasData: [],
            estudiosData: [],
            solicitudesPaseData: [],
            solicitudesInternacionData: []
          };
          console.log(`[PacienteService] Episodio #${ep.id_episodio} - Mapeando estado backend '${ep.estado}' -> frontend '${mappedEp.estado}' (Número correlativo: ${mappedEp.numero}, Diagnóstico: ${mappedEp.diagnosticoPrincipal})`);
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
        // Ordenamos de más antiguas a más nuevas para asignar números correlativos coherentes
        const sorted = [...response.evoluciones].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        return sorted.map((ev, index) => {
          let parsed = null;
          try {
            parsed = JSON.parse(ev.contenido);
          } catch (e) {
            // No es un JSON string (es texto plano antiguo)
          }

          if (parsed && typeof parsed === 'object') {
            return {
              id: ev.id_evolucion,
              id_evolucion: ev.id_evolucion,
              numero: index + 1, // Asignamos número correlativo coherente
              fecha: ev.fecha,
              fechaHora: parsed.fechaHora || ev.fecha,
              profesional: parsed.profesional || `Profesional #${ev.id_profesional}`,
              tipoConsulta: parsed.tipoConsulta || 'consulta_control',
              motivoEstado: parsed.motivoEstado || '',
              diagnostico: parsed.diagnostico || '',
              planTratamiento: parsed.planTratamiento || '',
              observacionesAdicionales: parsed.observacionesAdicionales || '',
              es_notificable: false
            };
          } else {
            // Fallback de texto plano
            const parts = (ev.contenido || '').split('\n');
            return {
              id: ev.id_evolucion,
              id_evolucion: ev.id_evolucion,
              numero: index + 1, // Asignamos número correlativo coherente
              fecha: ev.fecha,
              fechaHora: ev.fecha,
              profesional: `Profesional #${ev.id_profesional}`,
              rol: 'Médico',
              tipoConsulta: 'consulta_control',
              diagnostico: '',
              subjetivo: parts[0] || '',
              objetivo: parts[1] || '',
              analisis: parts[2] || '',
              plan: '',
              motivoEstado: ev.contenido || '',
              es_notificable: false
            };
          }
        });
      }
      return [];
    } catch (error) {
      console.error(`[PacienteService] Error al obtener evoluciones del episodio ${id_episodio}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene todas las recetas de un paciente desde el backend de HCE.
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
          estado: rec.estado || 'Activa',
          fecha: rec.fecha_creacion || new Date().toISOString(),
          medicamentos: Array.isArray(rec.items) ? rec.items.map((item, idx) => ({
            id: item.id_receta_item || idx,
            nombre: item.medicamento, // Mapeado para compatibilidad con el frontend
            medicamento: item.medicamento,
            presentacion: item.presentacion,
            dosis: item.dosis,
            duracion: item.duracion,
            indicaciones: item.indicaciones,
            cantidad: item.cantidad || 1
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
  guardarEvolucion: async (core_patient_id, id_episodio, evolucion) => {
    if (useMocks) return { id_evolucion: Date.now() };

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      
      // Armamos el payload estructurado como JSON string en el campo 'contenido'
      const payload = {
        contenido: JSON.stringify({
          tipoConsulta: evolucion.tipoConsulta || 'consulta_control',
          fechaHora: evolucion.fechaHora || new Date().toISOString(),
          profesional: evolucion.profesional || 'Dr. Santiago Rossi — Jefe de Guardia',
          motivoEstado: evolucion.motivoEstado || '',
          diagnostico: evolucion.diagnostico || '',
          planTratamiento: evolucion.planTratamiento || '',
          observacionesAdicionales: evolucion.observacionesAdicionales || ''
        })
      };

      const response = await api.post(`/patients/${cleanId}/episodes/${id_episodio}/evoluciones`, payload);
      return response;
    } catch (error) {
      console.error(`[PacienteService] Error al guardar evolución en episodio ${id_episodio} para paciente ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Registra una receta digital (prescripción de fármaco) en un episodio clínico.
   */
  emitirReceta: async (core_patient_id, id_episodio, id_evolucion, payload) => {
    if (useMocks) {
      return {
        id_receta: Date.now(),
        id_paciente: parseInt(core_patient_id.replace('core-', '').replace(/^0+/, '')),
        id_evolucion: id_evolucion,
        estado: 'Activa',
        items: payload.items.map((it, idx) => ({
          id_item: idx + 1,
          id_receta: Date.now(),
          medicamento: it.medicamento,
          indicaciones: it.indicaciones,
          cantidad: it.cantidad
        }))
      };
    }

    try {
      const cleanId = core_patient_id.replace('core-', '').replace(/^0+/, '');
      const response = await api.post(`/patients/${cleanId}/episodes/${id_episodio}/evoluciones/${id_evolucion}/recetas`, payload);
      return response;
    } catch (error) {
      console.error(`[PacienteService] Error al emitir receta digital para paciente ${core_patient_id}:`, error);
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
  },

  /**
   * Obtiene la lista de medicamentos (Vademecum Mock) desde el backend.
   */
  buscarMedicamentos: async (query) => {
    if (useMocks) {
      const meds = [
        { id: 1, nombre: "Ibuprofeno 600mg", presentacion: "Comprimidos" },
        { id: 2, nombre: "Paracetamol 500mg", presentacion: "Comprimidos" },
        { id: 3, nombre: "Amoxicilina 500mg", presentacion: "Comprimidos" },
        { id: 4, nombre: "Clonazepam 2mg", presentacion: "Comprimidos" },
        { id: 5, nombre: "Metformina 850mg", presentacion: "Comprimidos" },
        { id: 6, nombre: "Losartán 50mg", presentacion: "Comprimidos" },
        { id: 7, nombre: "Atorvastatina 20mg", presentacion: "Comprimidos" },
        { id: 8, nombre: "Aspirina 100mg", presentacion: "Comprimidos" },
        { id: 9, nombre: "Omeprazol 20mg", presentacion: "Cápsulas" },
        { id: 10, nombre: "Enalapril 10mg", presentacion: "Comprimidos" },
        { id: 11, nombre: "Sildenafil 50mg", presentacion: "Comprimidos" },
        { id: 12, font: "Diclofenac 75mg", nombre: "Diclofenac 75mg", presentacion: "Comprimidos" },
        { id: 13, nombre: "Loratadina 10mg", presentacion: "Comprimidos" },
        { id: 14, nombre: "Levotiroxina 100mcg", presentacion: "Comprimidos" },
        { id: 15, nombre: "Salbutamol Aerosol", presentacion: "Inhalador" },
      ];
      if (query) {
        const qLower = query.toLowerCase();
        return meds.filter(m => m.nombre.toLowerCase().includes(qLower));
      }
      return meds;
    }

    try {
      const response = await api.get('/medicamentos', { params: { q: query } });
      return response;
    } catch (error) {
      console.error(`[PacienteService] Error al buscar medicamentos con query '${query}':`, error);
      throw error;
    }
  }
};

