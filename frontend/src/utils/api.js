/**
 * Centralized API utility for NEXUS ESPORTS frontend.
 *
 * Priority order:
 *  1. PUBLIC_API_URL env var (set in Vercel / Render dashboard)
 *  2. Local dev fallback  → http://localhost:5000/api
 *  3. Live production URL → https://nexus-e-sports.vercel.app/api
 */

const LIVE_API_URL  = 'https://nexus-e-sports.vercel.app/api';
const LOCAL_API_URL = 'http://localhost:5000/api';

export const API_BASE_URL =
  import.meta.env.PUBLIC_API_URL ||
  (import.meta.env.DEV ? LOCAL_API_URL : LIVE_API_URL);

/**
 * Thin wrapper around fetch() that prepends API_BASE_URL.
 *
 * @param {string} endpoint  - e.g. '/tournaments' or 'bank'
 * @param {RequestInit} options - standard fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(endpoint, options = {}) {
  const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return fetch(`${API_BASE_URL}${formattedEndpoint}`, options);
}
