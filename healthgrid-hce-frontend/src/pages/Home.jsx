// src/pages/Home.jsx
import React from 'react';

const Home = () => {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F4F7F6' }}>
      
      {/* Barra de Navegación Superior */}
      <header style={{ backgroundColor: 'white', padding: '15px 30px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #E0E0E0' }}>
        <input 
          type="text" 
          placeholder="Buscar por DNI o Nombre..." 
          style={{ padding: '10px 15px', width: '300px', borderRadius: '5px', border: '1px solid #E0E0E0', backgroundColor: '#F9FAFA' }}
        />
        {/* Ignoramos el botón azul de "Siguiente Paciente" como pediste */}
      </header>

      {/* Contenido Principal */}
      <main style={{ padding: '30px', flexGrow: 1, overflowY: 'auto' }}>
        
        {/* Banner Verde */}
        <div style={{ backgroundColor: '#11352A', color: 'white', padding: '40px', borderRadius: '15px', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '2rem' }}>Bienvenido al <span style={{ color: '#259A5E' }}>Portal Clínico</span></h1>
          <p style={{ margin: 0, maxWidth: '500px', color: '#A0B8B0', lineHeight: '1.5' }}>
            Acceda de manera segura a la información de sus pacientes. El historial clínico digital unificado le permite tomar decisiones informadas con precisión quirúrgica.
          </p>
        </div>

        {/* Tarjeta Blanca de Búsqueda */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '1.2rem' }}>Búsqueda de Pacientes</h2>
          <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.9rem' }}>Inicie un nuevo proceso clínico ingresando la identidad del paciente.</p>
          
          <div style={{ display: 'flex', gap: '15px', marginBottom: '50px' }}>
            <input 
              type="text" 
              placeholder="Ingrese DNI o Nro. de Historia Clínica" 
              style={{ flexGrow: 1, padding: '15px', borderRadius: '8px', border: '1px solid #E0E0E0', backgroundColor: '#F9FAFA' }}
            />
            <button style={{ backgroundColor: '#11352A', color: 'white', padding: '0 30px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              BUSCAR
            </button>
          </div>

          {/* Sección de Nuevo Paciente */}
          <div style={{ textAlign: 'center', borderTop: '1px solid #E0E0E0', paddingTop: '40px' }}>
            <div style={{ width: '50px', height: '50px', backgroundColor: '#F0F4F2', color: '#259A5E', borderRadius: '50%', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', marginBottom: '15px', fontSize: '1.5rem' }}>
              +
            </div>
            <h3 style={{ margin: '0 0 10px 0' }}>¿Paciente no registrado?</h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '0.9rem' }}>Si el paciente es nuevo o no cuenta con historia previa, puede iniciar el registro ahora.</p>
            <button style={{ backgroundColor: '#11352A', color: 'white', padding: '12px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
              + NUEVA FICHA MÉDICA
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Home;