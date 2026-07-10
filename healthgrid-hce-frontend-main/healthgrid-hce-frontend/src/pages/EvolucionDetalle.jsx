// src/pages/EvolucionDetalle.jsx
import '../styles/EvolucionDetalle.css';
import {
  formatearFechaHoraLarga,
  tipoConsultaLabel,
  obtenerInicialesProfesional,
  obtenerNombreProfesional,
  obtenerRolProfesional,
} from '../utils/helpers';

const EvolucionDetalle = ({ evolucion, onVolver }) => {
  if (!evolucion) return null;

  const iniciales = obtenerInicialesProfesional(evolucion.profesional);
  const nombreProf = obtenerNombreProfesional(evolucion.profesional);
  const rolProf = obtenerRolProfesional(evolucion.profesional);

  // Generate tags from diagnostico
  const tags = evolucion.diagnostico
    ? evolucion.diagnostico.split('·').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="evol-detalle">

      {/* Volver */}
      <button className="evol-detalle__volver" onClick={onVolver}>
        ‹ Volver a evoluciones
      </button>

      {/* Título */}
      <h1 className="evol-detalle__titulo">{tipoConsultaLabel(evolucion.tipoConsulta)}</h1>
      <div className="evol-detalle__meta">
        <span className="evol-detalle__fecha">📅 {formatearFechaHoraLarga(evolucion.fechaHora)}</span>
        {tags.length > 0 && (
          <div className="evol-detalle__tags">
            {tags.map((tag, i) => (
              <span key={i} className="evol-detalle__tag">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Card del profesional */}
      <div className="evol-detalle__profesional-card">
        <div className="evol-detalle__profesional-avatar">
          {iniciales}
        </div>
        <div className="evol-detalle__profesional-info">
          <span className="evol-detalle__profesional-nombre">{nombreProf}</span>
          <span className="evol-detalle__profesional-rol">{rolProf}</span>
        </div>
      </div>

      {/* Secciones de contenido */}
      {evolucion.motivoEstado && (
        <section className="evol-detalle__seccion">
          <h3 className="evol-detalle__seccion-titulo">ESTADO ACTUAL DEL PACIENTE</h3>
          <div className="evol-detalle__seccion-contenido">
            {evolucion.motivoEstado}
          </div>
        </section>
      )}

      {evolucion.diagnostico && (
        <section className="evol-detalle__seccion">
          <h3 className="evol-detalle__seccion-titulo">DIAGNÓSTICO PRESUNTIVO</h3>
          <div className="evol-detalle__seccion-contenido">
            {evolucion.diagnostico}
          </div>
        </section>
      )}

      {evolucion.planTratamiento && (
        <section className="evol-detalle__seccion">
          <h3 className="evol-detalle__seccion-titulo">PLAN DE TRATAMIENTO</h3>
          <div className="evol-detalle__seccion-contenido">
            {evolucion.planTratamiento}
          </div>
        </section>
      )}

      {evolucion.observacionesAdicionales && (
        <section className="evol-detalle__seccion">
          <h3 className="evol-detalle__seccion-titulo">OBSERVACIONES ADICIONALES</h3>
          <div className="evol-detalle__seccion-contenido">
            {evolucion.observacionesAdicionales}
          </div>
        </section>
      )}

      {/* Si no hay nada escrito */}
      {!evolucion.motivoEstado && !evolucion.diagnostico && !evolucion.planTratamiento && !evolucion.observacionesAdicionales && (
        <div className="evol-detalle__vacio">
          <p>No se registraron datos clínicos en esta evolución.</p>
        </div>
      )}
    </div>
  );
};

export default EvolucionDetalle;
