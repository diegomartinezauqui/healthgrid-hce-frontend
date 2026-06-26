// src/pages/PedidoEstudioDetalle.jsx
import '../styles/PedidoEstudioDetalle.css';
import { formatearFechaLarga } from '../utils/helpers';

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
            📅 Fecha de solicitud: {formatearFechaLarga(estudio.fechaSolicitud)}
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
            📋 Resultado del estudio
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

          {/* Botón de placa PACS / DICOM */}
          {estudio.tipoEstudio === 'imagenes' && resultado.link_imagen && (
            <div className="ped-detalle__seccion" style={{ marginTop: 16 }}>
              <h3 className="ped-detalle__seccion-label">Estudio de Imágenes digitalizadas (PACS/DICOM)</h3>
              <div className="ped-detalle__pacs-container">
                <a
                  href={resultado.link_imagen}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ped-detalle__pacs-btn"
                >
                  <span className="ped-detalle__pacs-icon">🌐</span>
                  Ver placa DICOM / PACS
                </a>
              </div>
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
          <div className="ped-detalle__pendiente-icon">⏳</div>
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
