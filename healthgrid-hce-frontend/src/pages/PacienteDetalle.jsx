// src/pages/PacienteDetalle.jsx
import React, { useState } from 'react';
import NuevaFichaMedica from './NuevaFichaMedica';
import NuevoEpisodio from './NuevoEpisodio';
import EpisodioDetalle from './EpisodioDetalle';
import EvolucionDetalle from './EvolucionDetalle';
import PedidoEstudioDetalle from './PedidoEstudioDetalle';
import '../styles/PacienteDetalle.css';

// Helpers
const calcularEdad = (fechaNacimiento) => {
  if (!fechaNacimiento) return '—';
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const m = hoy.getMonth() - nacimiento.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
  return edad;
};

const formatearFecha = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatearFechaLarga = (fecha) => {
  if (!fecha) return '—';
  const d = new Date(fecha);
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
};

const capitalizarTipo = (tipo) => {
  if (!tipo) return '';
  const mapa = {
    alergia: 'Alergia',
    implante: 'Implante',
    condicion: 'Condición',
    contraindicacion: 'Contraindicación',
    quirurgico: 'Quirúrgico',
    familiar: 'Familiar',
    patologico: 'Patológico',
    habito: 'Hábito',
    internacion: 'Internación',
    otro: 'Otro',
  };
  return mapa[tipo] || tipo;
};

// Obtener iniciales del nombre
const obtenerIniciales = (nombre) => {
  if (!nombre) return '??';
  const partes = nombre.trim().split(/\s+/);
  if (partes.length >= 2) {
    return (partes[partes.length - 1][0] + partes[0][0]).toUpperCase();
  }
  return partes[0].substring(0, 2).toUpperCase();
};

// Color para tags según tipo
const getTagColor = (tipo) => {
  const colores = {
    alergia: { bg: '#FFF0F0', text: '#CC3333', border: '#FFCCCC', icon: '✕' },
    implante: { bg: '#F0F5FF', text: '#3366AA', border: '#CCE0FF', icon: '⊕' },
    condicion: { bg: '#FFF8E8', text: '#AA7733', border: '#FFEECC', icon: '⚠' },
    contraindicacion: { bg: '#FFF0F0', text: '#CC3333', border: '#FFCCCC', icon: '✕' },
    quirurgico: { bg: '#E8F5E9', text: '#2E7D32', border: '#C8E6C9', icon: '' },
    familiar: { bg: '#E3F2FD', text: '#1565C0', border: '#BBDEFB', icon: '' },
    patologico: { bg: '#FCE4EC', text: '#C62828', border: '#F8BBD0', icon: '' },
    habito: { bg: '#FFF3E0', text: '#E65100', border: '#FFE0B2', icon: '' },
    internacion: { bg: '#F3E5F5', text: '#6A1B9A', border: '#E1BEE7', icon: '' },
    otro: { bg: '#F5F5F5', text: '#616161', border: '#E0E0E0', icon: '' },
  };
  return colores[tipo] || colores.otro;
};

