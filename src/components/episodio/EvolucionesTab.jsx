import { FiActivity, FiPlusCircle, FiFileText, FiTruck, FiSearch, FiHome } from 'react-icons/fi';
import {
  tipoConsultaLabel,
  obtenerInicialesProfesional,
  obtenerRolProfesional,
  formatearFechaCorta,
} from '../../utils/helpers';

/**
 * EvolucionesTab (ahora Línea de Tiempo) renderiza todos los eventos del episodio 
 * (evoluciones, recetas, estudios, pases, internaciones) ordenados cronológicamente.
 */
const EvolucionesTab = ({
  evoluciones = [],
  recetas = [],
  estudios = [],
  pases = [],
  internaciones = [],
  esAbierto,
  episodioIndex,
  onVerEvolucion,
  onNuevaEvolucionClick,
}) => {

  // Unificar eventos
  const allEvents = [
    ...evoluciones.map((ev, i) => ({ ...ev, _timelineType: 'evolucion', _originalIndex: i, _sortDate: new Date(ev.fechaHora || ev.fecha) })),
    ...recetas.map((r, i) => {
      // Intentar encontrar el profesional de la evolución vinculada si r no tiene profesional
      let profesional = r.profesional;
      if (!profesional) {
        const ev = evoluciones.find(e => e.id_evolucion === r.id_evolucion || String(e._originalIndex) === String(r.evolucionVinculada));
        if (ev) profesional = ev.profesional;
      }
      return {
        ...r,
        profesional: profesional || 'Médico Responsable',
        _timelineType: 'receta',
        _originalIndex: i,
        _sortDate: new Date(r.fecha)
      };
    }),
    ...estudios.map((e, i) => ({ ...e, _timelineType: 'estudio', _originalIndex: i, _sortDate: new Date(e.fecha) })),
    ...pases.map((p, i) => ({ ...p, _timelineType: 'pase', _originalIndex: i, _sortDate: new Date(p.fechaHoraSugerida || p.fecha) })),
    ...internaciones.map((int, i) => ({ ...int, _timelineType: 'internacion', _originalIndex: i, _sortDate: new Date(int.fechaHoraSugerida || int.fecha) }))
  ].sort((a, b) => b._sortDate - a._sortDate);

  const getIcon = (type) => {
    switch (type) {
      case 'evolucion': return <FiFileText />;
      case 'receta': return <FiPlusCircle />;
      case 'estudio': return <FiSearch />;
      case 'pase': return <FiTruck />;
      case 'internacion': return <FiHome />;
      default: return <FiActivity />;
    }
  };

  const getTitle = (ev) => {
    switch(ev._timelineType) {
      case 'evolucion': return tipoConsultaLabel(ev.tipoConsulta);
      case 'receta': return `Receta Médica - ${ev.medicamentos?.length || 0} medicamento(s)`;
      case 'estudio': return `Pedido de Estudio: ${ev.tipoEstudio}`;
      case 'pase': return `Solicitud de Pase de Cama → ${ev.sector || ev.institucionDestino || ''}`;
      case 'internacion': return `Solicitud de Internación · Sector: ${ev.sector || ev.sectorDestino || ''}`;
      default: return 'Evento';
    }
  };

  const getSubtitle = (ev) => {
    switch(ev._timelineType) {
      case 'evolucion': return ev.motivoEstado?.length > 150 ? ev.motivoEstado.substring(0, 150) + '...' : ev.motivoEstado;
      case 'receta': {
        const medsStr = (ev.medicamentos || [])
          .filter(m => m.nombre)
          .map(m => `${m.nombre}${m.cantidad && m.cantidad > 1 ? ` x${m.cantidad}` : ''}${m.indicaciones ? ` (${m.indicaciones})` : ''}`)
          .join(' · ');
        const obsStr = ev.observaciones ? ` [Obs: ${ev.observaciones}]` : '';
        return medsStr ? `${medsStr}${obsStr}` : 'Sin medicamentos prescritos';
      }
      case 'estudio': return ev.diagnosticoPresuntivo ? `Diagnóstico: ${ev.diagnosticoPresuntivo}` : '';
      case 'pase': return ev.motivo ? `Motivo: ${ev.motivo}` : (ev.motivoDerivacion ? `Motivo: ${ev.motivoDerivacion}` : '');
      case 'internacion': return ev.motivo ? `Motivo: ${ev.motivo}` : (ev.motivoInternacion ? `Motivo: ${ev.motivoInternacion}` : '');
      default: return '';
    }
  };

  const getTags = (ev) => {
    if (ev._timelineType === 'evolucion' && ev.diagnostico) {
      return ev.diagnostico.split('·').map(t => t.trim());
    }
    return [];
  };

  return (
    <div className="ep-detalle__seccion">
      <div className="ep-detalle__seccion-header">
        <div>
          <h3 className="ep-detalle__seccion-titulo">Historial del Episodio</h3>
          <p className="ep-detalle__seccion-sub">
            {allEvents.length} evento{allEvents.length !== 1 ? 's' : ''} registrado{allEvents.length !== 1 ? 's' : ''} · vista de solo lectura
          </p>
        </div>
      </div>

      {/* Timeline unificado */}
      <div className="ep-timeline-container">
        {allEvents.length > 0 ? (
          <div className="ep-timeline">
            {allEvents.map((ev, i) => (
              <div
                key={ev.id || i}
                className="ep-timeline-item"
                onClick={() => {
                  if (ev._timelineType === 'evolucion') {
                    onVerEvolucion(episodioIndex, ev._originalIndex);
                  }
                }}
              >
                {/* Icono del Timeline */}
                <div className={`ep-timeline-item__icon ep-timeline-item__icon--${ev._timelineType}`}>
                  {getIcon(ev._timelineType)}
                </div>

                {/* Contenido del Evento */}
                <div className="ep-timeline-item__content">
                  <div className="ep-timeline-item__header">
                    <h4 className="ep-timeline-item__titulo">{getTitle(ev)}</h4>
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
                    {getSubtitle(ev)}
                  </p>

                  {getTags(ev).length > 0 && (
                    <div className="ep-timeline-item__tags">
                      {getTags(ev).map((tag, ti) => (
                        <span key={ti} className="ep-timeline-item__tag">
                          {tag}
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
            <FiActivity size={36} className="ep-detalle__vacio-icono" />
            <p>No hay eventos registrados en este episodio.</p>
            <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>
              Cree la primera evolución clínica para comenzar el seguimiento.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EvolucionesTab;
