// src/services/authService.js
import api from './api';

/**
 * Servicio de autenticación para desarrollo.
 * Permite obtener un token JWT simulado del backend de HCE si no se dispone de uno.
 */
export const authService = {
  /**
   * Realiza un inicio de sesión real contra la API del Core usando email y contraseña.
   */
  loginConCore: async (email, password) => {
    const coreApiUrl = import.meta.env.VITE_CORE_API_URL || 'https://api.healthcare.cantero.ar';
    console.log('[Auth Core] Solicitando token de sesión a /auth/login...');
    
    const response = await fetch(`${coreApiUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Credenciales inválidas. Verifique su correo y contraseña.');
      }
      throw new Error(`Error en el servidor del Core: HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.token) {
      localStorage.setItem('healthgrid_token', data.token);
      if (data.user) {
        localStorage.setItem('healthgrid_sso_user', JSON.stringify(data.user));
      }
      console.log('[Auth Core] Sesión real establecida y guardada en localStorage.');
      return data.user;
    }
    throw new Error('La respuesta del Core no contiene un token válido.');
  },

  /**
   * Comprueba si existe un token en localStorage. Si no existe y no estamos en
   * modo mocks, realiza una llamada al endpoint de login para desarrollo.
   */
  checkAndLoginDev: async () => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks) return null;

    const token = localStorage.getItem('healthgrid_token');
    if (token) return token;

    console.log('[Auth Dev] Solicitando token de desarrollo JWT a /dev/login...');
    try {
      // Enviamos cuerpo vacío para tomar los valores de médico por defecto en el backend
      const response = await api.post('/dev/login', {
        permissions: [
          "hce:read",
          "hce:write",
          "hce:alertas:read",
          "hce:alertas:write",
          "hce:antecedentes:read",
          "hce:antecedentes:write",
          "hce:ficha-medica:read",
          "hce:ficha-medica:write",
          "hce:recetas:read",
          "hce:recetas:write",
          "hce:ordenes:read",
          "hce:ordenes:write",
          "hce:resultados:read",
          "hce:resultados:write",
          "hce:internacion:write",
          "hce:episodes:read",
          "hce:episodes:write",
          "hce:medical-acts:read",
          "hce:insurance:read",
          "hce:evoluciones:read",
          "hce:evoluciones:write"
        ]
      });
      if (response && response.access_token) {
        localStorage.setItem('healthgrid_token', response.access_token);
        console.log('[Auth Dev] Token JWT de desarrollo guardado en localStorage.');
        return response.access_token;
      }
    } catch (error) {
      console.error('[Auth Dev] Falló la obtención del JWT de desarrollo:', error);
    }
    return null;
  },

  /**
   * Limpia el token y fuerza un nuevo dev login.
   */
  logout: async () => {
    const token = localStorage.getItem('healthgrid_token');
    if (token) {
      const coreApiUrl = import.meta.env.VITE_CORE_API_URL || 'https://api.healthcare.cantero.ar';
      console.log('[Auth Core] Solicitando invalidación de token a /auth/logout...');
      try {
        await fetch(`${coreApiUrl}/auth/logout`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('[Auth Core] Token invalidado en el Core con éxito.');
      } catch (error) {
        console.error('[Auth Core] Error al invalidar token en el Core:', error);
      }
    }
    localStorage.removeItem('healthgrid_token');
    localStorage.removeItem('healthgrid_sso_user');
    console.log('[Auth Dev] Token JWT de desarrollo eliminado.');
  },

  /**
   * Envía una solicitud de restablecimiento de contraseña para el email dado al Core API.
   */
  recuperarContrasena: async (email) => {
    const coreApiUrl = import.meta.env.VITE_CORE_API_URL || 'https://api.healthcare.cantero.ar';
    console.log('[Auth Core] Solicitando recuperación de contraseña a /auth/forgot-password...');
    
    const response = await fetch(`${coreApiUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No se encontró ninguna cuenta registrada con ese correo electrónico.');
      }
      throw new Error(`Error al solicitar restablecimiento: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.message || 'Código de restablecimiento enviado con éxito a tu casilla de correo.';
  },

  /**
   * Confirma el restablecimiento de contraseña usando el código recibido y la nueva contraseña.
   */
  confirmarResetPassword: async (email, code, newPassword) => {
    const coreApiUrl = import.meta.env.VITE_CORE_API_URL || 'https://api.healthcare.cantero.ar';
    console.log('[Auth Core] Enviando confirmación de reset de password a /auth/reset-password...');
    
    const response = await fetch(`${coreApiUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, new_password: newPassword })
    });

    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('El código ingresado es inválido, ya fue usado o ha expirado.');
      }
      throw new Error(`Error al restablecer la contraseña: HTTP ${response.status}`);
    }

    const data = await response.json();
    return data?.message || 'Contraseña restablecida con éxito. Ya puedes iniciar sesión.';
  }
};
