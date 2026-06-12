// src/pages/Home.jsx
import { useState, useEffect } from 'react';
import NuevaFichaMedica from './NuevaFichaMedica';
import { searchCorePatients } from '../services/mockCoreData';
import { getAgendaDelDia } from '../services/mockSalaEspera';

const Home = ({ pacientes = [], onSeleccionarPaciente, onGuardarPaciente, onIniciarAtencion }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [corePatientToCreate, setCorePatientToCreate] = useState(null);
  const [turnoPendiente, setTurnoPendiente] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [tabActiva, setTabActiva] = useState('agenda'); // 'agenda' | 'busqueda'
  const [agenda, setAgenda] = useState([]);
  
  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroTriage, setFiltroTriage] = useState('Todos');

  // Mock ID del profesional logueado
  const ID_PROFESIONAL_ACTUAL = "prof-001";

  useEffect(() => {
    setAgenda(getAgendaDelDia(ID_PROFESIONAL_ACTUAL));
  }, []);

  const handleGuardar = (data) => {
    onGuardarPaciente({ ...corePatientToCreate, ...data, core_patient_id: corePatientToCreate?.core_patient_id }, turnoPendiente);
    setMostrarModal(false);
    setCorePatientToCreate(null);
    setTurnoPendiente(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const coreResults = searchCorePatients(searchTerm);

  const renderFichaAction = (cp) => {
    const fichaMedicaIdx = (pacientes || []).findIndex(p => p.core_patient_id === cp.core_patient_id);
    const tieneFicha = fichaMedicaIdx !== -1;
    const fichaMedica = tieneFicha ? pacientes[fichaMedicaIdx] : null;

    return { fichaMedicaIdx, tieneFicha, fichaMedica };
  };

  const formatHora = (fechaIso) => {
    if (!fechaIso) return '—';
    return new Date(fechaIso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  const getBadgeColor = (estado) => {
    switch (estado) {
      case 'En espera': return { bg: '#FFF3E0', color: '#E65100' };
      case 'En triage': return { bg: '#E3F2FD', color: '#1565C0' };
      case 'Atendido': return { bg: '#E8F5E9', color: '#2E7D32' };
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

  const agendaFiltrada = agenda.filter(turno => {
    if (filtroEstado !== 'Todos') {
      if (filtroEstado === 'Pendientes' && turno.estado === 'Atendido') return false;
      if (filtroEstado === 'Atendidos' && turno.estado !== 'Atendido') return false;
    }
    if (filtroTriage !== 'Todos' && turno.nivel_triage !== filtroTriage) return false;
    return true;
  });

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
              onChange={handleSearchChange}
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
        
        {/* Banner Verde (Solo en Búsqueda Global o si se desea siempre) */}
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

        {/* CONTENIDO TAB AGENDA */}
        {tabActiva === 'agenda' && (
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
              {agendaFiltrada.length > 0 ? agendaFiltrada.map((turno) => {
                const { fichaMedicaIdx, tieneFicha, fichaMedica } = renderFichaAction(turno.paciente);
                const badgeColor = getBadgeColor(turno.estado);

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
                            {turno.estado.toUpperCase()}
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
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#444', marginTop: '5px' }}>
                          Motivo: <strong>{turno.motivo}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      {turno.estado !== 'Atendido' ? (
                        <button
                          onClick={() => {
                            if (tieneFicha) {
                              onIniciarAtencion(turno, fichaMedicaIdx);
                            } else {
                              setTurnoPendiente(turno);
                              setCorePatientToCreate(turno.paciente);
                              setMostrarModal(true);
                            }
                          }}
                          style={{
                            backgroundColor: '#259A5E', color: 'white', padding: '12px 24px', borderRadius: '8px', 
                            border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem',
                            display: 'flex', alignItems: 'center', gap: '8px'
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                          LLAMAR Y ATENDER
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (tieneFicha) {
                              onSeleccionarPaciente(fichaMedicaIdx);
                            } else {
                              setTurnoPendiente(turno);
                              setCorePatientToCreate(turno.paciente);
                              setMostrarModal(true);
                            }
                          }}
                          style={{
                            backgroundColor: '#E0E0E0', color: '#666', padding: '12px 24px', borderRadius: '8px', 
                            border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem',
                          }}
                        >
                          {tieneFicha ? 'Ver Registro' : 'Completar Ficha'}
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
        {tabActiva === 'busqueda' && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem', color: '#11352A' }}>Búsqueda Global</h2>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.9rem' }}>Busque por DNI o Nombre para acceder a fichas médicas de pacientes que no tienen turno.</p>

            <div style={{ marginTop: '20px', marginBottom: '40px' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1.05rem', color: '#11352A', fontWeight: 'bold' }}>
                Pacientes encontrados ({coreResults.length})
              </h3>
              {coreResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {coreResults.map((cp) => {
                    const { fichaMedicaIdx, tieneFicha, fichaMedica } = renderFichaAction(cp);

                    return (
                      <div
                        key={cp.core_patient_id}
                        onClick={() => {
                          if (tieneFicha) {
                            onSeleccionarPaciente(fichaMedicaIdx);
                          } else {
                            setCorePatientToCreate(cp);
                            setMostrarModal(true);
                          }
                        }}
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
                          {tieneFicha && (
                            <span style={{ fontSize: '0.8rem', color: '#666' }}>
                              HC: <strong>#{fichaMedica.numeroHistoriaClinica || '—'}</strong>
                            </span>
                          )}
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
              ) : (
                <p style={{ color: '#888', fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Ingrese un parámetro de búsqueda para encontrar pacientes en el Core.
                </p>
              )}
            </div>
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
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
};

export default Home;