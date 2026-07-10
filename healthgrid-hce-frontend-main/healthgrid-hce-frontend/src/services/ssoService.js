// src/services/ssoService.js
//
// SSO con el Core (M10) — variante SPA (nuestro front no tiene backend propio).
// El usuario llega a /auth/sso?ticket=...&redirect=/ruta desde otro módulo.
// Canjeamos el ticket (un solo uso, ~60s) por un JWT del Core y lo guardamos
// como nuestra sesión. Guía SSO del Core.

const CORE_API_URL =
  import.meta.env.VITE_CORE_API_URL || 'https://api.healthcare.cantero.ar';

const TOKEN_KEY = 'healthgrid_token';

/** Lee el ticket y el redirect desde la query (?ticket=) o el fragment (#ticket=). */
export function getSsoParams() {
  const search = new URLSearchParams(window.location.search);
  const frag = window.location.hash?.startsWith('#')
    ? new URLSearchParams(window.location.hash.slice(1))
    : null;

  const ticket = search.get('ticket') || frag?.get('ticket') || null;
  const redirect = search.get('redirect') || frag?.get('redirect') || null;
  return { ticket, redirect };
}

/** Sólo permite rutas internas absolutas; descarta URLs externas (open redirect). */
export function safeRedirect(path) {
  if (!path || typeof path !== 'string') return '/';
  if (!path.startsWith('/') || path.startsWith('//') || path.startsWith('/\\')) return '/';
  return path;
}

/**
 * Canjea el ticket por un JWT del Core y lo guarda como sesión.
 * Devuelve true si la sesión quedó establecida.
 */
export async function establecerSesionDesdeTicket(ticket) {
  const res = await fetch(`${CORE_API_URL}/auth/sso-exchange`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket }),
  });

  if (!res.ok) {
    console.error(`[SSO] sso-exchange falló: HTTP ${res.status}`);
    return false;
  }

  const data = await res.json();
  if (!data?.token) {
    console.error('[SSO] La respuesta del Core no trae token.');
    return false;
  }

  localStorage.setItem(TOKEN_KEY, data.token);
  if (data.user) {
    localStorage.setItem('healthgrid_sso_user', JSON.stringify(data.user));
  }
  console.log('[SSO] Sesión establecida con el JWT del Core.');
  return true;
}

export const ssoService = { getSsoParams, safeRedirect, establecerSesionDesdeTicket };
export default ssoService;
