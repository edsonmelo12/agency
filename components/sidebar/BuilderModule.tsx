
import React, { useState, useMemo, useEffect } from 'react';
import { GenerationOptions, PageType, Ebook, VslScript, DesignSystemConfig, Project } from '../../types';
import { Label, Card, Button, TextArea, Toggle } from '../ui/BaseComponents';

interface Props {
  options: GenerationOptions;
  setOptions: (o: GenerationOptions) => void;
  onGenerate: (o: GenerationOptions) => void;
  onInjectAsset: (type: 'ebook' | 'vsl', asset: any) => void;
  isLoading: boolean;
  availableEbooks: Ebook[];
  availableVsl?: VslScript;
  sections: { id: string; type: string }[];
  onRegenerateSection: (sectionId: string, sectionType: string) => void;
  pageVersions: Project[];
  activePageVersionId: string | null;
  onSelectPageVersion: (id: string) => void;
  onCreatePageVersion: () => void;
  onDuplicatePageVersion: (id: string) => void;
  onDeletePageVersion: (id: string) => void;
}

const BuilderModule: React.FC<Props> = ({ 
  options, setOptions, onGenerate, onInjectAsset, isLoading, availableEbooks, availableVsl, sections, onRegenerateSection,
  pageVersions, activePageVersionId, onSelectPageVersion, onCreatePageVersion, onDuplicatePageVersion, onDeletePageVersion
}) => {
  const [showDesignSystem, setShowDesignSystem] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [dsSectionKey, setDsSectionKey] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (showDesignSystem) setShowDesignSystem(false);
      if (selectedSectionId) setSelectedSectionId('');
      if (dsSectionKey) setDsSectionKey('');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showDesignSystem, selectedSectionId, dsSectionKey]);

  const nichePresets = [
    {
      id: 'auto' as const,
      label: 'Auto',
      config: {}
    },
    {
      id: 'artesanato' as const,
      label: 'Artesanato',
      config: {
        primaryColor: '#f97316',
        secondaryColor: '#0ea5e9',
        backgroundColor: 'light' as const,
        visualPreset: 'agency-premium' as const,
        fontPair: 'Elegant' as const,
        designSystem: {
          segment: 'Artesanato',
          style: 'lúdico, colorido, artesanal, badges e selos',
          globalRules: 'Use blocos arredondados, sombras suaves, badges/selos e ilustrações simples. Priorize visual e sensação handmade.',
          segmentSystem: 'Paleta vibrante com coral/laranja + azul céu + verde menta. Tipografia amigável e legível. Use cards com bordas suaves e micro-selos.',
          projectOverride: ''
        }
      }
    },
    {
      id: 'saude-mental' as const,
      label: 'Saúde Mental',
      config: {
        primaryColor: '#0f766e',
        secondaryColor: '#38bdf8',
        backgroundColor: 'dark' as const,
        visualPreset: 'agency-premium' as const,
        fontPair: 'Modern' as const,
        designSystem: {
          segment: 'Saúde Mental',
          style: 'calmo, confiável, editorial leve, respirável',
          globalRules: 'Use espaçamentos generosos, contraste suave e elementos de apoio discretos. Evite ruído visual.',
          segmentSystem: 'Paleta serena com azul profundo + verde/teal. Tipografia limpa, headlines fortes e corpo legível.',
          projectOverride: ''
        }
      }
    }
  ];

  const presetOptions = [
    { id: 'agency-premium', label: 'Agency Premium' },
    { id: 'standard', label: 'Essencial' }
  ];
  const scaleOptions = [
    { id: 'compact', label: 'Compacto' },
    { id: 'balanced', label: 'Equilibrado' },
    { id: 'large', label: 'Amplo' }
  ];

  const scaleLabel = options.visualScale === 'compact'
    ? 'Compacto'
    : options.visualScale === 'large'
      ? 'Amplo'
      : 'Equilibrado';

  const designSystem: DesignSystemConfig = options.designSystem || {
    segment: '',
    style: '',
    strength: 'medium',
    globalRules: '',
    segmentSystem: '',
    projectOverride: '',
    sectionOverrides: {}
  };

  const updateDesignSystem = (patch: Partial<DesignSystemConfig>) => {
    const next = {
      ...designSystem,
      ...patch,
      sectionOverrides: {
        ...(designSystem.sectionOverrides || {}),
        ...(patch.sectionOverrides || {})
      }
    };
    setOptions({ ...options, designSystem: next });
  };

  const applyNichePreset = (presetId: 'auto' | 'artesanato' | 'saude-mental') => {
    const preset = nichePresets.find((p) => p.id === presetId);
    if (!preset) return;
    if (presetId === 'auto') {
      setOptions({
        ...options,
        designSystem: {
          ...designSystem,
          nichePreset: 'auto'
        }
      });
      return;
    }
    setOptions({
      ...options,
      primaryColor: preset.config.primaryColor || options.primaryColor,
      secondaryColor: preset.config.secondaryColor || options.secondaryColor,
      backgroundColor: preset.config.backgroundColor || options.backgroundColor,
      visualPreset: preset.config.visualPreset || options.visualPreset,
      fontPair: preset.config.fontPair || options.fontPair,
      designSystem: {
        ...designSystem,
        segment: preset.config.designSystem?.segment || designSystem.segment,
        style: preset.config.designSystem?.style || designSystem.style,
        globalRules: preset.config.designSystem?.globalRules || designSystem.globalRules,
        segmentSystem: preset.config.designSystem?.segmentSystem || designSystem.segmentSystem,
        projectOverride: preset.config.designSystem?.projectOverride || designSystem.projectOverride,
        nichePreset: presetId
      }
    });
  };

  const sectionTypes = useMemo(() => {
    const unique = new Set(sections.map((s) => s.type));
    return Array.from(unique).sort();
  }, [sections]);

  const orderedVersions = useMemo(() => {
    return [...pageVersions].sort((a, b) => (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt));
  }, [pageVersions]);

  const dsOverrideValue = dsSectionKey
    ? (designSystem.sectionOverrides?.[dsSectionKey] || '')
    : '';

  const dsCommand = designSystem.segment || designSystem.style
    ? `python3 skills/ui-ux-pro-max/scripts/search.py "${designSystem.segment} ${designSystem.style} landing page" --design-system -f markdown`
    : '';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
      <Card color="slate">
        <Label color="slate">Layout & Estilo</Label>
        
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate uppercase">Tema da Página</span>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
            {[
              { id: 'light', label: 'Claro', icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3' },
              { id: 'dark', label: 'Escuro', icon: 'M20.354 15.354A9 9 0 018.646 3.646' },
              { id: 'neutral', label: 'Neutro', icon: 'M12 8v4l3 3m6-3' }
            ].map(theme => (
              <button 
                key={theme.id}
                onClick={() => setOptions({...options, backgroundColor: theme.id as any})}
                className={`flex-1 py-2 rounded-lg flex flex-col items-center justify-center gap-1 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${options.backgroundColor === theme.id ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate hover:text-slate'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={theme.icon} /></svg>
                <span className="text-[9px] font-black uppercase">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate uppercase">Nicho Visual</span>
          <div className="grid grid-cols-3 gap-2">
            {nichePresets.map((preset) => (
              <button
                key={preset.id}
                onClick={() => applyNichePreset(preset.id)}
                className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  (designSystem.nichePreset || 'auto') === preset.id
                    ? 'bg-white dark:bg-slate-700 text-primary dark:text-white border-primary'
                    : 'bg-transparent text-slate border-border dark:border-slate-700'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {!designSystem.segment && !designSystem.style && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Preset Visual</span>
            <div className="grid grid-cols-2 gap-2">
              {presetOptions.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setOptions({ ...options, visualPreset: preset.id as any })}
                  className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    options.visualPreset === preset.id
                      ? 'bg-white dark:bg-slate-700 text-primary dark:text-white border-primary'
                      : 'bg-transparent text-slate border-border dark:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate uppercase">Escala Visual</span>
          <div className="grid grid-cols-3 gap-2">
            {scaleOptions.map((scale) => (
              <button
                key={scale.id}
                onClick={() => setOptions({ ...options, visualScale: scale.id as any })}
                className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  options.visualScale === scale.id
                    ? 'bg-white dark:bg-slate-700 text-primary dark:text-white border-primary'
                    : 'bg-transparent text-slate border-border dark:border-slate-700'
                }`}
              >
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate uppercase">Ousadia Visual</span>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'low', label: 'Baixa' },
              { id: 'medium', label: 'Média' },
              { id: 'high', label: 'Alta' }
            ].map((level) => (
              <button
                key={level.id}
                onClick={() => {
                  const nextStrength = level.id === 'low' ? 'light' : level.id === 'high' ? 'strong' : 'medium';
                  setOptions({
                    ...options,
                    creativeFreedom: level.id as any,
                    designSystem: {
                      ...designSystem,
                      strength: nextStrength as any
                    }
                  });
                }}
                className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  (options.creativeFreedom || 'medium') === level.id
                    ? 'bg-white dark:bg-slate-700 text-primary dark:text-white border-primary'
                    : 'bg-transparent text-slate border-border dark:border-slate-700'
                }`}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate uppercase">Autor (Layout)</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'fixed', label: 'Seguro' },
              { id: 'free', label: 'Livre' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setOptions({ ...options, authorLayoutMode: mode.id as any })}
                className={`py-2 rounded-lg text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                  (options.authorLayoutMode || 'fixed') === mode.id
                    ? 'bg-white dark:bg-slate-700 text-primary dark:text-white border-primary'
                    : 'bg-transparent text-slate border-border dark:border-slate-700'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
          <p className="text-[9px] text-slate leading-relaxed">
            "Livre" permite variações visuais no autor (mantendo foto, nome e bio).
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Primária</span>
            <input type="color" value={options.primaryColor} onChange={e => setOptions({...options, primaryColor: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer bg-white border p-1" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate uppercase">Destaque</span>
            <input type="color" value={options.secondaryColor} onChange={e => setOptions({...options, secondaryColor: e.target.value})} className="w-full h-10 rounded-lg cursor-pointer bg-white border p-1" />
          </div>
        </div>

        <div className="mt-4 p-4 rounded-2xl border border-border bg-panel">
          <div className="text-[9px] font-black uppercase tracking-widest text-slate mb-2">Escala Visual Ativa</div>
          <div className="text-[10px] font-black text-ink">{scaleLabel}</div>
        </div>
      </Card>

      <Card color="slate">
        <div className="flex items-center justify-between mb-2">
          <Label color="slate">Design System (IA)</Label>
          <Toggle checked={showDesignSystem} onChange={setShowDesignSystem} />
        </div>
        <p className="text-[10px] font-bold text-slate leading-relaxed uppercase">
          Segmento + estilo aplicam a camada visual do projeto.
        </p>

        {showDesignSystem && (
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-slate">Segmento</span>
                <input
                  value={designSystem.segment}
                  onChange={(e) => updateDesignSystem({ segment: e.target.value })}
                  className="w-full rounded-lg border border-border p-2 text-[10px] font-bold text-slate"
                  placeholder="ex: saúde, fintech"
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-black uppercase text-slate">Estilo</span>
                <input
                  value={designSystem.style}
                  onChange={(e) => updateDesignSystem({ style: e.target.value })}
                  className="w-full rounded-lg border border-border p-2 text-[10px] font-bold text-slate"
                  placeholder="ex: editorial, dark"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { id: 'light', label: 'Leve' },
                { id: 'medium', label: 'Médio' },
                { id: 'strong', label: 'Forte' }
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => updateDesignSystem({ strength: mode.id as any })}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    (designSystem.strength || 'medium') === mode.id
                      ? 'bg-slate-800 text-white border-slate-800'
                      : 'bg-white text-slate border-border'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {dsCommand && (
              <div className="rounded-lg border border-border bg-panel p-3 text-[9px] text-slate">
                <div className="font-black uppercase tracking-widest text-slate mb-1">Comando sugerido</div>
                <code className="break-all">{dsCommand}</code>
              </div>
            )}

            <div className="space-y-3">
              <TextArea
                value={designSystem.segmentSystem}
                onChange={(e) => updateDesignSystem({ segmentSystem: e.target.value })}
                className="h-24 text-[10px]"
                placeholder="Cole aqui o Design System do segmento..."
              />
              <TextArea
                value={designSystem.projectOverride}
                onChange={(e) => updateDesignSystem({ projectOverride: e.target.value })}
                className="h-20 text-[10px]"
                placeholder="Override do projeto (opcional)..."
              />
            </div>

            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase text-slate">Override por Seção</div>
              <select
                value={dsSectionKey}
                onChange={(e) => setDsSectionKey(e.target.value)}
                className="w-full rounded-lg border border-border p-2 text-[10px] font-bold text-slate"
              >
                <option value="">Selecione a seção</option>
                {sectionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
              <TextArea
                value={dsOverrideValue}
                onChange={(e) => {
                  if (!dsSectionKey) return;
                  updateDesignSystem({ sectionOverrides: { [dsSectionKey]: e.target.value } as any });
                }}
                className="h-20 text-[10px]"
                placeholder="Override específico para esta seção..."
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    if (!dsSectionKey) return;
                    const next = { ...(designSystem.sectionOverrides || {}) };
                    delete next[dsSectionKey];
                    updateDesignSystem({ sectionOverrides: next });
                  }}
                  disabled={!dsSectionKey}
                >
                  Limpar Override
                </Button>
              </div>
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => updateDesignSystem({ segment: '', style: '', strength: 'medium', segmentSystem: '', projectOverride: '', sectionOverrides: {} })}
            >
              Limpar Design System
            </Button>
          </div>
        )}
      </Card>

      <Card color="slate">
        <Label color="slate">Galeria de PVs</Label>
        <p className="text-[10px] font-bold text-slate leading-relaxed uppercase">
          Crie versões para testar ângulos e layouts sem perder a página atual.
        </p>
        <Button
          variant="secondary"
          className="w-full"
          onClick={onCreatePageVersion}
          disabled={isLoading}
        >
          + Nova versão
        </Button>
        <div className="space-y-2">
          {orderedVersions.length === 0 && (
            <div className="text-[10px] text-slate">
              Nenhuma versão criada. Gere uma página para começar.
            </div>
          )}
          {orderedVersions.map((version) => {
            const isActive = version.id === activePageVersionId;
            const stamp = new Date(version.updatedAt || version.createdAt).toLocaleString('pt-BR');
            return (
              <div
                key={version.id}
                className={`rounded-xl border p-3 flex flex-col gap-2 ${
                  isActive ? 'border-primary bg-blue-500/10' : 'border-slate-700'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onSelectPageVersion(version.id)}
                  className="text-left"
                >
                  <div className="text-[11px] font-black text-white">
                    {version.versionName || version.name}
                  </div>
                  <div className="text-[9px] text-slate">{stamp}</div>
                </button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="text-[9px] px-3 py-2"
                    onClick={() => onDuplicatePageVersion(version.id)}
                  >
                    Duplicar
                  </Button>
                  <Button
                    variant="danger"
                    className="text-[9px] px-3 py-2"
                    onClick={() => onDeletePageVersion(version.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card color="indigo">
        <Label color="indigo">Reconstruir Seção (CRO)</Label>
        <p className="text-[10px] font-bold text-slate leading-relaxed uppercase">
          Reescreve apenas uma seção com regras de conversão e layout seguro.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { id: 'full', label: 'Tudo' },
            { id: 'copy', label: 'Só texto' },
            { id: 'layout', label: 'Só layout' },
            { id: 'style', label: 'Harmonizar estilo' }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setOptions({ ...options, regenMode: mode.id as any })}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                (options.regenMode || 'full') === mode.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-slate border-border'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          className="w-full mt-2 p-3 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-[10px] font-black uppercase text-slate"
        >
          <option value="">Selecione uma seção</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.type.toUpperCase()} • {s.id.slice(0, 6)}
            </option>
          ))}
        </select>
        <Button
          variant="secondary"
          onClick={() => {
            const found = sections.find((s) => s.id === selectedSectionId);
            if (!found) return;
            onRegenerateSection(found.id, found.type);
          }}
          disabled={isLoading || !selectedSectionId}
          className="w-full mt-3"
        >
          {isLoading ? 'Reconstruindo...' : 'Reconstruir Seção'}
        </Button>
      </Card>

      {availableVsl || availableEbooks.length > 0 ? (
        <Card color="emerald">
          <Label color="emerald">Sincronizar Ativos do Funil</Label>
          <div className="grid grid-cols-1 gap-2">
            {availableVsl && (
              <button 
                onClick={() => onInjectAsset('vsl', availableVsl)}
                disabled={isLoading}
                className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-xl text-left hover:border-indigo-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" /></svg>
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-primary">Vídeo VSL</p>
                       <p className="text-[10px] font-bold text-slate dark:text-slate-300">Injetar Seção de Vídeo</p>
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
                className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-left hover:border-emerald-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              >
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center">
                       <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9 4.804A7.993 7.993 0 0112 4c1.24 0 2.413.283 3.465.789a.4.4 0 01.135.545V15.71a.4.4 0 01-.545.135A7.993 7.993 0 0012 15a7.993 7.993 0 00-3 1c-1.24 0-2.413-.283-3.465-.789a.4.4 0 01-.135-.545V5.334a.4.4 0 01.545-.135A7.993 7.993 0 009 4.804z" /></svg>
                    </div>
                    <div>
                       <p className="text-[9px] font-black uppercase text-emerald-600">Isca Digital / Bônus</p>
                       <p className="text-[10px] font-bold text-slate dark:text-slate-300 truncate max-w-[150px]">{ebook.title}</p>
                    </div>
                 </div>
                 <span className="text-xl">+</span>
              </button>
            ))}
          </div>
        </Card>
      ) : null}

      <Card color="slate">
        <div className="flex items-center justify-between mb-2">
          <Label color="slate">Brief do Negócio</Label>
        </div>
        <TextArea 
          value={options.prompt} 
          onChange={e => setOptions({...options, prompt: e.target.value})} 
          className="h-32" 
          placeholder="Descreva produto, público, promessa e tom. Evite descrever a estrutura da página." 
        />
      </Card>

      <Button 
        onClick={() => onGenerate(options)} 
        disabled={isLoading}
        className="w-full py-6 text-base font-black"
      >
        {isLoading ? 'IA Construindo...' : 'Gerar Página Completa'}
      </Button>
    </div>
  );
};

export default BuilderModule;
