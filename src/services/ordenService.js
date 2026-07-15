// src/services/ordenService.js
import api from './api';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
let catalogoLaboratorioCache = null;
const analitosLaboratorioCache = new Map();

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

const CATALOGO_LABORATORIO_MOCK = [
  { id: 101, nombre: 'Hemograma Completo', categoria: 'Hematologia' },
  { id: 102, nombre: 'Glucemia / Glucosa', categoria: 'Quimica' },
  { id: 103, nombre: 'Perfil Lipídico (Colesterol/Triglicéridos)', categoria: 'Quimica' },
  { id: 104, nombre: 'Función Renal (Urea/Creatinina)', categoria: 'Quimica' },
  { id: 105, nombre: 'Hepatograma', categoria: 'Quimica' },
  { id: 106, nombre: 'Orina Completa', categoria: 'Uroanalisis' },
  { id: 107, nombre: 'Coagulograma', categoria: 'Hematologia' },
  { id: 108, nombre: 'Ionograma Plasmático', categoria: 'Quimica' },
];

const extractArrayPayload = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.items)) return response.items;
  if (Array.isArray(response?.results)) return response.results;
  return [];
};

const normalizarCatalogoLaboratorio = (item) => ({
  id: item?.id_estudio ?? item?.id ?? item?.estudio_id ?? item?.codigo ?? item?.value ?? null,
  nombre: item?.nombre ?? item?.descripcion ?? item?.titulo ?? item?.label ?? 'Sin nombre',
  categoria: item?.categoria ?? item?.categoria_nombre ?? item?.grupo ?? item?.subcategoria ?? null,
  codigo: item?.codigo ?? item?.codigo_nomenclador ?? null,
  descripcion: item?.descripcion ?? item?.detalle ?? null,
});

const normalizarAnalito = (item) => ({
  id: item?.id ?? item?.id_analito ?? item?.codigo ?? null,
  nombre: item?.nombre ?? item?.descripcion ?? item?.label ?? 'Analito',
  categoria: item?.categoria ?? item?.grupo ?? null,
  unidad: item?.unidad ?? item?.unidad_medida ?? null,
  descripcion: item?.descripcion ?? item?.detalle ?? null,
});

export const ordenService = {
  /**
   * Obtiene el catálogo bioquímico desde HCE.
   */
  obtenerCatalogoLaboratorio: async () => {
    if (catalogoLaboratorioCache) return catalogoLaboratorioCache;

    if (useMocks) {
      catalogoLaboratorioCache = CATALOGO_LABORATORIO_MOCK.map(normalizarCatalogoLaboratorio);
      return catalogoLaboratorioCache;
    }

    try {
      const response = await api.get('/m4/estudios');
      catalogoLaboratorioCache = extractArrayPayload(response).map(normalizarCatalogoLaboratorio);
      return catalogoLaboratorioCache;
    } catch (error) {
      console.error('[OrdenService] Error al obtener catálogo de laboratorio:', error);
      throw error;
    }
  },

  /**
   * Obtiene analitos complementarios por categoría desde HCE.
   */
  obtenerAnalitosLaboratorio: async (categoria) => {
    if (!categoria) return [];
    if (analitosLaboratorioCache.has(categoria)) {
      return analitosLaboratorioCache.get(categoria);
    }

    if (useMocks) {
      const analitosMock = [
        { id: 1, nombre: `Detalle clínico ${categoria}`, unidad: null, categoria },
      ];
      analitosLaboratorioCache.set(categoria, analitosMock);
      return analitosMock;
    }

    try {
      const response = await api.get('/m4/analitos', { params: { categoria } });
      const analitos = extractArrayPayload(response).map(normalizarAnalito);
      analitosLaboratorioCache.set(categoria, analitos);
      return analitos;
    } catch (error) {
      console.error(`[OrdenService] Error al obtener analitos para categoría ${categoria}:`, error);
      throw error;
    }
  },

  /**
   * Crea una orden de estudio en el backend de HCE especializando por tipo.
   */
  crearOrden: async (core_patient_id, estudioData, id_episodio = null, id_evolucion = null) => {
    const cleanId = cleanCoreId(core_patient_id);
    const tipo = (estudioData.tipoEstudio || '').toLowerCase();

    if (useMocks) {
      const mappedTipo = tipo === 'laboratorio' ? 'Laboratorio' : 'Imagen';
      return { id_orden: Date.now(), tipo_estudio: mappedTipo };
    }

    try {
      if (tipo === 'laboratorio') {
        const payload = {
          estudio_ids: estudioData.estudio_ids || [],
          descripcion_pedido: estudioData.descripcion_pedido || estudioData.descripcion || '',
          prioridad: mapPrioridadOrden(estudioData.prioridad),
          id_episodio: id_episodio || null,
          id_evolucion: id_evolucion || estudioData.id_evolucion || null,
        };
        const response = await api.post(`/pacientes/${cleanId}/ordenes/laboratorio`, payload);
        return { id_orden: response?.id_orden, tipo_estudio: 'Laboratorio' };
      } else {
        // Imágenes u otros
        const payload = {
          subtipo: estudioData.subtipo || 'RADIOLOGY', // Modalidad de imágenes (RESONANCE, RADIOLOGY, etc.)
          descripcion_pedido: estudioData.descripcion_pedido || estudioData.descripcion || 'Estudio de imágenes',
          prioridad: mapPrioridadOrden(estudioData.prioridad),
          id_episodio: id_episodio || null,
          id_evolucion: id_evolucion || estudioData.id_evolucion || null,
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
      return extractArrayPayload(response);
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
