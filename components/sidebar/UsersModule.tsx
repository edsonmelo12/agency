import React from 'react';
import { useUsersModule } from './UsersModuleContext';

interface UsersModuleProps {
  className?: string;
}

const UsersModule: React.FC<UsersModuleProps> = ({ className = '' }) => {
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

  const cardClass = 'p-5 border border-slate-200 rounded-3xl shadow-lg bg-white/80 backdrop-blur';

  return (
    <div className={`space-y-6 pb-6 ${className}`}>
      <form onSubmit={handleFormSubmit} className={`${cardClass} space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">Formulário</h3>
          <span className="text-[10px] text-slate-400">{formState.id ? 'Editando' : 'Novo'}</span>
        </div>
        {statusMessage && <p className="text-[10px] text-emerald-500">{statusMessage}</p>}
        {errorMessage && <p className="text-[10px] text-rose-500">{errorMessage}</p>}
        <input
          value={formState.email}
          onChange={e => updateFormField({ email: e.target.value })}
          placeholder="email@exemplo.com"
          className={`w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 ${inputTextClass}`}
        />
        <input
          value={formState.name}
          onChange={e => updateFormField({ name: e.target.value })}
          placeholder="Nome completo"
          className={`w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 ${inputTextClass}`}
        />
        <input
          type="password"
          value={formState.password}
          onChange={e => updateFormField({ password: e.target.value })}
          placeholder={formState.id ? 'Nova senha (deixe em branco para manter)' : 'Senha'}
          className="w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-900 outline-none focus:border-blue-500"
        />
        <select
          value={formState.role}
          onChange={e => updateFormField({ role: e.target.value as 'user' | 'admin' })}
          className={`w-full p-3 rounded-2xl border border-slate-200 bg-slate-50 outline-none focus:border-blue-500 ${inputTextClass}`}
        >
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
        <div className="flex flex-col gap-3 md:flex-row">
          <button
            type="submit"
            disabled={formDisabled || formLoading}
            className={`flex-1 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black uppercase text-[10px] tracking-widest transition ${formLoading ? 'opacity-80 cursor-wait' : ''}`}
          >
            {formLoading ? 'Salvando...' : formState.id ? 'Atualizar' : 'Criar usuário'}
          </button>
          {formState.id && (
            <button
              type="button"
              onClick={handleResetForm}
              className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-500 font-black uppercase text-[10px] tracking-widest"
            >
              Cancelar
            </button>
          )}
        </div>
        {formDisabled && (
          <p className="text-[10px] text-slate-400">Faça login como admin para habilitar o formulário.</p>
        )}
      </form>
      <div className={`${cardClass} space-y-4`}>
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-600">Autenticação direta</h3>
        <p className="text-sm text-slate-500">Use a página principal de login para autenticar. O painel mantém apenas operações administrativas.</p>
        <div className="flex items-center justify-between text-[10px] text-slate-500">
          <span>Token {token ? 'salvo' : 'pendente'}</span>
          {token && (
            <button onClick={handleLogout} className="underline text-slate-600">
              Logout
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersModule;
