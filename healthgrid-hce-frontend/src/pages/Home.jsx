// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import NuevaFichaMedica from './NuevaFichaMedica';
import { useSalaEspera } from '../hooks/useSalaEspera';
import { pacienteService } from '../services/pacienteService';
import { formatearNumeroHC } from '../utils/helpers';

const Home = ({ 
  pacientes = [], 
  onSeleccionarPaciente, 
  onGuardarPaciente, 
  onIniciarAtencion, 
  abrirModalNuevo = false, 
  onModalNuevoCerrado,
  turnoActivo = null,
  fichasRecientes = [],
  onGuardarPacienteSilencioso,
  onFinalizarAtencion
}) => {
  const [tabActiva, setTabActiva] = useState('agenda'); // 'agenda' | 'busqueda'

  const {
    agenda,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    coreResults,
    buscando,
    pagina,
    setPagina,
    tieneMas,
    filtroEstado,
    setFiltroEstado,
    filtroTriage,
    setFiltroTriage,
    mostrarModal,
    setMostrarModal,
    corePatientToCreate,
    setCorePatientToCreate,
    handleLlamarPaciente,
    handleIniciarAtencion,
    handleMarcarAusente,
    handleGuardarFicha,
    obtenerAccionFicha
  } = useSalaEspera({
    pacientes,
    turnoActivo,
    onIniciarAtencion,
    onGuardarPaciente,
    onGuardarPacienteSilencioso
  });

  const handleSeleccionarPacienteBusqueda = async (cp) => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks) {
      onSeleccionarPaciente(cp);
      return;
    }

    const pacienteMemoria = pacientes.find(p => p.core_patient_id === cp.core_patient_id);
    if (pacienteMemoria && pacienteMemoria.tieneFichaClinica !== undefined) {
      if (pacienteMemoria.tieneFichaClinica) {
        onSeleccionarPaciente(cp);
      } else {
        setCorePatientToCreate(cp);
        setMostrarModal(true);
      }
      return;
    }

    try {
      Swal.fire({
        title: 'Verificando ficha médica...',
        text: 'Conectando con el servidor HCE',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      const ficha = await pacienteService.obtenerFicha(cp.core_patient_id);
      Swal.close();

      if (ficha) {
        onGuardarPacienteSilencioso({
          ...cp,
          grupoSanguineo: ficha.grupo_sanguineo || 'O+',
          observaciones: ficha.observaciones_generales || '',
          peso_kg: ficha.peso_kg || null,
          altura_cm: ficha.altura_cm || null,
          antecedentes: ficha.antecedentes || [],
          consideraciones: ficha.alertas_clinicas || [],
          episodios: ficha.episodios || [],
          tieneFichaClinica: true
        });
        onSeleccionarPaciente(cp);
      } else {
        onGuardarPacienteSilencioso({
          ...cp,
          tieneFichaClinica: false
        });
        setCorePatientToCreate(cp);
        setMostrarModal(true);
      }
    } catch (err) {
      Swal.close();
      console.log(`[Home] Ficha no encontrada en el backend para ${cp.core_patient_id}. Abriendo creación.`);
      onGuardarPacienteSilencioso({
        ...cp,
        tieneFichaClinica: false
      });
      setCorePatientToCreate(cp);
      setMostrarModal(true);
    }
  };

  // Abrir modal automáticamente si viene de "Nuevo Registro"
  useEffect(() => {
    if (abrirModalNuevo) {
      setMostrarModal(true);
      if (onModalNuevoCerrado) onModalNuevoCerrado();
    }
  }, [abrirModalNuevo]);

  const formatHora = (fechaIso) => {
    if (!fechaIso) return '—';
    return new Date(fechaIso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'En espera': return { bg: '#FFF3E0', color: '#E65100' };
      case 'En triage': return { bg: '#E3F2FD', color: '#1565C0' };
      case 'En atención': return { bg: '#E0F2F1', color: '#00695C' };
      case 'Atendido': return { bg: '#E8F5E9', color: '#2E7D32' };
      case 'Llamado': return { bg: '#E3F2FD', color: '#0D47A1' };
      case 'Ausente': return { bg: '#FFEBEE', color: '#C62828' };
      default: return { bg: '#F5F5F5', color: '#616161' };
    }
  };

  const getTriageBadgeColor = (triage) => {
    switch (triage) {
      case 'Rojo': return '#ffebee';
      case 'Amarillo': return '#fff8e1';
      case 'Verde': return '#e8f5e9';
      default: return '#f5f5f5';
    }
  };

  const getTriageTextColor = (triage) => {
    switch (triage) {
      case 'Rojo': return '#c62828';
      case 'Amarillo': return '#f57f17';
      case 'Verde': return '#2e7d32';
      default: return '#616161';
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F4F7F6' }}>
      
      {/* Barra de Navegación Superior */}
      <header style={{ backgroundColor: 'white', padding: '15px 30px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #E0E0E0', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button 
            style={{ 
              background: 'none', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
              color: tabActiva === 'agenda' ? '#11352A' : '#999',
              borderBottom: tabActiva === 'agenda' ? '3px solid #259A5E' : '3px solid transparent',
              paddingBottom: '5px'
            }}
            onClick={() => setTabActiva('agenda')}
          >
            Mi Agenda / Sala de Espera
          </button>
          <button 
            style={{ 
              background: 'none', border: 'none', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
              color: tabActiva === 'busqueda' ? '#11352A' : '#999',
              borderBottom: tabActiva === 'busqueda' ? '3px solid #259A5E' : '3px solid transparent',
              paddingBottom: '5px'
            }}
            onClick={() => setTabActiva('busqueda')}
          >
            Búsqueda Global
          </button>
        </div>

        {tabActiva === 'busqueda' && (
          <div style={{ display: 'flex', border: '2.5px solid #11352A', borderRadius: '10px', overflow: 'hidden', width: '380px' }}>
            <input 
              type="text" 
              placeholder="Buscar por DNI o Nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ flexGrow: 1, padding: '10px 15px', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#333', backgroundColor: 'transparent' }}
            />
            <button style={{ backgroundColor: '#11352A', color: 'white', padding: '0 20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10.5" cy="10.5" r="7.5"></circle>
                <line x1="21" y1="21" x2="15.8" y2="15.8"></line>
              </svg>
            </button>
          </div>
        )}
      </header>

      {/* Contenido Principal */}
      <main style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
        
        {/* Banner Verde (Solo en Búsqueda Global) */}
        {tabActiva === 'busqueda' && (
          <div style={{ backgroundColor: '#11352A', color: 'white', padding: '50px 40px', borderRadius: '15px', marginBottom: '30px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {/* Círculos decorativos */}
            <div style={{ position: 'absolute', right: '-80px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8, pointerEvents: 'none' }}>
              <div style={{ width: '380px', height: '380px', borderRadius: '50%', border: '40px solid #164636', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '220px', height: '220px', borderRadius: '50%', border: '40px solid #1a5441' }}></div>
              </div>
            </div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h1 style={{ margin: '0 0 15px 0', fontSize: '2.4rem', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.5px' }}>
                Búsqueda <span style={{ color: '#259A5E', fontWeight: 'bold' }}>Global</span>
              </h1>
              <p style={{ margin: 0, maxWidth: '550px', color: '#A0B8B0', lineHeight: '1.6', fontSize: '0.95rem' }}>
                Busque en todo el padrón del Core para encontrar pacientes que no tienen turno hoy.
              </p>
            </div>
          </div>
        )}

        {/* Indicadores de carga y error */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#11352A', fontWeight: 'bold' }}>
            Cargando sala de espera...
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#c62828', fontWeight: 'bold' }}>
            {error}
          </div>
        )}

        {/* CONTENIDO TAB AGENDA */}
        {tabActiva === 'agenda' && !loading && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
              <div>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.4rem', color: '#11352A' }}>Mi Agenda del Día</h2>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem' }}>Listado de pacientes asignados a tu consultorio ordenados por horario de turno.</p>
              </div>

              {/* Controles de Filtro */}
              <div style={{ display: 'flex', gap: '15px', backgroundColor: '#F9FBFA', padding: '10px 15px', borderRadius: '10px', border: '1px solid #E8ECE9' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'bold' }}>Estado:</span>
                  <select 
                    value={filtroEstado} 
                    onChange={e => setFiltroEstado(e.target.value)}
                    style={{ border: '1px solid #CCC', borderRadius: '6px', padding: '5px 10px', fontSize: '0.85rem', outline: 'none', backgroundColor: 'white' }}
                  >
                    <option value="Todos">Todos</option>
                    <option value="Pendientes">Pendientes</option>
                    <option value="Atendidos">Atendidos</option>
                  </select>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: 'bold' }}>Triage:</span>
                  <select 
                    value={filtroTriage} 
                    onChange={e => setFiltroTriage(e.target.value)}
                    style={{ border: '1px solid #CCC', borderRadius: '6px', padding: '5px 10px', fontSize: '0.85rem', outline: 'none', backgroundColor: 'white' }}
                  >
                    <option value="Todos">Todos</option>
                    <option value="Rojo">Rojo (Emergencia)</option>
                    <option value="Amarillo">Amarillo (Urgencia)</option>
                    <option value="Verde">Verde (Normal)</option>
                  </select>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {agenda.length > 0 ? agenda.map((turno) => {
                const { fichaMedicaIdx, tieneFicha } = obtenerAccionFicha(turno.paciente);
                const estaEnAtencion = turno.estado === 'En atención' || (turnoActivo && turnoActivo.id_espera === turno.id_espera);
                const badgeColor = getBadgeColor(estaEnAtencion ? 'En atención' : turno.estado);

                return (
                  <div key={turno.id_espera} style={{
                    backgroundColor: '#F9FBFA', border: '1px solid #E8ECE9', borderRadius: '10px',
                    padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <div style={{ textAlign: 'center', minWidth: '80px', borderRight: '1px solid #E0E0E0', paddingRight: '20px' }}>
                        <div style={{ fontSize: turno.horario_turno ? '1.2rem' : '0.9rem', fontWeight: 'bold', color: '#11352A' }}>
                          {turno.horario_turno ? formatHora(turno.horario_turno) : 'Espontáneo'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#888' }}>
                          {turno.horario_turno ? 'Turno' : 'Llegada: ' + formatHora(turno.hora_llegada)}
                        </div>
                      </div>
                      
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                          <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#11352A', fontWeight: 'bold' }}>
                            {turno.paciente.nombreApellido}
                          </h4>
                          <span style={{
                            fontSize: '0.7rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '12px',
                            backgroundColor: badgeColor.bg, color: badgeColor.color
                          }}>
                            {(estaEnAtencion ? 'En atención' : turno.estado).toUpperCase()}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#666', flexWrap: 'wrap' }}>
                          <span>DNI: <strong>{turno.paciente.dni}</strong></span>
                          <span>Llegada: <strong>{formatHora(turno.hora_llegada)}</strong></span>
                          <span>Atención: <strong>{turno.tipo_atencion}</strong></span>
                          <span style={{ 
                            padding: '1px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                            backgroundColor: getTriageBadgeColor(turno.nivel_triage),
                            color: getTriageTextColor(turno.nivel_triage)
                          }}>
                            Triage: {turno.nivel_triage}
                          </span>
                          {turno.estado === 'Llamado' && turno.consultorio && (
                            <span style={{ color: '#0D47A1', fontWeight: 'bold' }}>
                              Consultorio: {turno.consultorio}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#444', marginTop: '5px' }}>
                          Motivo: <strong>{turno.motivo}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      {turno.estado === 'Atendido' ? (
                        <button
                          onClick={() => {
                            if (tieneFicha) {
                              onSeleccionarPaciente(fichaMedicaIdx);
                            } else {
                              setCorePatientToCreate(turno.paciente);
                              setMostrarModal(true);
                            }
                          }}
                          style={{
                            backgroundColor: tieneFicha ? '#E8F5E9' : '#E0E0E0', 
                            color: tieneFicha ? '#2e7d32' : '#666', 
                            padding: '12px 20px', borderRadius: '8px', 
                            border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {tieneFicha ? 'Ver Registro' : 'Completar Ficha'}
                        </button>
                      ) : estaEnAtencion ? (
                        <>
                          <button
                            onClick={() => {
                              if (tieneFicha) {
                                onSeleccionarPaciente(fichaMedicaIdx);
                              } else {
                                setCorePatientToCreate(turno.paciente);
                                setMostrarModal(true);
                              }
                            }}
                            style={{
                              backgroundColor: '#E65100', 
                              color: 'white', padding: '12px 20px', borderRadius: '8px', 
                              border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem',
                              display: 'flex', alignItems: 'center', gap: '8px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#BF360C'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#E65100'}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            RETOMAR CONSULTA
                          </button>
                          
                          <button
                            onClick={() => {
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
                                  onFinalizarAtencion(turno, false);
                                  Swal.fire({
                                    title: 'Turno finalizado',
                                    text: 'El consultorio ha sido liberado. El episodio clínico permanece abierto.',
                                    icon: 'success',
                                    confirmButtonColor: '#259A5E'
                                  });
                                }
                              });
                            }}
                            style={{
                              backgroundColor: '#0284c7', 
                              color: 'white', padding: '12px 20px', borderRadius: '8px', 
                              border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem',
                              display: 'flex', alignItems: 'center', gap: '8px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0369a1'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0284c7'}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            TERMINAR CONSULTA
                          </button>
                        </>
                      ) : turno.estado === 'Llamado' ? (
                        <>
                          <button
                            onClick={() => handleIniciarAtencion(turno)}
                            style={{
                              backgroundColor: '#259A5E', 
                              color: 'white', padding: '12px 20px', borderRadius: '8px', 
                              border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem',
                              display: 'flex', alignItems: 'center', gap: '8px',
                              transition: 'all 0.2s ease',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e7b4b'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#259A5E'}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                            ATENDER
                          </button>
                          
                          <button
                            onClick={() => handleMarcarAusente(turno)}
                            style={{
                              backgroundColor: '#F5F5F5', 
                              color: '#C62828', padding: '12px 15px', borderRadius: '8px', 
                              border: '1px solid #FFCDD2', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem',
                              display: 'flex', alignItems: 'center', gap: '5px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.backgroundColor = '#FFEBEE';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.backgroundColor = '#F5F5F5';
                            }}
                          >
                            AUSENTE
                          </button>

                          <button
                            onClick={() => handleLlamarPaciente(turno)}
                            title="Llamar nuevamente"
                            style={{
                              backgroundColor: '#F5F5F5', 
                              color: '#0D47A1', padding: '12px', borderRadius: '8px', 
                              border: '1px solid #BBDEFB', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E3F2FD'}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          </button>
                        </>
                      ) : turno.estado === 'Ausente' ? (
                        <button
                          onClick={() => handleLlamarPaciente(turno)}
                          style={{
                            backgroundColor: '#F5F5F5', 
                            color: '#666', padding: '12px 20px', borderRadius: '8px', 
                            border: '1px solid #DDD', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#EEEEEE'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
                        >
                          LLAMAR NUEVAMENTE
                        </button>
                      ) : (
                        <button
                          onClick={() => handleLlamarPaciente(turno)}
                          style={{
                            backgroundColor: tieneFicha ? '#259A5E' : '#1976D2', 
                            color: 'white', padding: '12px 20px', borderRadius: '8px', 
                            border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.88rem',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = tieneFicha ? '#1e7b4b' : '#1565C0'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = tieneFicha ? '#259A5E' : '#1976D2'}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          LLAMAR PACIENTE
                        </button>
                      )}
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  No tienes pacientes en la sala de espera para el día de hoy.
                </div>
              )}
            </div>
          </div>
        )}


        {/* CONTENIDO TAB BUSQUEDA GLOBAL */}
        {tabActiva === 'busqueda' && !loading && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            
            {/* Si no hay búsqueda escrita, mostramos las fichas recientes */}
            {!searchTerm.trim() ? (
              <div>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#11352A' }}>Fichas Médicas Recientes</h2>
                <p style={{ margin: '0 0 25px 0', color: '#666', fontSize: '0.9rem' }}>
                  Últimos pacientes visitados por tu usuario. Accede rápidamente a su historial clínico.
                </p>

                {fichasRecientes.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {fichasRecientes.map((cp) => {
                      return (
                        <div
                          key={cp.core_patient_id}
                          onClick={() => handleSeleccionarPacienteBusqueda(cp)}
                          style={{
                            backgroundColor: '#F9FBFA', border: '1px solid #E8ECE9', borderRadius: '8px',
                            padding: '15px 20px', display: 'flex', justifyContent: 'space-between',
                            alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#EAEFEA';
                            e.currentTarget.style.borderColor = '#C8E6C9';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#F9FBFA';
                            e.currentTarget.style.borderColor = '#E8ECE9';
                          }}
                        >
                          <div>
                            <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: '#11352A', fontWeight: '600' }}>
                              {cp.nombreApellido}
                            </h4>
                            <span style={{ fontSize: '0.8rem', color: '#666', marginRight: '15px' }}>
                              DNI: <strong>{cp.dni || '—'}</strong>
                            </span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{
                              fontSize: '0.72rem', fontWeight: '700', color: '#259A5E',
                              backgroundColor: '#E8F5E9', padding: '3px 10px', borderRadius: '12px'
                            }}>
                              ✓ Ficha Médica
                            </span>
                            <span style={{ color: '#CCC', fontSize: '1.2rem', fontWeight: 'bold' }}>›</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#888', fontStyle: 'italic', border: '1px dashed #DDD', borderRadius: '10px' }}>
                    Aún no has visitado ninguna ficha médica en esta sesión. Usa la barra superior de búsqueda.
                  </div>
                )}
              </div>
            ) : (
              // BÚSQUEDA ACTIVA
              <div>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#11352A' }}>Búsqueda Global</h2>
                <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.9rem' }}>
                  Resultados del padrón de pacientes en base a tu consulta.
                </p>

                <div style={{ marginTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.05rem', color: '#11352A', fontWeight: 'bold' }}>
                      Pacientes encontrados ({coreResults.length})
                    </h3>
                    {buscando && <span style={{ fontSize: '0.85rem', color: '#259A5E', fontWeight: 'bold' }}>Buscando...</span>}
                  </div>

                  {buscando ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                      Filtrando base de datos de pacientes...
                    </div>
                  ) : coreResults.length > 0 ? (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                        {coreResults.map((cp) => {
                          const { fichaMedicaIdx, tieneFicha, fichaMedica } = obtenerAccionFicha(cp);
                          return (
                            <div
                              key={cp.core_patient_id}
                              onClick={() => handleSeleccionarPacienteBusqueda(cp)}
                              style={{
                                backgroundColor: '#F9FBFA', border: '1px solid #E8ECE9', borderRadius: '8px',
                                padding: '15px 20px', display: 'flex', justifyContent: 'space-between',
                                alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
                              }}
                              onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#EAEFEA';
                                e.currentTarget.style.borderColor = '#C8E6C9';
                              }}
                              onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = '#F9FBFA';
                                e.currentTarget.style.borderColor = '#E8ECE9';
                              }}
                            >
                              <div>
                                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: '#11352A', fontWeight: '600' }}>
                                  {cp.nombreApellido}
                                </h4>
                                <span style={{ fontSize: '0.8rem', color: '#666', marginRight: '15px' }}>
                                  DNI: <strong>{cp.dni || '—'}</strong>
                                </span>
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                  HC: <strong>#{formatearNumeroHC(cp.core_patient_id)}</strong>
                                </span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                {tieneFicha ? (
                                  <span style={{
                                    fontSize: '0.72rem', fontWeight: '700', color: '#259A5E',
                                    backgroundColor: '#E8F5E9', padding: '3px 10px', borderRadius: '12px'
                                  }}>
                                    ✓ Ver Ficha Médica
                                  </span>
                                ) : (
                                  <span style={{
                                    fontSize: '0.72rem', fontWeight: '700', color: '#11352A',
                                    backgroundColor: '#E0E0E0', padding: '3px 10px', borderRadius: '12px'
                                  }}>
                                    + Crear Ficha
                                  </span>
                                )}
                                <span style={{ color: '#CCC', fontSize: '1.2rem', fontWeight: 'bold' }}>›</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* CONTROLES DE PAGINACIÓN */}
                      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '25px', paddingTop: '15px', borderTop: '1px solid #EEE' }}>
                        <button
                          disabled={pagina === 1}
                          onClick={() => setPagina(prev => Math.max(prev - 1, 1))}
                          style={{
                            padding: '8px 16px', borderRadius: '6px', border: '1px solid #CCC',
                            backgroundColor: pagina === 1 ? '#EEE' : 'white',
                            color: pagina === 1 ? '#999' : '#11352A',
                            fontWeight: 'bold', cursor: pagina === 1 ? 'default' : 'pointer',
                            fontSize: '0.85rem', transition: 'all 0.2s ease'
                          }}
                        >
                          Anterior
                        </button>
                        <span style={{ fontSize: '0.9rem', color: '#666' }}>
                          Página <strong>{pagina}</strong>
                        </span>
                        <button
                          disabled={!tieneMas}
                          onClick={() => setPagina(prev => prev + 1)}
                          style={{
                            padding: '8px 16px', borderRadius: '6px', border: '1px solid #CCC',
                            backgroundColor: !tieneMas ? '#EEE' : 'white',
                            color: !tieneMas ? '#999' : '#11352A',
                            fontWeight: 'bold', cursor: !tieneMas ? 'default' : 'pointer',
                            fontSize: '0.85rem', transition: 'all 0.2s ease'
                          }}
                        >
                          Siguiente
                        </button>
                      </div>
                    </>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic' }}>
                      No se encontraron pacientes que coincidan con la búsqueda.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal de Nueva Ficha Médica */}
      {mostrarModal && (
        <NuevaFichaMedica
          corePatient={corePatientToCreate}
          onCerrar={() => {
            setMostrarModal(false);
            setCorePatientToCreate(null);
          }}
          onGuardar={handleGuardarFicha}
        />
      )}
    </div>
  );
};

export default Home;