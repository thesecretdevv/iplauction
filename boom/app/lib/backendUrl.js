export function getBackendUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return '';
    }
  }

  return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bidwicket.onrender.com';
}

export function getSocketUrl() {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3001';
    }
  }

  return process.env.NEXT_PUBLIC_BACKEND_URL || 'https://bidwicket.onrender.com';
}
