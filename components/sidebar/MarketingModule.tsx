import React, { useState, useEffect } from 'react';
import { Label, Card, Button, Input, TextArea, Select, Toggle } from '../ui/BaseComponents';
import { PaidCampaignInput, AiFallbackLog } from '../../types';

const FallbackAlert: React.FC<{ log: AiFallbackLog | null; onDetails: () => void }> = ({ log, onDetails }) => {
  if (!log) return null;
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3 text-sm font-black uppercase tracking-wide text-amber-800 shadow-lg shadow-amber-400/30 border-dashed flex items-center justify-between gap-3 animate-fade-in">
      <div className="flex items-center gap-3">
        <span className="text-[18px] leading-none">⚠️</span>
        <span className="text-[11px] tracking-tight font-semibold">
          Quota do Gemini atingida; estamos usando OpenRouter automaticamente.
        </span>
      </div>
      <button
        onClick={onDetails}
        className="px-3 py-1 rounded-full border border-amber-500 bg-white text-[10px] font-black tracking-wider text-amber-700 hover:bg-amber-500 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
      >
        Ver detalhes
      </button>
    </div>
  );
};

const FallbackDetailsModal: React.FC<{
  log: AiFallbackLog | null;
  open: boolean;
  onClose: () => void;
  onRetry?: () => void;
}> = ({ log, open, onClose, onRetry }) => {
  if (!open || !log) return null;
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg space-y-4 rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Fallback de provedor</p>
            <h3 className="text-xl font-display text-ink dark:text-white">OpenRouter ativado</h3>
          </div>
          <button onClick={onClose} className="text-[10px] font-black uppercase text-slate-500 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">Fechar</button>
        </div>
        <div className="rounded-2xl bg-slate-50/80 dark:bg-slate-800 p-4 text-sm text-slate-700 dark:text-slate-300 space-y-2">
          <p><strong>Erro:</strong> {log.error}</p>
          <p><strong>Provider anterior:</strong> {log.previous}</p>
          <p><strong>Provider ativo:</strong> {log.current}</p>
          <p><strong>Momento:</strong> {new Date(log.timestamp).toLocaleString()}</p>
        </div>
        <div className="flex justify-end gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 rounded-2xl bg-amber-500 text-white text-xs font-black uppercase tracking-widest hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              Tentar Gemini
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-2xl border border-slate-300 text-xs font-black uppercase tracking-widest text-slate-800 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

interface Props {
  onGenerate: (input: PaidCampaignInput) => void;
  isLoading: boolean;
  activeProduct?: {
    name?: string;
    description?: string;
    price?: string;
    uniqueMechanism?: string;
    persona?: {
      audience?: string;
      pains?: string;
    };
  } | null;
  errorMessage?: string | null;
  fallbackLog?: AiFallbackLog | null;
  isFallbackDetailsOpen?: boolean;
  onShowFallbackDetails?: () => void;
  onCloseFallbackDetails?: () => void;
  onRetryWithGemini?: () => void;
}

const MarketingModule: React.FC<Props> = ({ 
  onGenerate, 
  isLoading, 
  activeProduct, 
  errorMessage,
  fallbackLog = null,
  isFallbackDetailsOpen = false,
  onShowFallbackDetails,
  onCloseFallbackDetails,
  onRetryWithGemini
}) => {
  const [objective, setObjective] = useState('Venda direta');
  const [ticket, setTicket] = useState('Baixo');
  const [segment, setSegment] = useState('');
  const [pain, setPain] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [promise, setPromise] = useState('');
  const [channel, setChannel] = useState('Meta');
  const [secondaryChannel, setSecondaryChannel] = useState('Google');
  const [tone, setTone] = useState('Direto');
  const [primaryMetric, setPrimaryMetric] = useState('CPA');
  const [budget, setBudget] = useState('');
  const [hasPv, setHasPv] = useState(true);
  const [hasEbook, setHasEbook] = useState(true);
  const [hasProof, setHasProof] = useState(true);

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

  React.useEffect(() => {
    if (!activeProduct) return;
    setSegment(prev => prev || activeProduct.persona?.audience || '');
    setPain(prev => prev || activeProduct.persona?.pains || '');
    setMechanism(prev => prev || activeProduct.uniqueMechanism || '');
    setPromise(prev => prev || activeProduct.description || '');
    if (!ticket && activeProduct.price) setTicket('Baixo');
  }, [activeProduct]);

  const resolveTicket = (price?: string) => {
    if (!price) return 'Baixo';
    const value = Number(String(price).replace(/[^\d.,]/g, '').replace(/\./g, '').replace(',', '.'));
    if (Number.isNaN(value)) return 'Baixo';
    if (value >= 997) return 'Alto';
    if (value >= 197) return 'Médio';
    return 'Baixo';
  };

  const applyAutoAnalysis = () => {
    if (!activeProduct) return;
    setObjective('Venda direta');
    setTicket(resolveTicket(activeProduct.price));
    setSegment(activeProduct.persona?.audience || '');
    setPain(activeProduct.persona?.pains || '');
    setMechanism(activeProduct.uniqueMechanism || '');
    setPromise(activeProduct.description || '');
    setChannel('Meta');
    setSecondaryChannel('Google');
    setTone('Direto');
    setPrimaryMetric('CPA');
    setBudget('');
    setHasPv(true);
    setHasEbook(true);
    setHasProof(true);
  };

  const handleGenerate = () => {
    const payload: PaidCampaignInput = {
      objective,
      ticket,
      segment,
      pain,
      mechanism,
      promise,
      channel,
      secondaryChannel,
      tone,
      primaryMetric,
      budget,
      assets: {
        hasPv,
        hasEbook,
        hasProof
      }
    };
    onGenerate(payload);
  };

  return (
    <>
      <FallbackDetailsModal
        log={fallbackLog}
        open={isFallbackDetailsOpen}
        onClose={onCloseFallbackDetails || (() => {})}
        onRetry={onRetryWithGemini}
      />
      <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
        <FallbackAlert log={fallbackLog || null} onDetails={() => onShowFallbackDetails?.()} />
      <Card color="slate">
        <Label color="slate">Estratégia Patrocinada</Label>
        <p className="text-[10px] font-bold text-slate leading-relaxed uppercase">
          Responda rápido para gerar o plano na área útil.
        </p>
        <div className="pt-3 space-y-2">
          <div className="text-[9px] font-bold uppercase text-slate mb-1">
            Preset: vendas diretas • Meta + Google • métrica {primaryMetric.toLowerCase()} • ticket {resolveTicket(activeProduct?.price).toLowerCase()}
          </div>
          <div className="text-[9px] leading-snug text-slate/80">
            Ticket automático: Baixo (&lt;R$197), Médio (R$197–R$997), Alto (&gt;R$997). Ajuste manualmente se for caso especial.
          </div>
          <Button
            variant="secondary"
            className="w-full text-[10px] font-black uppercase"
            onClick={applyAutoAnalysis}
            disabled={!activeProduct}
          >
            Análise automática
          </Button>
        </div>
        {errorMessage && (
          <div className="mt-3 rounded-2xl border border-danger/40 bg-danger/10 px-3 py-2 text-[11px] text-danger">
            <div className="uppercase tracking-widest text-[9px] font-black text-danger mb-1">Erro da API</div>
            <p className="leading-snug">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Objetivo</span>
            <Select value={objective} onChange={(e) => setObjective(e.target.value)}>
              <option>Venda direta</option>
              <option>Aquecer para orgânico</option>
              <option>Leads (isca)</option>
              <option>Remarketing</option>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Ticket</span>
            <Select value={ticket} onChange={(e) => setTicket(e.target.value)}>
              <option>Baixo</option>
              <option>Médio</option>
              <option>Alto</option>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Segmento / Persona</span>
            <Input value={segment} onChange={(e) => setSegment(e.target.value)} placeholder="Ex: Jovens profissionais no início da carreira" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Dor principal</span>
            <Input value={pain} onChange={(e) => setPain(e.target.value)} placeholder="Ex: Ansiedade, exaustão, falta de limites" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Mecanismo</span>
            <Input value={mechanism} onChange={(e) => setMechanism(e.target.value)} placeholder="Ex: Método 4P" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Promessa central</span>
            <TextArea value={promise} onChange={(e) => setPromise(e.target.value)} placeholder="Ex: Recuperar energia em 30 dias sem perder desempenho" className="h-20" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Canal principal</span>
            <Select value={channel} onChange={(e) => setChannel(e.target.value)}>
              <option>Meta</option>
              <option>Google</option>
              <option>TikTok</option>
              <option>YouTube</option>
              <option>LinkedIn</option>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Canal secundário</span>
            <Select value={secondaryChannel} onChange={(e) => setSecondaryChannel(e.target.value)}>
              <option>Google</option>
              <option>Meta</option>
              <option>TikTok</option>
              <option>YouTube</option>
              <option>LinkedIn</option>
              <option>Nenhum</option>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Tom de comunicação</span>
            <Select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Direto</option>
              <option>Acolhedor</option>
              <option>Técnico</option>
              <option>Aspiracional</option>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Métrica principal</span>
            <Select value={primaryMetric} onChange={(e) => setPrimaryMetric(e.target.value)}>
              <option>CPA</option>
              <option>CTR</option>
              <option>ROAS</option>
              <option>CPC</option>
            </Select>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Orçamento diário (opcional)</span>
            <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ex: R$ 50/dia" />
          </div>
        </div>
      </Card>

      <Card color="slate">
        <Label color="slate">Ativos disponíveis</Label>
        <div className="flex items-center justify-between text-[10px] text-slate font-black uppercase">
          Página de vendas
          <Toggle checked={hasPv} onChange={setHasPv} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate font-black uppercase">
          E-book
          <Toggle checked={hasEbook} onChange={setHasEbook} />
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate font-black uppercase">
          Provas
          <Toggle checked={hasProof} onChange={setHasProof} />
        </div>
      </Card>

      <Button variant="primary" className="w-full" onClick={handleGenerate} disabled={isLoading}>
        {isLoading ? 'Gerando estratégia...' : 'Gerar Plano de Campanha'}
      </Button>
      </div>
    </>
  );
};

export default MarketingModule;
