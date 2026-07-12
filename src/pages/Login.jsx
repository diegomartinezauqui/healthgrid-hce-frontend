// src/pages/Login.jsx
import { useState } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiBriefcase, FiShield, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { RiStethoscopeLine } from 'react-icons/ri';
import { authService } from '../services/authService';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleQuickAccess = (role) => {
    // Acceso rápido demo: sin token real, solo marca la sesión de UI
    onLogin({ role, nombre: role === 'Paciente' ? 'Paciente Demo' : role === 'Profesional' ? 'Dr. García' : 'Admin Demo' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const newErrors = {};

    if (!dni.trim()) newErrors.dni = 'Ingresá tu DNI o CUIL';
    if (!password.trim()) newErrors.password = 'Ingresá tu contraseña';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Intentar login real contra el Core (M10)
      const { access_token, user } = await authService.loginCore(dni.trim(), password);
      onLogin({ role: user?.role || 'Profesional', nombre: user?.username || 'Dr. García', dni, access_token, user });
    } catch (err) {
      console.error('[Login] Fallo el login contra el Core:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setLoginError('Credenciales incorrectas. Verificá tu DNI y contraseña.');
      } else if (!status) {
        // Sin respuesta del Core: modo dev (solo si no es producción)
        const isProd = import.meta.env.VITE_APP_ENV === 'production';
        if (!isProd) {
          console.warn('[Login] Core no disponible. Usando acceso demo de desarrollo.');
          onLogin({ role: 'Profesional', nombre: 'Dr. García', dni });
        } else {
          setLoginError('No se pudo conectar con el servidor de autenticación. Intente más tarde.');
        }
      } else {
        setLoginError('Error al iniciar sesión. Intente más tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Panel izquierdo - Hero */}
      <div className="login-hero">
        <div className="login-hero-content">
          <div className="login-logo">
            <div className="login-logo-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            </div>
            <span className="login-logo-text">Health Grid</span>
          </div>

          <div className="login-hero-headline">
            <h1>Tu salud, en la<br />palma de tu mano.</h1>
            <p className="login-hero-subtitle">
              Accedé a tus turnos, resultados de laboratorio, recetas y teleconsultas
              médicas desde un solo portal seguro y unificado.
            </p>
          </div>

          <div className="login-stats-grid">
            <div className="login-stat-card">
              <span className="login-stat-value">48k+</span>
              <span className="login-stat-label">Pacientes activos</span>
            </div>
            <div className="login-stat-card">
              <span className="login-stat-value">320+</span>
              <span className="login-stat-label">Profesionales</span>
            </div>
            <div className="login-stat-card">
              <span className="login-stat-value">99.9%</span>
              <span className="login-stat-label">Disponibilidad</span>
            </div>
            <div className="login-stat-card">
              <span className="login-stat-value">ISO 27001</span>
              <span className="login-stat-label">Certificación</span>
            </div>
          </div>
        </div>

        {/* Decoración de fondo animada */}
        <div className="login-hero-bg-decoration">
          <div className="login-hero-circle login-hero-circle-1"></div>
          <div className="login-hero-circle login-hero-circle-2"></div>
          <div className="login-hero-circle login-hero-circle-3"></div>
        </div>
      </div>

      {/* Panel derecho - Formulario */}
      <div className="login-form-panel">
        <div className="login-form-container">
          <div className="login-form-header">
            <h2>Iniciar sesión</h2>
            <p>Accedé al portal con tu DNI.</p>
          </div>

          {/* Acceso rápido demo */}
          <div className="login-quick-access">
            <span className="login-quick-label">ACCESO RÁPIDO · DEMO</span>
            <div className="login-quick-buttons">
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => handleQuickAccess('Paciente')}
                id="quick-access-paciente"
              >
                <FiUser size={20} />
                <span>Paciente</span>
              </button>
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => handleQuickAccess('Profesional')}
                id="quick-access-profesional"
              >
                <RiStethoscopeLine size={20} />
                <span>Profesional</span>
              </button>
              <button
                type="button"
                className="login-quick-btn"
                onClick={() => handleQuickAccess('Administrativo')}
                id="quick-access-administrativo"
              >
                <FiBriefcase size={20} />
                <span>Administrativo</span>
              </button>
            </div>
          </div>

          <div className="login-divider">
            <span>o ingresá con tus credenciales</span>
          </div>

          {/* Formulario */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="login-field">
              <label htmlFor="login-dni">DNI / CUIL</label>
              <div className={`login-input-wrapper ${errors.dni ? 'login-input-error' : ''}`}>
                <FiUser className="login-input-icon" size={18} />
                <input
                  id="login-dni"
                  type="text"
                  placeholder="DNI o CUIL"
                  value={dni}
                  onChange={(e) => {
                    setDni(e.target.value);
                    if (errors.dni) setErrors(prev => ({ ...prev, dni: '' }));
                  }}
                  autoComplete="username"
                />
              </div>
              {errors.dni && <span className="login-error-msg">{errors.dni}</span>}
            </div>

            <div className="login-field">
              <label htmlFor="login-password">CONTRASEÑA</label>
              <div className={`login-input-wrapper ${errors.password ? 'login-input-error' : ''}`}>
                <FiLock className="login-input-icon" size={18} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  id="toggle-password-visibility"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              {errors.password && <span className="login-error-msg">{errors.password}</span>}
            </div>

            <button
              type="submit"
              className="login-submit-btn"
              id="login-submit"
              disabled={loading}
              style={loading ? { opacity: 0.75, cursor: 'not-allowed' } : {}}
            >
              {loading ? (
                <>
                  <FiLoader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Verificando...
                </>
              ) : (
                <>
                  <FiShield size={18} />
                  Ingresar al portal
                </>
              )}
            </button>

            {/* Mensaje de error del servidor */}
            {loginError && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                backgroundColor: '#FFF3F3', border: '1px solid #FFCDD2',
                borderRadius: '8px', padding: '10px 14px',
                color: '#C62828', fontSize: '0.875rem', marginTop: '4px'
              }}>
                <FiAlertCircle size={16} style={{ flexShrink: 0 }} />
                {loginError}
              </div>
            )}
          </form>

          <div className="login-form-footer">
            <a href="#" className="login-forgot-link" onClick={(e) => { e.preventDefault(); handleQuickAccess('Profesional'); }}>
              ¿Olvidaste tu contraseña?
            </a>
            <p className="login-register-text">
              ¿Primera vez? Registrate con tu número de afiliado en la recepción o{' '}
              <a href="#" className="login-register-link" onClick={(e) => { e.preventDefault(); handleQuickAccess('Profesional'); }}>
                solicitá acceso online
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
