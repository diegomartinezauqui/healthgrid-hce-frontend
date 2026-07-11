// src/services/ordenService.js
import api from './api';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

// Limpia el prefijo "core-" y ceros a la izquierda (ej: "core-001" -> "1")
const cleanCoreId = (core_patient_id) =>
  String(core_patient_id).replace('core-', '').replace(/^0+/, '');

const mapPrioridadOrden = (p) => {
  const mapa = { normal: 'Normal', urgente: 'Urgente', emergencia: 'Emergencia' };
  return mapa[(p || '').toLowerCase()] || 'Normal';
};

// Enum del backend -> clave visual del front (EstudiosTab usa minúsculas)
const mapTipoEstudioBackToFront = (tipo) => {
  const mapa = {
    Laboratorio: 'laboratorio',
    Imagen: 'imagenes',
    Anatomia_Patologica: 'otro',
  };
  return mapa[tipo] || 'otro';
};

// Catálogo mock de determinaciones bioquímicas (Módulo 4)
export const CATALOGO_LABORATORIO_MOCK = [
  { id: 101, nombre: "Hemograma Completo" },
  { id: 102, nombre: "Glucemia / Glucosa" },
  { id: 103, nombre: "Perfil Lipídico (Colesterol/Triglicéridos)" },
  { id: 104, nombre: "Función Renal (Urea/Creatinina)" },
  { id: 105, nombre: "Hepatograma" },
  { id: 106, nombre: "Orina Completa" },
  { id: 107, nombre: "Coagulograma" },
  { id: 108, nombre: "Ionograma Plasmático" }
];

