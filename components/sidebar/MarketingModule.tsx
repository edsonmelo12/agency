import React, { useState, useEffect } from 'react';
import { Label, Card, Button, Input, TextArea, Select, Toggle } from '../ui/BaseComponents';
import { PaidCampaignInput } from '../../types';

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
}

const MarketingModule: React.FC<Props> = ({ onGenerate, isLoading, activeProduct }) => {
  const [objective, setObjective] = useState('Venda direta');
  const [ticket, setTicket] = useState('Baixo');
  const [segment, setSegment] = useState('');
  const [pain, setPain] = useState('');
  const [mechanism, setMechanism] = useState('');
  const [promise, setPromise] = useState('');
  const [channel, setChannel] = useState('Meta');
  const [tone, setTone] = useState('Direto');
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

  const handleGenerate = () => {
    const payload: PaidCampaignInput = {
      objective,
      ticket,
      segment,
      pain,
      mechanism,
      promise,
      channel,
      tone,
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
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
      <Card color="slate">
        <Label color="slate">Estratégia Patrocinada</Label>
        <p className="text-[10px] font-bold text-slate leading-relaxed uppercase">
          Responda rápido para gerar o plano na área útil.
        </p>

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
            <span className="text-[10px] font-bold text-slate uppercase">Tom de comunicação</span>
            <Select value={tone} onChange={(e) => setTone(e.target.value)}>
              <option>Direto</option>
              <option>Acolhedor</option>
              <option>Técnico</option>
              <option>Aspiracional</option>
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
  );
};

export default MarketingModule;
