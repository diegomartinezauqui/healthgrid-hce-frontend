import { FiActivity, FiFileText } from 'react-icons/fi';
import {
  tipoConsultaLabel,
  obtenerInicialesProfesional,
  obtenerRolProfesional,
  formatearFechaCorta,
} from '../../utils/helpers';

/**
 * EvolucionesListaTab muestra ÚNICAMENTE las evoluciones clínicas del episodio
 * y permite agregar una nueva. A diferencia del Historial (que agrega todos los
 * eventos en modo lectura), este tab es el punto de carga de evoluciones.
 */
const EvolucionesListaTab = ({
  evoluciones = [],
  esAbierto,
  episodioIndex,
  onVerEvolucion,
  onNuevaEvolucionClick,
}) => {
  // Más recientes primero
  const ordenadas = evoluciones
    .map((ev, i) => ({ ...ev, _originalIndex: i, _sortDate: new Date(ev.fechaHora || ev.fecha) }))
    .sort((a, b) => b._sortDate - a._sortDate);

  return (
    <div className="ep-detalle__seccion">
      <div className="ep-detalle__seccion-header">
        <div>
          <h3 className="ep-detalle__seccion-titulo">Evoluciones Clínicas</h3>
          <p className="ep-detalle__seccion-sub">
            {evoluciones.length} evolución{evoluciones.length !== 1 ? 'es' : ''} registrada
            {evoluciones.length !== 1 ? 's' : ''}
          </p>
        </div>
        {esAbierto && (
          <button className="ep-detalle__btn-nueva" onClick={onNuevaEvolucionClick}>
            <FiActivity style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Añadir Evolución
          </button>
        )}
      </div>

      <div className="ep-timeline-container">
        {ordenadas.length > 0 ? (
          <div className="ep-timeline">
            {ordenadas.map((ev, i) => (
              <div
                key={ev.id || i}
                className="ep-timeline-item"
                onClick={() => onVerEvolucion(episodioIndex, ev._originalIndex)}
              >
                <div className="ep-timeline-item__icon ep-timeline-item__icon--evolucion">
                  <FiFileText />
                </div>

                <div className="ep-timeline-item__content">
                  <div className="ep-timeline-item__header">
                    <h4 className="ep-timeline-item__titulo">{tipoConsultaLabel(ev.tipoConsulta)}</h4>
                    <div className="ep-timeline-item__fecha">
                      {formatearFechaCorta(ev.fechaHora || ev.fecha)}
                    </div>
                  </div>

                  <div className="ep-timeline-item__profesional">
                    <div className="ep-timeline-item__profesional-avatar">
                      {obtenerInicialesProfesional(ev.profesional)}
                    </div>
                    <span className="ep-timeline-item__profesional-nombre">
                      {ev.profesional?.split('—')[0]?.trim() || 'Profesional'}
                    </span>
                    <span className="ep-timeline-item__profesional-rol">
                      · {obtenerRolProfesional(ev.profesional)}
                    </span>
                  </div>

                  <p className="ep-timeline-item__descripcion">
                    {ev.motivoEstado?.length > 150
                      ? ev.motivoEstado.substring(0, 150) + '...'
                      : ev.motivoEstado}
                  </p>

                  {ev.diagnostico && (
                    <div className="ep-timeline-item__tags">
                      {ev.diagnostico.split('·').map((tag, ti) => (
                        <span key={ti} className="ep-timeline-item__tag">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="ep-detalle__vacio">
            <FiFileText size={36} className="ep-detalle__vacio-icono" />
            <p>No hay evoluciones registradas en este episodio.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              Cree la primera evolución clínica para comenzar el seguimiento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvolucionesListaTab;
