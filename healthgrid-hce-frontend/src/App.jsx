// src/App.jsx
import { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import PacienteDetalle from './pages/PacienteDetalle';
import mockPacientes from './data/mockPacientes';

function App() {
  // Estado global de pacientes en memoria (precargado con datos de prueba)
  const [pacientes, setPacientes] = useState(mockPacientes);
  // Vista actual: 'home' | 'detalle'
  const [vistaActual, setVistaActual] = useState('home');
  // Índice del paciente que se está viendo en detalle
  const [pacienteActualIndex, setPacienteActualIndex] = useState(null);
  // Flag para abrir modal de nueva ficha al volver a Home
  const [abrirModalNuevo, setAbrirModalNuevo] = useState(false);

  // Guardar nuevo paciente y navegar al detalle
  const guardarPaciente = (data) => {
    const nuevoPaciente = {
      ...data,
      id: Date.now(),
      fechaRegistro: new Date().toISOString(),
      estado: 'Activo',
      episodios: [],
    };
    setPacientes(prev => {
      const nuevos = [...prev, nuevoPaciente];
      setPacienteActualIndex(nuevos.length - 1);
      return nuevos;
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

  // Dar de alta un episodio
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

  // Seleccionar paciente existente desde búsqueda
  const seleccionarPaciente = (index) => {
    setPacienteActualIndex(index);
    setVistaActual('detalle');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      <Sidebar />

      <div style={{ flex: 1, overflow: 'hidden' }}>
        {vistaActual === 'home' && (
          <Home
            onGuardarPaciente={guardarPaciente}
            pacientes={pacientes}
            onSeleccionarPaciente={seleccionarPaciente}
            abrirModalNuevo={abrirModalNuevo}
            onModalNuevoCerrado={() => setAbrirModalNuevo(false)}
          />
        )}
        {vistaActual === 'detalle' && pacienteActualIndex !== null && (
          <PacienteDetalle
            paciente={pacientes[pacienteActualIndex]}
            pacienteIndex={pacienteActualIndex}
            pacientes={pacientes}
            onSeleccionarPaciente={seleccionarPaciente}
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
          />
        )}
      </div>
    </div>
  );
}

export default App;