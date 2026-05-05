// src/App.jsx
import { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import PacienteDetalle from './pages/PacienteDetalle';

function App() {
  // Estado global de pacientes en memoria
  const [pacientes, setPacientes] = useState([]);
  // Vista actual: 'home' | 'detalle'
  const [vistaActual, setVistaActual] = useState('home');
  // Índice del paciente que se está viendo en detalle
  const [pacienteActualIndex, setPacienteActualIndex] = useState(null);

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
          <Home onGuardarPaciente={guardarPaciente} />
        )}
        {vistaActual === 'detalle' && pacienteActualIndex !== null && (
          <PacienteDetalle
            paciente={pacientes[pacienteActualIndex]}
            pacienteIndex={pacienteActualIndex}
            onVolver={volverAHome}
            onActualizar={actualizarPaciente}
            onAgregarEpisodio={agregarEpisodio}
            onAgregarEvolucion={agregarEvolucion}
            onDarDeAlta={darDeAlta}
          />
        )}
      </div>
    </div>
  );
}

export default App;