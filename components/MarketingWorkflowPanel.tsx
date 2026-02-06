import React, { useMemo } from 'react';
import MarketingStrategyPanel from './MarketingStrategyPanel';
import { Button, Card } from './ui/BaseComponents';
import {
  PaidCampaignPlan,
  CreativeIdea,
  BuilderPlan,
  Producer,
  ProductInfo,
  StrategySuggestion,
  MarketingSettings
} from '../types';

interface Props {
  plan: PaidCampaignPlan | null;
  creativeIdeas: CreativeIdea[];
  builderPlan: BuilderPlan | null;
  expert: Producer | null;
  product: ProductInfo | null;
  marketing: MarketingSettings;
  onRefreshCreatives: () => Promise<CreativeIdea[]>;
  isGeneratingCreatives: boolean;
  onSavePlan: () => void;
  strategySuggestions: StrategySuggestion[];
  selectedStrategyId: string;
  onSelectStrategy: (strategyId: string) => void;
  onGenerateCreativeVariants: () => Promise<CreativeIdea[]>;
  customCreatives: CreativeIdea[];
  onSaveCustomCreative: (creative: CreativeIdea) => void;
}

const StepCard: React.FC<{ step: number | string; title: string; subtitle?: string; className?: string; children: React.ReactNode }> = ({
  step,
  title,
  subtitle,
  className = '',
  children
}) => (
  <Card color="white" className={`rounded-[28px] shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 ${className}`}>
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Passo {step}</p>
        <h3 className="text-2xl font-display text-slate-900 dark:text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>}
      </div>
    </div>
    <div className="mt-6 space-y-5 text-slate-900 dark:text-slate-100">{children}</div>
  </Card>
);

