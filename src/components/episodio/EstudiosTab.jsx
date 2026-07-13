
import { FiLayers, FiPlusCircle } from 'react-icons/fi';
import { formatearFechaCorta } from '../../utils/helpers';

/**
 * EstudiosTab renderiza los pedidos de estudios clínicos del episodio,
 * su estado (pendiente/completado) y habilita la carga de resultados médicos.
 */
const EstudiosTab = ({
  estudios = [],
  esAbierto,
  episodioIndex,
  onVerEstudio,
  onCargarResultadoClick,
  onNuevoPedidoClick,
}) => {
  return (
    <div className="ep-detalle__seccion">
      <div className="ep-detalle__seccion-header">
        <div>
          <h3 className="ep-detalle__seccion-titulo">Pedidos de Estudios</h3>
          <p className="ep-detalle__seccion-sub">
            {estudios.length} orden{estudios.length !== 1 ? 'es' : ''} en este episodio
          </p>
        </div>
        {esAbierto && (
          <button className="ep-detalle__btn-nueva" onClick={onNuevoPedidoClick}>
            <FiPlusCircle style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Nuevo Pedido
          </button>
        )}
      </div>

      {/* Lista de estudios */}
      <div className="estudios-lista">
        {estudios.length > 0 ? (
          estudios.map((est, i) => {
            const esCompletado = est.estado === 'completado';
            const tipoLabel =
              {
                laboratorio: 'LABORATORIO',
                imagenes: 'IMÁGENES',
                cardiologia: 'CARDIOLOGÍA',
                neurologia: 'NEUROLOGÍA',
                otro: 'OTRO',
              }[est.tipoEstudio] || 'ESTUDIO';

            const tipoColor = {
              laboratorio: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' },
              imagenes: { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB' },
              cardiologia: { bg: '#FCE4EC', text: '#C62828', border: '#F8BBD0' },
              neurologia: { bg: '#F3E5F5', text: '#6A1B9A', border: '#E1BEE7' },
              otro: { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' },
            }[est.tipoEstudio] || { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' };

            const tieneAdjuntos =
              est.resultado &&
              est.resultado.archivosAdjuntos &&
              est.resultado.archivosAdjuntos.length > 0;

            return (
              <div key={est.id || i} className="estudio-item">
                <div className="estudio-item__header">
                  <div className="estudio-item__header-left">
                    <span
                      className="estudio-item__tipo-badge"
                      style={{
                        backgroundColor: tipoColor.bg,
                        color: tipoColor.text,
                        border: `1px solid ${tipoColor.border}`,
                      }}
                    >
                      {tipoLabel}
                    </span>
                    <span className="estudio-item__numero">Orden #{est.numero}</span>
                    {est.origen && (
                      <span
                        className="estudio-item__tipo-badge"
                        style={{
                          backgroundColor: '#e9ecef',
                          color: '#495057',
                          border: '1px solid #ced4da',
                          marginLeft: '8px',
                          fontSize: '0.75rem',
                          padding: '2px 6px',
                        }}
                      >
                        {est.origen}
                      </span>
                    )}
                  </div>
                  <div className="estudio-item__header-right">
                    <span className="estudio-item__fecha">
                      {formatearFechaCorta(est.fechaSolicitud)}
                    </span>
                    <span
                      className={`estudio-item__estado ${
                        esCompletado
                          ? 'estudio-item__estado--completado'
                          : 'estudio-item__estado--pendiente'
                      }`}
                    >
                      {esCompletado ? 'Completado' : 'Pendiente'}
                    </span>
                  </div>
                </div>

                {est.descripcion && (
                  <p className="estudio-item__descripcion">
                    {est.descripcion.length > 120
                      ? est.descripcion.substring(0, 120) + '...'
                      : est.descripcion}
                  </p>
                )}

                <div className="estudio-item__footer">
                  <span className="estudio-item__resultado-info">
                    {esCompletado
                      ? `Resultado disponible${
                          tieneAdjuntos ? ' · ' + est.resultado.archivosAdjuntos.length + ' archivo adjunto' : ''
                        }`
                      : 'Resultado pendiente'}
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {!esCompletado && esAbierto && (
                      <button
                        className="estudio-item__cargar-resultado"
                        onClick={(e) => {
                          e.stopPropagation();
                          onCargarResultadoClick(i);
                        }}
                      >
                        Cargar Resultados
                      </button>
                    )}
                    <button
                      className="estudio-item__ver-detalle"
                      onClick={() => onVerEstudio(episodioIndex, i)}
                    >
                      Ver detalle →
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="ep-detalle__vacio">
            <FiLayers size={36} className="ep-detalle__vacio-icono" />
            <p>No hay pedidos de estudios registrados en este episodio.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              Aquí aparecerán las órdenes para laboratorio e imágenes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EstudiosTab;
