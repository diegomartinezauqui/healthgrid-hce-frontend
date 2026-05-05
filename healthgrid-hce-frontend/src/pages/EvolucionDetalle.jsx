// src/pages/EvolucionDetalle.jsx
import React from 'react';
import '../styles/EvolucionDetalle.css';

// Helpers
const formatearFechaHoraLarga = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = d.toLocaleDateString('es-ES', { month: 'long' });
  const anio = d.getFullYear();
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} de ${mes} de ${anio}, ${hora} hs`;
};

const tipoConsultaLabel = (tipo) => {
  const mapa = {
    consulta_control: 'Consulta de Control',
    consulta_urgencia: 'Consulta de Urgencia',
    interconsulta: 'Interconsulta',
    control_laboratorio: 'Control de Laboratorio',
    seguimiento: 'Seguimiento',
    otro: 'Otro',
  };
  return mapa[tipo] || tipo || 'Consulta';
};

const obtenerInicialesProfesional = (nombre) => {
  if (!nombre) return '??';
  const partes = nombre.replace(/^(Dr\.|Dra\.)\s*/i, '').split('—')[0].trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
};

const obtenerNombreProfesional = (profesional) => {
  if (!profesional) return 'Profesional';
  return profesional.split('—')[0].replace(/^(Dr\.|Dra\.)\s*/i, '').trim();
};

const obtenerRolProfesional = (profesional) => {
  if (!profesional) return '';
  const partes = profesional.split('—');
  return partes.length > 1 ? partes[1].trim() : '';
};

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