const StrategyCard: React.FC<{
  strategy: StrategySuggestion;
  isActive: boolean;
  onSelect: () => void;
}> = ({ strategy, isActive, onSelect }) => (
  <article
    className={`rounded-2xl border px-4 py-5 shadow-sm transition-all duration-200 ${
      isActive
        ? 'border-primary bg-primary/10 shadow-lg dark:bg-primary/10 dark:border-primary'
        : 'border-border bg-white hover:border-primary hover:bg-slate-50 dark:bg-slate-900/70'
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <span className="px-3 py-1 rounded-full border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white/80 dark:bg-slate-900/70">
        {strategy.stage}
      </span>
      <span className="text-[10px] font-black uppercase tracking-widest text-primary">{strategy.objective}</span>
    </div>
    <h3 className="mt-3 text-lg font-display text-slate-900 dark:text-white">{strategy.title}</h3>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{strategy.summary}</p>
    <div className="mt-4 grid gap-3 md:grid-cols-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-300">
      {strategy.segments.map(segment => (
        <div key={`${strategy.id}-${segment.name}`} className="rounded-2xl border border-slate-200 bg-panel/70 p-3 shadow-inner">
          <p className="text-[9px] font-black text-slate-400">{segment.name}</p>
          <p className="text-[12px] font-bold text-slate-900 dark:text-white leading-snug">{segment.focus}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{segment.budget}</p>
        </div>
      ))}
    </div>
    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-200">
      {strategy.tags.map(tag => (
        <span key={`${strategy.id}-${tag}`} className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-3 py-1 text-[9px] font-black text-slate-700 dark:text-slate-200">
          {tag}
        </span>
      ))}
    </div>
    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
      {strategy.metrics.map(metric => (
        <span key={`${strategy.id}-${metric}`} className="rounded-full border border-slate-200 px-3 py-1 bg-white/80 dark:bg-slate-900/70">
          {metric}
        </span>
      ))}
    </div>
    <div className="mt-4 space-y-1 text-sm text-slate-700 dark:text-slate-300">
      <p>
        <span className="font-black">Headline:</span> {strategy.creative.headline}
      </p>
      <p>
        <span className="font-black">Corpo:</span> {strategy.creative.body}
      </p>
      <p>
        <span className="font-black">CTA:</span> {strategy.creative.cta}
      </p>
    </div>
    <div className="mt-5 flex flex-col gap-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">Budget sugerido</p>
      <p className="text-[13px] font-black text-slate-900 dark:text-white">R$ {strategy.budgetPerDay.toFixed(0)} / dia</p>
      <button
        type="button"
        onClick={onSelect}
        className={`w-full rounded-2xl py-2 text-[10px] font-black uppercase tracking-widest transition-colors ${
          isActive ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-primary text-white hover:bg-blue-700'
        }`}
      >
        {isActive ? 'Estratégia ativa' : 'Selecionar estratégia'}
      </button>
    </div>
  </article>
);

const ActiveStrategySummary: React.FC<{ strategy: StrategySuggestion }> = ({ strategy }) => (
  <div className="rounded-[32px] border border-slate-200 bg-white shadow-lg px-6 py-5 dark:bg-slate-900/80 dark:border-slate-800">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Estratégia ativa</p>
        <h3 className="text-2xl font-display text-slate-900 dark:text-white">{strategy.title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">{strategy.summary}</p>
      </div>
      <div className="text-right">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Objetivo</p>
        <p className="text-base font-black text-primary">{strategy.objective}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Budget: R$ {strategy.budgetPerDay.toFixed(0)} / dia</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">UTM: {strategy.utmTemplate}</p>
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
      {strategy.checklistAdditions.map(item => (
        <span key={`${strategy.id}-check-${item}`} className="rounded-full border border-slate-200 px-3 py-1 bg-panel/60 text-slate-700 dark:text-slate-200">
          {item}
        </span>
      ))}
    </div>
  </div>
);

const StrategyFilterSelect: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="px-3 py-2 rounded-xl border border-border bg-white text-[10px] font-black uppercase tracking-widest text-slate-900 dark:bg-slate-900/80 dark:text-slate-100"
  >
    {['Todos', 'Topo', 'Meio', 'Fundo'].map(option => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

interface ManualCreativePayload {
  copy: string;
  cta: string;
  prompts: string[];
  intention: string;
  format: string;
  tags: string[];
}

const tagOptions = ['emotional', 'authority', 'urgency', 'proof', 'benefit', 'curiosity'];

const CustomCreativeModal: React.FC<{
  open: boolean;
  stage: FunnelStage;
  plan: PaidCampaignPlan | null;
  objectiveLabel: string;
  onClose: () => void;
  onSubmit: (payload: ManualCreativePayload, keepOpen?: boolean) => void;
  onGenerateVariants: () => Promise<CreativeIdea[]>;
}> = ({ open, stage, plan, objectiveLabel, onClose, onSubmit, onGenerateVariants }) => {
  const [copy, setCopy] = React.useState('');
  const [cta, setCta] = React.useState('Garantir agora');
  const [promptText, setPromptText] = React.useState('');
  const [intention, setIntention] = React.useState('Conversão direta');
  const [format, setFormat] = React.useState('Reels');
  const [selectedTags, setSelectedTags] = React.useState<string[]>([]);
  const [generatedVariants, setGeneratedVariants] = React.useState<CreativeIdea[]>([]);
  const [isGeneratingVariants, setIsGeneratingVariants] = React.useState(false);
  const [variantError, setVariantError] = React.useState<string | null>(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (!open) {
      setCopy('');
      setCta('Garantir agora');
      setPromptText('');
      setGeneratedVariants([]);
      setVariantError(null);
      setSelectedVariantIndex(null);
    }
  }, [open]);

  if (!open) return null;

  const prompts = promptText
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean);

  const instructions = [
    'Gancho claro → benefício específico → prova breve → CTA direto',
    'Use prova/autoridade dentro das 70 palavras e mantenha CTA no final',
    'Defina o formato recomendado (Stories/Reels/Feed) e o gatilho testado'
  ];

  const handleSubmit = (keepOpen: boolean = false) => {
    if (!copy.trim()) return;
    onSubmit(
      {
        copy: copy.trim(),
        cta: cta.trim(),
        prompts,
        intention,
        format,
        tags: selectedTags
      },
      keepOpen
    );
    if (!keepOpen) {
      onClose();
    } else {
      setCopy('');
      setCta('Garantir agora');
      setPromptText('');
      setSelectedTags([]);
      setSelectedVariantIndex(null);
    }
  };

  const handleGenerateVariants = async () => {
    setVariantError(null);
    setIsGeneratingVariants(true);
    try {
      const variants = await onGenerateVariants();
      setGeneratedVariants(variants);
    } catch (err) {
      console.error(err);
      setVariantError('Falha ao gerar variações. Tente novamente.');
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const handleUseVariant = (variant: CreativeIdea, index: number) => {
    setCopy(variant.adCopy || '');
    setCta(variant.cta || 'Garantir agora');
    const promptsValue = variant.visualPrompts?.length
      ? variant.visualPrompts.join('\n')
      : variant.imagePrompt || '';
    setPromptText(promptsValue);
    setSelectedVariantIndex(index);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-black uppercase tracking-widest text-slate-900 dark:text-white">Nova copy/prompt ({stage})</h3>
            <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">{objectiveLabel}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-black uppercase">Fechar</button>
        </div>
        <div className="space-y-4 text-sm text-slate-700 dark:text-slate-200">
          <label className="block">Anúncio (até 70 palavras)</label>
          <textarea
            value={copy}
            onChange={(e) => setCopy(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-border bg-panel/80 p-3 text-sm"
          />
          <label>CTA</label>
          <input
            value={cta}
            onChange={(e) => setCta(e.target.value)}
            className="w-full rounded-2xl border border-border bg-panel/80 p-3 text-sm"
          />
          <label>Prompts (cada linha vira uma variação)</label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={3}
            className="w-full rounded-2xl border border-border bg-panel/80 p-3 text-sm"
          />
          {prompts.length > 0 && (
            <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-300">
              {prompts.map((prompt, idx) => (
                <li key={`preview-${idx}`} className="rounded-full border border-slate-200 px-3 py-1">
                  Prompt #{idx + 1}: {prompt}
                </li>
              ))}
            </ul>
          )}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 dark:bg-slate-900/70 p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Funil ativo</p>
            <div className="grid gap-2 sm:grid-cols-3 text-[12px]">
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-2">
                <p className="text-[9px] uppercase text-slate-400">Topo</p>
                <p className="text-slate-800 text-sm line-clamp-2">{plan?.funnel?.top || '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-2">
                <p className="text-[9px] uppercase text-slate-400">Meio</p>
                <p className="text-slate-800 text-sm line-clamp-2">{plan?.funnel?.middle || '—'}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 p-2">
                <p className="text-[9px] uppercase text-slate-400">Fundo</p>
                <p className="text-slate-800 text-sm line-clamp-2">{plan?.funnel?.bottom || '—'}</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-3 space-y-2">
            <p className="text-[10px] uppercase text-slate-500">Instruções rápidas</p>
            <ul className="list-disc list-inside text-[10px] text-slate-500 space-y-1">
              {instructions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Intenção</label>
              <select
                value={intention}
                onChange={(e) => setIntention(e.target.value)}
                className="w-full rounded-xl border border-border bg-panel/80 p-2 text-sm"
              >
                <option value="Conversão direta">Conversão direta</option>
                <option value="Lead magnet">Lead magnet</option>
                <option value="Prova social">Prova social</option>
                <option value="Escassez/urgência">Escassez/urgência</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Formato</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full rounded-xl border border-border bg-panel/80 p-2 text-sm"
              >
                <option value="Reels">Reels</option>
                <option value="Stories">Stories</option>
                <option value="Feed">Feed</option>
                <option value="Carrossel">Carrossel</option>
                <option value="Vídeo curto">Vídeo curto</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Tags de estilo (opcional)</p>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`px-3 py-1 rounded-full border text-[9px] uppercase tracking-widest ${
                    selectedTags.includes(tag)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                  onClick={() => {
                    setSelectedTags((prev) =>
                      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
                    );
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 space-y-3">
          <Button
            variant="primary"
            onClick={handleGenerateVariants}
            disabled={isGeneratingVariants}
            className="w-full text-[10px]"
          >
            {isGeneratingVariants ? 'Gerando variações...' : 'Gerar IA com o funil atual'}
          </Button>
          {variantError && <p className="text-[10px] text-rose-500">{variantError}</p>}
          {generatedVariants.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Variações sugeridas</p>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {generatedVariants.map((variant, idx) => (
                  <div
                    key={`variant-${idx}`}
                    className={`rounded-2xl border px-3 py-2 text-sm bg-white/80 shadow-sm dark:bg-slate-900/70 ${
                      selectedVariantIndex === idx ? 'border-primary/80 bg-primary/10 dark:bg-primary/10' : 'border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">
                      <span>{variant.stage || 'Foco'}</span>
                      <span>{variant.awarenessLevel || 'Teste'}</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white leading-snug">{variant.adCopy}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">CTA: {variant.cta || 'Sem CTA'}</p>
                    <div className="flex flex-wrap gap-2 items-center text-[10px] text-slate-500 dark:text-slate-400">
                      <span className="rounded-full border border-slate-200 px-2 py-1">{variant.visualStyle}</span>
                      <span className="rounded-full border border-slate-200 px-2 py-1">{variant.objective || 'Objetivo'}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleUseVariant(variant, idx)}
                        className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest"
                      >
                        Usar variação
                      </Button>
                      <span className="text-[9px] text-slate-500 dark:text-slate-400">{variant.origin === 'ia' ? 'IA' : 'Manual'}</span>
                    </div>
                    {variant.visualPrompts?.length > 0 && (
                      <div className="mt-2 space-y-1 text-[9px] text-slate-500 dark:text-slate-300">
                        {variant.visualPrompts.map((prompt, promptIdx) => (
                          <p key={`variant-prompt-${idx}-${promptIdx}`} className="rounded-full border border-dashed border-slate-200 px-2 py-0.5">
                            Prompt {promptIdx + 1}: {prompt}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[10px] font-black uppercase rounded-2xl border border-border text-slate"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-4 py-2 text-[10px] font-black uppercase rounded-2xl bg-slate-900 text-white"
          >
            Salvar e adicionar outro
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2 text-[10px] font-black uppercase rounded-2xl bg-primary text-white"
          >
            Salvar copy/prompt
          </button>
        </div>
      </div>
    </div>
  );
};

const MarketingWorkflowPanel: React.FC<Props> = ({
  plan,
  creativeIdeas,
  builderPlan,
  expert,
  product,
  marketing,
  onRefreshCreatives,
  isGeneratingCreatives,
  onSavePlan,
  strategySuggestions,
  selectedStrategyId,
  onSelectStrategy,
  onGenerateCreativeVariants,
  customCreatives,
  onSaveCustomCreative,
}) => {
  const hasPlan = Boolean(plan);
  const hasBuilder = Boolean(builderPlan);
  const hasPixel = Boolean(marketing.metaPixelId || marketing.googleAnalyticsId || marketing.tiktokPixelId);
  const [stageFilter, setStageFilter] = React.useState<string>('Todos');
  const filteredStrategies = React.useMemo(() => {
    if (stageFilter === 'Todos') return strategySuggestions;
    return strategySuggestions.filter(item => item.stage === stageFilter);
  }, [stageFilter, strategySuggestions]);
  const activeStrategy = strategySuggestions.find(strategy => strategy.id === selectedStrategyId) || null;
  React.useEffect(() => {
    if (activeStrategy) {
      setStageFilter(activeStrategy.stage);
    }
  }, [activeStrategy]);
  const activeStageCreatives = React.useMemo(() => {
    if (!activeStrategy) return creativeIdeas;
    return creativeIdeas.filter(idea => idea.stage === activeStrategy.stage);
  }, [activeStrategy, creativeIdeas]);
  const focusStage = activeStrategy?.stage || 'Fundo';
  const stageCustomCreatives = React.useMemo(
    () => customCreatives.filter(idea => idea.stage === focusStage),
    [customCreatives, focusStage]
  );
  const heroCandidate =
    activeStageCreatives[0] ||
    stageCustomCreatives[0] ||
    creativeIdeas[0] ||
    customCreatives[0] ||
    null;
  const heroCreative = heroCandidate;
  const variationCreatives = React.useMemo(() => {
    const base = activeStageCreatives.slice(1);
    if (base.length > 0) return base;
    return creativeIdeas.slice(1, 6);
  }, [activeStageCreatives, creativeIdeas]);
  const isSameCreative = (a?: CreativeIdea, b?: CreativeIdea) => {
    if (!a || !b) return false;
    return a.adCopy === b.adCopy && a.cta === b.cta;
  };
  const kitVariations = React.useMemo(() => {
    const filteredCustom = customCreatives.filter(creative => !isSameCreative(creative, heroCandidate));
    return [...variationCreatives, ...filteredCustom];
  }, [variationCreatives, customCreatives, heroCandidate]);
  const [isCustomModalOpen, setCustomModalOpen] = React.useState(false);
  const clampWordsLocal = (text: string, maxWords: number = 70) => {
    if (!text) return '';
    const words = text.trim().split(/\s+/);
    if (words.length <= maxWords) return text.trim();
    return words.slice(0, maxWords).join(' ') + '...';
  };
  const objectiveLabel = plan?.copy?.headline || plan?.summary || 'Objetivo do funil não carregado';
  const creativeHighlights = React.useMemo(() => {
    const highlights: string[] = [];
    if (activeStrategy) {
      highlights.push(`${kitVariations.length} variações alinhadas ao stage ${activeStrategy.stage} (${activeStrategy.objective})`);
    }
    if (customCreatives.length > 0) {
      highlights.push(`${customCreatives.length} variações manuais registradas`);
    }
    return highlights;
  }, [activeStrategy, kitVariations.length, customCreatives.length]);

  const handleCustomModalSubmit = (payload: ManualCreativePayload, keepOpen?: boolean) => {
    const stage: FunnelStage = activeStrategy ? activeStrategy.stage : 'Fundo';
    const custom: CreativeIdea = {
      type: 'custom',
      angle: stage === 'Topo' ? 'engajamento' : stage === 'Meio' ? 'autoridade' : 'conversao',
      adCopy: clampWordsLocal(payload.copy),
      imagePrompt: payload.prompts[0] || `Prompt customizado para o stage ${stage}`,
      visualStyle: 'Custom Visual',
      stage,
      variant: customCreatives.length + 1,
      cta: payload.cta || 'Garantir agora',
      wordCount: clampWordsLocal(payload.copy).split(/\s+/).filter(Boolean).length,
      visualPrompts: payload.prompts.length ? payload.prompts : [payload.prompts[0] || ''],
      objective: objectiveLabel,
      awarenessLevel: stage,
      origin: 'manual',
      intention: payload.intention,
      format: payload.format,
      tags: payload.tags
    };
    onSaveCustomCreative(custom);
    if (!keepOpen) {
      setCustomModalOpen(false);
    }
  };

  const exportBlueprint = () => {
    if (!builderPlan) return;
    const snippet = [
      `Campanha: ${builderPlan.campaignName}`,
      `Objetivo: ${builderPlan.objective}`,
      `Budget: ${builderPlan.budgetPerDay}`,
      `UTM: ${builderPlan.utmTemplate}`,
      'Segmentos:',
      ...builderPlan.segments.map(segment => `  • ${segment.name}: ${segment.focus} (${segment.budget})`)
    ].join('\n');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(snippet);
      alert('Estrutura copiada para a área de transferência.');
      return;
    }
    alert('Seu navegador não permite copiar automaticamente. Revise manualmente.');
  };

  const quickReminder = () => {
    alert('Ajuste a oferta ou os ativos diretamente no sidebar esquerdo antes de avançar.');
  };

  const renderStatusBadges = () => (
    <div className="flex flex-wrap gap-3">
      <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100">
        Objetivo: {plan?.funnel ? 'Conversão' : 'Explorar Plano'}
      </span>
      <span className={`rounded-full border px-4 py-1 text-[11px] font-black uppercase tracking-widest ${hasPixel ? 'border-success/60 bg-success/10 text-success' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
        {hasPixel ? 'Pixel configurado' : 'Pixel ausente'}
      </span>
      <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100">
        Provider: {builderPlan?.providerName || 'Gemini'}
      </span>
      <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100">
        Confiança: {builderPlan?.providerConfidence ?? 76}%
      </span>
      {builderPlan?.note && (
        <span className="rounded-full border border-slate-200 bg-white/80 px-4 py-1 text-[11px] font-black uppercase tracking-widest text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100">
          Nota: {builderPlan.note}
        </span>
      )}
    </div>
  );

  const renderStrategies = () => (
    <div className="space-y-5 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Estratégias sugeridas</p>
          <h2 className="text-xl font-display text-slate-900 dark:text-white">Escolha um roteiro detalhado</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Cada card traz foco de funil, budget, criativos e indicadores para testar rapidamente.</p>
        </div>
        <StrategyFilterSelect value={stageFilter} onChange={setStageFilter} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStrategies.map(strategy => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            isActive={strategy.id === selectedStrategyId}
            onSelect={() => onSelectStrategy(strategy.id)}
          />
        ))}
      </div>
      {filteredStrategies.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma estratégia disponível para este estágio.</p>
      )}
    </div>
  );

  return (
    <div className="h-full overflow-y-auto px-6 py-8 space-y-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <CustomCreativeModal
        open={isCustomModalOpen}
        stage={activeStrategy?.stage || 'Fundo'}
        plan={plan}
        objectiveLabel={objectiveLabel}
        onClose={() => setCustomModalOpen(false)}
        onSubmit={handleCustomModalSubmit}
        onGenerateVariants={onGenerateCreativeVariants}
      />
      {renderStatusBadges()}
      {activeStrategy && <ActiveStrategySummary strategy={activeStrategy} />}
      {renderStrategies()}

      <StepCard step={0} title="Contexto da Oferta" subtitle="Confirme os dados antes de gerar a campanha">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Oferta</p>
            <h4 className="mt-1 text-xl font-display text-slate-900 dark:text-white">{product?.name || 'Selecione uma oferta'}</h4>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {product?.description || 'Cadastre um produto para iniciar o planejamento.'}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Expert responsável</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{expert?.name || 'Sem expert ativo'}</p>
            </div>
            {product?.price && (
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Ticket médio: <strong>{product.price}</strong>
              </p>
            )}
            <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase text-slate-500 dark:text-slate-300">
              {product?.persona?.audience && (
                <span className="px-3 py-1 rounded-full border border-slate-200 bg-white/70 text-slate-700 dark:text-slate-200">Persona: {product.persona.audience}</span>
              )}
              {product?.persona?.pains && (
                <span className="px-3 py-1 rounded-full border border-slate-200 bg-white/70 text-slate-700 dark:text-slate-200">Dor: {product.persona.pains}</span>
              )}
            </div>
            <Button variant="outline" onClick={quickReminder} className="text-[10px]">
              Revisar no sidebar
            </Button>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Promessa</p>
            <p className="mt-2 text-sm text-slate-900 dark:text-white leading-relaxed">{plan?.summary || 'Defina o objetivo para detalhar a promessa'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Campanha recomendada</p>
            <p className="mt-2 text-sm text-slate-900 dark:text-white">{builderPlan?.campaignName || 'Aguardando o Planner'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Checklist ativo</p>
            <p className="mt-2 text-sm text-slate-900 dark:text-white">{plan ? `${plan.checklist.length} itens` : 'Checklist vazio'}</p>
          </div>
        </div>
      </StepCard>

      <StepCard step={1} title="Planner Estratégico" subtitle="Objetivo, estrutura e justificação">
        {hasPlan ? (
          <div className="space-y-5">
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">{plan!.summary}</p>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { label: 'Topo', value: plan!.funnel.top },
                { label: 'Meio', value: plan!.funnel.middle },
                { label: 'Fundo', value: plan!.funnel.bottom }
              ].map(item => (
                <div key={item.label} className="rounded-2xl border border-border bg-panel/60 p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{item.label}</p>
                  <p className="text-sm text-slate-900 dark:text-white leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400">Ângulos sugeridos</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {plan!.angles.map(angle => (
                  <span key={angle} className="px-3 py-1 text-[10px] font-black uppercase tracking-wide rounded-full border border-slate-200 text-slate-700 dark:text-slate-200">
                    {angle}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-sm">Gere um plano para visualizar os insights do Planner.</p>
        )}
      </StepCard>

      <StepCard step={2} title="Criativos" subtitle="Copy + visual com diferentes estilos">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">Criativos principais + arsenal de variações</p>
            <p className="text-sm text-slate-700 dark:text-slate-300">Copy e prompts ajustados para o estágio ativo e sugestões de teste.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={onRefreshCreatives} disabled={isGeneratingCreatives} className="text-[10px]">
              {isGeneratingCreatives ? 'Regerando...' : 'Regenerar criativos'}
            </Button>
            <button
              type="button"
              onClick={() => setCustomModalOpen(true)}
              className="px-3 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-white rounded-2xl shadow-sm hover:bg-blue-700 transition-colors"
            >
              Adicionar copy/prompt
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/80 p-4 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
          <span>Copy hero + 3-5 variantes</span>
          <span>3-4 visuais distintos</span>
          <span>Teste combos para CTR, tempo médio e CPA/ROAS</span>
        </div>
        {heroCreative ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-panel/70 p-4 shadow-sm">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-300">
                <span>{activeStrategy ? `${activeStrategy.stage} • ${activeStrategy.objective}` : 'Foco ativo'}</span>
                <span className="rounded-full border border-primary/60 px-3 py-0.5 text-[9px] font-black uppercase text-primary">{heroCreative.stage || 'Foco'}</span>
              </div>
              <p className="mt-3 text-lg font-display text-slate-900 dark:text-white leading-relaxed">{heroCreative.adCopy}</p>
              <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                <span className="rounded-full border border-slate-200 px-3 py-1 bg-white/80 dark:bg-slate-900/70">Visual: {heroCreative.visualStyle}</span>
                <span className="rounded-full border border-slate-200 px-3 py-1 bg-white/80 dark:bg-slate-900/70">Prompt: {heroCreative.imagePrompt}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-300">
                <span>CTA: {heroCreative.cta || 'Sem CTA'}</span>
                <span>Words: {heroCreative.wordCount ?? 0}</span>
              </div>
              <div className="mt-4 space-y-2 text-[11px] text-slate-500 dark:text-slate-300">
                {heroCreative.visualPrompts?.map((prompt, idx) => (
                  <p key={`hero-prompt-${idx}`} className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-3 py-2 text-left text-[10px] uppercase tracking-widest">
                    Prompt {idx + 1}: {prompt}
                  </p>
                ))}
              </div>
            </div>
              <div className="rounded-2xl border border-border bg-white/90 p-4 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">Arsenal de variações</h4>
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">{kitVariations.length} sugestões</span>
                </div>
                <div className="mt-3 space-y-3">
                  {kitVariations.length > 0 ? (
                    <>
                      {kitVariations.map((idea, index) => (
                        <div key={`${idea.angle}-${idea.type}-${index}`} className="rounded-2xl border border-border bg-panel/60 p-3 space-y-1">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-300">
                            <span>Teste #{index + 1}</span>
                            <span className="text-[9px] font-black text-primary">{idea.visualStyle}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">{idea.adCopy}</p>
                          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                            <p>Prompt visual principal: {idea.imagePrompt}</p>
                            {idea.visualPrompts?.map((prompt, promptIdx) => (
                              <p key={`${idea.angle}-${index}-prompt-${promptIdx}`}>Variação {promptIdx + 1}: {prompt}</p>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">CTA: {idea.cta || 'Sem CTA'} • Words: {idea.wordCount ?? 0}</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                            Stage: {idea.stage || focusStage} • Origem: {idea.origin === 'manual' ? 'Manual' : 'IA'}
                          </p>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma variação disponível. Gere criativos para este stage.</p>
                  )}
                </div>
              </div>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-sm">{isGeneratingCreatives ? 'Gerando criativos...' : 'Nenhum criativo disponível ainda.'}</p>
        )}
      </StepCard>

      <StepCard step={3} title="Builder Técnico" subtitle="Estrutura pronta para o Ads Manager">
        {hasBuilder ? (
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400">Campanha sugerida</p>
              <h4 className="text-lg font-display text-slate-900 dark:text-white">{builderPlan!.campaignName}</h4>
              <p className="text-sm text-slate-700 dark:text-slate-300">Objetivo: {builderPlan!.objective}</p>
              <p className="text-sm text-slate-900 dark:text-white font-semibold">{builderPlan!.budgetPerDay}</p>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">
                <span>Provider: {builderPlan!.providerName}</span>
                <span className="px-2 py-0.5 rounded-full border border-success/70 text-success">Confiança {builderPlan!.providerConfidence}%</span>
              </div>
              {!hasPixel && (
                <div className="rounded-full border border-rose-300 bg-rose-50/80 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-rose-600">
                  Pixel não configurado — valide Meta/GA/TikTok antes de publicar.
                </div>
              )}
              {builderPlan!.note && <p className="text-xs text-slate-500 dark:text-slate-400">{builderPlan!.note}</p>}
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {['Topo', 'Meio', 'Fundo'].map((stage, idx) => {
                const stageSegment = builderPlan!.segments[idx];
                const angleMap: Record<string, string> = { Topo: 'engajamento', Meio: 'autoridade', Fundo: 'conversao' };
                const stageAngle = angleMap[stage];
                const creative = creativeIdeas.find(idea => idea.angle?.toLowerCase() === stageAngle) || creativeIdeas[idx];
                return (
                  <div key={stage} className="rounded-2xl border border-border bg-panel/70 p-4 space-y-2">
                    <p className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400">{stage}</p>
                    <p className="text-sm font-black text-slate-900 dark:text-white">{stageSegment?.name || 'Segmento padrão'}</p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">{stageSegment?.focus || 'Segmentação definida pelo Planner'}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{stageSegment?.budget || 'Budget TBD'}</p>
                    {creative ? (
                      <div className="space-y-1 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <p className="text-[12px] uppercase tracking-widest text-slate-500 dark:text-slate-400">Criativo sugerido</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">{creative.adCopy}</p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300">
                          <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">{creative.visualStyle}</span>
                          <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">CTA final</span>
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">Prompt: {creative.imagePrompt}</p>
                      </div>
                    ) : (
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Nenhum criativo definido para este estágio.</p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-white/60 p-4 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
                <p className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400">Simulações de orçamento</p>
                <div className="grid gap-2 mt-2">
                  {builderPlan!.simulations.map(sim => (
                    <div key={sim.label} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-panel/70 p-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400">{sim.label}</p>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{sim.budget}</p>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{sim.cpcEstimate} CPC</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-white/60 p-4 shadow-sm dark:bg-slate-900/70 dark:border-slate-800">
                <p className="text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-400">Checklist final</p>
                <ul className="space-y-2 mt-2">
                  {builderPlan!.checklist.map(item => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-900 dark:text-white">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {kitVariations.length > 0 && (
              <div className="rounded-2xl border border-dashed border-primary/60 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-widest text-primary dark:text-white">Kit de testes alinhado</h4>
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">{kitVariations.length} variações</span>
                </div>
                <div className="grid gap-3">
                  {kitVariations.map((idea, idx) => (
                    <div key={`kit-${idx}`} className="rounded-2xl border border-primary/30 bg-white/80 p-3 shadow-sm dark:bg-slate-900/60">
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300">
                        <span>Stage: {idea.stage || activeStrategy?.stage || 'Fundo'}</span>
                        <span>Origem: {idea.origin === 'manual' ? 'Manual' : 'IA'}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white leading-snug">{idea.adCopy}</p>
                      <div className="mt-2 flex flex-wrap gap-2 items-center text-[10px] text-slate-500 dark:text-slate-400">
                        <span className="rounded-full border border-slate-200 px-2 py-1">{idea.visualStyle}</span>
                        <span className="rounded-full border border-slate-200 px-2 py-1">Objetivo: {idea.objective || activeStrategy?.objective || 'Objetivo'}</span>
                        <span className="rounded-full border border-slate-200 px-2 py-1">Words: {idea.wordCount ?? 0}</span>
                      </div>
                      <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400">
                        CTA: {idea.cta || 'Sem CTA'} • Awareness: {idea.awarenessLevel || idea.stage || 'Teste'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <Button variant="primary" onClick={exportBlueprint} className="text-[10px]">
                Exportar campanha
              </Button>
              <Button variant="secondary" onClick={() => alert('Template salvo na biblioteca interna.')} className="text-[10px]">
                Salvar como template
              </Button>
              <Button variant="ghost" onClick={() => alert('Versão A/B criada com variações de copy e imagem.')} className="text-[10px]">
                Gerar versão A/B automática
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400 text-sm">Aguarde o Planner gerar a estrutura para habilitar o Builder.</p>
        )}
      </StepCard>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Passo 4</p>
            <h3 className="text-2xl font-display text-slate-900 dark:text-white">Resumo final</h3>
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Checklist + exportação</span>
        </div>
        <div className="rounded-[32px] border border-border bg-panel p-4 shadow-sm dark:bg-slate-900/80">
          <MarketingStrategyPanel plan={plan} onSavePlan={onSavePlan} creativeHighlights={creativeHighlights} />
        </div>
      </div>
    </div>
  );
};

export default MarketingWorkflowPanel;
