// src/pages/EpisodioDetalle.jsx
import { useState } from 'react';
import NuevaEvolucion from './NuevaEvolucion';
import NuevaReceta from './NuevaReceta';
import NuevoPedidoEstudio from './NuevoPedidoEstudio';
import SolicitarInternacion from './SolicitarInternacion';
import NuevaSolicitudPase from './NuevaSolicitudPase';
import CargarResultadoEstudio from './CargarResultadoEstudio';
import EpisodioHeaderCard from '../components/episodio/EpisodioHeaderCard';
import EvolucionesTab from '../components/episodio/EvolucionesTab';
import RecetasTab from '../components/episodio/RecetasTab';
import EstudiosTab from '../components/episodio/EstudiosTab';
import PasesYInternacionesTab from '../components/episodio/PasesYInternacionesTab';
import '../styles/EpisodioDetalle.css';
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
  const [subTab, setSubTab] = useState('timeline');
  const [mostrarModalEvolucion, setMostrarModalEvolucion] = useState(false);
  const [mostrarModalReceta, setMostrarModalReceta] = useState(false);
  const [mostrarModalEstudio, setMostrarModalEstudio] = useState(false);
  const [mostrarModalInternacion, setMostrarModalInternacion] = useState(false);
  const [mostrarModalSolicitudPase, setMostrarModalSolicitudPase] = useState(false);
  const [mostrarModalCargarResultado, setMostrarModalCargarResultado] = useState(false);
  const [estudioSeleccionadoIndex, setEstudioSeleccionadoIndex] = useState(null);

  if (!episodio) return null;

  const esAbierto = episodio.estado === 'abierto';
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
      <EpisodioHeaderCard
        episodio={episodio}
        onDarDeAlta={handleDarDeAlta}
        onSolicitarInternacionClick={() => setMostrarModalInternacion(true)}
      />

      {/* Sub-tabs: Evoluciones | Recetas | Pedidos de Estudios | Solicitudes de Pase | Solicitudes de Internación */}
      <div className="ep-detalle__subtabs">
        <button
          className={`ep-detalle__subtab ${subTab === 'timeline' ? 'ep-detalle__subtab--activa' : ''}`}
          onClick={() => setSubTab('timeline')}
        >
          Línea de Tiempo
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

      {/* ── SUB-TAB: TIMELINE (Línea de Tiempo) ── */}
      {subTab === 'timeline' && (
        <EvolucionesTab
          evoluciones={evoluciones}
          recetas={recetas}
          estudios={estudios}
          pases={solicitudesPase}
          internaciones={solicitudesInternacion}
          esAbierto={esAbierto}
          episodioIndex={episodioIndex}
          onVerEvolucion={onVerEvolucion}
          onNuevaEvolucionClick={() => setMostrarModalEvolucion(true)}
        />
      )}

      {/* ── SUB-TAB: RECETAS ── */}
      {subTab === 'recetas' && (
        <RecetasTab
          recetas={recetas}
          evoluciones={evoluciones}
          esAbierto={esAbierto}
          pacienteIndex={pacienteIndex}
          episodioIndex={episodioIndex}
          onCambiarEstadoReceta={onCambiarEstadoReceta}
          onNuevaRecetaClick={() => setMostrarModalReceta(true)}
        />
      )}

      {/* ── SUB-TAB: ESTUDIOS ── */}
      {subTab === 'estudios' && (
        <EstudiosTab
          estudios={estudios}
          esAbierto={esAbierto}
          episodioIndex={episodioIndex}
          onVerEstudio={onVerEstudio}
          onCargarResultadoClick={(idx) => {
            setEstudioSeleccionadoIndex(idx);
            setMostrarModalCargarResultado(true);
          }}
          onNuevoPedidoClick={() => setMostrarModalEstudio(true)}
        />
      )}

      {/* ── SUB-TAB: SOLICITUDES DE PASE ── */}
      {subTab === 'solicitudespase' && (
        <PasesYInternacionesTab
          tipo="pase"
          solicitudes={solicitudesPase}
          esAbierto={esAbierto}
          onNuevaSolicitudClick={() => setMostrarModalSolicitudPase(true)}
        />
      )}

      {/* ── SUB-TAB: SOLICITUDES DE INTERNACIÓN ── */}
      {subTab === 'internaciones' && (
        <PasesYInternacionesTab
          tipo="internacion"
          solicitudes={solicitudesInternacion}
          esAbierto={esAbierto}
          onNuevaSolicitudClick={() => setMostrarModalInternacion(true)}
        />
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
