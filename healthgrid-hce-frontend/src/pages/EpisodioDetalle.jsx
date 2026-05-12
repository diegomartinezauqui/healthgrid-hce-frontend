// src/pages/EpisodioDetalle.jsx
import React, { useState } from 'react';
import NuevaEvolucion from './NuevaEvolucion';
import NuevaReceta from './NuevaReceta';
import NuevoPedidoEstudio from './NuevoPedidoEstudio';
import '../styles/EpisodioDetalle.css';

import Swal from 'sweetalert2';

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
  const partes = nombre.replace(/^(Dr\.|Dra\.)\s*/i, '').split('—')[0].trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[0][0] + partes[1][0]).toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
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
  onAgregarReceta,
  onCambiarEstadoReceta,
  onAgregarEstudio,
  onVerEstudio,
}) => {
  const [subTab, setSubTab] = useState('evoluciones');
  const [mostrarModalEvolucion, setMostrarModalEvolucion] = useState(false);
  const [mostrarModalReceta, setMostrarModalReceta] = useState(false);
  const [mostrarModalEstudio, setMostrarModalEstudio] = useState(false);

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

  const handleGuardarReceta = (data) => {
    onAgregarReceta(pacienteIndex, episodioIndex, data);
    setMostrarModalReceta(false);
  };

  const handleGuardarEstudio = (data) => {
    onAgregarEstudio(pacienteIndex, episodioIndex, data);
    setMostrarModalEstudio(false);
  };

  const handleDarDeAlta = () => {
    Swal.fire({
      title: '¿Dar de alta episodio?',
      text: "El episodio se marcará como cerrado y no se podrán agregar más evoluciones de forma regular.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#259A5E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, dar de alta',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onDarDeAlta(pacienteIndex, episodioIndex);
        Swal.fire({
          title: '¡Alta exitosa!',
          text: 'El episodio ha sido cerrado correctamente.',
          icon: 'success',
          confirmButtonColor: '#259A5E'
        });
      }
    });
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
              <p className="ep-detalle__seccion-sub">{recetas.length} receta{recetas.length !== 1 ? 's' : ''} en este episodio</p>
            </div>
            {esAbierto && (
              <button
                className="ep-detalle__btn-nueva"
                onClick={() => setMostrarModalReceta(true)}
              >
                + Nueva Receta
              </button>
            )}
          </div>

          {/* Lista de recetas */}
          <div className="recetas-lista">
            {recetas.length > 0 ? (
              recetas.map((rec, i) => {
                const esVigente = rec.estado === 'vigente';
                // Find linked evolution info
                const evolVinculada = rec.evolucionVinculada !== '' && rec.evolucionVinculada !== undefined
                  ? evoluciones[parseInt(rec.evolucionVinculada)]
                  : null;

                return (
                  <div key={rec.id || i} className="receta-card">
                    {/* Header de la receta */}
                    <div className="receta-card__header">
                      <div className="receta-card__header-left">
                        <span className="receta-card__numero">RECETA #{rec.numero}</span>
                        <span className="receta-card__fecha">{formatearFechaLarga(rec.fecha)}</span>
                      </div>
                      <span className={`receta-card__estado ${esVigente ? 'receta-card__estado--vigente' : 'receta-card__estado--vencida'}`}>
                        {esVigente ? 'Vigente' : 'Vencida'}
                      </span>
                    </div>

                    {/* Lista de medicamentos */}
                    <div className="receta-card__medicamentos">
                      {(rec.medicamentos || []).filter(m => m.nombre).map((med, mi) => (
                        <div key={mi} className="receta-card__medicamento">
                          <div className="receta-card__med-icon">✓</div>
                          <div className="receta-card__med-info">
                            <span className="receta-card__med-nombre">{med.nombre}</span>
                            {med.indicaciones && (
                              <span className="receta-card__med-indicacion">{med.indicaciones}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Observaciones */}
                    {rec.observaciones && (
                      <div className="receta-card__observaciones">
                        <strong>Observaciones:</strong> {rec.observaciones}
                      </div>
                    )}

                    {/* Footer: evolución vinculada + cambiar estado */}
                    <div className="receta-card__footer">
                      <div className="receta-card__footer-left">
                        {evolVinculada && (
                          <span className="receta-card__evol-link">
                            ◇ Evolución #{evolVinculada.numero} — {tipoConsultaLabel(evolVinculada.tipoConsulta)}
                          </span>
                        )}
                      </div>
                      <button
                        className="receta-card__btn-estado"
                        onClick={() => onCambiarEstadoReceta(pacienteIndex, episodioIndex, i)}
                      >
                        Cambiar estado
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="ep-detalle__vacio">
                <p>No hay recetas registradas en este episodio.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB: ESTUDIOS ── */}
      {subTab === 'estudios' && (
        <div className="ep-detalle__seccion">
          <div className="ep-detalle__seccion-header">
            <div>
              <h3 className="ep-detalle__seccion-titulo">Pedidos de Estudios</h3>
              <p className="ep-detalle__seccion-sub">{estudios.length} orden{estudios.length !== 1 ? 'es' : ''} en este episodio</p>
            </div>
            {esAbierto && (
              <button
                className="ep-detalle__btn-nueva"
                onClick={() => setMostrarModalEstudio(true)}
              >
                + Nuevo Pedido
              </button>
            )}
          </div>

          {/* Lista de estudios */}
          <div className="estudios-lista">
            {estudios.length > 0 ? (
              estudios.map((est, i) => {
                const esCompletado = est.estado === 'completado';
                const tipoLabel = { laboratorio: 'LABORATORIO', imagenes: 'IMÁGENES', cardiologia: 'CARDIOLOGÍA', neurologia: 'NEUROLOGÍA', otro: 'OTRO' }[est.tipoEstudio] || 'ESTUDIO';
                const tipoColor = { laboratorio: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9' }, imagenes: { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB' }, cardiologia: { bg: '#FCE4EC', text: '#C62828', border: '#F8BBD0' }, neurologia: { bg: '#F3E5F5', text: '#6A1B9A', border: '#E1BEE7' }, otro: { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' } }[est.tipoEstudio] || { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0' };
                const tieneResultado = est.resultado && est.resultado.informe;
                const tieneAdjuntos = est.resultado && est.resultado.archivosAdjuntos && est.resultado.archivosAdjuntos.length > 0;

                return (
                  <div key={est.id || i} className="estudio-item">
                    <div className="estudio-item__header">
                      <div className="estudio-item__header-left">
                        <span className="estudio-item__tipo-badge" style={{ backgroundColor: tipoColor.bg, color: tipoColor.text, border: `1px solid ${tipoColor.border}` }}>
                          {tipoLabel}
                        </span>
                        <span className="estudio-item__numero">Orden #{est.numero}</span>
                      </div>
                      <div className="estudio-item__header-right">
                        <span className="estudio-item__fecha">{formatearFechaCorta(est.fechaSolicitud)}</span>
                        <span className={`estudio-item__estado ${esCompletado ? 'estudio-item__estado--completado' : 'estudio-item__estado--pendiente'}`}>
                          {esCompletado ? 'Completado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    {est.descripcion && (
                      <p className="estudio-item__descripcion">
                        {est.descripcion.length > 120 ? est.descripcion.substring(0, 120) + '...' : est.descripcion}
                      </p>
                    )}

                    <div className="estudio-item__footer">
                      <span className="estudio-item__resultado-info">
                        {esCompletado
                          ? `Resultado disponible${tieneAdjuntos ? ' · ' + est.resultado.archivosAdjuntos.length + ' archivo adjunto' : ''}`
                          : 'Resultado pendiente'
                        }
                      </span>
                      <button
                        className="estudio-item__ver-detalle"
                        onClick={() => onVerEstudio(episodioIndex, i)}
                      >
                        Ver detalle →
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="ep-detalle__vacio">
                <p>No hay pedidos de estudios registrados en este episodio.</p>
              </div>
            )}
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

      {/* Modal Nueva Receta */}
      {mostrarModalReceta && (
        <NuevaReceta
          onCerrar={() => setMostrarModalReceta(false)}
          onGuardar={handleGuardarReceta}
          pacienteNombre={paciente?.nombreApellido || 'Paciente'}
          pacienteHC={paciente?.numeroHistoriaClinica || '—'}
          evoluciones={evoluciones}
        />
      )}

      {/* Modal Nuevo Pedido de Estudio */}
      {mostrarModalEstudio && (
        <NuevoPedidoEstudio
          onCerrar={() => setMostrarModalEstudio(false)}
          onGuardar={handleGuardarEstudio}
          pacienteNombre={paciente?.nombreApellido || 'Paciente'}
          pacienteHC={paciente?.numeroHistoriaClinica || '—'}
          evoluciones={evoluciones}
        />
      )}
    </div>
  );
};

export default EpisodioDetalle;
