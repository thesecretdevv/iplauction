import 'server-only';

import { cookies } from 'next/headers';
import {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  createAdminSessionToken,
  verifyAdminCredentials,
  verifyAdminSessionToken,
} from '../../../shared/adminAuth.mjs';

export const ADMIN_COOKIE_NAME = 'ipl_admin_session';
const RENDER_BACKEND_URL = 'https://bidwicket.onrender.com';

function normalizeBackendUrl(url) {
  const trimmedUrl = url?.trim();
  if (!trimmedUrl) {
    return '';
  }

  return trimmedUrl.replace(/\/$/, '');
}

export function getAdminBackendUrl() {
  return normalizeBackendUrl(process.env.BACKEND_URL)
    || normalizeBackendUrl(process.env.NEXT_PUBLIC_BACKEND_URL)
    || (process.env.NODE_ENV === 'production' ? RENDER_BACKEND_URL : 'http://127.0.0.1:3001');
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value || '';
  return verifyAdminSessionToken(token);
}

export async function setAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
}

export function validateAdminLogin(username, password) {
  return verifyAdminCredentials(username, password);
}

export async function adminFetch(path, options = {}) {
  const baseUrl = getAdminBackendUrl();
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Admin-Username': ADMIN_USERNAME,
      'X-Admin-Password': ADMIN_PASSWORD,
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  return response;
}
