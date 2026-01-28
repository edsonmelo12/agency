import React from 'react';
import { Button } from './ui/BaseComponents';
import { PaidCampaignPlan } from '../types';

interface Props {
  plan: PaidCampaignPlan | null;
  onSavePlan?: () => void;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-3xl border border-border bg-panel p-8 shadow-sm">
    <h3 className="text-sm font-display uppercase tracking-widest text-slate mb-4">{title}</h3>
    {children}
  </div>
);

const MarketingStrategyPanel: React.FC<Props> = ({ plan, onSavePlan }) => {
  if (!plan) {
    return (
    <div className="h-full flex items-center justify-center text-slate text-sm">
        Gere um plano de campanha para visualizar o relatório.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-8 space-y-8">
      <div className="rounded-3xl border border-border bg-gradient-to-br from-panel to-slate-50 dark:from-slate-950 dark:to-slate-900 p-10 shadow-sm">
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-success">Plano de Campanha</div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate bg-panel px-2 py-1 rounded-full border border-border">Salvo no projeto</span>
            {onSavePlan && (
              <Button
                variant="secondary"
                className="px-3 py-1 text-[10px] font-black uppercase"
                onClick={onSavePlan}
              >
                Salvar plano
              </Button>
            )}
          </div>
        </div>
        <h2 className="text-3xl md:text-4xl font-display text-ink mb-4">Estratégia de Marketing Patrocinado</h2>
        <p className="text-slate max-w-3xl">{plan.summary}</p>
      </div>

      <SectionCard title="Estrutura do Funil">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: 'Topo', value: plan.funnel.top },
            { label: 'Meio', value: plan.funnel.middle },
            { label: 'Fundo', value: plan.funnel.bottom }
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-border p-5 bg-panel/70">
              <div className="text-xs font-black uppercase tracking-widest text-slate mb-2">{item.label}</div>
              <p className="text-ink text-sm leading-relaxed">{item.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Ângulos sugeridos">
        <ul className="space-y-3">
          {plan.angles.map((angle, idx) => (
          <li key={`${angle}-${idx}`} className="text-ink text-sm flex gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-success"></span>
            <span>{angle}</span>
          </li>
        ))}
        </ul>
      </SectionCard>

      <SectionCard title="Criativos recomendados">
        <div className="grid gap-4 md:grid-cols-2">
          {plan.creatives.map((creative, idx) => (
            <div key={`${creative.format}-${idx}`} className="rounded-2xl border border-border p-5">
              <div className="text-xs font-black uppercase tracking-widest text-primary mb-2">{creative.format}</div>
              <p className="text-ink text-sm"><strong>Objetivo:</strong> {creative.goal}</p>
              <p className="text-slate text-sm mt-2">{creative.notes}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Copy base do anúncio">
        <div className="space-y-4 text-sm text-ink">
          <div><strong>Headline:</strong> {plan.copy.headline}</div>
          <div><strong>Corpo:</strong> {plan.copy.body}</div>
          <div><strong>CTA:</strong> {plan.copy.cta}</div>
        </div>
      </SectionCard>

      <SectionCard title="Checklist de alinhamento">
        <ul className="space-y-3">
          {plan.checklist.map((item, idx) => (
          <li key={`${item}-${idx}`} className="text-ink text-sm flex gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-primary"></span>
            <span>{item}</span>
          </li>
        ))}
        </ul>
      </SectionCard>

      <SectionCard title="Próximos passos">
        <ul className="space-y-3">
          {plan.nextSteps.map((item, idx) => (
          <li key={`${item}-${idx}`} className="text-ink text-sm flex gap-3">
            <span className="mt-2 h-2 w-2 rounded-full bg-ink"></span>
            <span>{item}</span>
          </li>
        ))}
        </ul>
      </SectionCard>
    </div>
  );
};

export default MarketingStrategyPanel;
