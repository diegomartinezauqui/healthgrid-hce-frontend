// src/pages/Home.jsx
import React, { useState } from 'react';
import NuevaFichaMedica from './NuevaFichaMedica';

const Home = ({ onGuardarPaciente }) => {
  const [mostrarModal, setMostrarModal] = useState(false);

  const handleGuardar = (data) => {
    onGuardarPaciente(data);
    setMostrarModal(false);
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F4F7F6' }}>
      
      {/* Barra de Navegación Superior */}
      <header style={{ backgroundColor: 'white', padding: '15px 30px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #E0E0E0' }}>
        <div style={{ display: 'flex', border: '2.5px solid #11352A', borderRadius: '10px', overflow: 'hidden', width: '380px' }}>
          <input 
            type="text" 
            placeholder="Buscar por DNI o Nombre..." 
            style={{ flexGrow: 1, padding: '10px 15px', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#333', backgroundColor: 'transparent' }}
          />
          <button style={{ backgroundColor: '#11352A', color: 'white', padding: '0 20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s ease' }}
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
          
          <div style={{ display: 'flex', marginBottom: '50px', border: '2px solid #11352A', borderRadius: '10px', overflow: 'hidden', backgroundColor: 'white' }}>
            <input 
              type="text" 
              placeholder="Ingrese DNI o Nro. de Historia Clínica" 
              style={{ flexGrow: 1, padding: '12px 18px', border: 'none', outline: 'none', fontSize: '0.9rem', color: '#333', backgroundColor: 'transparent', fontFamily: 'inherit' }}
            />
            <button style={{ backgroundColor: '#11352A', color: 'white', padding: '0 25px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 0.2s ease' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a4a3a'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#11352A'}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10.5" cy="10.5" r="7.5"></circle>
                <line x1="21" y1="21" x2="15.8" y2="15.8"></line>
              </svg>
            </button>
          </div>

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