export const ordenService = {
  /**
   * Obtiene el catálogo bioquímico de Módulo 4
   */
  obtenerCatalogoLaboratorio: async () => {
    // Si estuviéramos en producción real, haríamos fetch a Módulo 4.
    // Devolvemos el mock local de forma robusta.
    return CATALOGO_LABORATORIO_MOCK;
  },

  /**
   * Crea una orden de estudio en el backend de HCE especializando por tipo.
   */
  crearOrden: async (core_patient_id, estudioData, id_episodio = null) => {
    const cleanId = cleanCoreId(core_patient_id);
    const tipo = (estudioData.tipoEstudio || '').toLowerCase();

    if (useMocks) {
      const mappedTipo = tipo === 'laboratorio' ? 'Laboratorio' : 'Imagen';
      return { id_orden: Date.now(), tipo_estudio: mappedTipo };
    }

    try {
      if (tipo === 'laboratorio') {
        const payload = {
          estudio_ids: estudioData.estudio_ids || [101], // IDs seleccionados del catálogo
          descripcion_pedido: estudioData.descripcion || 'Muestras bioquímicas',
          prioridad: mapPrioridadOrden(estudioData.prioridad),
          id_episodio: id_episodio || null,
          origen: estudioData.origen || 'Ambulatorio',
        };
        const response = await api.post(`/pacientes/${cleanId}/ordenes/laboratorio`, payload);
        return { id_orden: response?.id_orden, tipo_estudio: 'Laboratorio' };
      } else {
        // Imágenes u otros
        const payload = {
          subtipo: estudioData.subtipo || 'RADIOLOGY', // Modalidad de imágenes (RESONANCE, RADIOLOGY, etc.)
          descripcion_pedido: estudioData.descripcion || 'Estudio de imágenes',
          prioridad: mapPrioridadOrden(estudioData.prioridad),
          id_episodio: id_episodio || null,
          origen: estudioData.origen || 'Ambulatorio',
        };
        const response = await api.post(`/pacientes/${cleanId}/ordenes/imagenes`, payload);
        return { id_orden: response?.id_orden, tipo_estudio: 'Imagen' };
      }
    } catch (error) {
      console.error(`[OrdenService] Error al crear orden para ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Lista las órdenes de un episodio (con su resultado).
   */
  listarOrdenesEpisodio: async (core_patient_id, id_episodio) => {
    if (useMocks || !id_episodio) return [];
    try {
      const cleanId = cleanCoreId(core_patient_id);
      const response = await api.get(`/pacientes/${cleanId}/ordenes`);
      const rawOrdenes = Array.isArray(response?.data) ? response.data : (Array.isArray(response) ? response : []);

      const filtered = rawOrdenes.filter(o => o.id_episodio === Number(id_episodio));

      // Consultamos el resultado de todas las órdenes en paralelo usando el nuevo endpoint específico,
      // asociándolo si ya existe un resultado cargado (independientemente del estado de la orden).
      const resultadosMap = {};
      await Promise.all(
        filtered.map(async (o) => {
          console.log(`[OrdenService] Consultando resultado para Orden ID: ${o.id_orden}, Tipo: ${o.tipo_estudio}, Estado: ${o.estado}`);
          try {
            const resObj = await api.get(`/ordenes/${o.id_orden}/resultado`, {
              params: { tipo_estudio: o.tipo_estudio }
            });
            console.log(`[OrdenService] Respuesta recibida para Orden ID ${o.id_orden}:`, JSON.stringify(resObj));
            if (resObj) {
              resultadosMap[o.id_orden] = resObj;
            }
          } catch (err) {
            const status = err?.response?.status || err?.status;
            console.warn(`[OrdenService] Falló consulta de resultado para Orden ID ${o.id_orden}. Status: ${status}. Error:`, err);
          }
        })
      );

      const mapeadas = filtered.map((o, idx) => {
        const resObj = resultadosMap[o.id_orden];
        const esCompletado = (o.estado || '').toLowerCase() === 'finalizado' || !!resObj;
        
        const ordenMapeada = {
          id: o.id_orden,
          id_orden: o.id_orden,
          numero: idx + 1,
          tipoEstudio: mapTipoEstudioBackToFront(o.tipo_estudio),
          tipo_estudio: o.tipo_estudio,
          descripcion: o.descripcion_pedido,
          prioridad: o.prioridad,
          estado: esCompletado ? 'completado' : 'pendiente',
          fecha: resObj?.fecha_resultado || o.fecha_creacion || null,
          fechaSolicitud: o.fecha_creacion || null,
          origen: o.origen || 'Ambulatorio',
          resultado: resObj
            ? {
                informe: resObj.resumen,
                profesionalFirmante: resObj.profesional_firmante,
                fechaResultado: resObj.fecha_resultado,
                codigoExterno: resObj.id_externo_estudio || resObj.id_resultado || '',
                link_imagen: resObj.link_imagen, // Enlace DICOM/PACS
                url_detalle: resObj.url_detalle, // Enlace al informe completo en M5
                analitos: resObj.analitos, // Lista de determinaciones detalladas
                archivosAdjuntos: [],
              }
            : null,
        };
        console.log(`[OrdenService] Orden mapeada final para ID ${o.id_orden}:`, JSON.stringify(ordenMapeada));
        return ordenMapeada;
      });

      return mapeadas;
    } catch (error) {
      console.error(`[OrdenService] Error al listar órdenes del episodio ${id_episodio}:`, error);
      return [];
    }
  },

  /**
   * Lista las órdenes pendientes por tipo de estudio.
   */
  listarOrdenes: async (tipo_estudio = 'Laboratorio') => {
    if (useMocks) return [];
    try {
      const response = await api.get('/ordenes', { params: { tipo_estudio } });
      return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
      console.error('[OrdenService] Error al listar órdenes:', error);
      throw error;
    }
  },

  /**
   * Registra el resultado de un estudio en la HCE.
   */
  cargarResultado: async (core_patient_id, estudio, resultadoData) => {
    if (useMocks) return { status: 'success' };

    try {
      const cleanId = cleanCoreId(core_patient_id);
      const fecha = resultadoData.fechaResultado
        ? new Date(resultadoData.fechaResultado).toISOString()
        : new Date().toISOString();

      // Mapeamos para carga manual de analitos o links PACS en desarrollo si corresponde
      const payload = {
        id_orden: estudio?.id_orden || null,
        id_paciente: parseInt(cleanId, 10),
        tipo_estudio: estudio?.tipo_estudio || (estudio?.tipoEstudio === 'laboratorio' ? 'Laboratorio' : 'Imagen'),
        id_profesional_firmante: resultadoData.profesionalFirmante || 'Profesional HCE',
        fecha_resultado: fecha,
        informe_resumen: resultadoData.informe || '',
        id_externo_estudio: resultadoData.codigoExterno || null,
        link_imagen: resultadoData.link_imagen || null,
        analitos: resultadoData.analitos || null,
      };
      return await api.post('/resultados', payload);
    } catch (error) {
      console.error(`[OrdenService] Error al cargar resultado para ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene el historial de resultados finalizados de un paciente.
   */
  obtenerResultados: async (core_patient_id) => {
    if (useMocks) return [];
    try {
      const cleanId = cleanCoreId(core_patient_id);
      const response = await api.get(`/pacientes/${cleanId}/historial/resultados`);
      if (Array.isArray(response)) return response;
      return Array.isArray(response?.data) ? response.data : [];
    } catch (error) {
      console.error(`[OrdenService] Error al obtener resultados de ${core_patient_id}:`, error);
      throw error;
    }
  },

  /**
   * Obtiene el resultado de una orden médica específica por su ID y tipo de estudio.
   */
  obtenerResultadoOrden: async (id_orden, tipo_estudio) => {
    if (useMocks) return null;
    try {
      return await api.get(`/ordenes/${id_orden}/resultado`, {
        params: { tipo_estudio }
      });
    } catch (error) {
      console.error(`[OrdenService] Error al obtener resultado para la orden ${id_orden}:`, error);
      throw error;
    }
  },
};
