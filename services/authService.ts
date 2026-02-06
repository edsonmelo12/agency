import { AuthUser } from './authStorage';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000';

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

type AuthResponse = {
  accessToken: string;
  refreshToken?: string;
  user: AuthUser;
};

const parseError = async (response: Response) => {
  try {
    const payload = await response.json();
    if (payload && typeof payload === 'object' && payload.error) return payload.error;
    return JSON.stringify(payload);
  } catch {
    return (await response.text()) || `Erro ${response.status}`;
  }
};

const post = async (path: string, payload: AuthPayload): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  return response.json();
};

export const loginAdmin = (email: string, password: string) => post('/api/auth/login', { email, password });
export const registerAdmin = (email: string, password: string, name?: string) =>
  post('/api/auth/register', { email, password, name });
