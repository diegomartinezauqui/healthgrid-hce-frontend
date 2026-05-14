// src/components/Sidebar.jsx
import React from 'react';
import '../styles/Sidebar.css';

const Sidebar = () => {
  // Cuando tengan backend, estos datos vendrán de una API o del JWT
  const usuarioLogueado = {
    iniciales: "SR",
    nombre: "Dr. Santiago Rossi",
    rol: "Jefe de Guardia"
  };

  const navItems = [
    {
      name: 'Historia Clínica',
      active: true,
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="12" y1="18" x2="12" y2="12"></line>
          <line x1="9" y1="15" x2="15" y2="15"></line>
        </svg>
      )
    },
    {
      name: 'Farmacia e Insumos',
      active: false,
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"></path>
        </svg>
      )
    },
    {
      name: 'Laboratorio',
      active: false,
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M9 3v11l-4 5h14l-4-5V3"></path>
          <line x1="9" y1="3" x2="15" y2="3"></line>
        </svg>
      )
    },
    {
      name: 'Imágenes',
      active: false,
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="3" y="3" width="18" height="18" rx="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </svg>
      )
    },
    {
      name: 'Internación y Camas',
      active: false,
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M2 20h20M2 20V10l9-7 9 7v10"></path>
          <path d="M7 20v-5h10v5"></path>
        </svg>
      )
    },
    {
      name: 'Facturación',
      active: false,
      icon: (
        <svg viewBox="0 0 24 24">
          <rect x="2" y="5" width="20" height="14" rx="2"></rect>
          <line x1="2" y1="10" x2="22" y2="10"></line>
        </svg>
      )
    },
    {
      name: 'Portal Paciente',
      active: false,
      icon: (
        <svg viewBox="0 0 24 24">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
    {
      name: 'Configuración',
      active: false,
      icon: (
        <svg viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path>
        </svg>
      )
    }
  ];

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


        {/* Opciones de Menú */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <div 
              key={item.name} 
              className={`nav-item ${item.active ? 'active' : ''}`}
            >
              {item.icon}
              {item.name}
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