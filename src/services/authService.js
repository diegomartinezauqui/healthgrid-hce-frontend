// src/services/authService.js
/**
 * Servicio de autenticación.
 *
 * Modos de operación:
 *
 *  1. loginCore(username, password)
 *     → Llama al Core (M10) en POST /auth/login.
 *     → Recibe { access_token, token_type, ... }.
 *     → Guarda el JWT en localStorage ('healthgrid_token').
 *     → Retorna el token (string) o lanza un error.
 *
 *  2. checkAndLoginDev()
 *     → Solo disponible cuando VITE_USE_MOCKS !== 'true'.
 *     → Si ya existe un token en localStorage, lo devuelve sin llamar al backend.
 *     → Si no existe, llama al endpoint /dev/login del HCE para obtener
 *       un token HS256 de desarrollo.
 *
 *  3. logout()
 *     → Limpia el token del localStorage.
 */

import api, { coreApi } from './api';

const TOKEN_KEY = 'healthgrid_token';

export const authService = {
  /**
   * Autenticación real contra el módulo Core (M10).
   *
   * El Core espera un body con `username` y `password` (form o JSON según
   * su implementación). Ajustá el payload si el Core usa OAuth2 password flow
   * (application/x-www-form-urlencoded) en lugar de JSON.
   *
   * @param {string} username  — DNI, CUIL, email u otro identificador del Core
   * @param {string} password
   * @returns {Promise<{ access_token: string, user: object|null }>}
   */
  loginCore: async (username, password) => {
    console.log('[Auth] Iniciando autenticación contra el Core...');

    // ── Determinar si el Core usa form-urlencoded (OAuth2) o JSON ────────────
    // La mayoría de los backends FastAPI con OAuth2PasswordBearer esperan form.
    // Si tu Core acepta JSON, cambiá esto por: { username, password }
    const useFormEncoded = import.meta.env.VITE_CORE_AUTH_FORM === 'true';

    let payload;
    let headers = {};

    if (useFormEncoded) {
      payload = new URLSearchParams({ email: username, password });
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else {
      payload = { email: username, password };
    }

    // El endpoint de login del Core (ajustá si es distinto)
    const loginPath = import.meta.env.VITE_CORE_LOGIN_PATH || '/auth/login';

    const response = await coreApi.post(loginPath, payload, { headers });

    // response ya es response.data gracias al interceptor de coreApi
    const { access_token } = response;

    if (!access_token) {
      throw new Error('El Core no retornó un access_token válido.');
    }

    // Guardar en localStorage para que el interceptor de Axios lo inyecte
    localStorage.setItem(TOKEN_KEY, access_token);
    console.log('[Auth] JWT del Core guardado en localStorage.');

    // Intentar extraer datos del usuario del payload del token (sin validar firma)
    let user = null;
    try {
      const payloadB64 = access_token.split('.')[1];
      user = JSON.parse(atob(payloadB64));
    } catch {
      // Si no se puede decodificar el payload, no es crítico
      console.warn('[Auth] No se pudo decodificar el payload del JWT.');
    }

    return { access_token, user };
  },

  /**
   * Login de desarrollo contra el endpoint /dev/login del HCE.
   * Solo disponible cuando APP_ENV !== 'production' en el backend.
   *
   * Si ya existe un token válido en localStorage, lo reutiliza sin llamar
   * al backend para evitar peticiones redundantes.
   */
  checkAndLoginDev: async () => {
    const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';
    if (useMocks) return null;

    const token = localStorage.getItem(TOKEN_KEY);
    if (token) return token;

    console.log('[Auth Dev] Solicitando token de desarrollo JWT a /dev/login...');
    try {
      const response = await api.post('/dev/login', {
        permissions: [
          'hce:read',
          'hce:write',
          'hce:alertas:read',
          'hce:alertas:write',
          'hce:antecedentes:read',
          'hce:antecedentes:write',
          'hce:ficha-medica:read',
          'hce:ficha-medica:write',
          'hce:recetas:read',
          'hce:recetas:write',
          'hce:ordenes:read',
          'hce:ordenes:write',
          'hce:resultados:read',
          'hce:resultados:write',
          'hce:internacion:write',
          'hce:episodes:read',
          'hce:episodes:write',
          'hce:medical-acts:read',
          'hce:insurance:read',
          'hce:evoluciones:read',
          'hce:evoluciones:write',
        ],
      });

      if (response && response.access_token) {
        localStorage.setItem(TOKEN_KEY, response.access_token);
        console.log('[Auth Dev] Token JWT de desarrollo guardado en localStorage.');
        return response.access_token;
      }
    } catch (error) {
      console.error('[Auth Dev] Falló la obtención del JWT de desarrollo:', error);
    }
    return null;
  },

  /**
   * Cierra la sesión limpiando el token del localStorage.
   */
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    console.log('[Auth] Token JWT eliminado de localStorage.');
  },
};
