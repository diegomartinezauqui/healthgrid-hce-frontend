// src/App.jsx
import './App.css';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';

function App() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      {/* Cargamos el Menú Lateral a la izquierda */}
      <Sidebar />

      {/* Cargamos la Vista Principal que ocupará el resto del espacio */}
      <Home />
    </div>
  );
}

export default App;