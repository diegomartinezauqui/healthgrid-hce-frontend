// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import NuevaFichaMedica from './NuevaFichaMedica';

const Home = ({ onGuardarPaciente, pacientes = [], onSeleccionarPaciente, abrirModalNuevo = false, onModalNuevoCerrado }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);

  // Abrir modal automáticamente si viene de "Nuevo Registro"
  useEffect(() => {
    if (abrirModalNuevo) {
      setMostrarModal(true);
      if (onModalNuevoCerrado) onModalNuevoCerrado();
    }
  }, [abrirModalNuevo]);

  const handleGuardar = (data) => {
    onGuardarPaciente(data);
    setMostrarModal(false);
  };

  const ejecutarBusqueda = (termino) => {
    const t = (termino !== undefined ? termino : busqueda).trim().toLowerCase();
    if (!t) {
      setResultados([]);
      setBuscando(false);
      return;
    }
    setBuscando(true);
    const encontrados = pacientes
      .map((p, idx) => ({ ...p, _index: idx }))
      .filter(p =>
        (p.dni || '').toLowerCase().includes(t) ||
        (p.nombreApellido || '').toLowerCase().includes(t) ||
        (p.numeroHistoriaClinica || '').toLowerCase().includes(t)
      );
    setResultados(encontrados);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setBusqueda(val);
    ejecutarBusqueda(val);
  };

  const seleccionar = (paciente) => {
    onSeleccionarPaciente(paciente._index);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F4F7F6' }}>
      
      {/* Barra de Navegación Superior */}
      <header style={{ backgroundColor: 'white', padding: '15px 30px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #E0E0E0' }}>
        <div style={{ display: 'flex', border: '2.5px solid #11352A', borderRadius: '10px', overflow: 'hidden', width: '380px' }}>
          <input 
            type="text" 
            placeholder="Buscar por DNI o Nombre..." 
            value={busqueda}
            onChange={handleInputChange}
                        style={{ flexGrow: 1, padding: '10px 15px', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#333', backgroundColor: 'transparent' }}
          />
          <button 
            onClick={() => ejecutarBusqueda()}
            style={{ backgroundColor: '#11352A', color: 'white', padding: '0 20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s ease' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a4a3a'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#11352A'}
          >
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="10.5" cy="10.5" r="7.5"></circle>
              <line x1="21" y1="21" x2="15.8" y2="15.8"></line>
            </svg>
          </button>
        </div>
      </header>

      {/* Contenido Principal */}
      <main style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
        
        {/* Banner Verde */}
        <div style={{ backgroundColor: '#11352A', color: 'white', padding: '50px 40px', borderRadius: '15px', marginBottom: '30px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          
          {/* Círculos decorativos de fondo (derecha) */}
          <div style={{ position: 'absolute', right: '-80px', top: '50%', transform: 'translateY(-50%)', opacity: 0.8, pointerEvents: 'none' }}>
            <div style={{ width: '380px', height: '380px', borderRadius: '50%', border: '40px solid #164636', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: '220px', height: '220px', borderRadius: '50%', border: '40px solid #1a5441' }}></div>
            </div>
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ margin: '0 0 15px 0', fontSize: '2.4rem', fontFamily: 'Georgia, "Times New Roman", serif', letterSpacing: '0.5px' }}>
              Bienvenido al <span style={{ color: '#259A5E', fontWeight: 'bold' }}>Portal Clínico</span>
            </h1>
            <p style={{ margin: 0, maxWidth: '550px', color: '#A0B8B0', lineHeight: '1.6', fontSize: '0.95rem' }}>
              Acceda de manera segura a la información de sus pacientes. El historial clínico digital unificado le permite tomar decisiones informadas con precisión quirúrgica.
            </p>
          </div>
        </div>

        {/* Tarjeta Blanca de Búsqueda */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Búsqueda de Pacientes</h2>
          <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.9rem' }}>Inicie un nuevo proceso clínico ingresando la identidad del paciente.</p>
          
          <div style={{ display: 'flex', marginBottom: '25px', border: '2px solid #11352A', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white' }}>
            <input 
              type="text" 
              placeholder="Ingrese DNI o Nro. de Historia Clínica" 
              value={busqueda}
              onChange={handleInputChange}
              style={{ flexGrow: 1, padding: '12px 18px', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#333', backgroundColor: 'transparent', fontFamily: 'inherit' }}
            />
            <button 
              onClick={() => ejecutarBusqueda()}
              style={{ backgroundColor: '#11352A', color: 'white', padding: '0 25px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s ease' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a4a3a'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#11352A'}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10.5" cy="10.5" r="7.5"></circle>
                <line x1="21" y1="21" x2="15.8" y2="15.8"></line>
              </svg>
            </button>
          </div>

          {/* Resultados de búsqueda */}
          {buscando && (
            <div style={{ marginBottom: '30px' }}>
              {resultados.length > 0 ? (
                <div style={{ border: '1px solid #E0E4E2', borderRadius: '10px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 18px', backgroundColor: '#F0F4F2', fontSize: '0.8rem', color: '#666', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {resultados.length} paciente{resultados.length !== 1 ? 's' : ''} encontrado{resultados.length !== 1 ? 's' : ''}
                  </div>
                  {resultados.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => seleccionar(p)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '14px',
                        padding: '14px 18px', borderTop: '1px solid #E8ECE9',
                        cursor: 'pointer', transition: 'background-color 0.15s ease',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F8FAF9'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    >
                      <div style={{
                        width: '42px', height: '42px', borderRadius: '50%',
                        backgroundColor: '#259A5E', color: 'white', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontWeight: '700', fontSize: '0.85rem', flexShrink: 0,
                      }}>
                        {(p.nombreApellido || '??').split(/\s+/).slice(-1)[0]?.[0]?.toUpperCase() || '?'}
                        {(p.nombreApellido || '??').split(/\s+/)[0]?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#11352A' }}>
                          {p.nombreApellido}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '2px' }}>
                          DNI {p.dni} · HC {p.numeroHistoriaClinica} · {p.episodios?.length || 0} episodio{(p.episodios?.length || 0) !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{ color: '#259A5E', fontSize: '0.75rem', fontWeight: '600', backgroundColor: '#E8F5E9', padding: '4px 10px', borderRadius: '12px' }}>
                        {p.estado}
                      </div>
                      <div style={{ color: '#ccc', fontSize: '1.2rem' }}>›</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: '#888', fontSize: '0.9rem' }}>
                  No se encontraron pacientes con "<strong>{busqueda}</strong>".
                </div>
              )}
            </div>
          )}

          {/* Sección de Nuevo Paciente */}
          <div style={{ textAlign: 'center', borderTop: '1px solid #E0E0E0', paddingTop: '40px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#F0F4F2', color: '#259A5E', borderRadius: '50%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', fontSize: '1.5rem' }}>
              +
            </div>
            <h3 style={{ margin: '0 0 10px 0' }}>¿Paciente no registrado?</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.9rem' }}>Si el paciente es nuevo o no cuenta con historia previa, puede iniciar el registro ahora.</p>
            <button 
              onClick={() => setMostrarModal(true)}
              style={{ backgroundColor: '#11352A', color: 'white', padding: '12px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
            >
              + NUEVA FICHA MÉDICA
            </button>
          </div>
        </div>

      </main>

      {/* Modal de Nueva Ficha Médica */}
      {mostrarModal && (
        <NuevaFichaMedica
          onCerrar={() => setMostrarModal(false)}
          onGuardar={handleGuardar}
        />
      )}
    </div>
  );
};

export default Home;