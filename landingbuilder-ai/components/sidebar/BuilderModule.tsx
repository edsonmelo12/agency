
import React, { useState } from 'react';
import { GenerationOptions, PageType, Ebook, VslScript } from '../../types';
import { Label, Card, Button, TextArea, Toggle } from '../ui/BaseComponents';

interface Props {
  options: GenerationOptions;
  setOptions: (o: GenerationOptions) => void;
  onGenerate: (o: GenerationOptions) => void;
  onInjectAsset: (type: 'ebook' | 'vsl', asset: any) => void;
  onGenerateVariation: (hypothesis: string) => void;
  isLoading: boolean;
  availableEbooks: Ebook[];
  availableVsl?: VslScript;
}

const BuilderModule: React.FC<Props> = ({ 
  options, setOptions, onGenerate, onInjectAsset, onGenerateVariation, isLoading, availableEbooks, availableVsl 
}) => {
  const [useReference, setUseReference] = useState(false);
  const [showAB, setShowAB] = useState(false);
  const [abHypothesis, setAbHypothesis] = useState('');

  const hypothesisOptions = [
    "Variação focada em Prova Social e Resultados",
    "Abordagem agressiva focada em Escassez e Medo de Perda",
    "Simplificação total do design para máxima velocidade",
    " Headline focada em Benefício Imediato em vez de Processo"
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
      <div className="space-y-4">
        <Label color="slate">Layout & Estilo</Label>
        
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase">Tema da Página</span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            {[
              { id: 'light', label: 'Claro', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3' },
              { id: 'dark', label: 'Escuro', icon: 'M20.354 15.354A9 9 0 018.646 3.646' },
              { id: 'neutral', label: 'Neutro', icon: 'M12 8v4l3 3m6-3' }
            ].map(theme => (
              <button 
                key={theme.id}
                onClick={() => setOptions({...options, backgroundColor: theme.id as any})}
                className={`flex-1 py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${options.backgroundColor === theme.id ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={theme.icon} /></svg>
                <span className="text-[9px] font-black uppercase">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Primária</span>
            <input type="color" value={options.primaryColor} onChange={e => setOptions({...options, primaryColor: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer bg-white border p-1" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Destaque</span>
            <input type="color" value={options.secondaryColor} onChange={e => setOptions({...options, secondaryColor: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer bg-white border p-1" />
          </div>
        </div>
      </div>

      <Card color="indigo">
        <div className="flex items-center justify-between mb-2">
           <Label color="indigo">Laboratório de Teste A/B</Label>
           <Toggle checked={showAB} onChange={setShowAB} />
        </div>
        {showAB && (
          <div className="space-y-4 animate-in slide-in-from-top-2">
             <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase">Gere uma Versão B para comparar qual converte melhor.</p>
             <div className="flex flex-wrap gap-1">
                {hypothesisOptions.map((h, i) => (
                  <button 
                    key={i} 
                    onClick={() => setAbHypothesis(h)}
                    className={`px-2 py-1 rounded text-[8px] font-black uppercase border transition-all ${abHypothesis === h ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                  >
                    H{i+1}
                  </button>
                ))}
             </div>
             <TextArea 
              value={abHypothesis} 
              onChange={e => setAbHypothesis(e.target.value)}
              className="h-20 text-[10px]"
              placeholder="Descreva sua hipótese de teste..."
             />
             <Button 
              variant="secondary" 
              onClick={() => onGenerateVariation(abHypothesis)}
              disabled={isLoading || !abHypothesis}
              className="w-full py-3 border-indigo-200 text-indigo-600"
             >
               {isLoading ? 'Criando Versão B...' : 'Gerar Variação A/B'}
             </Button>
          </div>
        )}
      </Card>

      {(availableEbooks.length > 0 || availableVsl) && (
        <div className="space-y-4">
           <Label color="emerald">Sincronizar Ativos do Funil</Label>
           <div className="grid grid-cols-1 gap-2">
              {availableVsl && (
                <button 
                  onClick={() => onInjectAsset('vsl', availableVsl)}
                  disabled={isLoading}
                  className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-left hover:border-indigo-400 transition-all"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center">
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase text-indigo-600">Vídeo VSL</p>
                         <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300">Injetar Seção de Vídeo</p>
                      </div>
                   </div>
                   <span className="text-xl">+</span>
                </button>
              )}
              {availableEbooks.map(ebook => (
                <button 
                  key={ebook.id}
                  onClick={() => onInjectAsset('ebook', ebook)}
                  disabled={isLoading}
                  className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-left hover:border-emerald-400 transition-all"
                >
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                         <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.993 7.993 0 0112 4c1.24 0 2.413.283 3.465.789a.4.4 0 01.135.545V15.71a.4.4 0 01-.545.135A7.993 7.993 0 0012 15a7.993 7.993 0 00-3 1c-1.24 0-2.413-.283-3.465-.789a.4.4 0 01-.135-.545V5.334a.4.4 0 01.545-.135A7.993 7.993 0 009 4.804z" /></svg>
                      </div>
                      <div>
                         <p className="text-[9px] font-black uppercase text-emerald-600">Isca Digital / Bônus</p>
                         <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[150px]">{ebook.title}</p>
                      </div>
                   </div>
                   <span className="text-xl">+</span>
                </button>
              ))}
           </div>
        </div>
      )}

      <Card color="blue">
        <div className="flex items-center justify-between mb-2">
          <Label color="blue">Clonar Referência</Label>
          <Toggle checked={useReference} onChange={setUseReference} />
        </div>
        {useReference && (
          <div className="space-y-3 pt-2">
            <input 
              type="text" 
              value={options.referenceUrl} 
              onChange={e => setOptions({...options, referenceUrl: e.target.value})} 
              className="w-full bg-white border border-blue-200 p-3 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none" 
              placeholder="https://exemplo-landing.com" 
            />
            <div className="flex flex-wrap gap-2">
              {['structure', 'copy', 'colors'].map(flag => (
                <button 
                  key={flag}
                  onClick={() => setOptions({...options, extractionFlags: {...options.extractionFlags, [flag]: !options.extractionFlags[flag as keyof typeof options.extractionFlags]}})}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all ${options.extractionFlags[flag as keyof typeof options.extractionFlags] ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-200'}`}
                >
                  {flag === 'structure' ? 'Estrutura' : flag === 'copy' ? 'Texto' : 'Cores'}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      <div className="space-y-4">
        <Label color="slate">Instruções para IA</Label>
        <TextArea 
          value={options.prompt} 
          onChange={e => setOptions({...options, prompt: e.target.value})} 
          className="h-32" 
          placeholder="Ex: Crie uma página agressiva com foco em escassez..." 
        />
      </div>

      <Button 
        onClick={() => onGenerate(options)} 
        disabled={isLoading}
        className="w-full py-5"
      >
        {isLoading ? 'IA Construindo...' : 'Gerar Página Completa'}
      </Button>
    </div>
  );
};

export default BuilderModule;
