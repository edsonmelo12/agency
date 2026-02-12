import { applyAuthSession, clearAuthSession, AuthSessionPayload } from './authSession';
import { readAuthToken, readRefreshToken } from './authStorage';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000';
const REFRESH_ENDPOINT = '/api/auth/refresh';
const REFRESH_THRESHOLD_MS = 60_000;

export class SessionExpiredError extends Error {
  constructor(message?: string) {
    super(message || 'Sessão expirada');
    this.name = 'SessionExpiredError';
  }
}

const decodeJwtPayload = (token: string) => {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(payload);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

const shouldRefreshToken = (token: string) => {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== 'number') {
    return true;
  }
  const expiresAt = payload.exp * 1000;
  return Date.now() >= expiresAt - REFRESH_THRESHOLD_MS;
};

let refreshPromise: Promise<void> | null = null;

const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }
  const refreshToken = readRefreshToken();
  if (!refreshToken) {
    clearAuthSession();
    throw new SessionExpiredError('Refresh token não disponível');
  }
  refreshPromise = (async () => {
    const response = await fetch(`${API_BASE}${REFRESH_ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-refresh-token': refreshToken,
      },
    });
    if (!response.ok) {
      clearAuthSession();
      throw new SessionExpiredError('Não foi possível renovar a sessão');
    }
    const payload: AuthSessionPayload = await response.json();
    applyAuthSession(payload);
  })().finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
};

const ensureAccessToken = async () => {
  const token = readAuthToken();
  if (!token) {
    clearAuthSession();
    throw new SessionExpiredError('Sessão não encontrada');
  }
  if (shouldRefreshToken(token)) {
    await refreshAccessToken();
  }
  const updated = readAuthToken();
  if (!updated) {
    clearAuthSession();
    throw new SessionExpiredError('Sessão expirada');
  }
  return updated;
};

export const authorizedFetch = async (path: string, init: RequestInit = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const token = await ensureAccessToken();
  const headers = new Headers(init.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(url, { ...init, headers });
  if (response.status === 401) {
    try {
      await refreshAccessToken();
    } catch (error) {
      throw error;
    }
    const retryToken = readAuthToken();
    if (!retryToken) {
      throw new SessionExpiredError();
    }
    headers.set('Authorization', `Bearer ${retryToken}`);
    return fetch(url, { ...init, headers });
  }
  return response;
};
