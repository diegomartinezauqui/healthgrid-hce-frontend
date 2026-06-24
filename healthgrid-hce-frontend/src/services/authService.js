// src/services/authService.js
import api from './api';

/**
 * Servicio de autenticación para desarrollo.
 * Permite obtener un token JWT simulado del backend de HCE si no se dispone de uno.
 */
export const authService = {
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
      const response = await api.post('/dev/login', {});
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
  logout: () => {
    localStorage.removeItem('healthgrid_token');
    console.log('[Auth Dev] Token JWT de desarrollo eliminado.');
  }
};
