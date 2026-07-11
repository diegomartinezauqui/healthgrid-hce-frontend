// src/hooks/useSalaEspera.js
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { salaEsperaService } from '../services/salaEsperaService';
import { pacienteService } from '../services/pacienteService';
import { searchCorePatients } from '../services/mockCoreData';


/**
 * Custom Hook (composable) que encapsula el estado y la lógica de la Sala de Espera / Agenda.
 */
export const useSalaEspera = ({
  pacientes,
  turnoActivo,
  onIniciarAtencion,
  onGuardarPaciente,
  onGuardarPacienteSilencioso
}) => {
  const [agenda, setAgenda] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroTriage, setFiltroTriage] = useState('Todos');

  // Búsqueda global en el padrón del Core
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de modal de nueva ficha
  const [mostrarModal, setMostrarModal] = useState(false);
  const [turnoPendiente, setTurnoPendiente] = useState(null);
  const [corePatientToCreate, setCorePatientToCreate] = useState(null);

  /**
   * Carga la lista de turnos desde el servicio (Mock o Backend HCE).
   */
  const cargarAgenda = async () => {
    setLoading(true);
    setError(null);
    try {
      const datos = await salaEsperaService.listar();
      setAgenda(datos);

      // Verificamos si el turno activo guardado localmente sigue estando "En atención" en la base de datos
      if (turnoActivo) {
        const turnoEnDb = datos.find(t => t.id_espera === turnoActivo.id_espera);
        if (!turnoEnDb || turnoEnDb.estado !== 'En atención') {
          console.warn(`[useSalaEspera] El turno activo ${turnoActivo.id_espera} ya no está En atención en la base de datos. Limpiando.`);
          if (onIniciarAtencion) {
            onIniciarAtencion(null, null);
          }
        }
      }

      // Verificación silenciosa asíncrona de existencia de Ficha Médica real en el backend para cada paciente de la sala
      const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
      if (!useMocks && datos.length > 0 && onGuardarPacienteSilencioso) {
        const idsUnicos = [...new Set(datos.map(t => t.paciente.core_patient_id))];
        idsUnicos.forEach(async (coreId) => {
          try {
            const ficha = await pacienteService.obtenerFicha(coreId);
            const turnoAsociado = datos.find(t => t.paciente.core_patient_id === coreId);
            if (ficha) {
              onGuardarPacienteSilencioso({
                core_patient_id: coreId,
                nombreApellido: turnoAsociado?.paciente.nombreApellido,
                dni: turnoAsociado?.paciente.dni || '—',
                grupoSanguineo: ficha.grupo_sanguineo || 'O+',
                observaciones: ficha.observaciones_generales || '',
                peso_kg: ficha.peso_kg || null,
                altura_cm: ficha.altura_cm || null,
                antecedentes: ficha.antecedentes || [],
                consideraciones: ficha.alertas_clinicas || [],
                episodios: ficha.episodios || [],
                tieneFichaClinica: true
              });
            } else {
              onGuardarPacienteSilencioso({
                core_patient_id: coreId,
                nombreApellido: turnoAsociado?.paciente.nombreApellido,
                dni: turnoAsociado?.paciente.dni || '—',
                tieneFichaClinica: false
              });
            }
          } catch (err) {
            const turnoAsociado = datos.find(t => t.paciente.core_patient_id === coreId);
            onGuardarPacienteSilencioso({
              core_patient_id: coreId,
              nombreApellido: turnoAsociado?.paciente.nombreApellido,
              dni: turnoAsociado?.paciente.dni || '—',
              tieneFichaClinica: false
            });
          }
        });
      }
    } catch (err) {
      setError('No se pudo establecer conexión con la sala de espera.');
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    cargarAgenda();
  }, []);

  // Estados para controlar la búsqueda paginada
  const [coreResults, setCoreResults] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [tieneMas, setTieneMas] = useState(false);
  const LIMIT = 5; // Paginación de a 5 como solicita el usuario

  // Búsqueda en el padrón debounced para mejorar performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Resetear la página a 1 ante un nuevo término de búsqueda
  useEffect(() => {
    setPagina(1);
  }, [searchTerm]);

  // Ejecución de búsqueda con paginación
  useEffect(() => {
    const realizarBusqueda = async () => {
      const term = debouncedSearchTerm.trim().toLowerCase();
      if (!term) {
        setCoreResults([]);
        setTieneMas(false);
        return;
      }

      setBuscando(true);
      const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
      const skip = (pagina - 1) * LIMIT;

      try {
        let listadoFiltrado = [];
        if (useMocks) {
          listadoFiltrado = searchCorePatients(term);
        } else {
          // Obtener todos los pacientes de la base de datos para filtrarlos en memoria (desarrollo local)
          const todosPacientes = await pacienteService.listarPacientes();
          listadoFiltrado = todosPacientes.filter(p =>
            (p.nombreApellido || '').toLowerCase().includes(term) ||
            (p.dni || '').includes(term)
          );
        }

        const paginados = listadoFiltrado.slice(skip, skip + LIMIT);
        setCoreResults(paginados);
        setTieneMas(listadoFiltrado.length > skip + LIMIT);

        // Verificación silenciosa asíncrona de existencia de Ficha Médica real en el backend para cada resultado de la búsqueda
        if (!useMocks && paginados.length > 0 && onGuardarPacienteSilencioso) {
          paginados.forEach(async (cp) => {
            try {
              const ficha = await pacienteService.obtenerFicha(cp.core_patient_id);
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
              } else {
                onGuardarPacienteSilencioso({
                  ...cp,
                  tieneFichaClinica: false
                });
              }
            } catch (err) {
              onGuardarPacienteSilencioso({
                ...cp,
                tieneFichaClinica: false
              });
            }
          });
        }
      } catch (err) {
        console.error('[useSalaEspera] Error en la búsqueda de pacientes:', err);
      } finally {
        setBuscando(false);
      }
    };

    realizarBusqueda();
  }, [debouncedSearchTerm, pagina]);




  // Mapear si el paciente ya tiene ficha creada en local
  const obtenerAccionFicha = (cp) => {
    const fichaMedicaIdx = (pacientes || []).findIndex(p => p.core_patient_id === cp.core_patient_id);
    const tieneFicha = fichaMedicaIdx !== -1 && pacientes[fichaMedicaIdx].tieneFichaClinica === true;
    const fichaMedica = tieneFicha ? pacientes[fichaMedicaIdx] : null;
    return { fichaMedicaIdx, tieneFicha, fichaMedica };
  };

  // Filtrar agenda localmente en base a filtros de la UI
  const agendaFiltrada = agenda.filter(turno => {
    if (filtroEstado !== 'Todos') {
      if (filtroEstado === 'Pendientes' && turno.estado === 'Atendido') return false;
      if (filtroEstado === 'Atendidos' && turno.estado !== 'Atendido') return false;
    }
    if (filtroTriage !== 'Todos' && turno.nivel_triage !== filtroTriage) return false;
    return true;
  });

  // Guardar nueva ficha y vincularla al turno
  const handleGuardarFicha = (data) => {
    onGuardarPaciente({ ...corePatientToCreate, ...data, core_patient_id: corePatientToCreate?.core_patient_id }, turnoPendiente);
    setMostrarModal(false);
    setCorePatientToCreate(null);
    setTurnoPendiente(null);
    cargarAgenda();
  };

  // Manejar el flujo de llamada preguntando consultorio
  const handleLlamarPaciente = async (turno) => {
    const ultimoConsultorio = localStorage.getItem('healthgrid_ultimo_consultorio') || '';
    const { value: consultorio } = await Swal.fire({
      title: 'Llamar Paciente',
      input: 'text',
      inputLabel: `Llamar a ${turno.paciente.nombreApellido} a consultorio:`,
      inputValue: ultimoConsultorio,
      showCancelButton: true,
      inputPlaceholder: 'Ej: 104',
      confirmButtonColor: '#259A5E',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Llamar',
      cancelButtonText: 'Cancelar',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return '¡Debe ingresar un consultorio!';
        }
      }
    });

    if (consultorio) {
      localStorage.setItem('healthgrid_ultimo_consultorio', consultorio.trim());
      try {
        await salaEsperaService.llamarPaciente(turno.id_espera, consultorio.trim());
        Swal.fire({
          icon: 'success',
          title: 'Paciente llamado',
          text: `Se ha enviado la llamada al consultorio ${consultorio.trim()}`,
          timer: 2000,
          showConfirmButton: false
        });
        cargarAgenda();
      } catch (err) {
        console.error('[useSalaEspera] Error al llamar paciente:', err);
        Swal.fire('Error', 'No se pudo realizar la llamada al paciente', 'error');
      }
    }
  };

  // Manejar el flujo de inicio de consulta (atender)
  const handleIniciarAtencion = (turno) => {
    const { tieneFicha, fichaMedicaIdx } = obtenerAccionFicha(turno.paciente);

    const proceder = async () => {
      try {
        if (tieneFicha) {
          const updatedTurno = await salaEsperaService.atenderPaciente(turno.id_espera);
          onIniciarAtencion(updatedTurno || turno, fichaMedicaIdx);
        } else {
          // Si el paciente anterior estaba en atención, lo suspendemos inmediatamente
          if (turnoActivo) {
            await salaEsperaService.suspenderPaciente(turnoActivo.id_espera);
            onIniciarAtencion(null, null); // Libera el estado global de React
          }
          setTurnoPendiente(turno);
          setCorePatientToCreate(turno.paciente);
          setMostrarModal(true);
          // Refrescamos la lista de la sala
          cargarAgenda();
        }
      } catch (err) {
        console.error('[useSalaEspera] Error al proceder con la atención:', err);
      }
    };

    if (turnoActivo && turnoActivo.id_espera !== turno.id_espera) {
      Swal.fire({
        title: 'Paciente en atención',
        text: `Ya tienes al paciente "${turnoActivo.paciente.nombreApellido}" en atención. ¿Deseas suspender su atención actual para iniciar la consulta de "${turno.paciente.nombreApellido}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#259A5E',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, cambiar de paciente',
        cancelButtonText: 'Cancelar'
      }).then(async (result) => {
        if (result.isConfirmed) {
          // Al suspender al anterior en el backend
          await salaEsperaService.suspenderPaciente(turnoActivo.id_espera);
          proceder();
        }
      });
    } else {
      proceder();
    }
  };

  // Manejar el flujo para registrar la ausencia de un paciente
  const handleMarcarAusente = (turno) => {
    Swal.fire({
      title: '¿Marcar como ausente?',
      text: `¿Está seguro de que desea marcar a "${turno.paciente.nombreApellido}" como ausente?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, marcar ausente',
      cancelButtonText: 'Volver'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await salaEsperaService.marcarAusente(turno.id_espera);
          Swal.fire({
            icon: 'success',
            title: 'Ausencia registrada',
            text: `El paciente ha sido marcado como ausente`,
            timer: 2000,
            showConfirmButton: false
          });
          cargarAgenda();
        } catch (err) {
          console.error('[useSalaEspera] Error al marcar ausente:', err);
          Swal.fire('Error', 'No se pudo registrar la ausencia del paciente', 'error');
        }
      }
    });
  };

  return {
    agenda: agendaFiltrada,
    rawAgenda: agenda,
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
    obtenerAccionFicha,
    recargarAgenda: cargarAgenda
  };
};