const PacienteDetalle = ({ paciente, pacienteIndex, onVolver, onActualizar, onAgregarEpisodio, onAgregarEvolucion, onDarDeAlta, onAgregarReceta, onCambiarEstadoReceta, onAgregarEstudio, onAgregarSolicitudPase }) => {
  const [tabActiva, setTabActiva] = useState('ficha');
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEpisodio, setMostrarModalEpisodio] = useState(false);

  // Sub-navegación de episodios
  const [subVistaEpisodio, setSubVistaEpisodio] = useState('lista'); // 'lista' | 'detalle' | 'evolucionDetalle' | 'estudioDetalle'
  const [episodioSeleccionadoIdx, setEpisodioSeleccionadoIdx] = useState(null);
  const [evolucionSeleccionadaIdx, setEvolucionSeleccionadaIdx] = useState(null);
  const [estudioSeleccionadoIdx, setEstudioSeleccionadoIdx] = useState(null);

  if (!paciente) return null;

  const edad = calcularEdad(paciente.fechaNacimiento);
  const iniciales = obtenerIniciales(paciente.nombreApellido);

  // Extraer alergias para el resumen clínico
  const alergias = (paciente.consideraciones || [])
    .filter(c => c.tipo === 'alergia' && c.descripcion)
    .map(c => c.descripcion);

  // Handle guardar edición
  const handleGuardarEdicion = (data) => {
    onActualizar(pacienteIndex, data);
    setMostrarModalEdicion(false);
  };

  // Handle crear episodio
  const handleCrearEpisodio = (data) => {
    onAgregarEpisodio(pacienteIndex, data);
    setMostrarModalEpisodio(false);
  };

  // Navegación episodios
  const abrirEpisodio = (idx) => {
    setEpisodioSeleccionadoIdx(idx);
    setSubVistaEpisodio('detalle');
  };

  const volverAListaEpisodios = () => {
    setSubVistaEpisodio('lista');
    setEpisodioSeleccionadoIdx(null);
    setEvolucionSeleccionadaIdx(null);
    setEstudioSeleccionadoIdx(null);
  };

  const abrirEvolucion = (episodioIdx, evolucionIdx) => {
    setEpisodioSeleccionadoIdx(episodioIdx);
    setEvolucionSeleccionadaIdx(evolucionIdx);
    setSubVistaEpisodio('evolucionDetalle');
  };

  const volverAEpisodioDetalle = () => {
    setSubVistaEpisodio('detalle');
    setEvolucionSeleccionadaIdx(null);
    setEstudioSeleccionadoIdx(null);
  };

  const abrirEstudio = (episodioIdx, estudioIdx) => {
    setEpisodioSeleccionadoIdx(episodioIdx);
    setEstudioSeleccionadoIdx(estudioIdx);
    setSubVistaEpisodio('estudioDetalle');
  };

  // Al cambiar de tab, resetear sub-navegación
  const cambiarTab = (tab) => {
    setTabActiva(tab);
    if (tab === 'episodios') {
      setSubVistaEpisodio('lista');
      setEpisodioSeleccionadoIdx(null);
      setEvolucionSeleccionadaIdx(null);
      setEstudioSeleccionadoIdx(null);
    }
  };

  // Episodios del paciente
  const episodios = paciente.episodios || [];

  // Episodio seleccionado
  const episodioActual = episodioSeleccionadoIdx !== null ? episodios[episodioSeleccionadoIdx] : null;
  // Evolución seleccionada
  const evolucionActual = episodioActual && evolucionSeleccionadaIdx !== null
    ? (episodioActual.evolucionesData || [])[evolucionSeleccionadaIdx]
    : null;
  // Estudio seleccionado
  const estudioActual = episodioActual && estudioSeleccionadoIdx !== null
    ? (episodioActual.estudiosData || [])[estudioSeleccionadoIdx]
    : null;

  // Determinar texto del link "volver" según contexto
  const getVolverTexto = () => {
    if (tabActiva === 'episodios') {
      if (subVistaEpisodio === 'evolucionDetalle') return null; // EvolucionDetalle tiene su propio volver
      if (subVistaEpisodio === 'detalle') return null; // EpisodioDetalle tiene su propio volver
    }
    return 'Volver a búsqueda';
  };

  return (
    <div className="detalle-page">

      {/* Barra superior con búsqueda y tabs */}
      <header className="detalle-topbar">
        <div className="detalle-topbar__left">
          <div className="detalle-topbar__search-wrapper">
            <input
              type="text"
              placeholder="Buscar por DNI o Nombre..."
              className="detalle-topbar__search"
            />
            <button className="detalle-topbar__search-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10.5" cy="10.5" r="7.5"></circle>
                <line x1="21" y1="21" x2="15.8" y2="15.8"></line>
              </svg>
            </button>
          </div>
        </div>
        <div className="detalle-topbar__tabs">
          <button
            className={`detalle-tab ${tabActiva === 'ficha' ? 'detalle-tab--activa' : ''}`}
            onClick={() => cambiarTab('ficha')}
          >
            Ficha Médica
          </button>
          <button
            className={`detalle-tab ${tabActiva === 'episodios' ? 'detalle-tab--activa' : ''}`}
            onClick={() => cambiarTab('episodios')}
          >
            Episodios
          </button>
        </div>
        <button className="detalle-topbar__btn-siguiente">
          ← Siguiente Paciente
        </button>
      </header>

      {/* Contenido scrolleable */}
      <main className="detalle-content">

        {/* Link volver — solo en vistas de lista principal */}
        {tabActiva === 'ficha' && (
          <button className="detalle-volver" onClick={onVolver}>
            ‹ Volver a búsqueda
          </button>
        )}
        {tabActiva === 'episodios' && subVistaEpisodio === 'lista' && (
          <button className="detalle-volver" onClick={onVolver}>
            ‹ Volver a búsqueda
          </button>
        )}

        {/* ─── CARD PACIENTE (Header con avatar + info) ─── */}
        <div className="detalle-paciente-card">
          <div className="detalle-paciente-card__left">
            <div className="detalle-avatar">
              {iniciales}
            </div>
            <div className="detalle-paciente-info">
              <h1 className="detalle-paciente-nombre">
                {paciente.nombreApellido || 'Sin nombre'}
              </h1>
              <div className="detalle-paciente-meta">
                {tabActiva === 'ficha' && (
                  <>
                    <span className="detalle-meta-item">🎂 {edad} años</span>
                    <span className="detalle-meta-item">{formatearFecha(paciente.fechaNacimiento)}</span>
                    <span className="detalle-meta-item">⚫ DNI <strong>{paciente.dni || '—'}</strong></span>
                    <span className="detalle-meta-item">🏥 HC <strong>{paciente.numeroHistoriaClinica || '—'}</strong></span>
                    <span className="detalle-meta-badge">● Activo</span>
                  </>
                )}
                {tabActiva === 'episodios' && (
                  <>
                    <span className="detalle-meta-item">🆔 DNI <strong>{paciente.dni || '—'}</strong></span>
                    <span className="detalle-meta-item">🏥 HC <strong>{paciente.numeroHistoriaClinica || '—'}</strong></span>
                    <span className="detalle-meta-badge">● Activo</span>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Botones solo visibles en tab Ficha Médica */}
          {tabActiva === 'ficha' && (
            <div className="detalle-paciente-card__right">
              <button
                className="detalle-btn detalle-btn--editar"
                onClick={() => setMostrarModalEdicion(true)}
              >
                ✏ Actualizar / Editar Ficha
              </button>
              <button className="detalle-btn detalle-btn--nuevo">
                + Nuevo Registro
              </button>
            </div>
          )}
        </div>

        {/* ─── TAB: FICHA MÉDICA ─── */}
        {tabActiva === 'ficha' && (
          <>
            {/* Fila superior: Datos Personales + Resumen Clínico */}
            <div className="detalle-grid-2cols">
              {/* DATOS PERSONALES */}
              <section className="detalle-card">
                <h2 className="detalle-card__titulo">
                  <span className="detalle-card__icono">👤</span> DATOS PERSONALES
                </h2>
                <div className="detalle-datos-lista">
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">DNI</span>
                    <span className="detalle-dato__valor">{paciente.dni || '—'}</span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Nombre y apellido</span>
                    <span className="detalle-dato__valor">{paciente.nombreApellido || '—'}</span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Fecha de nacimiento</span>
                    <span className="detalle-dato__valor">{formatearFecha(paciente.fechaNacimiento)}</span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Sexo</span>
                    <span className="detalle-dato__valor" style={{ textTransform: 'capitalize' }}>{paciente.sexo || '—'}</span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Nro. de Historia Clínica</span>
                    <span className="detalle-dato__valor">{paciente.numeroHistoriaClinica || '—'}</span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Teléfono</span>
                    <span className="detalle-dato__valor">{paciente.telefono || '—'}</span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Correo</span>
                    <span className="detalle-dato__valor">{paciente.correo || '—'}</span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Domicilio</span>
                    <span className="detalle-dato__valor">{paciente.domicilio || '—'}</span>
                  </div>
                </div>
              </section>

              {/* RESUMEN CLÍNICO BÁSICO */}
              <section className="detalle-card">
                <h2 className="detalle-card__titulo">
                  <span className="detalle-card__icono">🩺</span> RESUMEN CLÍNICO BÁSICO
                </h2>
                <div className="detalle-datos-lista">
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Grupo sanguíneo</span>
                    <span className="detalle-dato__valor detalle-dato__valor--destacado">{paciente.grupoSanguineo || '—'}</span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Alergias relevantes</span>
                    <span className="detalle-dato__valor detalle-dato__valor--destacado">
                      {alergias.length > 0 ? alergias.join(', ') : 'Ninguna registrada'}
                    </span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Contacto de emergencia</span>
                    <span className="detalle-dato__valor detalle-dato__valor--destacado">{paciente.contactoEmergencia || '—'}</span>
                  </div>
                  <div className="detalle-dato">
                    <span className="detalle-dato__label">Última consulta</span>
                    <span className="detalle-dato__valor detalle-dato__valor--destacado">{formatearFecha(paciente.fechaRegistro)}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Fila inferior: Consideraciones + Antecedentes */}
            <div className="detalle-grid-2cols">
              {/* CONSIDERACIONES */}
              <section className="detalle-card">
                <h2 className="detalle-card__titulo">
                  <span className="detalle-card__icono">⚠</span> CONSIDERACIONES
                </h2>
                <div className="detalle-tags">
                  {(paciente.consideraciones || []).filter(c => c.tipo && c.descripcion).length > 0 ? (
                    (paciente.consideraciones || [])
                      .filter(c => c.tipo && c.descripcion)
                      .map((c, i) => {
                        const color = getTagColor(c.tipo);
                        return (
                          <span
                            key={i}
                            className="detalle-tag"
                            style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                          >
                            {color.icon && <span className="detalle-tag__icon">{color.icon}</span>}
                            {capitalizarTipo(c.tipo)}: {c.descripcion}
                            {c.detalleReaccion ? ` (${c.detalleReaccion})` : ''}
                          </span>
                        );
                      })
                  ) : (
                    <span className="detalle-tag detalle-tag--vacio">Sin consideraciones registradas</span>
                  )}
                </div>
              </section>

              {/* ANTECEDENTES */}
              <section className="detalle-card">
                <h2 className="detalle-card__titulo">
                  <span className="detalle-card__icono">📋</span> ANTECEDENTES
                </h2>
                <div className="detalle-tags">
                  {(paciente.antecedentes || []).filter(a => a.tipo && a.nombreDescripcion).length > 0 ? (
                    (paciente.antecedentes || [])
                      .filter(a => a.tipo && a.nombreDescripcion)
                      .map((a, i) => {
                        const color = getTagColor(a.tipo);
                        return (
                          <span
                            key={i}
                            className="detalle-tag"
                            style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
                          >
                            {capitalizarTipo(a.tipo)}: {a.nombreDescripcion}
                            {a.fecha ? ` (${formatearFecha(a.fecha)})` : ''}
                          </span>
                        );
                      })
                  ) : (
                    <span className="detalle-tag detalle-tag--vacio">Sin antecedentes registrados</span>
                  )}
                </div>
              </section>
            </div>

            {/* OBSERVACIONES */}
            <section className="detalle-card">
              <h2 className="detalle-card__titulo">
                <span className="detalle-card__icono">📝</span> OBSERVACIONES
              </h2>
              <p className="detalle-card__subtitulo">Notas generales</p>
              <div className="detalle-observaciones-box">
                {paciente.observaciones || 'Sin observaciones registradas.'}
              </div>
            </section>
          </>
        )}

        {/* ─── TAB: EPISODIOS ─── */}
        {tabActiva === 'episodios' && (
          <>
            {/* Sub-vista: Lista de episodios */}
            {subVistaEpisodio === 'lista' && (
              <div className="episodios-section">
                <div className="episodios-header">
                  <div>
                    <h2 className="episodios-header__titulo">Episodios Médicos</h2>
                    <p className="episodios-header__subtitulo">Historial de interacciones clínicas del paciente</p>
                  </div>
                  <button
                    className="detalle-btn detalle-btn--nuevo"
                    onClick={() => setMostrarModalEpisodio(true)}
                  >
                    + Nuevo Episodio
                  </button>
                </div>

                <div className="episodios-lista">
                  {episodios.length > 0 ? (
                    episodios.map((ep, i) => {
                      const esAbierto = ep.estado === 'abierto';
                      const esInternado = ep.tipoEpisodio === 'internado';
                      const numEvol = ep.evolucionesData?.length || 0;
                      const numRecetas = ep.recetasData?.length || 0;
                      const numEstudios = ep.estudiosData?.length || 0;
                      return (
                        <div key={ep.id || i} className="episodio-item" onClick={() => abrirEpisodio(i)}>
                          <div className={`episodio-item__icono ${esAbierto ? 'episodio-item__icono--abierto' : 'episodio-item__icono--cerrado'}`}>
                            {esAbierto ? '⊕' : '✓'}
                          </div>
                          <div className="episodio-item__info">
                            <div className="episodio-item__titulo-row">
                              <span className="episodio-item__titulo">Episodio #{ep.numero}</span>
                              <span className={`episodio-item__tipo-badge ${esInternado ? 'episodio-item__tipo-badge--internado' : 'episodio-item__tipo-badge--ambulatorio'}`}>
                                {esInternado ? 'Internado' : 'Ambulatorio'}
                              </span>
                              <span className={`episodio-item__estado-badge ${esAbierto ? 'episodio-item__estado-badge--abierto' : 'episodio-item__estado-badge--cerrado'}`}>
                                {esAbierto ? '● Abierto' : 'Cerrado'}
                              </span>
                            </div>
                            <div className="episodio-item__detalle">
                              {esAbierto
                                ? `Desde ${formatearFechaLarga(ep.fechaApertura)} — En curso`
                                : `${formatearFechaLarga(ep.fechaApertura)} → Alta: ${formatearFechaLarga(ep.fechaAlta)}`
                              }
                            </div>
                            {ep.motivo && (
                              <div className="episodio-item__motivo">{ep.motivo}</div>
                            )}
                          </div>
                          <div className="episodio-item__stats">
                            <div className="episodio-item__stat">
                              <span className="episodio-item__stat-num">{numEvol}</span>
                              <span className="episodio-item__stat-label">EVOL.</span>
                            </div>
                            <div className="episodio-item__stat">
                              <span className="episodio-item__stat-num">{numRecetas}</span>
                              <span className="episodio-item__stat-label">RECETAS</span>
                            </div>
                            <div className="episodio-item__stat">
                              <span className="episodio-item__stat-num">{numEstudios}</span>
                              <span className="episodio-item__stat-label">ESTUDIOS</span>
                            </div>
                          </div>
                          <div className="episodio-item__arrow">›</div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="episodios-vacio">
                      <div className="episodios-vacio__icono">📋</div>
                      <p className="episodios-vacio__texto">No hay episodios registrados para este paciente.</p>
                      <p className="episodios-vacio__subtexto">Cree el primer episodio clínico para comenzar el seguimiento.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Sub-vista: Detalle de un episodio */}
            {subVistaEpisodio === 'detalle' && episodioActual && (
              <EpisodioDetalle
                episodio={episodioActual}
                episodioIndex={episodioSeleccionadoIdx}
                paciente={paciente}
                pacienteIndex={pacienteIndex}
                onVolver={volverAListaEpisodios}
                onAgregarEvolucion={onAgregarEvolucion}
                onVerEvolucion={abrirEvolucion}
                onDarDeAlta={onDarDeAlta}
                onAgregarReceta={onAgregarReceta}
                onCambiarEstadoReceta={onCambiarEstadoReceta}
                onAgregarEstudio={onAgregarEstudio}
                onVerEstudio={abrirEstudio}
                onAgregarSolicitudPase={onAgregarSolicitudPase}
              />
            )}

            {/* Sub-vista: Detalle de una evolución */}
            {subVistaEpisodio === 'evolucionDetalle' && evolucionActual && (
              <EvolucionDetalle
                evolucion={evolucionActual}
                onVolver={volverAEpisodioDetalle}
              />
            )}

            {/* Sub-vista: Detalle de un pedido de estudio */}
            {subVistaEpisodio === 'estudioDetalle' && estudioActual && (
              <PedidoEstudioDetalle
                estudio={estudioActual}
                onVolver={volverAEpisodioDetalle}
              />
            )}
          </>
        )}

      </main>

      {/* Modal de edición de ficha */}
      {mostrarModalEdicion && (
        <NuevaFichaMedica
          onCerrar={() => setMostrarModalEdicion(false)}
          onGuardar={handleGuardarEdicion}
          datosIniciales={paciente}
        />
      )}

      {/* Modal de nuevo episodio */}
      {mostrarModalEpisodio && (
        <NuevoEpisodio
          onCerrar={() => setMostrarModalEpisodio(false)}
          onCrear={handleCrearEpisodio}
          pacienteNombre={paciente.nombreApellido || 'Sin nombre'}
          pacienteHC={paciente.numeroHistoriaClinica || '—'}
        />
      )}
    </div>
  );
};

export default PacienteDetalle;
