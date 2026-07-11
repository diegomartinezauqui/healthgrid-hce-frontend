// src/pages/Login.jsx
import { useState } from 'react';
import { FiUser, FiLock, FiEye, FiEyeOff, FiBriefcase, FiShield, FiMail } from 'react-icons/fi';
import { RiStethoscopeLine } from 'react-icons/ri';
import Swal from 'sweetalert2';
import { authService } from '../services/authService';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleQuickAccess = (role) => {
    // Cualquier botón de acceso rápido te manda directo al home
    onLogin({ role, nombre: role === 'Paciente' ? 'Paciente Demo' : role === 'Profesional' ? 'Dr. García' : 'Admin Demo' });
  };

  const handleForgotOrRegister = async (e, action) => {
    e.preventDefault();
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks) {
      handleQuickAccess('Profesional');
      return;
    }

    if (action === 'forgot') {
      const { value: emailInput } = await Swal.fire({
        title: 'Recuperar Contraseña',
        input: 'email',
        inputLabel: 'Ingresá tu correo electrónico registrado en el Core',
        inputPlaceholder: 'ejemplo@healthcare.com',
        showCancelButton: true,
        confirmButtonColor: '#259A5E',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Enviar código',
        cancelButtonText: 'Cancelar',
        validationMessage: 'Por favor, ingresá un correo electrónico válido'
      });

      if (emailInput) {
        Swal.fire({
          title: 'Procesando solicitud',
          text: 'Conectando con el Core API...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          }
        });

        try {
          const msg = await authService.recuperarContrasena(emailInput);
          
          // Segundo paso: Solicitud de código y nueva contraseña
          const { value: formValues } = await Swal.fire({
            title: 'Establecer Nueva Contraseña',
            html:
              '<p style="font-size: 0.9rem; margin-bottom: 10px; color: #666;">Ingresa el código que recibiste por correo electrónico y tu nueva contraseña.</p>' +
              '<input id="swal-code" class="swal2-input" placeholder="Código de verificación" style="margin-bottom: 10px;">' +
              '<input id="swal-password" type="password" class="swal2-input" placeholder="Nueva Contraseña (mínimo 6 caracteres)">',
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonColor: '#259A5E',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Confirmar cambio',
            cancelButtonText: 'Cancelar',
            preConfirm: () => {
              const code = document.getElementById('swal-code').value;
              const password = document.getElementById('swal-password').value;
              if (!code.trim()) {
                Swal.showValidationMessage('Por favor, ingresa el código');
                return false;
              }
              if (!password.trim() || password.length < 6) {
                Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
                return false;
              }
              return { code, password };
            }
          });

          if (formValues) {
            Swal.fire({
              title: 'Restableciendo contraseña',
              text: 'Guardando los cambios en el Core...',
              allowOutsideClick: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });

            try {
              const resetMsg = await authService.confirmarResetPassword(emailInput, formValues.code, formValues.password);
              Swal.fire({
                icon: 'success',
                title: 'Contraseña Cambiada',
                text: resetMsg || 'Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.',
                confirmButtonColor: '#259A5E',
                confirmButtonText: 'Entendido'
              });
            } catch (err) {
              Swal.fire({
                icon: 'error',
                title: 'Fallo al restablecer',
                text: err.message || 'No se pudo restablecer la contraseña.',
                confirmButtonColor: '#d33',
                confirmButtonText: 'Entendido'
              });
            }
          }
        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: 'Error al procesar',
            text: err.message || 'No se pudo procesar la solicitud de recuperación.',
            confirmButtonColor: '#d33',
            confirmButtonText: 'Entendido'
          });
        }
      }
    } else {
      // Registro
      Swal.fire({
        icon: 'info',
        title: 'Creación de Cuenta',
        text: 'Para solicitar un nuevo acceso al portal, ponte en contacto con la recepción o el personal administrativo de tu centro de salud.',
        confirmButtonColor: '#259A5E',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Ingresá tu correo electrónico';
    }
    if (!password.trim()) {
      newErrors.password = 'Ingresá tu contraseña';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks) {
      // Mock local
      onLogin({ role: 'Profesional', nombre: 'Dr. García', email });
      return;
    }

    // Login real con el Core
    Swal.fire({
      title: 'Iniciando sesión',
      text: 'Conectando con el portal de Health Grid Core...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const user = await authService.loginConCore(email, password);
      Swal.close();
      
      Swal.fire({
        icon: 'success',
        title: 'Sesión iniciada',
        text: `Bienvenido/a, ${user.first_name || 'Médico'}`,
        timer: 1500,
        showConfirmButton: false
      });

      // Guardamos bandera en sessionStorage para compatibilidad del front
      sessionStorage.setItem('healthgrid_logged_in', 'true');
      onLogin({ 
        role: 'Profesional', 
        nombre: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Médico',
        email: user.email 
      });
    } catch (err) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Error de Inicio de Sesión',
        text: err.message || 'Ocurrió un error inesperado al autenticar.',
        confirmButtonColor: '#d33',
        confirmButtonText: 'Reintentar'
      });
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
            <p>Accedé al portal de Health Grid.</p>
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
              <label htmlFor="login-email">CORREO ELECTRÓNICO</label>
              <div className={`login-input-wrapper ${errors.email ? 'login-input-error' : ''}`}>
                <FiMail className="login-input-icon" size={18} />
                <input
                  id="login-email"
                  type="email"
                  placeholder="ejemplo@healthcare.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="login-error-msg">{errors.email}</span>}
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

            <button type="submit" className="login-submit-btn" id="login-submit">
              <FiShield size={18} />
              Ingresar al portal
            </button>
          </form>

          <div className="login-form-footer">
            <a href="#" className="login-forgot-link" onClick={(e) => handleForgotOrRegister(e, 'forgot')}>
              ¿Olvidaste tu contraseña?
            </a>
            <p className="login-register-text">
              ¿Primera vez? Registrate con tu número de afiliado en la recepción o{' '}
              <a href="#" className="login-register-link" onClick={(e) => handleForgotOrRegister(e, 'register')}>
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
