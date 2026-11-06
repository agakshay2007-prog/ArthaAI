/**
 * ArthaAI API URL Configuration & Path Normalizer
 *
 * Guarantees exactly one slash between baseURL and endpoints.
 * Defensively handles trailing slashes in VITE_API_BASE_URL,
 * leading slashes in endpoint paths, and prevents double slashes
 * such as '//api/auth/register'.
 */

export const getApiBaseUrl = (): string => {
  const rawBase = (import.meta.env.VITE_API_BASE_URL || '').trim();
  // Strip trailing slashes (e.g. "https://api.domain.com/" -> "https://api.domain.com", "/" -> "")
  return rawBase.replace(/\/+$/, '');
};

/**
 * Normalizes and builds a complete, well-formed API request URL.
 *
 * Examples:
 *   - buildApiUrl('/api/auth/register') -> '/api/auth/register' (when base is empty or '/')
 *   - buildApiUrl('/api/auth/register') -> 'https://host.com/api/auth/register' (when base is 'https://host.com' or 'https://host.com/')
 *   - buildApiUrl('/api/auth/register') -> 'https://host.com/api/auth/register' (when base is 'https://host.com/api' or 'https://host.com/api/')
 */
export const buildApiUrl = (endpoint: string): string => {
  const base = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  if (!base) {
    // Relative request (local dev proxy or same-origin): collapse any duplicate slashes
    return cleanEndpoint.replace(/\/{2,}/g, '/');
  }

  // Deduplicate /api if base already includes it and endpoint begins with /api
  if (base.endsWith('/api') && cleanEndpoint.startsWith('/api/')) {
    return `${base}${cleanEndpoint.slice(4)}`;
  }

  return `${base}${cleanEndpoint}`;
};
