// src/components/Sidebar.jsx
import React from 'react';

const Sidebar = () => {
  // Cuando tengan backend, estos datos vendrán de una API o del JWT
  const usuarioLogueado = {
    iniciales: "SR",
    nombre: "Dr. Santiago Rossi",
    rol: "Jefe de Guardia"
  };

  return (
    <aside style={{
      width: '260px',
      backgroundColor: '#11352A', // Verde oscuro del mock
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100vh',
      padding: '20px 0'
    }}>
      {/* Parte Superior: Logo y Menú */}
      <div>
        {/* Logo */}
        <div style={{ padding: '0 20px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '30px', height: '30px', backgroundColor: '#259A5E', borderRadius: '5px' }}></div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Health Grid</h2>
            <span style={{ fontSize: '0.7rem', color: '#88A39A', letterSpacing: '1px' }}>CLINICAL EDITORIAL</span>
          </div>
        </div>

        {/* Buscador lateral */}
        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <input 
            type="text" 
            placeholder="Buscar por DNI o Nombre..." 
            style={{ width: '100%', padding: '10px', borderRadius: '5px', border: 'none', backgroundColor: '#1C4A3C', color: 'white' }}
          />
        </div>

        {/* Opciones de Menú */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '0 10px' }}>
          {/* Opción Activa */}
          <div style={{ backgroundColor: '#259A5E', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            + Historia Clínica
          </div>
          {/* Opciones Inactivas */}
          {['Farmacia e Insumos', 'Laboratorio', 'Imágenes', 'Internación y Camas', 'Facturación', 'Portal Paciente', 'Configuración'].map(item => (
            <div key={item} style={{ padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', color: '#A0B8B0' }}>
              {item}
            </div>
          ))}
        </nav>
      </div>

      {/* Parte Inferior: Perfil del Usuario */}
      <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '40px', height: '40px', backgroundColor: '#259A5E', borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontWeight: 'bold' }}>
          {usuarioLogueado.iniciales}
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem' }}>{usuarioLogueado.nombre}</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#A0B8B0' }}>{usuarioLogueado.rol}</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;