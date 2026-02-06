import React, { createContext, useContext, useEffect, useState } from 'react';
import { readAuthToken } from '../../services/authStorage';

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
};

type FormState = {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'user' | 'admin';
};

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:5000';

export const parseDate = (value?: string | null) => {
  if (!value) return '—';
  const date = new Date(value);
  return isNaN(date.getTime()) ? value : date.toLocaleString('pt-BR');
};

const parseError = async (response: Response): Promise<string> => {
  try {
    const parsed = await response.json();
    if (parsed && typeof parsed === 'object' && parsed.error) return parsed.error;
    return JSON.stringify(parsed);
  } catch {
    return (await response.text()) || `Erro ${response.status}`;
  }
};

interface UsersModuleContextValue {
  token: string | null;
  account: UserRow | null;
  users: UserRow[];
  usersLoading: boolean;
  formState: FormState;
  formLoading: boolean;
  statusMessage: string | null;
  errorMessage: string | null;
  inputTextClass: string;
  formDisabled: boolean;
  handleFormSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  handleEdit: (user: UserRow) => void;
  handleDelete: (id: string) => Promise<void>;
  handleResetForm: () => void;
  handleLogout: () => void;
  updateFormField: (update: Partial<FormState>) => void;
  setTokenDirectly: (value: string | null) => void;
}

const UsersModuleContext = createContext<UsersModuleContextValue | undefined>(undefined);

export const UsersModuleProvider: React.FC<{ uiTheme: 'light' | 'dark'; children: React.ReactNode }> = ({ uiTheme, children }) => {
  const [token, setToken] = useState<string | null>(readAuthToken());
  const [account, setAccount] = useState<UserRow | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>({ id: '', email: '', name: '', password: '', role: 'user' });

  const inputTextClass = uiTheme === 'dark' ? 'text-white' : 'text-slate-900';

  const setSession = (newToken: string | null, user: UserRow | null) => {
    setToken(newToken);
    setAccount(user);
    if (newToken) {
      try {
        window.localStorage.setItem('lb_admin_token', newToken);
      } catch {
        // ignore
      }
    } else {
      try {
        window.localStorage.removeItem('lb_admin_token');
      } catch {
        // ignore
      }
    }
  };

  const fetchJson = async (path: string, init: RequestInit = {}, withAuth = true) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(init.headers as Record<string, string> | undefined),
    };
    if (withAuth && token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${API_BASE}${path}`, { ...init, headers });
    if (!response.ok) {
      if (response.status === 401) {
        setSession(null, null);
        setStatusMessage('Sessão encerrada. Faça login novamente.');
      }
      throw new Error(await parseError(response));
    }
    return response.json();
  };

  const reloadUsers = async () => {
    if (!token) return;
    setUsersLoading(true);
    try {
      const data: UserRow[] = await fetchJson('/api/users', {}, true);
      setUsers(data);
      setErrorMessage(null);
    } catch (error: any) {
      setErrorMessage(error.message || 'Falha ao carregar usuários');
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      reloadUsers();
    } else {
      setUsers([]);
    }
  }, [token]);

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      setErrorMessage('Faça login como admin para continuar.');
      return;
    }
    if (!formState.email) {
      setErrorMessage('Informe o e-mail do usuário.');
      return;
    }
    if (!formState.id && !formState.password) {
      setErrorMessage('Informe uma senha para o novo usuário.');
      return;
    }
    setFormLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      const payload: Record<string, string> = { email: formState.email, name: formState.name, role: formState.role };
      if (formState.password) payload.password = formState.password;
      const path = formState.id ? `/api/users/${formState.id}` : '/api/users';
      const method = formState.id ? 'PUT' : 'POST';
      const data = await fetchJson(path, { method, body: JSON.stringify(payload) }, true);
      setStatusMessage(`Usuário ${method === 'POST' ? 'criado' : 'atualizado'}: ${data.email}`);
      setFormState({ id: '', email: '', name: '', password: '', role: 'user' });
      reloadUsers();
      if (account?.id === data.id) {
        setAccount(data);
      }
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao salvar usuário');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;
    setFormLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await fetchJson(`/api/users/${id}`, { method: 'DELETE' }, true);
      setStatusMessage('Usuário excluído');
      if (account?.id === id) {
        handleLogout();
      }
      reloadUsers();
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro ao excluir usuário');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (user: UserRow) => {
    setFormState({ id: user.id, email: user.email, name: user.name, password: '', role: user.role });
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const handleResetForm = () => {
    setFormState({ id: '', email: '', name: '', password: '', role: 'user' });
    setErrorMessage(null);
    setStatusMessage(null);
  };

  const handleLogout = () => {
    setSession(null, null);
    setStatusMessage('Logout realizado');
  };

  const updateFormField = (updates: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  const value: UsersModuleContextValue = {
    token,
    account,
    users,
    usersLoading,
    formState,
    formLoading,
    statusMessage,
    errorMessage,
    inputTextClass,
    formDisabled: !token,
    handleFormSubmit,
    handleEdit,
    handleDelete,
    handleResetForm,
    handleLogout,
    updateFormField,
    setTokenDirectly: setSession,
  };

  return <UsersModuleContext.Provider value={value}>{children}</UsersModuleContext.Provider>;
};

export const useUsersModule = () => {
  const context = useContext(UsersModuleContext);
  if (!context) {
    throw new Error('useUsersModule must be used within a UsersModuleProvider');
  }
  return context;
};
