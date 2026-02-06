import React from 'react';
import { useUsersModule } from './UsersModuleContext';

const UsersModule: React.FC = () => {
  const {
    formState,
    formLoading,
    statusMessage,
    errorMessage,
    inputTextClass,
    formDisabled,
    handleFormSubmit,
    handleResetForm,
    updateFormField,
    handleLogout,
    token,
  } = useUsersModule();

  return (
    <div className="space-y-6 pb-6">
      <form onSubmit={handleFormSubmit} className="p-5 border border-border rounded-3xl shadow-sm bg-panel/90 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Formulário</h3>
          <span className="text-[10px] text-slate-200">{formState.id ? 'Editando' : 'Novo'}</span>
        </div>
        {statusMessage && <p className="text-[10px] text-green-400">{statusMessage}</p>}
        {errorMessage && <p className="text-[10px] text-rose-400">{errorMessage}</p>}
        <input
          value={formState.email}
          onChange={e => updateFormField({ email: e.target.value })}
          placeholder="email@exemplo.com"
          className={`w-full p-3 rounded-2xl border border-border bg-slate-900 outline-none focus:border-primary ${inputTextClass}`}
        />
        <input
          value={formState.name}
          onChange={e => updateFormField({ name: e.target.value })}
          placeholder="Nome completo"
          className={`w-full p-3 rounded-2xl border border-border bg-slate-900 outline-none focus:border-primary ${inputTextClass}`}
        />
        <input
          type="password"
          value={formState.password}
          onChange={e => updateFormField({ password: e.target.value })}
          placeholder={formState.id ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
          className="w-full p-3 rounded-2xl border border-border bg-slate-900 text-white outline-none focus:border-primary"
        />
        <select
          value={formState.role}
          onChange={e => updateFormField({ role: e.target.value as 'user' | 'admin' })}
          className={`w-full p-3 rounded-2xl border border-border bg-slate-900 outline-none focus:border-primary ${inputTextClass}`}
        >
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={formDisabled || formLoading}
            className={`flex-1 py-3 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest transition ${formLoading ? 'opacity-80 cursor-wait' : ''}`}
          >
            {formLoading ? 'Salvando...' : formState.id ? 'Atualizar' : 'Criar usuário'}
          </button>
          {formState.id && (
            <button
              type="button"
              onClick={handleResetForm}
              className="flex-1 py-3 rounded-2xl border border-white/30 text-white font-black uppercase text-[10px] tracking-widest"
            >
              Cancelar
            </button>
          )}
        </div>
        {formDisabled && (
          <p className="text-[10px] text-slate-400">Faça login como admin para habilitar o formulário.</p>
        )}
      </form>
      <div className="p-5 border border-border rounded-3xl shadow-sm bg-panel/90 space-y-4">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-200">Autenticação direta</h3>
        <p className="text-sm text-slate-400">Use a página principal de login para autenticar. O painel mantém apenas operações administrativas.</p>
        <div className="flex items-center justify-between text-[10px] text-slate-200">
          <span>Token {token ? 'salvo' : 'pendente'}</span>
          {token && (
            <button onClick={handleLogout} className="underline">
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersModule;
