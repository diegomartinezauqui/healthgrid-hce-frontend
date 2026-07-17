// src/pages/PedidoEstudioDetalle.jsx
import { useState, useEffect } from 'react';
import '../styles/PedidoEstudioDetalle.css';
import { formatearFechaLarga } from '../utils/helpers';
import { FiClock, FiCalendar, FiFileText } from 'react-icons/fi';
import { ordenService } from '../services/ordenService';

const extractReportId = (resultado) => {
  if (!resultado) return null;
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;
  
  const fields = [
    resultado.codigoExterno,
    resultado.url_detalle,
    resultado.link_imagen,
    resultado.id_externo_estudio,
    resultado.id_resultado
  ];
  
  for (const field of fields) {
    if (field && typeof field === 'string') {
      const match = field.match(uuidRegex);
      if (match) return match[0];
    }
  }
  return null;
};

const tipoEstudioLabel = (tipo) => {
  const mapa = {
    laboratorio: 'LABORATORIO',
    imagenes: 'IMÁGENES',
    cardiologia: 'CARDIOLOGÍA',
    neurologia: 'NEUROLOGÍA',
    otro: 'OTRO',
  };
  return mapa[tipo] || 'ESTUDIO';
};

const tipoEstudioColor = (tipo) => {
  const colores = {
    laboratorio: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' },
    imagenes: { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB' },
    cardiologia: { bg: '#FCE4EC', text: '#C62828', border: '#F8BBD0' },
    neurologia: { bg: '#F3E5F5', text: '#6A1B9A', border: '#E1BEE7' },
    otro: { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' },
  };
  return colores[tipo] || colores.otro;
};

const formatearRango = (rango, unidad) => {
  if (!rango) return '—';
  if (typeof rango === 'object') {
    const minVal = rango.min !== undefined && rango.min !== null ? rango.min : '';
    const maxVal = rango.max !== undefined && rango.max !== null ? rango.max : '';
    if (minVal !== '' && maxVal !== '') {
      return `${minVal} - ${maxVal} ${unidad || ''}`.trim();
    }
    if (minVal !== '') return `>= ${minVal} ${unidad || ''}`.trim();
    if (maxVal !== '') return `<= ${maxVal} ${unidad || ''}`.trim();
    return '—';
  }
  return `${rango} ${unidad || ''}`.trim();
};

const PedidoEstudioDetalle = ({ estudio, onVolver }) => {
  if (!estudio) return null;

  const color = tipoEstudioColor(estudio.tipoEstudio);
  const esCompletado = estudio.estado === 'completado';
  const resultado = estudio.resultado || {};

  const [detalleM5, setDetalleM5] = useState(null);
  const [imagenesM5, setImagenesM5] = useState([]);
  const [loadingM5, setLoadingM5] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [filterType, setFilterType] = useState('normal');

  const reportId = resultado.report_id || extractReportId(resultado) || (import.meta.env.DEV ? "338d03cb-e245-45b4-b2e0-e2a947e1d6c4" : null);

  console.log('[PedidoEstudioDetalle] estudio:', estudio);
  console.log('[PedidoEstudioDetalle] reportId:', reportId);

  useEffect(() => {
    if (estudio.tipoEstudio !== 'imagenes' || !reportId) return;

    const cargarM5 = async () => {
      setLoadingM5(true);
      try {
        const [det, imgs] = await Promise.allSettled([
          ordenService.obtenerDetalleImagenM5(reportId),
          ordenService.obtenerImagenesM5(reportId)
        ]);

        if (det.status === 'fulfilled' && det.value) {
          setDetalleM5(det.value);
        }
        if (imgs.status === 'fulfilled' && imgs.value) {
          const rawImgs = imgs.value;
          let list = [];
          if (Array.isArray(rawImgs)) {
            list = rawImgs;
          } else if (rawImgs && Array.isArray(rawImgs.images)) {
            list = rawImgs.images;
          }
          setImagenesM5(list);
        }
      } catch (err) {
        console.error('Error al cargar datos de M5:', err);
      } finally {
        setLoadingM5(false);
      }
    };

    cargarM5();
  }, [estudio, reportId]);

  return (
    <div className="ped-detalle">

      {/* Volver */}
      <button className="ped-detalle__volver" onClick={onVolver}>
        ‹ Volver a pedidos de estudios
      </button>

      {/* Header de la orden */}
      <div className="ped-detalle__header">
        <div className="ped-detalle__header-left">
          <div className="ped-detalle__titulo-row">
            <h2 className="ped-detalle__titulo">Orden #{estudio.numero}</h2>
            <span
              className="ped-detalle__tipo-badge"
              style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
            >
              {tipoEstudioLabel(estudio.tipoEstudio)}
            </span>
            <span className={`ped-detalle__estado-badge ${esCompletado ? 'ped-detalle__estado-badge--completado' : 'ped-detalle__estado-badge--pendiente'}`}>
              {esCompletado ? 'Completado' : 'Pendiente'}
            </span>
          </div>
          <p className="ped-detalle__fecha">
            <FiCalendar style={{ marginRight: 5, verticalAlign: 'middle', color: '#888' }} />
            Fecha de solicitud: {formatearFechaLarga(estudio.fechaSolicitud)}
            {estudio.origen && (
              <span style={{ marginLeft: 15, padding: '2px 6px', backgroundColor: '#e9ecef', color: '#495057', borderRadius: 4, fontSize: '0.8rem', border: '1px solid #ced4da' }}>
                🏢 Origen: {estudio.origen}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Descripción del pedido */}
      <div className="ped-detalle__seccion">
        <h3 className="ped-detalle__seccion-label">DESCRIPCIÓN DEL PEDIDO</h3>
        <div className="ped-detalle__seccion-box">
          {estudio.descripcion || 'Sin descripción.'}
        </div>
      </div>

      {/* Resultado del estudio (solo si completado y hay datos) */}
      {esCompletado && (
        <div className="ped-detalle__resultado">
          <h3 className="ped-detalle__resultado-titulo">
            <FiFileText style={{ marginRight: 8, verticalAlign: 'middle', color: '#259A5E' }} />
            Resultado del estudio
          </h3>

          {/* Metadata del resultado */}
          <div className="ped-detalle__resultado-meta">
            <div className="ped-detalle__resultado-meta-item">
              <span className="ped-detalle__resultado-meta-label">Código externo</span>
              <span className="ped-detalle__resultado-meta-valor">{resultado.codigoExterno || '—'}</span>
            </div>
            <div className="ped-detalle__resultado-meta-item">
              <span className="ped-detalle__resultado-meta-label">Profesional firmante</span>
              <span className="ped-detalle__resultado-meta-valor">{resultado.profesionalFirmante || '—'}</span>
            </div>
            <div className="ped-detalle__resultado-meta-item">
              <span className="ped-detalle__resultado-meta-label">Fecha del resultado</span>
              <span className="ped-detalle__resultado-meta-valor">{formatearFechaLarga(resultado.fechaResultado) || '—'}</span>
            </div>
          </div>

          {/* Determinaciones detalladas de Laboratorio */}
          {estudio.tipoEstudio === 'laboratorio' && resultado.analitos && resultado.analitos.length > 0 && (
            <div className="ped-detalle__seccion" style={{ marginTop: 16 }}>
              <h3 className="ped-detalle__seccion-label">Determinaciones detalladas</h3>
              <div className="ped-detalle__analitos-container">
                <table className="ped-detalle__analitos-table">
                  <thead>
                    <tr>
                      <th>Determinación</th>
                      <th>Valor</th>
                      <th>Rango de Referencia</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.analitos.map((analito, index) => {
                      const esCritico = analito.es_critico;
                      const fueraRango = analito.fuera_de_rango;
                      const rowClass = esCritico 
                        ? 'ped-detalle__analito-row--critico' 
                        : fueraRango 
                        ? 'ped-detalle__analito-row--fuera-rango' 
                        : '';
                      return (
                        <tr key={index} className={rowClass}>
                          <td className="ped-detalle__analito-nombre">
                            {analito.nombre}
                          </td>
                          <td className="ped-detalle__analito-valor">
                            <span className="ped-detalle__valor-texto">
                              {analito.valor} {analito.unidad}
                            </span>
                            {esCritico && <span className="ped-detalle__critico-badge">CRÍTICO</span>}
                            {!esCritico && fueraRango && <span className="ped-detalle__fuera-rango-badge">FUERA DE RANGO</span>}
                          </td>
                          <td>
                            {formatearRango(analito.rango_normal, analito.unidad)}
                          </td>
                          <td className="ped-detalle__analito-obs">
                            {analito.observacion || '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Visor PACS / DICOM Integrado (Módulo 5) */}
          {estudio.tipoEstudio === 'imagenes' && reportId && (
            <div className="ped-detalle__dicom-section">
              <h3 className="ped-detalle__dicom-title">
                <span className="ped-detalle__pacs-icon">🏥</span>
                Visor PACS / DICOM Integrado
              </h3>

              {loadingM5 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 0' }}>
                  <div style={{ width: '30px', height: '30px', border: '3px solid rgba(59, 130, 246, 0.1)', borderTop: '3px solid #3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '10px' }} />
                  <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Recuperando imágenes y reporte técnico de M5...</p>
                  <style dangerouslySetInnerHTML={{__html: `
                    @keyframes spin {
                      0% { transform: rotate(0deg); }
                      100% { transform: rotate(360deg); }
                    }
                  `}} />
                </div>
              ) : (
                <div className="ped-detalle__dicom-grid">
                  {/* Columna Principal: Display de la Imagen + Controles */}
                  <div className="ped-detalle__dicom-main">
                    <div className="ped-detalle__dicom-frame">
                      {imagenesM5.length > 0 ? (
                        <img
                          src={
                            imagenesM5[activeImageIndex]?.url_archivo ||
                            imagenesM5[activeImageIndex]?.image ||
                            imagenesM5[activeImageIndex]?.path
                          }
                          alt={imagenesM5[activeImageIndex]?.title || 'Estudio de Imagen'}
                          className="ped-detalle__dicom-img"
                          style={{
                            filter: `brightness(${brightness}%) contrast(${contrast}%) ${
                              filterType === 'inverted'
                                ? 'invert(100%)'
                                : filterType === 'grayscale'
                                ? 'grayscale(100%)'
                                : filterType === 'sepia'
                                ? 'sepia(100%)'
                                : ''
                            }`,
                          }}
                        />
                      ) : (
                        <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>No hay imágenes asociadas a este estudio.</p>
                      )}
                    </div>

                    {/* Controles de visualización DICOM */}
                    {imagenesM5.length > 0 && (
                      <div className="ped-detalle__dicom-controls">
                        <div className="ped-detalle__dicom-control-item">
                          <span className="ped-detalle__dicom-control-label">Brillo:</span>
                          <input
                            type="range"
                            min="50"
                            max="200"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="ped-detalle__dicom-control-input"
                          />
                          <span style={{ minWidth: '35px', textAlign: 'right' }}>{brightness}%</span>
                        </div>

                        <div className="ped-detalle__dicom-control-item">
                          <span className="ped-detalle__dicom-control-label">Contraste:</span>
                          <input
                            type="range"
                            min="50"
                            max="200"
                            value={contrast}
                            onChange={(e) => setContrast(Number(e.target.value))}
                            className="ped-detalle__dicom-control-input"
                          />
                          <span style={{ minWidth: '35px', textAlign: 'right' }}>{contrast}%</span>
                        </div>

                        <div className="ped-detalle__dicom-control-item">
                          <span className="ped-detalle__dicom-control-label">Filtro:</span>
                          <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="ped-detalle__dicom-control-select"
                          >
                            <option value="normal">Normal</option>
                            <option value="inverted">Negativo (Invertido)</option>
                            <option value="grayscale">Escala de Grises</option>
                            <option value="sepia">Sepia</option>
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setBrightness(100);
                            setContrast(100);
                            setFilterType('normal');
                          }}
                          style={{
                            marginLeft: 'auto',
                            backgroundColor: '#374151',
                            border: 'none',
                            color: '#F9FAFB',
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                          }}
                        >
                          Restablecer
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Columna Lateral: Galería de Miniaturas */}
                  <div className="ped-detalle__dicom-sidebar">
                    <span className="ped-detalle__dicom-sidebar-title">Placas / Series ({imagenesM5.length})</span>
                    <div className="ped-detalle__dicom-thumbnails">
                      {imagenesM5.map((img, idx) => {
                        const url = img.url_archivo || img.image || img.path;
                        const title = img.title || `Placa #${idx + 1}`;
                        const dateText = img.created_at || img.date || '—';
                        return (
                          <div
                            key={img.id || img.imageId || idx}
                            className={`ped-detalle__dicom-thumb ${
                              idx === activeImageIndex ? 'ped-detalle__dicom-thumb--active' : ''
                            }`}
                            onClick={() => setActiveImageIndex(idx)}
                          >
                            <img src={url} alt={title} className="ped-detalle__dicom-thumb-img" />
                            <div className="ped-detalle__dicom-thumb-info">
                              <span className="ped-detalle__dicom-thumb-title">{title}</span>
                              <span className="ped-detalle__dicom-thumb-meta">
                                {dateText.includes('T') ? new Date(dateText).toLocaleDateString() : dateText}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Detalle Técnico del Reporte de M5 */}
              {detalleM5 && (
                <div className="ped-detalle__dicom-report">
                  {detalleM5.observations && (
                    <div className="ped-detalle__dicom-report-section">
                      <span className="ped-detalle__dicom-report-label">Observaciones del Radiólogo</span>
                      <div className="ped-detalle__dicom-report-text">{detalleM5.observations}</div>
                    </div>
                  )}
                  {(detalleM5.conclusion || detalleM5.conclusiones) && (
                    <div className="ped-detalle__dicom-report-section">
                      <span className="ped-detalle__dicom-report-label">Conclusión Diagnóstica</span>
                      <div className="ped-detalle__dicom-report-text">
                        {detalleM5.conclusion || detalleM5.conclusiones}
                      </div>
                    </div>
                  )}
                  {detalleM5.techniqueDetail && (
                    <div className="ped-detalle__dicom-report-section">
                      <span className="ped-detalle__dicom-report-label">Técnica Utilizada</span>
                      <div className="ped-detalle__dicom-report-text">{detalleM5.techniqueDetail}</div>
                    </div>
                  )}

                  <div className="ped-detalle__dicom-report-meta">
                    <span>
                      ✍️ <strong>Firmado por:</strong> {detalleM5.doctorName || `Profesional M5 (ID: ${detalleM5.medico_firmante_id})`}
                    </span>
                    <span>
                      📅 <strong>Fecha de Informe:</strong>{' '}
                      {new Date(detalleM5.fecha_informe || detalleM5.date || Date.now()).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Botón PACS Externo */}
              {(resultado.link_imagen || detalleM5?.pacs_url) && (
                <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                  <a
                    href={detalleM5?.pacs_url || resultado.link_imagen}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ped-detalle__pacs-btn"
                    style={{ fontSize: '0.78rem', padding: '8px 14px' }}
                  >
                    <span className="ped-detalle__pacs-icon">🌐</span>
                    Abrir en Visor Web PACS Externo (DICOM Full)
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Informe */}
          {resultado.informe && (
            <div className="ped-detalle__seccion" style={{ marginTop: 16 }}>
              <h3 className="ped-detalle__seccion-label">INFORME</h3>
              <div className="ped-detalle__seccion-box">
                {resultado.informe}
              </div>
            </div>
          )}

          {/* Archivos adjuntos */}
          {resultado.archivosAdjuntos && resultado.archivosAdjuntos.length > 0 && (
            <div className="ped-detalle__adjuntos">
              <h3 className="ped-detalle__seccion-label">ARCHIVOS ADJUNTOS</h3>
              <div className="ped-detalle__adjuntos-lista">
                {resultado.archivosAdjuntos.map((archivo, i) => (
                  <div key={i} className="ped-detalle__adjunto-card">
                    <div className="ped-detalle__adjunto-icon">📄</div>
                    <div className="ped-detalle__adjunto-info">
                      <span className="ped-detalle__adjunto-nombre">{archivo.nombre}</span>
                      {archivo.url && (
                        <a
                          className="ped-detalle__adjunto-url"
                          href={archivo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {archivo.url.length > 70 ? archivo.url.substring(0, 70) + '...' : archivo.url}
                        </a>
                      )}
                    </div>
                    <span className="ped-detalle__adjunto-tipo">{archivo.tipo || 'PDF'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Estado pendiente sin resultados */}
      {!esCompletado && (
        <div className="ped-detalle__pendiente">
          <div className="ped-detalle__pendiente-icon">
            <FiClock size={36} style={{ color: '#E67E22' }} />
          </div>
          <p className="ped-detalle__pendiente-texto">
            Este estudio se encuentra pendiente de resultados.
          </p>
          <p className="ped-detalle__pendiente-sub">
            Los resultados estarán disponibles una vez que el laboratorio o servicio complete el estudio.
          </p>
        </div>
      )}
    </div>
  );
};

export default PedidoEstudioDetalle;
