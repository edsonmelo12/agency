import React, { useState } from 'react';

type AuthGateProps = {
  loading: boolean;
  error?: string | null;
  status?: string | null;
  onLogin: (email: string, password: string) => Promise<void>;
};

const AuthGate: React.FC<AuthGateProps> = ({ loading, error, status, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onLogin(email, password);
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-lg flex flex-col items-center justify-center px-4 py-6">
      <div className="max-w-md w-full rounded-3xl bg-white/10 border border-white/20 p-8 shadow-[0_40px_120px_rgba(2,6,23,0.8)] text-white">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-sky-300">FunilBuilder AI</p>
        <h1 className="mt-2 text-3xl font-black leading-tight">Acesso seguro</h1>
        <p className="text-sm text-slate-200 mt-2">Informe suas credenciais de admin para entrar na plataforma.</p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="email@exemplo.com"
            className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Senha"
            className="w-full rounded-2xl border border-white/30 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 focus:border-primary focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-400 px-4 py-3 text-[10px] font-black uppercase tracking-[0.4em] text-white disabled:opacity-60"
          >
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
        </form>
        {status && <p className="mt-4 text-[11px] font-black text-emerald-400">{status}</p>}
        {error && <p className="mt-4 text-[11px] font-black text-rose-400">{error}</p>}
      </div>
    </div>
  );
};

export default AuthGate;
