import { FaBed } from 'react-icons/fa';
import { FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';
import { formatearFechaCorta } from '../../utils/helpers';

/**
 * InternacionPasesTab unifica las solicitudes de internación y de pase de cama
 * de un episodio en una sola lista. Las solicitudes pendientes pueden cancelarse
 * o simular el ingreso/aceptación de M6 (mock de la integración con Camas).
 *
 * Cada solicitud trae (shape del backend): { id_solicitud, _tipo: 'internacion'|'pase',
 * sector, motivo, fecha_solicitud, cama, motivo_rechazo,
 * estado: 'pendiente'|'aceptada'|'rechazada'|'cancelada' }.
 */
const InternacionPasesTab = ({
  solicitudes = [],
  esAbierto,
  onCancelarSolicitud,
  onSimularIngreso,
}) => {
  const ordenadas = [...solicitudes].sort(
    (a, b) => new Date(b.fecha_solicitud || 0) - new Date(a.fecha_solicitud || 0)
  );

  const estadoDe = (s) => s.estado || 'pendiente';

  const badgeClase = (estado) => {
    if (estado === 'aceptada') return 'pase-item__estado-badge--completado';
    if (estado === 'cancelada' || estado === 'rechazada') return 'pase-item__estado-badge--cancelado';
    return 'pase-item__estado-badge--pendiente';
  };

  const estadoLabel = (estado) =>
    estado === 'aceptada'
      ? 'Aceptada (ingreso M6)'
      : estado === 'rechazada'
      ? 'Rechazada (M6)'
      : estado === 'cancelada'
      ? 'Cancelada'
      : 'Pendiente';

  return (
    <div className="ep-detalle__seccion">
      <div className="ep-detalle__seccion-header">
        <div>
          <h3 className="ep-detalle__seccion-titulo">Internación y Pases de Cama</h3>
          <p className="ep-detalle__seccion-sub">
            {solicitudes.length} solicitud{solicitudes.length !== 1 ? 'es' : ''} registrada
            {solicitudes.length !== 1 ? 's' : ''}. Se gestiona desde el botón de la cabecera del episodio.
          </p>
        </div>
      </div>

      <div className="pase-lista">
        {ordenadas.length > 0 ? (
          ordenadas.map((sol, i) => {
            const estado = estadoDe(sol);
            const esPase = sol._tipo === 'pase';
            const esPendiente = estado === 'pendiente';

            return (
              <div key={sol.id_solicitud || i} className="pase-item">
                <div className={`pase-item__dot ${badgeClase(estado).replace('estado-badge', 'dot')}`} />
                <div className="pase-item__contenido">
                  <div className="pase-item__header">
                    <span
                      className="pase-item__titulo"
                      style={!esPase ? { color: '#C0392B' } : undefined}
                    >
                      {esPase ? 'Solicitud de Pase de Cama' : 'Solicitud de Internación'}
                    </span>
                    <span className="pase-item__fecha">
                      {formatearFechaCorta(sol.fecha_solicitud)}
                    </span>
                  </div>
                  <p className="pase-item__destino">
                    {esPase ? 'Destino: ' : 'Sector solicitado: '}
                    <strong>{sol.sector || '—'}</strong>
                    {sol.prioridad && (
                      <span style={{ marginLeft: '10px', fontSize: '0.78rem', color: '#777' }}>
                        · Prioridad: <strong>{sol.prioridad}</strong>
                      </span>
                    )}
                  </p>
                  {sol.motivo && (
                    <p className="pase-item__motivo">
                      Motivo:{' '}
                      {sol.motivo.length > 120 ? sol.motivo.substring(0, 120) + '...' : sol.motivo}
                    </p>
                  )}
                  {estado === 'aceptada' && sol.cama && (
                    <p className="pase-item__motivo" style={{ color: '#1E8449', fontWeight: 600 }}>
                      🛏 Cama asignada: {sol.cama}{sol.habitacion ? ` · ${sol.habitacion}` : ''}
                    </p>
                  )}
                  {estado === 'rechazada' && sol.motivo_rechazo && (
                    <p className="pase-item__motivo" style={{ color: '#C0392B' }}>
                      Rechazo: {sol.motivo_rechazo}
                    </p>
                  )}

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <span className={`pase-item__estado-badge ${badgeClase(estado)}`}>
                      {estado === 'aceptada' ? (
                        <FiCheckCircle style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      ) : estado === 'cancelada' || estado === 'rechazada' ? (
                        <FiXCircle style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      ) : (
                        <FiClock style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                      )}
                      {estadoLabel(estado)}
                    </span>

                    {esAbierto && esPendiente && (
                      <>
                        <button
                          type="button"
                          className="ep-detalle__btn-nueva"
                          style={{ padding: '5px 12px', fontSize: '0.8rem', backgroundColor: '#0284c7' }}
                          onClick={() => onSimularIngreso(sol._tipo, sol.id_solicitud)}
                        >
                          <FaBed style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                          Simular ingreso M6
                        </button>
                        <button
                          type="button"
                          className="ep-detalle__btn-nueva"
                          style={{ padding: '5px 12px', fontSize: '0.8rem', backgroundColor: '#d33' }}
                          onClick={() => onCancelarSolicitud(sol._tipo, sol.id_solicitud)}
                        >
                          <FiXCircle style={{ marginRight: '5px', verticalAlign: 'middle' }} />
                          Cancelar
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="ep-detalle__vacio">
            <FaBed size={36} className="ep-detalle__vacio-icono" />
            <p>No hay solicitudes de internación ni pases registrados en este episodio.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              Si el episodio es ambulatorio, use “Solicitar Internación”. Una vez aceptada, podrá solicitar pases de cama.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InternacionPasesTab;
