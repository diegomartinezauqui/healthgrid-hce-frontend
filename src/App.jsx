// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import './App.css';
import { Toaster } from 'sonner';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import PacienteDetalle from './pages/PacienteDetalle';
import { actualizarEstadoTurno } from './services/mockSalaEspera';
import { authService } from './services/authService';
import { pacienteService } from './services/pacienteService';
import { salaEsperaService } from './services/salaEsperaService';
import { ordenService } from './services/ordenService';
import { useAuth } from './context/AuthContext';
import { ssoService } from './services/ssoService';

function App() {
  // Contexto global de autenticación (JWT)
  const auth = useAuth();
  
  // Evitar doble canje de ticket SSO en React Strict Mode
  const ssoValidadoRef = useRef(false);

  // Estado de login mockeado (sesión de UI — independiente del JWT)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return sessionStorage.getItem('healthgrid_logged_in') === 'true';
  });

  /**
   * handleLogin — llamado por Login.jsx al autenticarse.
   * Si viene un access_token del Core, lo persiste en el contexto y localStorage.
   */
  const handleLogin = (userData) => {
    sessionStorage.setItem('healthgrid_logged_in', 'true');
    if (userData?.access_token) {
      // Login real contra el Core: persistir el JWT en AuthContext + localStorage
      auth.login({ access_token: userData.access_token, user: userData.user || null });
    }
    setIsLoggedIn(true);
  };

  // Estado para demorar el renderizado de la UI hasta asegurar que el login de desarrollo se completó (si no usamos mocks)
  const [authReady, setAuthReady] = useState(() => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks) return true;
    const token = localStorage.getItem('healthgrid_token');
    return !!token;
  });

  // Escuchar el evento global de 401 emitido por los interceptores de Axios
  useEffect(() => {
    const handleUnauthorized = () => {
      console.warn('[App] Sesión expirada o token inválido. Cerrando sesión...');
      auth.logout();
      sessionStorage.removeItem('healthgrid_logged_in');
      setIsLoggedIn(false);
    };
    window.addEventListener('healthgrid:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('healthgrid:unauthorized', handleUnauthorized);
  }, [auth]);

  // Dev Login inicial o canje de ticket SSO
  useEffect(() => {
    const initAuth = async () => {
      const { ticket, redirect } = ssoService.getSsoParams();
      
      if (ticket) {
        if (ssoValidadoRef.current) return;
        ssoValidadoRef.current = true;

        Swal.fire({
          title: 'Iniciando sesión...',
          text: 'Validando tus credenciales de Single Sign-On (SSO)',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        try {
          const success = await ssoService.establecerSesionDesdeTicket(ticket);
          Swal.close();

          if (success) {
            const token = localStorage.getItem('healthgrid_token');
            const ssoUserRaw = localStorage.getItem('healthgrid_sso_user');
            const ssoUser = ssoUserRaw ? JSON.parse(ssoUserRaw) : null;

            const nombreCompleto = ssoUser
              ? `${ssoUser.first_name || ''} ${ssoUser.last_name || ''}`.trim() || ssoUser.name || ssoUser.nombre || ssoUser.username || 'Profesional'
              : 'Profesional';

            sessionStorage.setItem('healthgrid_logged_in', 'true');
            auth.login({ access_token: token, user: ssoUser });
            setIsLoggedIn(true);

            // Limpiamos los parámetros de la URL para que no quede el ticket expuesto
            const cleanUrl = window.location.origin + window.location.pathname;

            Swal.fire({
              icon: 'success',
              title: '¡Sesión Iniciada!',
              html: `<p style="margin: 0 0 10px 0; font-size: 1.05rem;">Bienvenido/a, <strong>${nombreCompleto}</strong>.</p>
                     <p style="margin: 0; color: #666; font-size: 0.9rem;">Acceso concedido de forma segura mediante SSO.</p>`,
              confirmButtonText: 'Entrar a HCE',
              confirmButtonColor: '#2d7d46',
              allowOutsideClick: false
            }).then(() => {
              // Redireccionamos a la URL limpia forzando un reload completo de la SPA.
              // Esto limpia en seco la memoria de React del médico anterior y recarga la sala de espera del nuevo.
              window.location.href = cleanUrl;
            });

            // Si hay una ruta de redirección interna específica
            if (redirect) {
              const targetPath = ssoService.safeRedirect(redirect);
              console.log(`[SSO] Redirigiendo a ruta solicitada: ${targetPath}`);
              // Aquí podrías cambiar la vista si se usa enrutador custom
            }
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error de Autenticación',
              text: 'El ticket de sesión única es inválido o ha expirado. Por favor, reintentá iniciar sesión.'
            });
            // Limpiamos la URL de todos modos
            const cleanUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }
        } catch (err) {
          console.error('[SSO] Error durante el canje del ticket:', err);
          Swal.close();
          Swal.fire({
            icon: 'error',
            title: 'Error de Conexión',
            text: 'No se pudo conectar con el Core para validar la sesión única.'
          });
        }
      } else {
        // Flujo normal de desarrollo (sin ticket de SSO en la URL)
        const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
        if (!useMocks) {
          // Limpiamos los pacientes y fichas recientes del localStorage para evitar interferencias
          localStorage.removeItem('healthgrid_pacientes');
          localStorage.removeItem('healthgrid_fichas_recientes');
          if (!localStorage.getItem('healthgrid_token')) {
            try {
              const devToken = await authService.checkAndLoginDev();
              if (devToken) {
                auth.login({ access_token: devToken });
              }
            } catch (error) {
              console.error('[App] Error en la inicialización de autenticación de desarrollo:', error);
            }
          }
        }
      }
      setAuthReady(true);
    };
    initAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
  // Flag que indica que el paciente actualmente en detalle ya fue atendido (su turno tiene estado 'Atendido')
  const [pacienteYaAtendido, setPacienteYaAtendido] = useState(false);

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

  const iniciarAtencion = async (turno, pacienteIdx) => {
    if (turnoActivo && (!turno || turnoActivo.id_espera !== turno.id_espera)) {
      actualizarEstadoTurno(turnoActivo.id_espera, 'En espera');
    }
    setTurnoActivo(turno);
    
    if (turno) {
      actualizarEstadoTurno(turno.id_espera, 'En atención');
      
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

      // Cargamos de forma asíncrona todos sus datos (personales y clínicos)
      await seleccionarPaciente(pacienteIdx);
    } else {
      setPacienteActualIndex(null);
    }
  };

  // Actualizar paciente existente (editar ficha) — persiste en backend + estado local
  const actualizarPaciente = async (index, data) => {
    const useMocksLocal = import.meta.env.VITE_USE_MOCKS === 'true';
    const pacienteActual = pacientes[index];
    const corePatientId = pacienteActual?.core_patient_id || pacienteActual?.id;

    // 1. Persistir en backend (upsert via /ficha-completa)
    if (!useMocksLocal && corePatientId) {
      try {
        console.log(`[App] Actualizando ficha médica para paciente ${corePatientId} en el backend...`);
        await pacienteService.crearFichaCompleta(corePatientId, data);
        console.log(`[App] Ficha médica actualizada exitosamente en el backend.`);
      } catch (err) {
        console.error('[App] Error al persistir edición de ficha en el backend:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al Guardar',
          text: 'No se pudo guardar la ficha médica en el servidor. Los cambios se mantendrán solo en memoria.',
        });
      }
    }

    // 2. Actualizar estado local de React
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
              recetasData: localEp.recetasData?.length ? localEp.recetasData : backendEp.recetasData,
              // Preservar el estado de camas (M6) del estado local para que una recarga
              // silenciosa de episodios no borre las camas ya aceptadas/rechazadas.
              solicitudesCamaData: localEp.solicitudesCamaData?.length ? localEp.solicitudesCamaData : (backendEp.solicitudesCamaData || localEp.solicitudesCamaData),
              camaActual: localEp.camaActual || backendEp.camaActual || null,
              tipoEpisodio: localEp.tipoEpisodio || backendEp.tipoEpisodio,
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

  // Actualizar el detalle de un episodio (evoluciones, recetas, estudios,
  // solicitudes de cama, cama actual). Sólo pisa los campos presentes en `detalle`.
  const actualizarDetalleEpisodio = (pacienteIdx, episodioIdx, detalle = {}) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      if (paciente && paciente.episodios && paciente.episodios[episodioIdx]) {
        const episodios = [...paciente.episodios];
        const ep = { ...episodios[episodioIdx] };
        if (detalle.evoluciones !== undefined) ep.evolucionesData = detalle.evoluciones;
        if (detalle.recetas !== undefined) ep.recetasData = detalle.recetas;
        if (detalle.estudios !== undefined) ep.estudiosData = detalle.estudios;
        if (detalle.solicitudesCama !== undefined) ep.solicitudesCamaData = detalle.solicitudesCama;
        if (detalle.camaActual !== undefined) ep.camaActual = detalle.camaActual;
        if (detalle.internado) ep.tipoEpisodio = 'internado';
        episodios[episodioIdx] = ep;
        paciente.episodios = episodios;
        actualizados[pacienteIdx] = paciente;
      }
      return actualizados;
    });
  };

  // Agregar episodio a un paciente
  const agregarEpisodio = async (index, episodioData) => {
    const pacienteObj = pacientes[index];
    if (!pacienteObj) return;

    // Mapeamos el tipo de episodio del frontend al backend HCE
    const backendTipo = episodioData.tipoEpisodio === 'internado' ? 'internacion' : 'consulta-externa';

    try {
      console.log(`[App] Abriendo nuevo episodio clínico en backend para paciente ${pacienteObj.core_patient_id}...`);
      const response = await pacienteService.crearEpisodio(
        pacienteObj.core_patient_id,
        backendTipo,
        episodioData.motivo || 'Nuevo episodio clínico'
      );

      const realEpisodeId = response?.id_episodio || Date.now();

      setPacientes(prev => {
        const actualizados = [...prev];
        const paciente = actualizados[index];
        const nuevoEpisodio = {
          ...episodioData,
          id: realEpisodeId,
          id_episodio: realEpisodeId,
          numero: (paciente.episodios?.length || 0) + 1,
          estado: 'abierto',
          fechaAlta: null,
          fechaApertura: response?.fecha_apertura || new Date().toISOString(),
          evolucionesData: [],
          recetasData: [],
          estudiosData: [],
          solicitudesPaseData: [],
          solicitudesInternacionData: []
        };
        actualizados[index] = {
          ...paciente,
          episodios: [...(paciente.episodios || []), nuevoEpisodio],
        };
        return actualizados;
      });
    } catch (err) {
      console.error('[App] Error al abrir episodio en el backend:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al abrir episodio',
        text: 'No se pudo registrar el episodio clínico en el servidor HCE. Por favor, intente de nuevo.'
      });
    }
  };

  // Agregar evolución a un episodio
  const agregarEvolucion = async (pacienteIdx, episodioIdx, evolucionData) => {
    const pacienteObj = pacientes[pacienteIdx];
    const episodioObj = pacienteObj?.episodios?.[episodioIdx];
    if (!pacienteObj || !episodioObj) return;

    try {
      const idEpDb = episodioObj.id_episodio || episodioObj.id;
      console.log(`[App] Guardando evolución en backend para episodio ${idEpDb}...`);
      const response = await pacienteService.guardarEvolucion(
        pacienteObj.core_patient_id,
        idEpDb,
        evolucionData
      );

      // Si la evolución contiene actos médicos/prácticas, los registramos en el backend
      if (Array.isArray(evolucionData.practicas) && evolucionData.practicas.length > 0) {
        const token = localStorage.getItem('healthgrid_token');
        let idProfesional = 32;
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
            idProfesional = payload.user_id || payload.sub || 32;
          } catch (e) {
            console.error('[App] Error decodificando JWT para profesional:', e);
          }
        }

        console.log(`[App] Registrando ${evolucionData.practicas.length} actos médicos en HCE para episodio ${idEpDb}...`);
        try {
          await Promise.all(
            evolucionData.practicas.map(practica =>
              pacienteService.registrarActoMedico(pacienteObj.core_patient_id, idEpDb, {
                tipo: 'consulta',
                codigo_nomenclador: practica.codigo_nomenclador,
                descripcion: practica.descripcion || 'Práctica clínica',
                id_profesional: idProfesional,
                cantidad: parseInt(practica.cantidad) || 1,
                observaciones: practica.observaciones || ''
              })
            )
          );
          console.log('[App] Todos los actos médicos fueron registrados con éxito.');
        } catch (actError) {
          console.error('[App] Error al registrar algunos actos médicos:', actError);
        }
      }

      const realEvolucionId = response?.id_evolucion || Date.now();

      setPacientes(prev => {
        const actualizados = [...prev];
        const paciente = { ...actualizados[pacienteIdx] };
        const episodios = [...(paciente.episodios || [])];
        const episodio = { ...episodios[episodioIdx] };

        const nuevaEvolucion = {
          ...evolucionData,
          id: realEvolucionId,
          id_evolucion: realEvolucionId,
          fecha: response?.fecha || new Date().toISOString(),
          fechaHora: evolucionData.fechaHora || response?.fecha || new Date().toISOString(),
          numero: (episodio.evolucionesData?.length || 0) + 1,
        };

        episodio.evolucionesData = [...(episodio.evolucionesData || []), nuevaEvolucion];
        episodios[episodioIdx] = episodio;
        paciente.episodios = episodios;
        actualizados[pacienteIdx] = paciente;
        return actualizados;
      });
    } catch (err) {
      console.error('[App] Error al guardar evolución en el backend:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: 'No se pudo guardar la evolución clínica en el servidor HCE. Por favor, intente de nuevo.'
      });
    }
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
  const agregarReceta = async (pacienteIdx, episodioIdx, recetaData) => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    const paciente = pacientes[pacienteIdx];
    const episodio = paciente.episodios[episodioIdx];

    let id_evolucion = null;
    let evolIndice = recetaData.evolucionVinculada;

    if (evolIndice !== '' && evolIndice !== undefined) {
      const ev = episodio.evolucionesData[parseInt(evolIndice)];
      if (ev) id_evolucion = ev.id_evolucion;
    } else if (episodio.evolucionesData && episodio.evolucionesData.length > 0) {
      // Si no se vinculó una específica, tomamos la última por defecto
      const ev = episodio.evolucionesData[episodio.evolucionesData.length - 1];
      if (ev) {
        id_evolucion = ev.id_evolucion;
        evolIndice = String(episodio.evolucionesData.length - 1);
      }
    }

    if (!useMocks && !id_evolucion) {
      Swal.fire({
        title: 'Atención requerida',
        text: 'Para emitir una receta digital, el episodio debe tener al menos una evolución médica registrada.',
        icon: 'warning',
        confirmButtonColor: '#259A5E'
      });
      return;
    }

    // Payload requerido por el backend
    const payload = {
      items: (recetaData.medicamentos || []).map(m => ({
        medicamento: m.nombre,
        indicaciones: m.indicaciones || '',
        cantidad: parseInt(m.cantidad) || 1
      }))
    };

    let idRecetaReal = Date.now();
    let id_evolucion_res = id_evolucion;
    let estadoReal = 'Activa';
    let itemsReales = (recetaData.medicamentos || []).map((m, idx) => ({
      id: idx,
      nombre: m.nombre,
      indicaciones: m.indicaciones || '',
      cantidad: parseInt(m.cantidad) || 1
    }));

    if (!useMocks) {
      try {
        const res = await pacienteService.emitirReceta(paciente.core_patient_id, episodio.id_episodio, id_evolucion, payload);
        if (res) {
          idRecetaReal = res.id_receta;
          id_evolucion_res = res.id_evolucion || id_evolucion;
          estadoReal = res.estado || 'Activa';
          itemsReales = (res.items || []).map((it, idx) => ({
            id: it.id_item || idx,
            nombre: it.medicamento,
            indicaciones: it.indicaciones,
            cantidad: it.cantidad || 1
          }));
        }
      } catch (err) {
        console.error('[agregarReceta] Error al emitir receta digital:', err);
        Swal.fire({
          title: 'Error al emitir receta',
          text: 'Ocurrió un error en el servidor al registrar la receta digital.',
          icon: 'error',
          confirmButtonColor: '#259A5E'
        });
        return;
      }
    }

    setPacientes(prev => {
      const actualizados = [...prev];
      const pac = { ...actualizados[pacienteIdx] };
      const eps = [...(pac.episodios || [])];
      const ep = { ...eps[episodioIdx] };

      const nuevaReceta = {
        id: idRecetaReal,
        id_receta: idRecetaReal,
        id_evolucion: id_evolucion_res,
        evolucionVinculada: evolIndice,
        numero: (ep.recetasData?.length || 0) + 1,
        fecha: new Date().toISOString(),
        estado: estadoReal,
        medicamentos: itemsReales,
        observaciones: recetaData.observaciones || ''
      };

      ep.recetasData = [...(ep.recetasData || []), nuevaReceta];
      ep.cantRecetas = (ep.cantRecetas || 0) + 1; // Incrementamos el contador para que coincida en pantalla

      eps[episodioIdx] = ep;
      pac.episodios = eps;
      actualizados[pacienteIdx] = pac;
      return actualizados;
    });

    Swal.fire({
      title: 'Receta Emitida',
      text: 'La receta digital ha sido registrada exitosamente.',
      icon: 'success',
      confirmButtonColor: '#259A5E'
    });
  };

  // Cambiar estado de receta (ciclo: Activa -> Dispensada -> Suspendida -> Vencida)
  const cambiarEstadoReceta = (pacienteIdx, episodioIdx, recetaIdx) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = [...(paciente.episodios || [])];
      const episodio = { ...episodios[episodioIdx] };
      const recetas = [...(episodio.recetasData || [])];
      
      const current = (recetas[recetaIdx].estado || '').toLowerCase();
      let nextState = 'Activa';
      if (current === 'activa' || current === 'vigente') {
        nextState = 'Dispensada';
      } else if (current === 'dispensada') {
        nextState = 'Suspendida';
      } else if (current === 'suspendida') {
        nextState = 'Vencida';
      } else {
        nextState = 'Activa';
      }

      recetas[recetaIdx] = {
        ...recetas[recetaIdx],
        estado: nextState,
      };
      episodio.recetasData = recetas;
      episodios[episodioIdx] = episodio;
      paciente.episodios = episodios;
      actualizados[pacienteIdx] = paciente;
      return actualizados;
    });
  };

  // Agregar pedido de estudio a un episodio (crea la orden en el backend HCE)
  const agregarEstudio = async (pacienteIdx, episodioIdx, estudioData) => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    const paciente = pacientes[pacienteIdx];
    if (!paciente) return;

    let id_orden = Date.now();
    let tipo_estudio = null;
    const id_episodio = paciente.episodios?.[episodioIdx]?.id_episodio || null;

    if (!useMocks) {
      try {
        const res = await ordenService.crearOrden(paciente.core_patient_id, estudioData, id_episodio);
        if (res) {
          id_orden = res.id_orden || id_orden;
          tipo_estudio = res.tipo_estudio || null;
        }
      } catch (err) {
        console.error('[App] Error al crear la orden de estudio en el backend:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al emitir el pedido',
          text: 'No se pudo registrar la orden de estudio en el servidor HCE. Intente de nuevo.'
        });
        return;
      }
    }

    setPacientes(prev => {
      const actualizados = [...prev];
      const pac = { ...actualizados[pacienteIdx] };
      const episodios = [...(pac.episodios || [])];
      const episodio = { ...episodios[episodioIdx] };

      const nuevoEstudio = {
        ...estudioData,
        id: id_orden,
        id_orden,
        tipo_estudio,
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
      pac.episodios = episodios;
      actualizados[pacienteIdx] = pac;
      return actualizados;
    });
  };

  // Las solicitudes de internación/pase ahora se gestionan y persisten desde
  // EpisodioDetalle vía solicitudCamaService (crear/resolver/cancelar) + recarga.

  // Cargar resultado de un estudio en un episodio (lo vincula a la HCE via /resultados)
  const agregarResultadoEstudio = async (pacienteIdx, episodioIdx, estudioIdx, resultadoData) => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    const pacienteRef = pacientes[pacienteIdx];
    const estudioRef = pacienteRef?.episodios?.[episodioIdx]?.estudiosData?.[estudioIdx];

    if (!useMocks && estudioRef) {
      try {
        await ordenService.cargarResultado(pacienteRef.core_patient_id, estudioRef, resultadoData);
      } catch (err) {
        console.error('[App] Error al cargar el resultado del estudio en el backend:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar resultados',
          text: 'No se pudo registrar el resultado en el servidor HCE. Intente de nuevo.'
        });
        return;
      }
    }

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
          link_imagen: resultadoData.link_imagen || null,
          analitos: resultadoData.analitos || null,
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
    setPacienteYaAtendido(false);
  };

  // Nuevo Registro: volver a Home y abrir modal de nueva ficha
  const nuevoRegistro = () => {
    setVistaActual('home');
    setPacienteActualIndex(null);
    setAbrirModalNuevo(true);
  };

  // Seleccionar paciente desde un turno ya atendido (bloquea crear nuevos episodios)
  const seleccionarPacienteAtendido = async (indexOrData) => {
    setPacienteYaAtendido(true);
    await seleccionarPaciente(indexOrData);
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
        console.log(`[App] Cargando datos personales y ficha clínica diferida para ${pacienteObj.core_patient_id}...`);
        
        // Consultamos en paralelo datos personales y ficha médica
        const [datosPersonalesRes, fichaRes] = await Promise.allSettled([
          pacienteService.obtenerDatosPersonales(pacienteObj.core_patient_id),
          pacienteService.obtenerFicha(pacienteObj.core_patient_id)
        ]);

        if (datosPersonalesRes.status === 'fulfilled' && datosPersonalesRes.value) {
          const dp = datosPersonalesRes.value;
          pacienteObj = {
            ...pacienteObj,
            nombreApellido: dp.nombreApellido || pacienteObj.nombreApellido,
            dni: dp.dni || pacienteObj.dni,
            fechaNacimiento: dp.fechaNacimiento || pacienteObj.fechaNacimiento,
            sexo: dp.sexo || pacienteObj.sexo,
            telefono: dp.telefono || pacienteObj.telefono,
            direccion: dp.direccion || pacienteObj.direccion,
            obraSocial: dp.obraSocial || pacienteObj.obraSocial,
            email: dp.email || pacienteObj.email,
            numeroHistoriaClinica: pacienteObj.id || pacienteObj.core_patient_id.replace('core-', '').replace(/^0+/, '')
          };
        } else {
          // Asignar al menos la Historia Clínica si falló o no vino de datos personales
          pacienteObj.numeroHistoriaClinica = pacienteObj.id || pacienteObj.core_patient_id.replace('core-', '').replace(/^0+/, '');
        }

        if (fichaRes.status === 'fulfilled' && fichaRes.value) {
          const ficha = fichaRes.value;
          pacienteObj = {
            ...pacienteObj,
            grupoSanguineo: ficha.grupo_sanguineo || 'O+',
            observaciones: ficha.observaciones_generales || '',
            peso_kg: ficha.peso_kg || null,
            altura_cm: ficha.altura_cm || null,
            antecedentes: ficha.antecedentes || [],
            consideraciones: ficha.alertas_clinicas || [],
            episodios: ficha.episodios || [],
            tieneFichaClinica: true,
            // Cobertura M7
            nombre_obra_social: ficha.nombre_obra_social || null,
            nombre_plan: ficha.nombre_plan || null,
            entidadFinanciadoraId: ficha.entidadFinanciadoraId || null,
            planId: ficha.planId || null,
            numero_afiliado: ficha.numero_afiliado || null,
            // Contacto
            telefono: ficha.telefono || pacienteObj.telefono || null,
            domicilio: ficha.domicilio || pacienteObj.direccion || pacienteObj.domicilio || null,
            correo: ficha.correo || pacienteObj.email || pacienteObj.correo || null
          };
        } else {
          pacienteObj.tieneFichaClinica = false;
        }
      } catch (err) {
        console.error('[App] Error al cargar los datos del paciente:', err);
        pacienteObj.tieneFichaClinica = false;
        pacienteObj.consideraciones = [];
        pacienteObj.antecedentes = [];
        pacienteObj.episodios = [];
      }
    } else {
      // Si estamos en Mocks, igual definimos numeroHistoriaClinica
      pacienteObj.numeroHistoriaClinica = pacienteObj.id || pacienteObj.core_patient_id.replace('core-', '').replace(/^0+/, '');
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

  // Si no está logueado, mostrar la pantalla de Login
  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

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
      <Toaster position="top-right" richColors closeButton />
      <Sidebar />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {vistaActual === 'home' && (
          <Home
            pacientes={pacientes}
            onSeleccionarPaciente={seleccionarPaciente}
            onSeleccionarPacienteAtendido={seleccionarPacienteAtendido}
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
            pacienteYaAtendido={pacienteYaAtendido}
            onVolver={volverAHome}
            onNuevoRegistro={nuevoRegistro}
            onActualizar={actualizarPaciente}
            onAgregarEpisodio={agregarEpisodio}
            onAgregarEvolucion={agregarEvolucion}
            onDarDeAlta={darDeAlta}
            onAgregarReceta={agregarReceta}
            onCambiarEstadoReceta={cambiarEstadoReceta}
            onAgregarEstudio={agregarEstudio}
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