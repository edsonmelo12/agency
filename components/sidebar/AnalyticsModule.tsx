
import React, { useEffect } from 'react';
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 pb-20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label color="indigo">Configurações de SEO</Label>
          <button
            onClick={onAutoSeo}
            disabled={isLoading}
            className="text-[10px] font-black text-primary uppercase hover:underline disabled:opacity-50"
          >
            {isLoading ? 'Gerando...' : '✨ IA Otimizar'}
          </button>
        </div>
        <div className="space-y-3">
          <p className="text-[9px] font-bold text-slate uppercase tracking-widest">Título da Aba</p>
          <Input value={seo.title} onChange={e => setSeo({ ...seo, title: e.target.value })} placeholder="Ex: Curso Completo de Marketing" />

          <p className="text-[9px] font-bold text-slate uppercase tracking-widest">Descrição Meta</p>
          <TextArea value={seo.description} onChange={e => setSeo({ ...seo, description: e.target.value })} className="h-24" placeholder="Descrição para Google e Redes Sociais" />

          <p className="text-[9px] font-bold text-slate uppercase tracking-widest">Palavras-chave</p>
          <Input value={seo.keywords} onChange={e => setSeo({ ...seo, keywords: e.target.value })} placeholder="marketing, vendas, curso" />
        </div>
      </div>

      <div className="space-y-4">
        <Label color="emerald">Pixels e Rastreamento</Label>
        <Card color="white">
          <div className="space-y-4">
            <div>
              <p className="text-[9px] font-bold text-slate uppercase mb-2">Meta Pixel ID (Facebook)</p>
              <Input value={marketing.metaPixelId} onChange={e => setMarketing({ ...marketing, metaPixelId: e.target.value })} placeholder="ID do Pixel" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-slate uppercase mb-2">Google Analytics 4 (G-XXXX)</p>
              <Input value={marketing.googleAnalyticsId} onChange={e => setMarketing({ ...marketing, googleAnalyticsId: e.target.value })} placeholder="ID de Medição" />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label color="blue">Webhooks (Distribuição de Leads)</Label>
          <button
            onClick={() => {
              const newWebhook = { id: `wh-${Date.now()}`, name: 'Novo Webhook', url: '', event: 'lead' as const, active: true };
              setMarketing({ ...marketing, webhooks: [...(marketing.webhooks || []), newWebhook] });
            }}
            className="text-[10px] font-black text-primary uppercase hover:underline"
          >
            + Adicionar
          </button>
        </div>

        <div className="space-y-3">
          {(marketing.webhooks || []).map((wh, idx) => (
            <Card key={wh.id} color="white" className="p-4 space-y-3 relative group">
              <button
                onClick={() => {
                  const next = (marketing.webhooks || []).filter(w => w.id !== wh.id);
                  setMarketing({ ...marketing, webhooks: next });
                }}
                className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={wh.active}
                  onChange={e => {
                    const next = (marketing.webhooks || []).map(w => w.id === wh.id ? { ...w, active: e.target.checked } : w);
                    setMarketing({ ...marketing, webhooks: next });
                  }}
                  className="w-3 h-3 rounded border-slate-300 text-primary focus:ring-primary"
                />
                <input
                  value={wh.name}
                  onChange={e => {
                    const next = (marketing.webhooks || []).map(w => w.id === wh.id ? { ...w, name: e.target.value } : w);
                    setMarketing({ ...marketing, webhooks: next });
                  }}
                  className="text-[10px] font-black uppercase bg-transparent border-none p-0 focus:ring-0 w-full"
                  placeholder="Nome do Webhook"
                />
              </div>

              <Input
                value={wh.url}
                onChange={e => {
                  const next = (marketing.webhooks || []).map(w => w.id === wh.id ? { ...w, url: e.target.value } : w);
                  setMarketing({ ...marketing, webhooks: next });
                }}
                placeholder="https://seu-crm.com/webhook"
                className="text-[10px]"
              />

              <select
                value={wh.event}
                onChange={e => {
                  const next = (marketing.webhooks || []).map(w => w.id === wh.id ? { ...w, event: e.target.value as any } : w);
                  setMarketing({ ...marketing, webhooks: next });
                }}
                className="w-full text-[10px] font-bold uppercase bg-panel border-border rounded-lg py-1 px-2 focus:ring-primary"
              >
                <option value="lead">Evento: Novo Lead</option>
                <option value="purchase">Evento: Venda Realizada</option>
                <option value="page_view">Evento: Visualização de Página</option>
              </select>
            </Card>
          ))}

          {(!marketing.webhooks || marketing.webhooks.length === 0) && (
            <div className="py-8 text-center border-2 border-dashed border-border rounded-2xl">
              <p className="text-[9px] font-bold text-slate uppercase tracking-widest">Nenhum webhook configurado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModule;
