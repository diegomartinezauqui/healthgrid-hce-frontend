// src/context/AuthContext.jsx
/**
 * Contexto global de autenticación.
 *
 * Responsabilidades:
 *  - Almacenar el JWT (access_token) y los datos del usuario autenticado.
 *  - Persistir el token en localStorage bajo la clave 'healthgrid_token'.
 *  - Exponer helpers: login(), logout(), token, user, isAuthenticated.
 *
 * El interceptor de request en api.js lee el token de localStorage cada vez que
 * Axios dispara una petición, por lo que basta con guardarlo aquí y en
 * localStorage para que todas las instancias de la API lo usen automáticamente.
 */

import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const TOKEN_KEY = 'healthgrid_token';
const USER_KEY  = 'healthgrid_user';

// ─── Helpers de localStorage ──────────────────────────────────────────────────

const readToken = () => localStorage.getItem(TOKEN_KEY) || null;

const readUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── Contexto ─────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

/**
 * AuthProvider — envuelve toda la aplicación.
 * Usar en main.jsx: <AuthProvider><App /></AuthProvider>
 */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(readToken);
  const [user, setUser]   = useState(readUser);

  /**
   * login({ access_token, user? })
   * Guarda el token en estado y localStorage.
   * `user` es opcional; si viene del payload del Core se puede pasar directamente.
   */
  const login = useCallback(({ access_token, user: userData = null }) => {
    localStorage.setItem(TOKEN_KEY, access_token);
    setToken(access_token);

    if (userData) {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
    }
  }, []);

  /**
   * logout()
   * Borra el token del estado y del localStorage.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isAuthenticated = Boolean(token);

  const value = useMemo(
    () => ({ token, user, isAuthenticated, login, logout }),
    [token, user, isAuthenticated, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth() — hook para consumir el contexto desde cualquier componente.
 *
 * @example
 *   const { token, user, isAuthenticated, login, logout } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}

export default AuthContext;
