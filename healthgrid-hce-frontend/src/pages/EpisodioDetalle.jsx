// src/pages/EpisodioDetalle.jsx
import { useState } from 'react';
import NuevaEvolucion from './NuevaEvolucion';
import NuevaReceta from './NuevaReceta';
import NuevoPedidoEstudio from './NuevoPedidoEstudio';
import SolicitarInternacion from './SolicitarInternacion';
import NuevaSolicitudPase from './NuevaSolicitudPase';
import CargarResultadoEstudio from './CargarResultadoEstudio';
import { FiActivity, FiFileText, FiLayers, FiSend, FiCheckCircle, FiPlusCircle } from 'react-icons/fi';
import { FaBed } from 'react-icons/fa';
import '../styles/EpisodioDetalle.css';
import {
  formatearFechaLarga,
  formatearFechaCorta,
  tipoConsultaLabel,
  obtenerInicialesProfesional,
  obtenerRolProfesional,
} from '../utils/helpers';

import Swal from 'sweetalert2';

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
  onAgregarSolicitudPase,
  onAgregarSolicitudInternacion,
  onAgregarResultadoEstudio,
}) => {
  const [subTab, setSubTab] = useState('evoluciones');
  const [mostrarModalEvolucion, setMostrarModalEvolucion] = useState(false);
  const [mostrarModalReceta, setMostrarModalReceta] = useState(false);
  const [mostrarModalEstudio, setMostrarModalEstudio] = useState(false);
  const [mostrarModalInternacion, setMostrarModalInternacion] = useState(false);
  const [mostrarModalSolicitudPase, setMostrarModalSolicitudPase] = useState(false);
  const [mostrarModalCargarResultado, setMostrarModalCargarResultado] = useState(false);
  const [estudioSeleccionadoIndex, setEstudioSeleccionadoIndex] = useState(null);

  if (!episodio) return null;

  const esAbierto = episodio.estado === 'abierto';
  const esInternado = episodio.tipoEpisodio === 'internado';
  const evoluciones = episodio.evolucionesData || [];
  const recetas = episodio.recetasData || [];
  const estudios = episodio.estudiosData || [];
  const solicitudesPase = episodio.solicitudesPaseData || [];
  const solicitudesInternacion = episodio.solicitudesInternacionData || [];

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

  const handleEnviarInternacion = (data) => {
    if (onAgregarSolicitudInternacion) {
      onAgregarSolicitudInternacion(pacienteIndex, episodioIndex, data);
    }
    setMostrarModalInternacion(false);
  };

  const handleGuardarResultadoEstudio = (data) => {
    if (onAgregarResultadoEstudio) {
      onAgregarResultadoEstudio(pacienteIndex, episodioIndex, estudioSeleccionadoIndex, data);
    }
    setMostrarModalCargarResultado(false);
  };

  const handleGuardarSolicitudPase = (data) => {
    onAgregarSolicitudPase(pacienteIndex, episodioIndex, data);
    setMostrarModalSolicitudPase(false);
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
                <FiCheckCircle style={{ marginRight: '6px', verticalAlign: 'middle', fontSize: '1.1rem' }} /> Dar de Alta
              </button>
              <button className="ep-detalle__btn ep-detalle__btn--solicitar" onClick={() => setMostrarModalInternacion(true)}>
                <FaBed style={{ marginRight: '6px', verticalAlign: 'middle', fontSize: '1.1rem' }} /> Solicitar Internación
              </button>
            </>
          )}
        </div>
      </div>

      {/* Sub-tabs: Evoluciones | Recetas | Pedidos de Estudios | Solicitudes de Pase | Solicitudes de Internación */}
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
        <button
          className={`ep-detalle__subtab ${subTab === 'solicitudespase' ? 'ep-detalle__subtab--activa' : ''}`}
          onClick={() => setSubTab('solicitudespase')}
        >
          Solicitudes de Pase
        </button>
        <button
          className={`ep-detalle__subtab ${subTab === 'internaciones' ? 'ep-detalle__subtab--activa' : ''}`}
          onClick={() => setSubTab('internaciones')}
        >
          Internaciones
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
                <FiPlusCircle style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Nueva Evolución
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
                <FiActivity size={36} className="ep-detalle__vacio-icono" />
                <p>No hay evoluciones registradas en este episodio.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Cree la primera evolución clínica para comenzar el seguimiento.</p>
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
                <FiPlusCircle style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Nueva Receta
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
                <FiFileText size={36} className="ep-detalle__vacio-icono" />
                <p>No hay recetas registradas en este episodio.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Aquí podrá ver las prescripciones médicas indicadas.</p>
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
                <FiPlusCircle style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Nuevo Pedido
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
                      <div style={{ display: 'flex', gap: '10px' }}>
                        {!esCompletado && esAbierto && (
                          <button
                            className="estudio-item__cargar-resultado"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEstudioSeleccionadoIndex(i);
                              setMostrarModalCargarResultado(true);
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
                <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Aquí aparecerán las órdenes para laboratorio e imágenes.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB: SOLICITUDES DE PASE ── */}
      {subTab === 'solicitudespase' && (
        <div className="ep-detalle__seccion">
          <div className="ep-detalle__seccion-header">
            <div>
              <h3 className="ep-detalle__seccion-titulo">Solicitudes de Pase de Cama</h3>
              <p className="ep-detalle__seccion-sub">{solicitudesPase.length} solicitud{solicitudesPase.length !== 1 ? 'es' : ''} registrada{solicitudesPase.length !== 1 ? 's' : ''}</p>
            </div>
            {esAbierto && (
              <button
                className="ep-detalle__btn-nueva"
                onClick={() => setMostrarModalSolicitudPase(true)}
              >
                <FiPlusCircle style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Nueva Solicitud
              </button>
            )}
          </div>

          <div className="pase-lista">
            {solicitudesPase.length > 0 ? (
              solicitudesPase.map((sol, i) => {
                const esPendiente = sol.estado === 'pendiente';
                const esCompletado = sol.estado === 'completado';
                return (
                  <div key={sol.id || i} className="pase-item">
                    <div className={`pase-item__dot ${esPendiente ? 'pase-item__dot--pendiente' : esCompletado ? 'pase-item__dot--completado' : 'pase-item__dot--cancelado'}`} />
                    <div className="pase-item__contenido">
                      <div className="pase-item__header">
                        <span className="pase-item__titulo">Solicitud de Pase</span>
                        <span className="pase-item__fecha">{formatearFechaCorta(sol.fechaHoraSugerida)}</span>
                      </div>
                      <p className="pase-item__destino">
                        Destino: <strong>{sol.sector}</strong>
                      </p>
                      {sol.motivo && (
                        <p className="pase-item__motivo">
                          Motivo: {sol.motivo.length > 100 ? sol.motivo.substring(0, 100) + '...' : sol.motivo}
                        </p>
                      )}
                      <span className={`pase-item__estado-badge ${esPendiente ? 'pase-item__estado-badge--pendiente' : esCompletado ? 'pase-item__estado-badge--completado' : 'pase-item__estado-badge--cancelado'}`}>
                        {esPendiente ? 'Pendiente' : esCompletado ? 'Completado' : 'Cancelado'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="ep-detalle__vacio">
                <FiSend size={36} className="ep-detalle__vacio-icono" />
                <p>No hay solicitudes de pase registradas en este episodio.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Registre derivaciones a otros servicios u hospitales.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB: SOLICITUDES DE INTERNACIÓN ── */}
      {subTab === 'internaciones' && (
        <div className="ep-detalle__seccion">
          <div className="ep-detalle__seccion-header">
            <div>
              <h3 className="ep-detalle__seccion-titulo">Solicitudes de Internación</h3>
              <p className="ep-detalle__seccion-sub">{solicitudesInternacion.length} solicitud{solicitudesInternacion.length !== 1 ? 'es' : ''} registrada{solicitudesInternacion.length !== 1 ? 's' : ''}</p>
            </div>
            {esAbierto && (
              <button
                className="ep-detalle__btn-nueva"
                onClick={() => setMostrarModalInternacion(true)}
              >
                <FiPlusCircle style={{ marginRight: '5px', verticalAlign: 'middle' }} /> Solicitar Internación
              </button>
            )}
          </div>

          <div className="pase-lista">
            {solicitudesInternacion.length > 0 ? (
              solicitudesInternacion.map((sol, i) => (
                <div key={sol.id || i} className="pase-item">
                  <div className="pase-item__dot pase-item__dot--pendiente" />
                  <div className="pase-item__contenido">
                    <div className="pase-item__header">
                      <span className="pase-item__titulo" style={{ color: '#C0392B' }}>Solicitud de Internación</span>
                      <span className="pase-item__fecha">{formatearFechaCorta(sol.fechaHoraSugerida)}</span>
                    </div>
                    <p className="pase-item__destino">
                      Sector solicitado: <strong>{sol.sector}</strong>
                    </p>
                    {sol.motivo && (
                      <p className="pase-item__motivo">
                        Motivo: {sol.motivo.length > 100 ? sol.motivo.substring(0, 100) + '...' : sol.motivo}
                      </p>
                    )}
                    <span className="pase-item__estado-badge pase-item__estado-badge--pendiente" style={{ backgroundColor: '#FADBD8', color: '#78281F', borderColor: '#F5B7B1' }}>
                      Pendiente
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="ep-detalle__vacio">
                <FaBed size={36} className="ep-detalle__vacio-icono" />
                <p>No hay solicitudes de internación registradas en este episodio.</p>
                <p style={{ fontSize: '0.8rem', marginTop: '6px' }}>Registre derivaciones a sectores de internación o unidades críticas.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Nueva Solicitud de Pase */}
      {mostrarModalSolicitudPase && (
        <NuevaSolicitudPase
          onCerrar={() => setMostrarModalSolicitudPase(false)}
          onGuardar={handleGuardarSolicitudPase}
          pacienteNombre={paciente?.nombreApellido || 'Paciente'}
          pacienteHC={paciente?.numeroHistoriaClinica || '—'}
        />
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

      {/* Modal Solicitar Internación */}
      {mostrarModalInternacion && (
        <SolicitarInternacion
          onCerrar={() => setMostrarModalInternacion(false)}
          onEnviar={handleEnviarInternacion}
          pacienteNombre={paciente?.nombreApellido || 'Paciente'}
          pacienteHC={paciente?.numeroHistoriaClinica || '—'}
        />
      )}

      {/* Modal Cargar Resultado de Estudio */}
      {mostrarModalCargarResultado && (
        <CargarResultadoEstudio
          onCerrar={() => {
            setMostrarModalCargarResultado(false);
            setEstudioSeleccionadoIndex(null);
          }}
          onGuardar={handleGuardarResultadoEstudio}
          pacienteNombre={paciente?.nombreApellido || 'Paciente'}
          pacienteHC={paciente?.numeroHistoriaClinica || '—'}
          estudio={estudios[estudioSeleccionadoIndex]}
        />
      )}
    </div>
  );
};

export default EpisodioDetalle;
