export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
};

const TOKEN_KEY = 'lb_admin_token';
const USER_KEY = 'lb_admin_user';

const safeRead = <T>(key: string, parser: (value: string) => T | null): T | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return parser(raw);
  } catch {
    return null;
  }
};

const safeWrite = (key: string, value: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
};

const safeRemove = (key: string) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const readAuthToken = (): string | null => safeRead(TOKEN_KEY, (v) => v);
export const writeAuthToken = (token: string) => safeWrite(TOKEN_KEY, token);
export const clearAuthToken = () => safeRemove(TOKEN_KEY);

export const readAuthUser = (): AuthUser | null =>
  safeRead(USER_KEY, (value) => {
    try {
      return JSON.parse(value) as AuthUser;
    } catch {
      return null;
    }
  });

export const writeAuthUser = (user: AuthUser) => safeWrite(USER_KEY, JSON.stringify(user));
export const clearAuthUser = () => safeRemove(USER_KEY);

const REFRESH_KEY = 'lb_admin_refresh';

export const readRefreshToken = (): string | null => safeRead(REFRESH_KEY, (v) => v);
export const writeRefreshToken = (token: string) => safeWrite(REFRESH_KEY, token);
export const clearRefreshToken = () => safeRemove(REFRESH_KEY);
