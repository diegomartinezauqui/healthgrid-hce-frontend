// src/pages/Login.jsx
import { useState } from 'react';
import { FiLock, FiEye, FiEyeOff, FiShield, FiAlertCircle, FiLoader, FiMail } from 'react-icons/fi';
import { authService } from '../services/authService';
import Swal from 'sweetalert2';
import '../styles/Login.css';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleForgotOrRegister = async (e, action) => {
    e.preventDefault();
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks) {
      onLogin({ role: 'Profesional', nombre: 'Dr. García' });
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
        html: 
          '<p style="text-align: left; font-size: 0.95rem; line-height: 1.5; color: #444;">' +
          'Para solicitar un nuevo acceso al portal, ponte en contacto con la ' +
          '<strong>recepción</strong> o el <strong>personal administrativo</strong> de tu centro de salud.<br/><br/>' +
          'Ellos te darán de alta en el sistema y recibirás un correo de verificación ' +
          'para establecer tu contraseña.' +
          '</p>',
        confirmButtonColor: '#259A5E',
        confirmButtonText: 'Entendido'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Ingresá tu correo electrónico';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Ingresá un correo electrónico válido';
    }
    if (!password.trim()) newErrors.password = 'Ingresá tu contraseña';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      // Intentar login real contra el Core (M10)
      const { access_token, user } = await authService.loginCore(email.trim(), password);
      onLogin({ role: user?.role || 'Profesional', nombre: user?.username || 'Dr. García', email, access_token, user });
    } catch (err) {
      console.error('[Login] Fallo el login contra el Core:', err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setLoginError('Credenciales incorrectas. Verificá tu correo electrónico y contraseña.');
      } else if (!status) {
        // Sin respuesta del Core: modo dev (solo si no es producción)
        const isProd = import.meta.env.VITE_APP_ENV === 'production';
        if (!isProd) {
          console.warn('[Login] Core no disponible. Usando acceso demo de desarrollo.');
          onLogin({ role: 'Profesional', nombre: 'Dr. García', email });
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
            <p>Accedé al portal con tu cuenta.</p>
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
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  autoComplete="username"
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
