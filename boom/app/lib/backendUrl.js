const RAILWAY_BACKEND_URL = 'https://bidwicket-production.up.railway.app';
const STALE_RENDER_BACKEND_URL = 'https://bidwicket.onrender.com';

function getConfiguredBackendUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_BACKEND_URL?.trim();
  if (!configuredUrl || configuredUrl === STALE_RENDER_BACKEND_URL) {
    return RAILWAY_BACKEND_URL;
  }

  return configuredUrl.replace(/\/$/, '');
}

export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '';
    }
  }

  return getConfiguredBackendUrl();
}

export function getSocketUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }

  return getConfiguredBackendUrl();
}
