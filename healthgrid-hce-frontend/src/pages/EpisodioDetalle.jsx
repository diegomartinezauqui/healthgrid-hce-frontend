// src/pages/EpisodioDetalle.jsx
import { useState, useEffect } from 'react';
import { pacienteService } from '../services/pacienteService';
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
import NotificacionObligatoria from '../components/NotificacionObligatoria';
import { detectarNotificacionObligatoria } from '../data/patologiasNotificables';
import { emitirNotificacionObligatoria } from '../services/epidemiologia';
import { FiActivity, FiFileText, FiLayers, FiSend, FiCheckCircle, FiPlusCircle, FiAlertTriangle } from 'react-icons/fi';
import { FaBed } from 'react-icons/fa';
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
  esTurnoActivo,
  onFinalizarAtencion,
  turnoActivo,
  onActualizarDetalleEpisodio,
}) => {
  const [subTab, setSubTab] = useState('timeline');
  const [mostrarModalEvolucion, setMostrarModalEvolucion] = useState(false);
  const [mostrarModalReceta, setMostrarModalReceta] = useState(false);
  const [mostrarModalEstudio, setMostrarModalEstudio] = useState(false);
  const [mostrarModalInternacion, setMostrarModalInternacion] = useState(false);
  const [mostrarModalSolicitudPase, setMostrarModalSolicitudPase] = useState(false);
  const [mostrarModalCargarResultado, setMostrarModalCargarResultado] = useState(false);
  const [estudioSeleccionadoIndex, setEstudioSeleccionadoIndex] = useState(null);
  const [notificacion, setNotificacion] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);

  useEffect(() => {
    const cargarDetalleEpisodio = async () => {
      const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
      if (useMocks || !episodio || !episodio.id_episodio) return;

      setLoadingDetalle(true);
      try {
        console.log(`[EpisodioDetalle] Cargando evoluciones y recetas reales del episodio ${episodio.id_episodio}...`);
        const [evoluciones, todasLasRecetas] = await Promise.all([
          pacienteService.obtenerEvoluciones(paciente.core_patient_id, episodio.id_episodio),
          pacienteService.obtenerRecetas(paciente.core_patient_id)
        ]);

        if (evoluciones && todasLasRecetas) {
          const idsEvoluciones = evoluciones.map(ev => ev.id_evolucion);
          const recetasDelEpisodio = todasLasRecetas.filter(rec => idsEvoluciones.includes(rec.id_evolucion));

          if (onActualizarDetalleEpisodio) {
            onActualizarDetalleEpisodio(pacienteIndex, episodioIndex, evoluciones, recetasDelEpisodio);
          }
        }
      } catch (err) {
        console.error('[EpisodioDetalle] Error cargando detalle de evolución/recetas:', err);
      } finally {
        setLoadingDetalle(false);
      }
    };
    cargarDetalleEpisodio();
  }, [episodio?.id_episodio, paciente.core_patient_id, pacienteIndex, episodioIndex]);

  if (!episodio) return null;

  const esAbierto = episodio.estado === 'abierto';
  const evoluciones = episodio.evolucionesData || [];
  const recetas = episodio.recetasData || [];
  const estudios = episodio.estudiosData || [];
  const solicitudesPase = episodio.solicitudesPaseData || [];
  const solicitudesInternacion = episodio.solicitudesInternacionData || [];

  const handleGuardarEvolucion = async (data) => {
    const patologia = detectarNotificacionObligatoria(
      `${data.diagnostico || ''} ${data.motivoEstado || ''}`
    );

    const evolucionData = patologia
      ? {
          ...data,
          notificacionObligatoria: {
            codigo: patologia.codigo,
            nombre: patologia.nombre,
            modalidad: patologia.modalidad,
          },
        }
      : data;

    onAgregarEvolucion(pacienteIndex, episodioIndex, evolucionData);
    setMostrarModalEvolucion(false);

    if (patologia) {
      try {
        const evento = await emitirNotificacionObligatoria({
          paciente: paciente?.nombreApellido,
          historiaClinica: paciente?.numeroHistoriaClinica,
          episodioId: episodio?.id,
          diagnostico: data.diagnostico,
          patologia: patologia.codigo,
          profesional: data.profesional,
          fecha: new Date().toISOString(),
        });
        setNotificacion({ patologia, evento });
      } catch (e) {
        console.error('No se pudo emitir la notificación obligatoria:', e);
        setNotificacion({ patologia, evento: null });
      }
    }
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

  const handleTerminarConsulta = () => {
    Swal.fire({
      title: '¿Terminar consulta sin dar de alta?',
      text: "El consultorio quedará liberado en la sala de espera, pero el episodio clínico permanecerá ABIERTO para que el paciente pueda ser atendido nuevamente.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, terminar consulta',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        onFinalizarAtencion(turnoActivo, false);
        Swal.fire({
          title: 'Turno finalizado',
          text: 'El consultorio ha sido liberado. El episodio clínico permanece abierto.',
          icon: 'success',
          confirmButtonColor: '#259A5E'
        });
      }
    });
  };

  if (loadingDetalle) {
    return (
      <div className="ep-detalle" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '100px 20px' }}>
        <div style={{ width: '40px', height: '40px', border: '3px solid rgba(37, 154, 94, 0.1)', borderTop: '3px solid #259A5E', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '20px' }} />
        <p style={{ color: '#11352A', fontWeight: 'bold' }}>Recuperando evoluciones y recetas de este episodio...</p>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

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
        esTurnoActivo={esTurnoActivo}
        onTerminarConsultaClick={handleTerminarConsulta}
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

      {/* Toast: Notificación Obligatoria Emitida (evento asincrónico a Epidemiología) */}
      {notificacion && (
        <NotificacionObligatoria
          patologia={notificacion.patologia}
          evento={notificacion.evento}
          onCerrar={() => setNotificacion(null)}
        />
      )}
    </div>
  );
};

export default EpisodioDetalle;
