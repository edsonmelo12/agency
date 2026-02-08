
import React from 'react';
import { MarketingSettings, SeoSettings } from '../../types';
import { Label, Input, TextArea, Card, Button } from '../ui/BaseComponents';

interface Props {
  marketing: MarketingSettings;
  setMarketing: (m: MarketingSettings) => void;
  seo: SeoSettings;
  setSeo: (s: SeoSettings) => void;
  onAutoSeo: () => void;
  isLoading: boolean;
}

const AnalyticsModule: React.FC<Props> = ({ marketing, setMarketing, seo, setSeo, onAutoSeo, isLoading }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 pb-20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label color="indigo">Configurações de SEO</Label>
          <button 
            onClick={onAutoSeo}
            disabled={isLoading}
            className="text-[10px] font-black text-blue-600 uppercase hover:underline disabled:opacity-50"
          >
            {isLoading ? 'Gerando...' : '✨ IA Otimizar'}
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Título da Aba</p>
          <Input value={seo.title} onChange={e => setSeo({...seo, title: e.target.value})} placeholder="Ex: Curso Completo de Marketing" />
          
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Descrição Meta</p>
          <TextArea value={seo.description} onChange={e => setSeo({...seo, description: e.target.value})} className="h-24" placeholder="Descrição para Google e Redes Sociais" />
          
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Palavras-chave</p>
          <Input value={seo.keywords} onChange={e => setSeo({...seo, keywords: e.target.value})} placeholder="marketing, vendas, curso" />
        </div>
      </div>

      <div className="space-y-4">
        <Label color="emerald">Pixels e Rastreamento</Label>
        <Card color="white">
           <div className="space-y-4">
              <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Meta Pixel ID (Facebook)</p>
                 <Input value={marketing.metaPixelId} onChange={e => setMarketing({...marketing, metaPixelId: e.target.value})} placeholder="ID do Pixel" />
              </div>
              <div>
                 <p className="text-[9px] font-bold text-slate-400 uppercase mb-2">Google Analytics 4 (G-XXXX)</p>
                 <Input value={marketing.googleAnalyticsId} onChange={e => setMarketing({...marketing, googleAnalyticsId: e.target.value})} placeholder="ID de Medição" />
              </div>
           </div>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsModule;
