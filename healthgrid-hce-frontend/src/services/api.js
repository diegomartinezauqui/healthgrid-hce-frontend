// src/services/api.js
import axios from 'axios';

// Creación de la instancia base de Axios
const api = axios.create({
  // URL base configurada desde variables de entorno de Vite o HCE backend por defecto
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Límite de tiempo de 10 segundos
});

// Interceptor de peticiones: Inyecta el token de autenticación (JWT) si existe
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('healthgrid_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuestas: Manejo unificado de datos y errores globales
api.interceptors.response.use(
  (response) => {
    // Retorna la propiedad data para evitar desestructurar en cada componente
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Captura de errores HTTP recurrentes
      switch (status) {
        case 401:
          console.warn('No autorizado / Sesión expirada. Limpiando credenciales y recargando...');
          localStorage.removeItem('healthgrid_token');
          window.location.reload();
          break;
        case 403:
          console.error('Acceso prohibido. No cuenta con los permisos requeridos.');
          break;
        case 400:
        case 422:
          console.error('Errores de validación en la petición:', data);
          break;
        case 500:
          console.error('Error interno del servidor. Intente más tarde.');
          break;
        default:
          console.error(`Error de API (${status}):`, data);
      }
    } else if (error.request) {
      console.error('No se recibió respuesta del servidor. Verifique su conexión.');
    } else {
      console.error('Error al configurar la petición:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
