// src/App.jsx
import { useState, useEffect } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import PacienteDetalle from './pages/PacienteDetalle';
import { actualizarEstadoTurno } from './services/mockSalaEspera';

function App() {
  // Estado global de pacientes cargado desde localStorage
  const [pacientes, setPacientes] = useState(() => {
    const saved = localStorage.getItem('healthgrid_pacientes');
    return saved ? JSON.parse(saved) : [];
  });
  // Vista actual: 'home' | 'detalle'
  const [vistaActual, setVistaActual] = useState('home');
  // Índice del paciente que se está viendo en detalle
  const [pacienteActualIndex, setPacienteActualIndex] = useState(null);
  // Turno actualmente en atención
  const [turnoActivo, setTurnoActivo] = useState(null);

  // Sincronizar estado de pacientes con localStorage
  useEffect(() => {
    localStorage.setItem('healthgrid_pacientes', JSON.stringify(pacientes));
  }, [pacientes]);

  // Guardar nuevo paciente y navegar al detalle
  const guardarPaciente = (data, turnoAsociado = null) => {
    const nuevoPaciente = {
      ...data,
      id: Date.now(),
      fechaRegistro: new Date().toISOString(),
      estado: 'Activo',
      episodios: [],
    };

    if (turnoAsociado) {
      actualizarEstadoTurno(turnoAsociado.id_espera, 'En atención');
      nuevoPaciente.episodios = [{
        id: Date.now(),
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
    setTurnoActivo(turno);
    actualizarEstadoTurno(turno.id_espera, 'En atención');
    setPacienteActualIndex(pacienteIdx);

    // Si no tiene episodio abierto, crearlo automáticamente
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = paciente.episodios || [];
      const tieneEpisodioAbierto = episodios.some(e => e.estado === 'abierto');

      if (!tieneEpisodioAbierto) {
        const nuevoEpisodio = {
          id: Date.now(),
          numero: episodios.length + 1,
          fecha: new Date().toISOString(),
          medico: turno.id_profesional,
          especialidad: turno.sector,
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

  // Dar de alta un episodio (Finaliza el episodio y el turno)
  const darDeAlta = (pacienteIdx, episodioIdx) => {
    setPacientes(prev => {
      const actualizados = [...prev];
      const paciente = { ...actualizados[pacienteIdx] };
      const episodios = [...(paciente.episodios || [])];
      episodios[episodioIdx] = {
        ...episodios[episodioIdx],
        estado: 'cerrado',
        fechaAlta: new Date().toISOString(),
      };
      paciente.episodios = episodios;
      actualizados[pacienteIdx] = paciente;
      return actualizados;
    });

    if (turnoActivo) {
      actualizarEstadoTurno(turnoActivo.id_espera, 'Atendido');
      setTurnoActivo(null);
    }
    volverAHome();
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {vistaActual === 'home' && (
          <Home
            pacientes={pacientes}
            onSeleccionarPaciente={(idx) => {
              setPacienteActualIndex(idx);
              setVistaActual('detalle');
            }}
            onGuardarPaciente={guardarPaciente}
            onIniciarAtencion={iniciarAtencion}
          />
        )}
        {vistaActual === 'detalle' && pacienteActualIndex !== null && (
          <PacienteDetalle
            paciente={pacientes[pacienteActualIndex]}
            pacienteIndex={pacienteActualIndex}
            turnoActivo={turnoActivo}
            onVolver={volverAHome}
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
          />
        )}
      </div>
    </div>
  );
}

export default App;