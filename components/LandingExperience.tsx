import React from 'react';

const LandingExperience: React.FC<{ onEnter: () => void }> = ({ onEnter }) => {
  return (
    <div className="relative min-h-screen bg-[#020617] text-white">
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#0d1b2a] via-[#021328] to-[#000d1a]"
        aria-hidden="true"
      />
      <div className="relative min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl w-full space-y-12">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.5em] text-sky-300 font-black">
              <span>FunilBuilder AI</span>
              <span className="h-px w-10 bg-sky-300 opacity-60" />
              <span>Plataforma · Landing · Funil</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-white drop-shadow-[0_30px_80px_rgba(2,132,199,0.35)]">
              Construa funis guiados pela IA e mantenha cada ação registrada em um banco real.
            </h1>
            <p className="max-w-3xl text-lg text-slate-200 leading-relaxed">
              Do cadastro do especialista até o lançamento do produto: o FunilBuilder AI gera
              landing pages, roteiros de VSL, e-books e criativos com Gemini + OpenRouter, sincroniza
              tudo no Prisma/SQLite e salva cada movimento em history logs para auditar cada
              progresso.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onEnter}
                className="px-8 py-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 text-[11px] font-black uppercase tracking-[0.4em] text-white shadow-[0_25px_45px_rgba(14,165,233,0.35)] transition-transform duration-200 hover:-translate-y-0.5"
              >
                Testar o FunilBuilder AI
              </button>
              <button className="px-7 py-3 rounded-full border border-white/30 text-[11px] font-black uppercase tracking-[0.4em] text-slate-100 transition hover:border-white">
                Ver fluxo técnico
              </button>
            </div>
            <p className="max-w-2xl text-sm text-slate-300">
              Uma dashboard minimalista coloca o conteúdo principal no centro. Menos blocos, mais foco:
              apenas o essencial para o seu próximo funil aparecer em minutos.
            </p>
          </div>
          <div className="rounded-[36px] border border-white/10 bg-white/5 px-8 py-7 shadow-[0_35px_80px_rgba(2,6,23,0.9)] backdrop-blur-3xl">
            <div className="space-y-5">
              <p className="text-[10px] uppercase tracking-[0.4em] text-slate-300">FunilBuilder AI</p>
              <h2 className="text-2xl font-black">Contexto pronto em 3 minutos</h2>
              <p className="text-sm text-slate-200 leading-relaxed">
                Templates editoriais, roteiros de VSL e e-books preservando a autoridade do especialista,
                com sincronização total em banco real.
              </p>
              <p className="text-sm text-slate-200">
                Painel lateral limpo, sem cartões repetidos: apenas o texto necessário para guiar a ação.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingExperience;
