import React, { useEffect, useMemo, useState } from 'react';
import { parseDate, useUsersModule, UserRow } from '../sidebar/UsersModuleContext';

const FILTER_OPTIONS: { label: string; value: 'all' | 'admin' | 'user' }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Administradores', value: 'admin' },
  { label: 'Usuários comuns', value: 'user' },
];

const ROLE_BADGES: Record<'admin' | 'user', { label: string; classes: string }> = {
  admin: { label: 'Administrador', classes: 'bg-sky-100/80 border-sky-200 text-sky-700' },
  user: { label: 'Usuário comum', classes: 'bg-slate-100/90 border-slate-200 text-slate-600' },
};

const skeletonColumns = Array.from({ length: 5 });

const UsersWorkspace: React.FC = () => {
  const {
    users,
    usersLoading,
    formLoading,
    handleEdit,
    handleDelete,
    handleResetForm,
    statusMessage,
    errorMessage,
    clearMessages,
  } = useUsersModule();

  const [filterValue, setFilterValue] = useState<'all' | 'admin' | 'user'>('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<UserRow | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filteredUsers = useMemo(() => {
    if (filterValue === 'all') return users;
    return users.filter(user => user.role === filterValue);
  }, [users, filterValue]);

  useEffect(() => {
    if (statusMessage) {
      setToast({ type: 'success', text: statusMessage });
    } else if (errorMessage) {
      setToast({ type: 'error', text: errorMessage });
    }
  }, [statusMessage, errorMessage]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => {
      clearMessages();
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, clearMessages]);

  const closeToast = () => {
    clearMessages();
    setToast(null);
  };

  const openDeleteModal = (user: UserRow) => {
    setPendingDelete(user);
  };

  const closeDeleteModal = () => {
    setPendingDelete(null);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await handleDelete(pendingDelete.id);
    closeDeleteModal();
  };

  const activeFilterLabel = FILTER_OPTIONS.find(option => option.value === filterValue)?.label || 'Todos';

  return (
    <div className="relative flex-1 p-10">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -top-16 right-12 h-64 w-64 rounded-full bg-gradient-to-br from-sky-500/60 to-blue-950/60 blur-[120px]" />
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-auto absolute top-6 left-1/2 z-20 flex w-[min(360px,92vw)] -translate-x-1/2 items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/95 px-6 py-3 text-[12px] font-bold uppercase tracking-widest text-slate-800 shadow-xl transition"
        >
          <span className={`${toast.type === 'error' ? 'text-rose-600' : 'text-emerald-600'}`}>{toast.text}</span>
          <button type="button" onClick={closeToast} className="text-xs text-slate-500 underline-offset-4 underline">
            Fechar
          </button>
        </div>
      )}

      <div className="relative z-10 flex h-full flex-col gap-6 rounded-[36px] border border-slate-200/80 bg-white/90 p-10 shadow-[0_35px_120px_rgba(15,23,42,0.2)] backdrop-blur">
        <header className="flex flex-col gap-4">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">FunilBuilder AI</p>
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-4xl font-display text-slate-900">Usuários ativos</h2>
              <p className="text-base text-slate-500">
                Lista responsiva com colunas articuladas, filtros em camadas e confirmação contextual para cada ação administrativa.
              </p>
              <p className="text-xs text-slate-400">Filtrando: {activeFilterLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterMenuOpen(prev => !prev)}
                  aria-expanded={filterMenuOpen}
                  className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500 transition hover:border-blue-500 hover:text-blue-500"
                >
                  Filtrar
                  <span className="text-[10px] text-slate-400">{activeFilterLabel}</span>
                </button>
                {filterMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 rounded-2xl border border-slate-200 bg-white shadow-xl">
                    {FILTER_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setFilterValue(option.value);
                          setFilterMenuOpen(false);
                        }}
                        className={`flex w-full justify-between px-4 py-3 text-left text-sm uppercase tracking-widest transition ${
                          filterValue === option.value ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'
                        }`}
                      >
                        <span>{option.label}</span>
                        {filterValue === option.value && <span className="text-xs text-blue-400">•</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  handleResetForm();
                  clearMessages();
                }}
                className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white shadow-xl"
              >
                Novo usuário
              </button>
            </div>
          </div>
        </header>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-[12px] text-slate-500">
            <span>{filteredUsers.length} / {users.length} usuários no total</span>
            <span className="text-slate-400">Última atualização automática</span>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-50/40 shadow-[0_25px_80px_rgba(15,23,42,0.15)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-[0.5em] text-slate-400">
                    <th className="px-6 py-4">Nome</th>
                    <th className="px-6 py-4">E-mail</th>
                    <th className="px-6 py-4">Função</th>
                    <th className="px-6 py-4">Último login</th>
                    <th className="px-6 py-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    skeletonColumns.map((_, index) => (
                      <tr key={`skeleton-${index}`} className="border-t border-slate-100">
                        {skeletonColumns.map((__, colIndex) => (
                          <td key={`skeleton-cell-${colIndex}`} className="px-6 py-5">
                            <div className="h-3 rounded-full bg-slate-200/60 animate-pulse"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">
                        Nenhum usuário encontrado para este filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      const badge = ROLE_BADGES[user.role];
                      return (
                        <tr key={user.id} className="border-t border-slate-100 hover:bg-white">
                          <td className="px-6 py-4 font-semibold text-slate-900 max-w-[180px] truncate">{user.name || user.email}</td>
                          <td className="px-6 py-4 text-slate-500 max-w-[220px] truncate">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.4em] ${badge.classes}`}>
                              {badge.label}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400">{parseDate(user.lastLoginAt)}</td>
                          <td className="px-6 py-4 flex flex-col gap-2 md:flex-row">
                            <button
                              type="button"
                              onClick={() => handleEdit(user)}
                              className="rounded-2xl border border-slate-200 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-slate-500 transition hover:border-blue-500 hover:text-blue-500"
                            >
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteModal(user)}
                              className="rounded-2xl border border-rose-200 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-rose-500 transition hover:bg-rose-500/10"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {pendingDelete && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-6">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-modal-title"
            className="max-w-md rounded-[28px] border border-white/10 bg-slate-900/90 p-8 text-center shadow-[0_35px_120px_rgba(2,6,23,0.65)] backdrop-blur"
          >
            <p id="delete-modal-title" className="text-lg font-black uppercase tracking-[0.3em] text-rose-200">
              Confirmar exclusão
            </p>
            <p className="mt-4 text-sm text-slate-200">
              Você está prestes a remover <strong>{pendingDelete.name || pendingDelete.email}</strong> da equipe. Essa ação é irreversível.
            </p>
            <div className="mt-6 flex flex-col gap-3 md:flex-row md:justify-center">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="flex-1 rounded-2xl border border-slate-600 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-slate-300 transition hover:border-slate-400"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={formLoading}
                className="flex-1 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition disabled:opacity-60"
              >
                {formLoading ? 'Excluindo...' : 'Confirmar exclusão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersWorkspace;
