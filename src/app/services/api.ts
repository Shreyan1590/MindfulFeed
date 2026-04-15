export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'https://mindfulfeed-worker.info-skillxpress.workers.dev';

export const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '87314678313-3gqqqeo2krfilu6uo5s2m4auraune9ji.apps.googleusercontent.com';

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

export function getStoredSession() {
  const userId = localStorage.getItem('mindfulfeed_userId');
  const userName = localStorage.getItem('mindfulfeed_userName');
  const token = localStorage.getItem('mindfulfeed_token');
  const isDemo =
    localStorage.getItem('mindfulfeed_isDemo') === 'true' || Boolean(userId?.startsWith('demo_'));

  return { userId, userName, token, isDemo };
}
