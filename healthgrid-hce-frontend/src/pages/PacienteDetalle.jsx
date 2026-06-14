// src/pages/PacienteDetalle.jsx
import { useState, useEffect, useRef } from 'react';
import { FiCalendar, FiCreditCard, FiFileText, FiUser, FiActivity, FiAlertTriangle, FiClipboard, FiEdit3, FiEdit2, FiPlusCircle, FiFolder } from 'react-icons/fi';
import NuevaFichaMedica from './NuevaFichaMedica';
import NuevoEpisodio from './NuevoEpisodio';
import EpisodioDetalle from './EpisodioDetalle';
import EvolucionDetalle from './EvolucionDetalle';
import PedidoEstudioDetalle from './PedidoEstudioDetalle';
import PacienteHeaderCard from '../components/paciente/PacienteHeaderCard';
import PacienteFichaTab from '../components/paciente/PacienteFichaTab';
import PacienteEpisodiosTab from '../components/paciente/PacienteEpisodiosTab';
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

const PacienteDetalle = ({
  paciente,
  pacienteIndex,
  pacientes = [],
  onSeleccionarPaciente,
  onVolver,
  onNuevoRegistro,
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

  // Búsqueda de pacientes en topbar
  const [busquedaTopbar, setBusquedaTopbar] = useState('');
  const [sugerencias, setSugerencias] = useState([]);
  const searchContainerRef = useRef(null);

  const handleBusquedaTopbar = (e) => {
    const val = e.target.value;
    setBusquedaTopbar(val);
    const t = val.trim().toLowerCase();
    if (!t) { setSugerencias([]); return; }
    setSugerencias(
      pacientes
        .map((p, idx) => ({ ...p, _index: idx }))
        .filter(p =>
          (p.dni || '').toLowerCase().includes(t) ||
          (p.nombreApellido || '').toLowerCase().includes(t) ||
          (p.numeroHistoriaClinica || '').toLowerCase().includes(t)
        )
    );
  };

  const seleccionarSugerencia = (p) => {
    setBusquedaTopbar('');
    setSugerencias([]);
    onSeleccionarPaciente(p._index);
  };

  // Click outside para cerrar sugerencias
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setSugerencias([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <div ref={searchContainerRef} style={{ position: 'relative' }}>
            <div className="detalle-topbar__search-wrapper">
              <input
                type="text"
                placeholder="Buscar por DNI o Nombre..."
                className="detalle-topbar__search"
                value={busquedaTopbar}
                onChange={handleBusquedaTopbar}
              />
              <button className="detalle-topbar__search-btn">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="10.5" cy="10.5" r="7.5"></circle>
                  <line x1="21" y1="21" x2="15.8" y2="15.8"></line>
                </svg>
              </button>
            </div>
            {sugerencias.length > 0 && (
              <div className="detalle-topbar__sugerencias">
                {sugerencias.map((p) => (
                  <div
                    key={p.id}
                    className="detalle-topbar__sugerencia-item"
                    onClick={() => seleccionarSugerencia(p)}
                  >
                    <div className="detalle-topbar__sugerencia-avatar">
                      {(p.nombreApellido || '??').split(/\s+/).slice(-1)[0]?.[0]?.toUpperCase() || '?'}
                      {(p.nombreApellido || '??').split(/\s+/)[0]?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="detalle-topbar__sugerencia-info">
                      <span className="detalle-topbar__sugerencia-nombre">{p.nombreApellido}</span>
                      <span className="detalle-topbar__sugerencia-meta">DNI {p.dni} · HC {p.numeroHistoriaClinica}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
