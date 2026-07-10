// src/pages/EpisodioDetalle.jsx
import { useState, useEffect, useCallback } from 'react';
import { pacienteService } from '../services/pacienteService';
import { ordenService } from '../services/ordenService';
import { solicitudCamaService } from '../services/solicitudCamaService';
import NuevaEvolucion from './NuevaEvolucion';
import NuevaReceta from './NuevaReceta';
import NuevoPedidoEstudio from './NuevoPedidoEstudio';
import SolicitarInternacion from './SolicitarInternacion';
import NuevaSolicitudPase from './NuevaSolicitudPase';
import CargarResultadoEstudio from './CargarResultadoEstudio';
import EpisodioHeaderCard from '../components/episodio/EpisodioHeaderCard';
import EvolucionesTab from '../components/episodio/EvolucionesTab';
import EvolucionesListaTab from '../components/episodio/EvolucionesListaTab';
import RecetasTab from '../components/episodio/RecetasTab';
import EstudiosTab from '../components/episodio/EstudiosTab';
import InternacionPasesTab from '../components/episodio/InternacionPasesTab';
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

  // Carga (o recarga) todo el detalle del episodio desde el backend:
  // evoluciones, recetas, órdenes de estudio y solicitudes de cama + cama actual.
  const cargarDetalle = useCallback(async () => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks || !episodio || !episodio.id_episodio || !onActualizarDetalleEpisodio) return;

    setLoadingDetalle(true);
    try {
      const [evoluciones, todasLasRecetas, ordenes, solicitudesResp] = await Promise.all([
        pacienteService.obtenerEvoluciones(paciente.core_patient_id, episodio.id_episodio),
        pacienteService.obtenerRecetas(paciente.core_patient_id),
        ordenService.listarOrdenesEpisodio(paciente.core_patient_id, episodio.id_episodio),
        solicitudCamaService.listar(paciente.core_patient_id, episodio.id_episodio),
      ]);

      const idsEvoluciones = (evoluciones || []).map(ev => ev.id_evolucion);
      const recetasDelEpisodio = (todasLasRecetas || []).filter(rec => idsEvoluciones.includes(rec.id_evolucion));

      onActualizarDetalleEpisodio(pacienteIndex, episodioIndex, {
        evoluciones: evoluciones || [],
        recetas: recetasDelEpisodio,
        estudios: ordenes || [],
        solicitudesCama: solicitudesResp?.solicitudes || [],
        camaActual: solicitudesResp?.cama_actual || null,
        internado: solicitudesResp?.internado || false,
      });
    } catch (err) {
      console.error('[EpisodioDetalle] Error cargando detalle del episodio:', err);
    } finally {
      setLoadingDetalle(false);
    }
    // onActualizarDetalleEpisodio se EXCLUYE a propósito: App la recrea en cada
    // render y, si fuera dependencia, el efecto entraría en loop infinito.
    // Usa setPacientes(prev => ...), por lo que una referencia "vieja" es segura.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [episodio?.id_episodio, paciente.core_patient_id, pacienteIndex, episodioIndex]);

  useEffect(() => {
    cargarDetalle();
  }, [cargarDetalle]);

  if (!episodio) return null;

  const esAbierto = episodio.estado === 'abierto';
  const evoluciones = episodio.evolucionesData || [];
  const recetas = episodio.recetasData || [];
  const estudios = episodio.estudiosData || [];
  const camaActual = episodio.camaActual || null;

  // Solicitudes de cama (internación + pase) persistidas en el backend.
  const solicitudesCama = (episodio.solicitudesCamaData || []).map((s) => ({ ...s, _tipo: s.tipo }));
  const solicitudesInternacion = solicitudesCama.filter((s) => s.tipo === 'internacion');
  const solicitudesPase = solicitudesCama.filter((s) => s.tipo === 'pase');

  // ¿Hay alguna solicitud pendiente? (bloquea generar otra)
  const hayPendiente = solicitudesCama.some((s) => s.estado === 'pendiente');
  // ¿La internación ya fue aceptada / el paciente está internado? (habilita pase de cama)
  const hayInternacionAceptada = !!camaActual || solicitudesInternacion.some((s) => s.estado === 'aceptada');
  const labelSolicitudCama = hayInternacionAceptada ? 'Solicitar Pase de Cama' : 'Solicitar Internación';

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

  const handleGuardarEstudio = async (data) => {
    await onAgregarEstudio(pacienteIndex, episodioIndex, data);
    setMostrarModalEstudio(false);
    await cargarDetalle();
  };

  const handleGuardarResultadoEstudio = async (data) => {
    if (onAgregarResultadoEstudio) {
      await onAgregarResultadoEstudio(pacienteIndex, episodioIndex, estudioSeleccionadoIndex, data);
    }
    setMostrarModalCargarResultado(false);
    await cargarDetalle();
  };

  // Crea una solicitud de internación (persistida en backend) y refresca.
  const handleEnviarInternacion = async (data) => {
    try {
      await solicitudCamaService.crear(paciente.core_patient_id, episodio.id_episodio, {
        tipo: 'internacion',
        prioridad: data.prioridad || 'Media',
        sector: data.sector,
        motivo: data.motivo,
      });
      setMostrarModalInternacion(false);
      await cargarDetalle();
    } catch (err) {
      console.error('[EpisodioDetalle] Error al crear solicitud de internación:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar la solicitud de internación.' });
    }
  };

  // Crea una solicitud de pase de cama (persistida en backend) y refresca.
  const handleGuardarSolicitudPase = async (data) => {
    try {
      await solicitudCamaService.crear(paciente.core_patient_id, episodio.id_episodio, {
        tipo: 'pase',
        prioridad: data.prioridad || 'Media',
        sector: data.sector,
        motivo: data.motivo,
      });
      setMostrarModalSolicitudPase(false);
      await cargarDetalle();
    } catch (err) {
      console.error('[EpisodioDetalle] Error al crear solicitud de pase:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar la solicitud de pase.' });
    }
  };

  // Botón de cama del header: bloquea si ya hay una solicitud pendiente,
  // y abre el modal correcto según el estado (internación o pase de cama).
  const handleSolicitudCamaClick = () => {
    if (hayPendiente) {
      Swal.fire({
        icon: 'warning',
        title: 'Solicitud pendiente',
        text: 'Ya existe una solicitud de internación o pase de cama pendiente. Espere la respuesta de Camas (M6) o cancélela antes de generar una nueva.',
        confirmButtonColor: '#259A5E',
      });
      return;
    }
    if (hayInternacionAceptada) {
      setMostrarModalSolicitudPase(true);
    } else {
      setMostrarModalInternacion(true);
    }
  };

  const handleCancelarSolicitud = (tipo, id_solicitud) => {
    Swal.fire({
      title: '¿Cancelar solicitud?',
      text: 'La solicitud quedará marcada como cancelada.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await solicitudCamaService.cancelar(id_solicitud);
          await cargarDetalle();
        } catch (err) {
          console.error('[EpisodioDetalle] Error al cancelar solicitud:', err);
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar la solicitud.' });
        }
      }
    });
  };

  // Simula la respuesta de M6: aceptar (pide cama) o rechazar (pide motivo).
  const handleSimularIngreso = async (tipo, id_solicitud) => {
    const { value: decision } = await Swal.fire({
      title: 'Simular respuesta de M6 (Camas)',
      input: 'radio',
      inputOptions: { aceptada: '✅ Aceptar y asignar cama', rechazada: '❌ Rechazar' },
      inputValue: 'aceptada',
      showCancelButton: true,
      confirmButtonColor: '#259A5E',
      confirmButtonText: 'Continuar',
      cancelButtonText: 'Cancelar',
      inputValidator: (v) => (!v ? 'Elegí una opción' : undefined),
    });
    if (!decision) return;

    try {
      if (decision === 'aceptada') {
        const { value: cama } = await Swal.fire({
          title: 'Cama asignada por M6',
          input: 'text',
          inputPlaceholder: 'Ej: Cama 4 — Hab 201',
          showCancelButton: true,
          confirmButtonColor: '#259A5E',
          confirmButtonText: 'Confirmar ingreso',
          inputValidator: (v) => (!v || !v.trim() ? 'Ingresá la cama asignada' : undefined),
        });
        if (!cama) return;
        await solicitudCamaService.resolver(id_solicitud, { decision: 'aceptada', cama: cama.trim() });
        await cargarDetalle();
        Swal.fire({
          icon: 'success',
          title: 'Ingreso confirmado (M6)',
          text: tipo === 'pase'
            ? `Pase de cama aceptado. Cama: ${cama.trim()}.`
            : `Internación aceptada. Cama: ${cama.trim()}. Ahora puede solicitar pases de cama.`,
          confirmButtonColor: '#259A5E',
        });
      } else {
        const { value: motivo } = await Swal.fire({
          title: 'Motivo del rechazo (M6)',
          input: 'text',
          inputPlaceholder: 'Ej: No hay camas disponibles en el sector',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          confirmButtonText: 'Rechazar',
        });
        await solicitudCamaService.resolver(id_solicitud, { decision: 'rechazada', motivo_rechazo: motivo || '' });
        await cargarDetalle();
        Swal.fire({ icon: 'info', title: 'Solicitud rechazada por M6', confirmButtonColor: '#259A5E' });
      }
    } catch (err) {
      console.error('[EpisodioDetalle] Error al resolver solicitud:', err);
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo registrar la respuesta de M6.' });
    }
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
        camaActual={camaActual}
        onDarDeAlta={handleDarDeAlta}
        onSolicitudCamaClick={handleSolicitudCamaClick}
        labelSolicitudCama={labelSolicitudCama}
        esTurnoActivo={esTurnoActivo}
        onTerminarConsultaClick={handleTerminarConsulta}
      />

      {/* Sub-tabs: Historial | Evoluciones | Recetas | Pedidos de Estudios | Internación y Pases */}
      <div className="ep-detalle__subtabs">
        <button
          className={`ep-detalle__subtab ${subTab === 'timeline' ? 'ep-detalle__subtab--activa' : ''}`}
          onClick={() => setSubTab('timeline')}
        >
          Historial
        </button>
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
          className={`ep-detalle__subtab ${subTab === 'internacion' ? 'ep-detalle__subtab--activa' : ''}`}
          onClick={() => setSubTab('internacion')}
        >
          Internación y Pases
        </button>
      </div>

      {/* ── SUB-TAB: HISTORIAL (timeline read-only) ── */}
      {subTab === 'timeline' && (
        <EvolucionesTab
          evoluciones={evoluciones}
          recetas={recetas}
          estudios={estudios}
          pases={solicitudesPase.map((s) => ({ ...s, fecha: s.fecha_solicitud }))}
          internaciones={solicitudesInternacion.map((s) => ({ ...s, fecha: s.fecha_solicitud }))}
          esAbierto={esAbierto}
          episodioIndex={episodioIndex}
          onVerEvolucion={onVerEvolucion}
        />
      )}

      {/* ── SUB-TAB: EVOLUCIONES (solo evoluciones + alta) ── */}
      {subTab === 'evoluciones' && (
        <EvolucionesListaTab
          evoluciones={evoluciones}
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

      {/* ── SUB-TAB: INTERNACIÓN Y PASES (unificado) ── */}
      {subTab === 'internacion' && (
        <InternacionPasesTab
          solicitudes={solicitudesCama}
          esAbierto={esAbierto}
          onCancelarSolicitud={handleCancelarSolicitud}
          onSimularIngreso={handleSimularIngreso}
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
