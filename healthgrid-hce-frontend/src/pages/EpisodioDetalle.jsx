// src/pages/EpisodioDetalle.jsx
import React, { useState } from 'react';
import NuevaEvolucion from './NuevaEvolucion';
import '../styles/EpisodioDetalle.css';

// Helpers
const formatearFechaLarga = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

const formatearFechaCorta = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  const dia = d.getDate().toString().padStart(2, '0');
  const mes = d.toLocaleDateString('es-ES', { month: 'short' });
  const anio = d.getFullYear();
  const hora = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return `${dia} ${mes} ${anio} · ${hora}`;
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
  // Extract name part before the dash
  const partes = nombre.replace(/^(Dr\.|Dra\.)\s*/i, '').split('—')[0].trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
};

const obtenerNombreProfesional = (profesional) => {
  if (!profesional) return 'Profesional';
  const partes = profesional.split('—');
  return partes[0].replace(/^(Dr\.|Dra\.)\s*/i, '').trim();
};

const obtenerRolProfesional = (profesional) => {
  if (!profesional) return '';
  const partes = profesional.split('—');
  return partes.length > 1 ? partes[1].trim() : '';
};

const EpisodioDetalle = ({
  episodio,
  episodioIndex,
  paciente,
  pacienteIndex,
  onVolver,
  onAgregarEvolucion,
  onVerEvolucion,
  onDarDeAlta,
}) => {
  const [subTab, setSubTab] = useState('evoluciones');
  const [mostrarModalEvolucion, setMostrarModalEvolucion] = useState(false);

  if (!episodio) return null;

  const esAbierto = episodio.estado === 'abierto';
  const esInternado = episodio.tipoEpisodio === 'internado';
  const evoluciones = episodio.evolucionesData || [];
  const recetas = episodio.recetasData || [];
  const estudios = episodio.estudiosData || [];

  const handleGuardarEvolucion = (data) => {
    onAgregarEvolucion(pacienteIndex, episodioIndex, data);
    setMostrarModalEvolucion(false);
  };

  const handleDarDeAlta = () => {
    if (window.confirm('¿Está seguro que desea dar de alta este episodio?')) {
      onDarDeAlta(pacienteIndex, episodioIndex);
    }
  };

  return (
    <div className="ep-detalle">

      {/* Volver */}
      <button className="ep-detalle__volver" onClick={onVolver}>
        ‹ Volver a episodios
      </button>

      {/* Card del episodio */}
      <div className="ep-detalle__card">
        <div className="ep-detalle__card-left">
          <div className="ep-detalle__titulo-row">
            <h2 className="ep-detalle__titulo">Episodio #{episodio.numero}</h2>
            <span className={`ep-detalle__tipo-badge ${esInternado ? 'ep-detalle__tipo-badge--internado' : 'ep-detalle__tipo-badge--ambulatorio'}`}>
              {esInternado ? 'Internado' : 'Ambulatorio'}
            </span>
            <span className={`ep-detalle__estado-badge ${esAbierto ? 'ep-detalle__estado-badge--abierto' : 'ep-detalle__estado-badge--cerrado'}`}>
              {esAbierto ? '● Abierto' : 'Cerrado'}
            </span>
          </div>
          <p className="ep-detalle__fecha">
            {esAbierto
              ? `Desde ${formatearFechaLarga(episodio.fechaApertura)} — En curso`
              : `${formatearFechaLarga(episodio.fechaApertura)} → Alta: ${formatearFechaLarga(episodio.fechaAlta)}`
            }
          </p>
        </div>
        <div className="ep-detalle__card-right">
          {esAbierto && (
            <>
              <button className="ep-detalle__btn ep-detalle__btn--alta" onClick={handleDarDeAlta}>
                ↕ Dar de Alta
              </button>
              <button className="ep-detalle__btn ep-detalle__btn--solicitar">
                📋 Solicitar Internación
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-tabs: Evoluciones | Recetas | Pedidos de Estudios */}
      <div className="ep-detalle__subtabs">
        <button
          className={`ep-detalle__subtab ${subTab === 'evoluciones' ? 'ep-detalle__subtab--activa' : ''}`}
          onClick={() => setSubTab('evoluciones')}
        >
          Evoluciones
        </button>
        <button
          className={`ep-detalle__subtab ${subTab === 'recetas' ? 'ep-detalle__subtab--activa' : ''}`}
          onClick={() => setSubTab('recetas')}
        >
          Recetas
        </button>
        <button
          className={`ep-detalle__subtab ${subTab === 'estudios' ? 'ep-detalle__subtab--activa' : ''}`}
          onClick={() => setSubTab('estudios')}
        >
          Pedidos de Estudios
        </button>
      </div>

      {/* ── SUB-TAB: EVOLUCIONES ── */}
      {subTab === 'evoluciones' && (
        <div className="ep-detalle__seccion">
          <div className="ep-detalle__seccion-header">
            <div>
              <h3 className="ep-detalle__seccion-titulo">Evoluciones</h3>
              <p className="ep-detalle__seccion-sub">{evoluciones.length} registro{evoluciones.length !== 1 ? 's' : ''} en este episodio</p>
            </div>
            {esAbierto && (
              <button
                className="ep-detalle__btn-nueva"
                onClick={() => setMostrarModalEvolucion(true)}
              >
                + Nueva Evolución
              </button>
            )}
          </div>

          {/* Lista de evoluciones */}
          <div className="ep-detalle__evoluciones-lista">
            {evoluciones.length > 0 ? (
              evoluciones.map((ev, i) => (
                <div
                  key={ev.id || i}
                  className="evol-item"
                  onClick={() => onVerEvolucion(episodioIndex, i)}
                >
                  {/* Dot timeline */}
                  <div className="evol-item__dot" />

                  {/* Info */}
                  <div className="evol-item__info">
                    <h4 className="evol-item__titulo">{tipoConsultaLabel(ev.tipoConsulta)}</h4>
                    <div className="evol-item__profesional">
                      <div className="evol-item__profesional-avatar">
                        {obtenerInicialesProfesional(ev.profesional)}
                      </div>
                      <span className="evol-item__profesional-nombre">
                        {ev.profesional?.split('—')[0]?.trim() || 'Profesional'}
                      </span>
                      <span className="evol-item__profesional-rol">
                        · {obtenerRolProfesional(ev.profesional)}
                      </span>
                    </div>
                    {ev.motivoEstado && (
                      <p className="evol-item__descripcion">
                        {ev.motivoEstado.length > 150 ? ev.motivoEstado.substring(0, 150) + '...' : ev.motivoEstado}
                      </p>
                    )}
                    {ev.diagnostico && (
                      <div className="evol-item__tags">
                        {ev.diagnostico.split('·').map((tag, ti) => (
                          <span key={ti} className="evol-item__tag">{tag.trim()}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Fecha */}
                  <div className="evol-item__fecha">
                    {formatearFechaCorta(ev.fechaHora)}
                  </div>

                  {/* Flecha */}
                  <div className="evol-item__arrow">›</div>
                </div>
              ))
            ) : (
              <div className="ep-detalle__vacio">
                <p>No hay evoluciones registradas en este episodio.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB: RECETAS ── */}
      {subTab === 'recetas' && (
        <div className="ep-detalle__seccion">
          <div className="ep-detalle__seccion-header">
            <div>
              <h3 className="ep-detalle__seccion-titulo">Recetas</h3>
              <p className="ep-detalle__seccion-sub">{recetas.length} registro{recetas.length !== 1 ? 's' : ''} en este episodio</p>
            </div>
          </div>
          <div className="ep-detalle__vacio">
            <p>📋 La gestión de recetas estará disponible próximamente.</p>
          </div>
        </div>
      )}

      {/* ── SUB-TAB: ESTUDIOS ── */}
      {subTab === 'estudios' && (
        <div className="ep-detalle__seccion">
          <div className="ep-detalle__seccion-header">
            <div>
              <h3 className="ep-detalle__seccion-titulo">Pedidos de Estudios</h3>
              <p className="ep-detalle__seccion-sub">{estudios.length} registro{estudios.length !== 1 ? 's' : ''} en este episodio</p>
            </div>
          </div>
          <div className="ep-detalle__vacio">
            <p>🔬 La gestión de pedidos de estudios estará disponible próximamente.</p>
          </div>
        </div>
      )}

      {/* Modal Nueva Evolución */}
      {mostrarModalEvolucion && (
        <NuevaEvolucion
          onCerrar={() => setMostrarModalEvolucion(false)}
          onGuardar={handleGuardarEvolucion}
          pacienteNombre={paciente?.nombreApellido || 'Paciente'}
          pacienteHC={paciente?.numeroHistoriaClinica || '—'}
        />
      )}
    </div>
  );
};

export default EpisodioDetalle;
