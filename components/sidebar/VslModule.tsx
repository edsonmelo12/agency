
import React, { useState } from 'react';
import { ProductInfo, Producer } from '../../types';
import { Label, Select, Button, Card } from '../ui/BaseComponents';

interface Props {
  onGenerate: (model: string, duration: string) => void;
  isLoading: boolean;
}

const VslModule: React.FC<Props> = ({ onGenerate, isLoading }) => {
  const [model, setModel] = useState<'SLS' | '12-STEPS' | 'HOOK-STORY-OFFER'>('HOOK-STORY-OFFER');
  const [duration, setDuration] = useState<'short' | 'medium' | 'long'>('short');

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="space-y-4">
        <div>
          <Label color="indigo">Modelo de Copy</Label>
          <Select value={model} onChange={e => setModel(e.target.value as any)}>
            <option value="HOOK-STORY-OFFER">Gancho, História e Oferta (Moderno)</option>
            <option value="SLS">Simple Letter Solution (Direto)</option>
            <option value="12-STEPS">12 Passos de Jon Benson (Longo)</option>
          </Select>
          <p className="text-[9px] text-slate mt-2 font-bold uppercase tracking-tight">
            * O modelo define a psicologia por trás do roteiro.
          </p>
        </div>

        <div>
          <Label color="blue">Duração Alvo</Label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'short', label: 'Curto', desc: '2-3 min' },
              { id: 'medium', label: 'Médio', desc: '5-7 min' },
              { id: 'long', label: 'Longo', desc: '12+ min' }
            ].map(d => (
              <button 
                key={d.id}
                onClick={() => setDuration(d.id as any)}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${duration === d.id ? 'bg-primary border-primary text-white shadow-lg' : 'bg-panel border-border text-slate'}`}
              >
                <span className="text-[10px] font-black uppercase">{d.label}</span>
                <span className="text-[8px] font-bold opacity-60">{d.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Card color="indigo">
        <h4 className="text-[10px] font-black uppercase text-primary mb-2">Dica de Conversão</h4>
        <p className="text-[11px] leading-relaxed text-slate font-medium">
          Vídeos **curtos** funcionam melhor para anúncios e low-ticket. Para produtos acima de **R$ 497**, prefira o modelo de **12 Passos** com duração média ou longa.
        </p>
      </Card>

      <Button 
        variant="primary" 
        onClick={() => onGenerate(model, duration)}
        disabled={isLoading}
        className="w-full py-5"
      >
        {isLoading ? 'Roteirizando...' : 'Gerar Roteiro de Vídeo'}
      </Button>
    </div>
  );
};

export default VslModule;
