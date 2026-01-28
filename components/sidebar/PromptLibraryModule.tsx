
import React, { useState } from 'react';
import { PROMPT_LIBRARY } from '../../constants/prompts';
import { Label, Card } from '../ui/BaseComponents';

const PromptLibraryModule: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('Tudo');

  const categories = ['Tudo', ...Array.from(new Set(PROMPT_LIBRARY.map(p => p.category)))];

  const handleCopy = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(title);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = filter === 'Tudo' ? PROMPT_LIBRARY : PROMPT_LIBRARY.filter(p => p.category === filter);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-wrap gap-1">
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${filter === cat ? 'bg-primary text-white border-primary' : 'bg-panel text-slate border-border'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((prompt) => (
          <div 
            key={prompt.title}
            onClick={() => handleCopy(prompt.content, prompt.title)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleCopy(prompt.content, prompt.title);
              }
            }}
            className="group p-5 bg-panel border border-border rounded-[28px] hover:border-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 cursor-pointer relative overflow-hidden shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="px-2 py-0.5 bg-panel text-slate text-[8px] font-black uppercase rounded-md">{prompt.category}</span>
              {copiedId === prompt.title ? (
                <span className="text-[8px] font-black text-emerald-500 uppercase animate-bounce">Copiado!</span>
              ) : (
                <svg className="w-4 h-4 text-slate-200 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
              )}
            </div>
            <h4 className="text-xs font-black uppercase text-ink mb-2">{prompt.title}</h4>
            <p className="text-[10px] font-bold text-slate leading-relaxed italic line-clamp-2">"{prompt.content}"</p>
          </div>
        ))}
      </div>

      <Card color="blue">
         <p className="text-[9px] font-bold text-primary uppercase leading-relaxed text-center">💡 Dica: Copie o prompt, cole no campo "Instruções" do Gerador e substitua os campos entre [COLCHETES].</p>
      </Card>
    </div>
  );
};

export default PromptLibraryModule;
