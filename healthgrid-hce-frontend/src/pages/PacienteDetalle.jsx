// src/pages/PacienteDetalle.jsx
import { useState, useEffect, useRef } from 'react';
import { FiClipboard, FiFolder } from 'react-icons/fi';
import NuevaFichaMedica from './NuevaFichaMedica';
import NuevoEpisodio from './NuevoEpisodio';
import EpisodioDetalle from './EpisodioDetalle';
import EvolucionDetalle from './EvolucionDetalle';
import PedidoEstudioDetalle from './PedidoEstudioDetalle';
import PacienteHeaderCard from '../components/paciente/PacienteHeaderCard';
import PacienteFichaTab from '../components/paciente/PacienteFichaTab';
import PacienteEpisodiosTab from '../components/paciente/PacienteEpisodiosTab';
import '../styles/PacienteDetalle.css';

const PacienteDetalle = ({
  paciente,
  pacienteIndex,
  onVolver,
  onActualizar,
  onAgregarEpisodio,
  onAgregarEvolucion,
  onDarDeAlta,
  onAgregarReceta,
  onCambiarEstadoReceta,
  onAgregarEstudio,
  onAgregarSolicitudPase,
  onAgregarSolicitudInternacion,
  onAgregarResultadoEstudio,
  onSiguiente,
  turnoActivo,
}) => {
  const [tabActiva, setTabActiva] = useState('ficha');
  const [mostrarModalEdicion, setMostrarModalEdicion] = useState(false);
  const [mostrarModalEpisodio, setMostrarModalEpisodio] = useState(false);

  // Sub-navegación de episodios
  const [subVistaEpisodio, setSubVistaEpisodio] = useState('lista'); // 'lista' | 'detalle' | 'evolucionDetalle' | 'estudioDetalle'
  const [episodioSeleccionadoIdx, setEpisodioSeleccionadoIdx] = useState(null);
  const [evolucionSeleccionadaIdx, setEvolucionSeleccionadaIdx] = useState(null);
  const [estudioSeleccionadoIdx, setEstudioSeleccionadoIdx] = useState(null);

  if (!paciente) return null;

  const autoOpenedRef = useRef(false);

  // Auto-abrir episodio si hay turno activo (SOLO UNA VEZ)
  useEffect(() => {
    if (turnoActivo && !autoOpenedRef.current) {
      const episodios = paciente.episodios || [];
      const openIdx = episodios.findIndex(e => e.estado === 'abierto');
      if (openIdx !== -1) {
        setTabActiva('episodios');
        setEpisodioSeleccionadoIdx(openIdx);
        setSubVistaEpisodio('detalle');
        autoOpenedRef.current = true;
      }
    }
  }, [turnoActivo, paciente.episodios]);

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
            <FiClipboard className="detalle-tab__icon" />
            Ficha Médica
          </button>
          <button
            className={`detalle-tab ${tabActiva === 'episodios' ? 'detalle-tab--activa' : ''}`}
            onClick={() => cambiarTab('episodios')}
          >
            <FiFolder className="detalle-tab__icon" />
            Episodios
          </button>
        </div>
        <button className="detalle-topbar__btn-siguiente" onClick={onSiguiente}>
          Siguiente Paciente →
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
        <PacienteHeaderCard
          paciente={paciente}
          tabActiva={tabActiva}
          onEditarClick={() => setMostrarModalEdicion(true)}
          onNuevoEpisodioClick={() => setMostrarModalEpisodio(true)}
        />

        {/* ─── TAB: FICHA MÉDICA ─── */}
        {tabActiva === 'ficha' && (
          <PacienteFichaTab paciente={paciente} />
        )}

        {/* ─── TAB: EPISODIOS ─── */}
        {tabActiva === 'episodios' && (
          <>
            {/* Sub-vista: Lista de episodios */}
            {subVistaEpisodio === 'lista' && (
              <PacienteEpisodiosTab
                episodios={episodios}
                onAbrirEpisodio={abrirEpisodio}
                onNuevoEpisodioClick={() => setMostrarModalEpisodio(true)}
              />
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
                onAgregarSolicitudInternacion={onAgregarSolicitudInternacion}
                onAgregarResultadoEstudio={onAgregarResultadoEstudio}
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
          corePatient={paciente}
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
