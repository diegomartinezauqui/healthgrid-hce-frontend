
import { FiPlusCircle, FiSend } from 'react-icons/fi';
import { FaBed } from 'react-icons/fa';
import { formatearFechaCorta } from '../../utils/helpers';

/**
 * PasesYInternacionesTab renderiza las listas de solicitudes de pases de cama
 * o de solicitudes de internación, incluyendo estados de bed/cama y sectores asignados.
 */
const PasesYInternacionesTab = ({
  tipo = 'pase', // 'pase' | 'internacion'
  solicitudes = [],
  esAbierto,
  onNuevaSolicitudClick,
}) => {
  const esPase = tipo === 'pase';

  return (
    <div className="ep-detalle__seccion">
      <div className="ep-detalle__seccion-header">
        <div>
          <h3 className="ep-detalle__seccion-titulo">
            {esPase ? 'Solicitudes de Pase de Cama' : 'Solicitudes de Internación'}
          </h3>
          <p className="ep-detalle__seccion-sub">
            {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} registrada
            {solicitudes.length !== 1 ? 's' : ''}
          </p>
        </div>
        {esAbierto && (
          <button className="ep-detalle__btn-nueva" onClick={onNuevaSolicitudClick}>
            <FiPlusCircle style={{ marginRight: '5px', verticalAlign: 'middle' }} />{' '}
            {esPase ? 'Nueva Solicitud' : 'Solicitar Internación'}
          </button>
        )}
      </div>

      <div className="pase-lista">
        {solicitudes.length > 0 ? (
          solicitudes.map((sol, i) => {
            const esPendiente = sol.estado === 'pendiente' || !sol.estado;
            const esCompletado = sol.estado === 'completado';

            return (
              <div key={sol.id || i} className="pase-item">
                <div
                  className={
                    esPase
                      ? `pase-item__dot ${
                          esPendiente
                            ? 'pase-item__dot--pendiente'
                            : esCompletado
                            ? 'pase-item__dot--completado'
                            : 'pase-item__dot--cancelado'
                        }`
                      : 'pase-item__dot pase-item__dot--pendiente'
                  }
                />
                <div className="pase-item__contenido">
                  <div className="pase-item__header">
                    <span
                      className="pase-item__titulo"
                      style={!esPase ? { color: '#C0392B' } : undefined}
                    >
                      {esPase ? 'Solicitud de Pase' : 'Solicitud de Internación'}
                    </span>
                    <span className="pase-item__fecha">
                      {formatearFechaCorta(sol.fechaHoraSugerida)}
                    </span>
                  </div>
                  <p className="pase-item__destino">
                    {esPase ? 'Destino: ' : 'Sector solicitado: '}
                    <strong>{sol.sector}</strong>
                  </p>
                  {sol.motivo && (
                    <p className="pase-item__motivo">
                      Motivo:{' '}
                      {sol.motivo.length > 100
                        ? sol.motivo.substring(0, 100) + '...'
                        : sol.motivo}
                    </p>
                  )}
                  {esPase ? (
                    <span
                      className={`pase-item__estado-badge ${
                        esPendiente
                          ? 'pase-item__estado-badge--pendiente'
                          : esCompletado
                          ? 'pase-item__estado-badge--completado'
                          : 'pase-item__estado-badge--cancelado'
                      }`}
                    >
                      {esPendiente ? 'Pendiente' : esCompletado ? 'Completado' : 'Cancelado'}
                    </span>
                  ) : (
                    <span
                      className="pase-item__estado-badge pase-item__estado-badge--pendiente"
                      style={{
                        backgroundColor: '#FADBD8',
                        color: '#78281F',
                        borderColor: '#F5B7B1',
                      }}
                    >
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="ep-detalle__vacio">
            {esPase ? (
              <FiSend size={36} className="ep-detalle__vacio-icono" />
            ) : (
              <FaBed size={36} className="ep-detalle__vacio-icono" />
            )}
            <p>
              {esPase
                ? 'No hay solicitudes de pase registradas en este episodio.'
                : 'No hay solicitudes de internación registradas en este episodio.'}
            </p>
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              {esPase
                ? 'Registre derivaciones a otros servicios u hospitales.'
                : 'Registre derivaciones a sectores de internación o unidades críticas.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasesYInternacionesTab;
