// src/App.jsx
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './App.css';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import PacienteDetalle from './pages/PacienteDetalle';
import { actualizarEstadoTurno } from './services/mockSalaEspera';
import { authService } from './services/authService';
import { pacienteService } from './services/pacienteService';
import { salaEsperaService } from './services/salaEsperaService';

function App() {
  // Estado para demorar el renderizado de la UI hasta asegurar que el login de desarrollo se completó (si no usamos mocks)
  const [authReady, setAuthReady] = useState(() => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks) return true;
    const token = localStorage.getItem('healthgrid_token');
    return !!token;
  });

  // Dev Login inicial si no estamos usando mocks
  useEffect(() => {
    const initAuth = async () => {
      const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
      if (!useMocks) {
        // Limpiamos los pacientes y fichas recientes del localStorage para evitar interferencias
        localStorage.removeItem('healthgrid_pacientes');
        localStorage.removeItem('healthgrid_fichas_recientes');
        if (!localStorage.getItem('healthgrid_token')) {
          try {
            await authService.checkAndLoginDev();
          } catch (error) {
            console.error('[App] Error en la inicialización de autenticación de desarrollo:', error);
          }
        }
      }
      setAuthReady(true);
    };
    initAuth();
  }, []);

  // Historial de fichas médicas vistas recientemente (máximo 5)
  const [fichasRecientes, setFichasRecientes] = useState(() => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (!useMocks) {
      return [];
    }
    const saved = localStorage.getItem('healthgrid_fichas_recientes');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('[App] Error parseando healthgrid_fichas_recientes:', e);
      }
    }
    return [];
  });

  const registrarFichaVista = (paciente) => {
    setFichasRecientes(prev => {
      const filtrados = prev.filter(p => p.core_patient_id !== paciente.core_patient_id);
      const nuevoReciente = {
        core_patient_id: paciente.core_patient_id,
        nombreApellido: paciente.nombreApellido,
        dni: paciente.dni || '—',
        fechaNacimiento: paciente.fechaNacimiento || '',
        sexo: paciente.sexo || '',
        obraSocial: paciente.obraSocial || 'Particular',
        numeroHistoriaClinica: paciente.numeroHistoriaClinica || ''
      };
      const actualizados = [nuevoReciente, ...filtrados].slice(0, 5);
      const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
      if (useMocks) {
        localStorage.setItem('healthgrid_fichas_recientes', JSON.stringify(actualizados));
      }
      return actualizados;
    });
  };

  // Estado global de pacientes cargado desde localStorage
  const [pacientes, setPacientes] = useState(() => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (!useMocks) {
      return [];
    }
    const saved = localStorage.getItem('healthgrid_pacientes');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Si hay pacientes pero todos carecen de core_patient_id (datos antiguos corruptos que causaban el bug), los migramos/reseteamos
        if (parsed.length > 0 && !parsed.some(p => p.core_patient_id)) {
          console.warn("Datos antiguos de pacientes detectados sin core_patient_id. Inicializando mocks correctos.");
        } else {
          return parsed;
        }
      } catch (e) {
        console.error("Error parseando healthgrid_pacientes del localStorage", e);
      }
    }

    // Fichas clínicas iniciales (Mocks) por defecto para Juan Pérez (core-001) y María González (core-002)
    return [
      {
        id: 101,
        core_patient_id: "core-001",
        nombreApellido: "Juan Perez",
        dni: "30123456",
        fechaNacimiento: "1985-05-15",
        sexo: "Masculino",
        telefono: "11-4567-8901",
        direccion: "Av. Siempre Viva 123",
        numeroHistoriaClinica: "482",
        grupoSanguineo: "O+",
        contactoEmergencia: "Laura Perez (Esposa) - 11-5555-5555",
        consideraciones: [
          { tipo: "alergia", descripcion: "Penicilina", detalleReaccion: "Urticaria leve" }
        ],
        antecedentes: [
          { tipo: "quirurgico", nombreDescripcion: "Apendicectomía", fecha: "2010-08-12", observaciones: "Sin complicaciones" }
        ],
        observaciones: "Paciente hipertenso controlado de forma regular.",
        fechaRegistro: new Date().toISOString(),
        estado: "Activo",
        episodios: [],
        tieneFichaClinica: true
      },
      {
        id: 102,
        core_patient_id: "core-002",
        nombreApellido: "Maria Gonzalez",
        dni: "28987654",
        fechaNacimiento: "1980-11-20",
        sexo: "Femenino",
        telefono: "11-9876-5432",
        direccion: "Calle Falsa 123",
        numeroHistoriaClinica: "715",
        grupoSanguineo: "A+",
        contactoEmergencia: "Pedro Gonzalez (Hermano) - 11-4444-4444",
        consideraciones: [
          { tipo: "condicion", descripcion: "Diabetes Tipo 2", detalleReaccion: "Controlada con metformina" }
        ],
        antecedentes: [
          { tipo: "familiar", nombreDescripcion: "Diabetes materna", fecha: "", observaciones: "" }
        ],
        observaciones: "Requiere controles periódicos de glucemia.",
        fechaRegistro: new Date().toISOString(),
        estado: "Activo",
        episodios: [],
        tieneFichaClinica: true
      }
    ];
  });
  // Vista actual: 'home' | 'detalle'
  const [vistaActual, setVistaActual] = useState('home');
  // Índice del paciente que se está viendo en detalle
  const [pacienteActualIndex, setPacienteActualIndex] = useState(null);
  // Turno actualmente en atención
  const [turnoActivo, setTurnoActivo] = useState(() => {
    const saved = localStorage.getItem('healthgrid_turno_activo');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parseando healthgrid_turno_activo del localStorage", e);
      }
    }
    return null;
  });
  // Flag para abrir modal de nueva ficha al volver a Home
  const [abrirModalNuevo, setAbrirModalNuevo] = useState(false);

  // Sincronizar estado de pacientes con localStorage
  useEffect(() => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks) {
      localStorage.setItem('healthgrid_pacientes', JSON.stringify(pacientes));
    }
  }, [pacientes]);

  // Sincronizar estado de turnoActivo con localStorage
  useEffect(() => {
    if (turnoActivo) {
      localStorage.setItem('healthgrid_turno_activo', JSON.stringify(turnoActivo));
    } else {
      localStorage.removeItem('healthgrid_turno_activo');
    }
  }, [turnoActivo]);

  // Guardar o actualizar datos de un paciente de forma silenciosa (ej: al cargar el estado en la agenda)
  const actualizarPacienteSilencioso = (datosPaciente) => {
    setPacientes(prev => {
      const idx = prev.findIndex(p => p.core_patient_id === datosPaciente.core_patient_id);
      if (idx !== -1) {
        const actualizados = [...prev];
        actualizados[idx] = {
          ...actualizados[idx],
          ...datosPaciente
        };
        return actualizados;
      }
      return [...prev, datosPaciente];
    });
  };

  // Guardar nuevo paciente y navegar al detalle
  const guardarPaciente = async (data, turnoAsociado = null) => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    // Formateamos inicialmente el paciente para cargarlo en el estado de React
    let nuevoPaciente = {
      ...data,
      id: Date.now(),
      fechaRegistro: new Date().toISOString(),
      estado: 'Active',
      episodios: [],
      tieneFichaClinica: true
    };

    let realEpisodeId = null;

    if (!useMocks) {
      try {
        console.log(`[App] Guardando ficha médica real para ${data.core_patient_id} en el backend...`);
        await pacienteService.crearFichaCompleta(data.core_patient_id, data);
        
        // Si hay un turno asociado en la sala de espera, lo marcamos como Atendido en el backend
        if (turnoAsociado) {
          console.log(`[App] Marcando turno ${turnoAsociado.id_espera} como Atendido en el backend...`);
          const updatedTurno = await salaEsperaService.atenderPaciente(turnoAsociado.id_espera);
          if (updatedTurno && updatedTurno.id_episodio) {
            realEpisodeId = updatedTurno.id_episodio;
          }
        }
      } catch (err) {
        console.error('[App] Error al persistir ficha médica o atender turno en el backend:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de Conexión',
          text: 'No se pudo guardar la ficha clínica en el backend. Los datos se mantendrán sólo en memoria temporal.'
        });
      }
    }

    if (turnoAsociado) {
      if (turnoActivo && turnoActivo.id_espera !== turnoAsociado.id_espera) {
        actualizarEstadoTurno(turnoActivo.id_espera, 'En espera');
      }
      actualizarEstadoTurno(turnoAsociado.id_espera, 'En atención');
      
      nuevoPaciente.episodios = [{
        id: realEpisodeId || Date.now(),
        id_episodio: realEpisodeId || null,
        numero: 1,
        fecha: new Date().toISOString(),
        medico: turnoAsociado.id_profesional,
        especialidad: turnoAsociado.sector,
        motivoConsulta: turnoAsociado.motivo,
        estado: 'abierto',
        fechaAlta: null,
        evolucionesData: [],
        recetasData: [],
        estudiosData: [],
      }];
    }

    setPacientes(prev => [...prev, nuevoPaciente]);
    setPacienteActualIndex(pacientes.length); // el nuevo índice será el tamaño actual del array

    if (turnoAsociado) {
      setTurnoActivo(turnoAsociado);
    }

    setVistaActual('detalle');
  };

  const iniciarAtencion = (turno, pacienteIdx) => {
    if (turnoActivo && (!turno || turnoActivo.id_espera !== turno.id_espera)) {
      actualizarEstadoTurno(turnoActivo.id_espera, 'En espera');
    }
    setTurnoActivo(turno);
    
    if (turno) {
      actualizarEstadoTurno(turno.id_espera, 'En atención');
      setPacienteActualIndex(pacienteIdx);
      
      // Registramos al paciente en la lista de recientes al iniciar su atención
      if (pacientes[pacienteIdx]) {
        registrarFichaVista(pacientes[pacienteIdx]);
      }

      // Si no tiene episodio abierto, crearlo automáticamente
      setPacientes(prev => {
        const actualizados = [...prev];
        const paciente = { ...actualizados[pacienteIdx] };
        const episodios = paciente.episodios || [];
        const tieneEpisodioAbierto = episodios.some(e => e.estado === 'abierto');

        if (!tieneEpisodioAbierto) {
          const nuevoEpisodio = {
            id: turno.id_episodio || Date.now(),
            id_episodio: turno.id_episodio || null,
            numero: episodios.length + 1,
            fecha: new Date().toISOString(),
            medico: turno.id_profesional || turno.id_medico,
            especialidad: turno.sector || 'Clínica Médica',
            motivoConsulta: turno.motivo,
            estado: 'abierto',
            fechaAlta: null,
            evolucionesData: [],
            recetasData: [],
            estudiosData: [],
          };
          paciente.episodios = [...episodios, nuevoEpisodio];
          actualizados[pacienteIdx] = paciente;
        }
        return actualizados;
      });

      setVistaActual('detalle');
    } else {
      setPacienteActualIndex(null);
    }
  };

  // Actualizar paciente existente (editar ficha)
  const actualizarPaciente = (index, data) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      actualizados[index] = {
        ...actualizados[index],
        ...data,
      };
      return actualizados;
    });
  };

  // Actualizar la lista de episodios de un paciente de forma asíncrona tras consultar al backend
  const actualizarEpisodiosPaciente = (index, episodios) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = actualizados[index];
      if (paciente) {
        const combinados = (episodios || []).map(backendEp => {
          const localEp = (paciente.episodios || []).find(e => e.id_episodio === backendEp.id_episodio);
          if (localEp) {
            return {
              ...localEp,
              ...backendEp,
              evolucionesData: localEp.evolucionesData?.length ? localEp.evolucionesData : backendEp.evolucionesData,
              recetasData: localEp.recetasData?.length ? localEp.recetasData : backendEp.recetasData
            };
          }
          return backendEp;
        });

        actualizados[index] = {
          ...paciente,
          episodios: combinados
        };
      }
      return actualizados;
    });
  };

  // Actualizar el detalle (evoluciones, recetas) de un episodio clínico específico
  const actualizarDetalleEpisodio = (pacienteIdx, episodioIdx, evoluciones, recetas) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      if (paciente && paciente.episodios && paciente.episodios[episodioIdx]) {
        const episodios = [...paciente.episodios];
        episodios[episodioIdx] = {
          ...episodios[episodioIdx],
          evolucionesData: evoluciones,
          recetasData: recetas
        };
        paciente.episodios = episodios;
        actualizados[pacienteIdx] = paciente;
      }
      return actualizados;
    });
  };

  // Agregar episodio a un paciente
  const agregarEpisodio = (index, episodioData) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = actualizados[index];
      const nuevoEpisodio = {
        ...episodioData,
        id: Date.now(),
        numero: (paciente.episodios?.length || 0) + 1,
        estado: 'abierto',
        fechaAlta: null,
        evolucionesData: [], // Array real de evoluciones
        recetasData: [],
        estudiosData: [],
      };
      actualizados[index] = {
        ...paciente,
        episodios: [...(paciente.episodios || []), nuevoEpisodio],
      };
      return actualizados;
    });
  };

  // Agregar evolución a un episodio
  const agregarEvolucion = (pacienteIdx, episodioIdx, evolucionData) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = [...(paciente.episodios || [])];
      const episodio = { ...episodios[episodioIdx] };

      const nuevaEvolucion = {
        ...evolucionData,
        id: Date.now(),
        numero: (episodio.evolucionesData?.length || 0) + 1,
      };

      episodio.evolucionesData = [...(episodio.evolucionesData || []), nuevaEvolucion];
      episodios[episodioIdx] = episodio;
      paciente.episodios = episodios;
      actualizados[pacienteIdx] = paciente;
      return actualizados;
    });
  };

  // Finalizar la atención de un paciente (liberando consultorio y opcionalmente cerrando el episodio)
  const finalizarAtencionPaciente = async (turno, cerrarEpisodio = false) => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

    if (cerrarEpisodio && !useMocks) {
      const paciente = pacientes.find(p => p.core_patient_id === turno.paciente.core_patient_id);
      const episodioAbierto = paciente?.episodios?.find(e => e.estado === 'abierto');
      if (episodioAbierto) {
        try {
          const idEpDb = episodioAbierto.id_episodio || episodioAbierto.id;
          console.log(`[App] Cerrando episodio real ${idEpDb} para ${paciente.core_patient_id} en el backend...`);
          await pacienteService.cerrarEpisodio(paciente.core_patient_id, idEpDb);

          // Actualizar estado local del paciente
          setPacientes(prev => {
            return prev.map(p => {
              if (p.core_patient_id === turno.paciente.core_patient_id) {
                return {
                  ...p,
                  episodios: (p.episodios || []).map(e => {
                    if (e.id === episodioAbierto.id || e.id_episodio === episodioAbierto.id_episodio) {
                      return { ...e, estado: 'cerrado', fechaAlta: new Date().toISOString() };
                    }
                    return e;
                  })
                };
              }
              return p;
            });
          });
        } catch (err) {
          console.error('[App] Error al cerrar el episodio en el backend:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error al dar de alta',
            text: 'No se pudo cerrar el episodio clínico en el servidor. Inténtelo nuevamente.'
          });
          return; // Abortamos para que intente de nuevo y no pierda la acción
        }
      }
    } else if (cerrarEpisodio && useMocks) {
      // Mock de cierre local
      setPacientes(prev => {
        return prev.map(p => {
          if (p.core_patient_id === turno.paciente.core_patient_id) {
            return {
              ...p,
              episodios: (p.episodios || []).map(e => {
                if (e.estado === 'abierto') {
                  return { ...e, estado: 'cerrado', fechaAlta: new Date().toISOString() };
                }
                return e;
              })
            };
          }
          return p;
        });
      });
    }

    if (turno) {
      if (!useMocks) {
        try {
          console.log(`[App] Finalizando turno real ${turno.id_espera} en el backend...`);
          await salaEsperaService.finalizarPaciente(turno.id_espera);
        } catch (err) {
          console.error('[App] Error al finalizar el turno en la sala de espera:', err);
        }
      } else {
        actualizarEstadoTurno(turno.id_espera, 'Atendido');
      }
    }
    setTurnoActivo(null);
    volverAHome();
  };

  // Dar de alta un episodio (Finaliza el episodio y el turno)
  const darDeAlta = (pacienteIdx, episodioIdx) => {
    if (turnoActivo && pacientes[pacienteIdx]?.core_patient_id === turnoActivo.paciente.core_patient_id) {
      finalizarAtencionPaciente(turnoActivo, true);
    } else {
      // Flujo de edición/cierre fuera de turno activo (ej: búsqueda global)
      const paciente = pacientes[pacienteIdx];
      const episodio = paciente?.episodios?.[episodioIdx];
      const proceedClose = async () => {
        const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
        if (!useMocks && paciente && episodio) {
          try {
            const idEpDb = episodio.id_episodio || episodio.id;
            await pacienteService.cerrarEpisodio(paciente.core_patient_id, idEpDb);
          } catch (err) {
            console.error('[App] Error al cerrar el episodio de búsqueda:', err);
            Swal.fire('Error', 'No se pudo cerrar el episodio clínico en el servidor.', 'error');
            return;
          }
        }
        setPacientes(prev => {
          const actualizados = [...prev];
          const pac = { ...actualizados[pacienteIdx] };
          const eps = [...(pac.episodios || [])];
          eps[episodioIdx] = {
            ...eps[episodioIdx],
            estado: 'cerrado',
            fechaAlta: new Date().toISOString(),
          };
          pac.episodios = eps;
          actualizados[pacienteIdx] = pac;
          return actualizados;
        });
        volverAHome();
      };
      proceedClose();
    }
  };

  // Agregar receta a un episodio
  const agregarReceta = (pacienteIdx, episodioIdx, recetaData) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = [...(paciente.episodios || [])];
      const episodio = { ...episodios[episodioIdx] };

      const nuevaReceta = {
        ...recetaData,
        id: Date.now(),
        numero: (episodio.recetasData?.length || 0) + 1,
        estado: 'vigente',
      };

      episodio.recetasData = [...(episodio.recetasData || []), nuevaReceta];
      episodios[episodioIdx] = episodio;
      paciente.episodios = episodios;
      actualizados[pacienteIdx] = paciente;
      return actualizados;
    });
  };

  // Cambiar estado de receta (vigente <-> vencida)
  const cambiarEstadoReceta = (pacienteIdx, episodioIdx, recetaIdx) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = [...(paciente.episodios || [])];
      const episodio = { ...episodios[episodioIdx] };
      const recetas = [...(episodio.recetasData || [])];
      recetas[recetaIdx] = {
        ...recetas[recetaIdx],
        estado: recetas[recetaIdx].estado === 'vigente' ? 'vencida' : 'vigente',
      };
      episodio.recetasData = recetas;
      episodios[episodioIdx] = episodio;
      paciente.episodios = episodios;
      actualizados[pacienteIdx] = paciente;
      return actualizados;
    });
  };

  // Agregar pedido de estudio a un episodio
  const agregarEstudio = (pacienteIdx, episodioIdx, estudioData) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = [...(paciente.episodios || [])];
      const episodio = { ...episodios[episodioIdx] };

      const nuevoEstudio = {
        ...estudioData,
        id: Date.now(),
        numero: (episodio.estudiosData?.length || 0) + 1,
        resultado: estudioData.estado === 'completado' ? {
          codigoExterno: '',
          profesionalFirmante: '',
          fechaResultado: '',
          informe: '',
          archivosAdjuntos: [],
        } : null,
      };

      episodio.estudiosData = [...(episodio.estudiosData || []), nuevoEstudio];
      episodios[episodioIdx] = episodio;
      paciente.episodios = episodios;
      actualizados[pacienteIdx] = paciente;
      return actualizados;
    });
  };

  // Agregar solicitud de pase a un episodio
  const agregarSolicitudPase = (pacienteIdx, episodioIdx, paseData) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = [...(paciente.episodios || [])];
      const episodio = { ...episodios[episodioIdx] };

      const nuevaSolicitud = {
        ...paseData,
        id: Date.now(),
        estado: 'pendiente',
      };

      episodio.solicitudesPaseData = [...(episodio.solicitudesPaseData || []), nuevaSolicitud];
      episodios[episodioIdx] = episodio;
      paciente.episodios = episodios;
      actualizados[pacienteIdx] = paciente;
      return actualizados;
    });
  };

  // Agregar solicitud de internación a un episodio
  const agregarSolicitudInternacion = (pacienteIdx, episodioIdx, internacionData) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = [...(paciente.episodios || [])];
      const episodio = { ...episodios[episodioIdx] };

      const nuevaSolicitud = {
        ...internacionData,
        id: Date.now(),
        estado: 'pendiente',
      };

      episodio.solicitudesInternacionData = [...(episodio.solicitudesInternacionData || []), nuevaSolicitud];
      episodios[episodioIdx] = episodio;
      paciente.episodios = episodios;
      actualizados[pacienteIdx] = paciente;
      return actualizados;
    });
  };

  // Cargar resultado de un estudio en un episodio
  const agregarResultadoEstudio = (pacienteIdx, episodioIdx, estudioIdx, resultadoData) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = [...(paciente.episodios || [])];
      const episodio = { ...episodios[episodioIdx] };
      const estudios = [...(episodio.estudiosData || [])];

      estudios[estudioIdx] = {
        ...estudios[estudioIdx],
        estado: 'completado',
        resultado: {
          codigoExterno: resultadoData.codigoExterno || '',
          profesionalFirmante: resultadoData.profesionalFirmante || '',
          fechaResultado: resultadoData.fechaResultado || new Date().toISOString().slice(0, 10),
          informe: resultadoData.informe || '',
          archivosAdjuntos: resultadoData.archivosAdjuntos || [],
        },
      };

      episodio.estudiosData = estudios;
      episodios[episodioIdx] = episodio;
      paciente.episodios = episodios;
      actualizados[pacienteIdx] = paciente;
      return actualizados;
    });
  };

  // Ver siguiente paciente
  const verSiguientePaciente = () => {
    if (pacientes.length > 1) {
      setPacienteActualIndex(prev => (prev + 1) % pacientes.length);
    }
  };

  // Volver al Home desde detalle
  const volverAHome = () => {
    setVistaActual('home');
    setPacienteActualIndex(null);
  };

  // Nuevo Registro: volver a Home y abrir modal de nueva ficha
  const nuevoRegistro = () => {
    setVistaActual('home');
    setPacienteActualIndex(null);
    setAbrirModalNuevo(true);
  };

  // Seleccionar paciente cargando sus datos de forma diferida (Lazy Load) si es necesario
  const seleccionarPaciente = async (indexOrData) => {
    let pacienteObj = null;
    let idx = -1;

    if (typeof indexOrData === 'number') {
      idx = indexOrData;
      pacienteObj = pacientes[indexOrData];
    } else if (indexOrData && typeof indexOrData === 'object') {
      const coreId = indexOrData.core_patient_id;
      idx = pacientes.findIndex(p => p.core_patient_id === coreId);
      pacienteObj = idx !== -1 ? pacientes[idx] : { ...indexOrData };
    }

    if (!pacienteObj) return;

    // Si no estamos usando mocks, recuperamos la ficha clínica en tiempo real si aún no la cargamos en memoria
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (!useMocks) {
      try {
        console.log(`[App] Cargando ficha clínica diferida para ${pacienteObj.core_patient_id}...`);
        const ficha = await pacienteService.obtenerFicha(pacienteObj.core_patient_id);
        if (ficha) {
          pacienteObj = {
            ...pacienteObj,
            grupoSanguineo: ficha.grupo_sanguineo || 'O+',
            observaciones: ficha.observaciones_generales || '',
            peso_kg: ficha.peso_kg || null,
            altura_cm: ficha.altura_cm || null,
            antecedentes: ficha.antecedentes || [],
            consideraciones: ficha.alertas_clinicas || [],
            episodios: ficha.episodios || [],
            tieneFichaClinica: true
          };
        } else {
          pacienteObj.tieneFichaClinica = false;
        }
      } catch (err) {
        console.log(`[App] Ficha médica no encontrada en el backend para ${pacienteObj.core_patient_id} (se creará al guardar).`);
        pacienteObj.tieneFichaClinica = false;
        // Aseguramos estructura básica de arreglos para evitar errores de renderizado
        pacienteObj.consideraciones = [];
        pacienteObj.antecedentes = [];
        pacienteObj.episodios = [];
      }
    }

    // Registramos en el historial de vistos recientemente
    registrarFichaVista(pacienteObj);

    if (idx !== -1) {
      setPacientes(prev => {
        const actualizados = [...prev];
        actualizados[idx] = pacienteObj;
        return actualizados;
      });
      setPacienteActualIndex(idx);
    } else {
      setPacientes(prev => [...prev, pacienteObj]);
      setPacienteActualIndex(pacientes.length);
    }

    setVistaActual('detalle');
  };

  if (!authReady) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F4F7F6', // var(--color-bg-clinical)
        fontFamily: "'Inter', sans-serif"
      }}>
        <div style={{
          padding: '2.5rem',
          borderRadius: '15px', // var(--border-radius-lg)
          backgroundColor: '#FFFFFF',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
          {/* Spinner circular premium con estilo clínico */}
          <div style={{
            width: '50px',
            height: '50px',
            border: '4px solid rgba(37, 154, 94, 0.1)',
            borderTop: '4px solid #259A5E', // var(--color-primary-accent)
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1.5rem'
          }} />
          <h2 style={{
            margin: '0 0 0.5rem 0',
            color: '#11352A', // var(--color-primary-dark)
            fontSize: '1.25rem',
            fontWeight: 600
          }}>
            Iniciando Sesión Clínica
          </h2>
          <p style={{
            margin: 0,
            color: '#666666', // var(--color-text-muted)
            fontSize: '0.9rem',
            lineHeight: '1.4'
          }}>
            Estableciendo conexión segura con el servidor HCE. Por favor, espere...
          </p>
        </div>
        {/* Estilo inyectado para la animación de rotación del spinner */}
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
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {vistaActual === 'home' && (
          <Home
            pacientes={pacientes}
            onSeleccionarPaciente={seleccionarPaciente}
            onGuardarPaciente={guardarPaciente}
            onIniciarAtencion={iniciarAtencion}
            abrirModalNuevo={abrirModalNuevo}
            onModalNuevoCerrado={() => setAbrirModalNuevo(false)}
            turnoActivo={turnoActivo}
            fichasRecientes={fichasRecientes}
            onGuardarPacienteSilencioso={actualizarPacienteSilencioso}
            onFinalizarAtencion={finalizarAtencionPaciente}
          />
        )}
        {vistaActual === 'detalle' && pacienteActualIndex !== null && (
          <PacienteDetalle
            paciente={pacientes[pacienteActualIndex]}
            pacienteIndex={pacienteActualIndex}
            pacientes={pacientes}
            onSeleccionarPaciente={seleccionarPaciente}
            turnoActivo={turnoActivo}
            onVolver={volverAHome}
            onNuevoRegistro={nuevoRegistro}
            onActualizar={actualizarPaciente}
            onAgregarEpisodio={agregarEpisodio}
            onAgregarEvolucion={agregarEvolucion}
            onDarDeAlta={darDeAlta}
            onAgregarReceta={agregarReceta}
            onCambiarEstadoReceta={cambiarEstadoReceta}
            onAgregarEstudio={agregarEstudio}
            onAgregarSolicitudPase={agregarSolicitudPase}
            onAgregarSolicitudInternacion={agregarSolicitudInternacion}
            onAgregarResultadoEstudio={agregarResultadoEstudio}
            onSiguiente={verSiguientePaciente}
            onFinalizarAtencion={finalizarAtencionPaciente}
            onActualizarEpisodios={actualizarEpisodiosPaciente}
            onActualizarDetalleEpisodio={actualizarDetalleEpisodio}
          />
        )}
      </div>
    </div>
  );
}

export default App;