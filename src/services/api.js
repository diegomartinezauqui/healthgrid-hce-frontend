// src/services/api.js
/**
 * Instancias centralizadas de Axios.
 *
 * ┌─ api ─────────────────────────────────────────────────────────────────────┐
 * │  Apunta al backend HCE (FastAPI).                                         │
 * │  Interceptor REQUEST → inyecta el JWT desde localStorage en cada llamada. │
 * │  Interceptor RESPONSE → desenvuelve `response.data` y maneja errores HTTP.│
 * └───────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─ coreApi ──────────────────────────────────────────────────────────────────┐
 * │  Apunta al módulo Core (M10 — autenticación / padrón).                    │
 * │  Interceptor REQUEST → inyecta el JWT si ya existe (para endpoints        │
 * │  autenticados del Core distintos al login).                               │
 * └───────────────────────────────────────────────────────────────────────────┘
 */

import axios from 'axios';

const TOKEN_KEY = 'healthgrid_token';

// ─── Instancia HCE ───────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Interceptor de peticiones: inyecta el JWT antes de que la request salga
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de respuestas: desenvuelve data y maneja errores globales
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          console.warn('[HCE API] No autorizado / sesión expirada. Limpiando credenciales...');
          localStorage.removeItem(TOKEN_KEY);
          // Emitir evento global para que App.jsx / AuthContext reaccionen
          window.dispatchEvent(new Event('healthgrid:unauthorized'));
          break;
        case 403:
          console.error('[HCE API] Acceso prohibido. Sin permisos suficientes.');
          break;
        case 400:
        case 422:
          console.error('[HCE API] Errores de validación:', data);
          break;
        case 500:
          console.error('[HCE API] Error interno del servidor. Intente más tarde.');
          break;
        default:
          console.error(`[HCE API] Error (${status}):`, data);
      }
    } else if (error.request) {
      console.error('[HCE API] Sin respuesta del servidor. Verifique su conexión.');
    } else {
      console.error('[HCE API] Error al configurar la petición:', error.message);
    }
    return Promise.reject(error);
  }
);

// ─── Instancia CORE (M10) ────────────────────────────────────────────────────

const coreApi = axios.create({
  baseURL: import.meta.env.VITE_CORE_API_URL || 'https://api.healthcare.cantero.ar',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Interceptor REQUEST del Core: inyecta el JWT si existe
// (útil para endpoints del Core que requieren auth, distintos al login)
coreApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor RESPONSE del Core: desenvuelve data y loguea errores
coreApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      console.error(`[CORE API] Error (${status}):`, data);
      if (status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        window.dispatchEvent(new Event('healthgrid:unauthorized'));
      }
    } else if (error.request) {
      console.error('[CORE API] Sin respuesta del servidor Core. Verifique su conexión.');
    } else {
      console.error('[CORE API] Error al configurar la petición:', error.message);
    }
    return Promise.reject(error);
  }
);

export { coreApi };
export default api;
