
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import PreviewPanel from './components/PreviewPanel';
import StudioPanel from './components/StudioPanel';
import BookPanel from './components/BookPanel';
import VslPanel from './components/VslPanel';
import MarketingWorkflowPanel from './components/MarketingWorkflowPanel';
import { 
  GenerationOptions, Section, ActiveElement, Project, 
  PageType, MarketingSettings, SeoSettings, Producer, ProductInfo, StudioImage, ImageFallbackReason, VisualStyle, ImageAspectRatio, ImageExportFormat,
  Ebook, VslScript, AssetPreset, EbookConfig, PaidCampaignInput, PaidCampaignPlan, CreativeIdea, BuilderPlan, CampaignSegment, StrategySuggestion, AiFallbackLog, AiPlanResult
} from './types';
import { generateLandingPage, generateStudioImage, generateBookOutline, generateChapterContent, reviewChapterContent, generateVslScript, refineLandingPageContent, injectAssetIntoPage, generateCreativeCampaign, generateSeoFromSections, generateMarketingIdeas, generatePaidAdsPlan, generatePaidCampaignStrategy, regenerateSectionWithCRO, hydrateSectionContent, ApiKeyLeakDetail } from './services/genaiClient';
import { getAllExperts, getProductsByExpert, getProjectsByProduct, saveProject, deleteProject, getAllStudioImages, saveStudioImage, deleteStudioImage, saveEbook, getEbooksByProduct, saveProduct, saveExpert, deleteEbook, saveVslScript, getVslScriptsByProduct, openDB, clearAllData } from './services/dbService';

type NavModule = 'strategy' | 'product' | 'builder' | 'analytics' | 'studio' | 'ebook' | 'vsl' | 'library' | 'marketing';

const formatMarketingError = (error: unknown) => {
  if (!error) return 'Falha ao gerar o plano de campanha.';
  if (typeof error === 'string') {
    return error.toLowerCase().includes('quota') ? 'Cota da API excedida. Aguarde alguns minutos.' : error;
  }
  const err = error as any;
  const message = err.message || (err.error && err.error.message) || '';
  const lower = message.toLowerCase();
  if (err?.code === 429 || err?.status === 429 || lower.includes('quota exceeded') || lower.includes('resource_exhausted')) {
    return 'Cota da API excedida. Aguarde alguns minutos ou valide suas credenciais.';
  }
  if (message) {
    return `Falha ao gerar o plano: ${message}`;
  }
  return 'Falha ao gerar o plano de campanha.';
};

// Extend window for AI Studio helpers
declare global {
  // Use the AIStudio interface name as expected by the environment to avoid re-declaration conflicts
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    // Fix: Removed readonly to ensure identical modifiers with the environment's declaration of aistudio
    aistudio: AIStudio;
  }
}

const STRATEGY_SUGGESTIONS: StrategySuggestion[] = [
  {
    id: 'topo-curiosity',
    stage: 'Topo',
    title: 'Topo – Curiosidade guiada',
    objective: 'Consciência (Traffic)',
    summary: 'Vídeo curto narrando solução + carrossel conceitual para despertar curiosidade.',
    segments: [
      { name: 'BROAD', focus: 'Brasil • 25-55 • Artesanato & DIY', budget: 'R$ 9 / dia' },
      { name: 'LOOKALIKE', focus: 'Lookalike 1% dos visitantes da home', budget: 'R$ 7 / dia' }
    ],
    metrics: ['CTR ≥ 2.5%', 'View rate ≥ 40%'],
    tags: ['emotional', 'storytelling'],
    creative: {
      headline: 'Descubra o método que salva horas de artesanato',
      body: 'Vídeo de 30s com dor→solução e corte rápido de prova visual.',
      cta: 'Conhecer o método'
    },
    budgetPerDay: 16,
    utmTemplate: 'utm_campaign=topo-curiosity&utm_medium=paid',
    checklistAdditions: ['Criar texto educacional', 'Adicionar legenda com benefício']
  },
  {
    id: 'meio-authority',
    stage: 'Meio',
    title: 'Meio – Autoridade e comparação',
    objective: 'Consideração (Engagement)',
    summary: 'Comparativo com concorrentes + depoimento com dados para acelerar confiança.',
    segments: [
      { name: 'CUSTOM', focus: 'Engajamento de vídeo + leads quentes', budget: 'R$ 12 / dia' },
      { name: 'LOOKALIKE', focus: 'Lookalike 2% dos compradores', budget: 'R$ 8 / dia' }
    ],
    metrics: ['Tempo médio ≥ 45s', 'CTR ≥ 3%'],
    tags: ['authority', 'comparison'],
    creative: {
      headline: 'Veja por que Sara ensina o método que chefs não revelam',
      body: 'Depoimento com número de alunos e bullets comparando resultados.',
      cta: 'Ver comparação'
    },
    budgetPerDay: 28,
    utmTemplate: 'utm_campaign=meio-authority&utm_medium=paid',
    checklistAdditions: ['Incluir prova social', 'Adicionar comparação visual']
  },
  {
    id: 'fundo-urgency',
    stage: 'Fundo',
    title: 'Fundo – Prova + urgência',
    objective: 'Conversão (Purchase)',
    summary: 'Remarketing com oferta direta, escassez controlada e prova social curta.',
    segments: [
      { name: 'REMARKETING', focus: '14 dias • visitas + leads', budget: 'R$ 15 / dia' },
      { name: 'BROAD', focus: 'Lookalike alto valor + carrinhos', budget: 'R$ 12 / dia' }
    ],
    metrics: ['CPA ≤ objetivo', 'ROAS ≥ 3'],
    tags: ['direct', 'urgency'],
    creative: {
      headline: 'Últimas vagas com garantia estendida',
      body: 'Oferta direta com prova visual e preço + garantia de 7 dias.',
      cta: 'Garantir vaga'
    },
    budgetPerDay: 27,
    utmTemplate: 'utm_campaign=fundo-urgency&utm_medium=paid',
    checklistAdditions: ['Adicionar garantia', 'Mostrar escassez']
  }
];

const safeLocalStorage = {
  read(key: string, fallback: string | null = null) {
    if (typeof window === 'undefined') return fallback;
    try {
      return window.localStorage?.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },
  write(key: string, value: string) {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage?.setItem(key, value);
    } catch {
      // ignore
    }
  }
};

const parseBudgetValue = (budget?: string): number => {
  if (!budget) return 30;
  const normalized = budget.replace(/\s/g, '').replace(/[^\d,\.]/g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 30;
};

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'campanha';

const buildBuilderPlan = (
  plan: PaidCampaignPlan,
  input: PaidCampaignInput,
  provider: 'Gemini' | 'OpenRouter' | 'Unknown',
  note?: string,
  strategy?: StrategySuggestion
): BuilderPlan => {
  const baseBudget = Math.max(parseBudgetValue(input.budget), 20);
  const headline = plan.copy?.headline || plan.summary || input.objective;
  const shortHeadline = headline
    .split(' ')
    .slice(0, 4)
    .join(' ')
    .trim();
  const campaignName = `CBO - Conversão - ${shortHeadline || input.objective}`;
  const segments = [
    { name: 'BROAD', focus: 'Brasil • 25-55 • Interesses amplos', budget: `${formatCurrency(baseBudget * 0.45)} / dia` },
    { name: 'LOOKALIKE', focus: 'Lookalike 1% dos compradores + leads quentes', budget: `${formatCurrency(baseBudget * 0.3)} / dia` },
    { name: 'REMARKETING', focus: 'Remarketing 14 dias • tráfego recente', budget: `${formatCurrency(baseBudget * 0.25)} / dia` }
  ];
  const simulations = [
    { label: 'Fase 1 (teste)', budget: `${formatCurrency(baseBudget)} / dia`, cpcEstimate: 'R$3,80' },
    { label: 'Escala +50%', budget: `${formatCurrency(baseBudget * 1.5)} / dia`, cpcEstimate: 'R$3,45' }
  ];
  const utmTemplate = strategy?.utmTemplate || `utm_campaign=${slugify(plan.summary || headline)}&utm_source=${(input.channel || 'meta').toLowerCase()}&utm_medium=paid`;
  const checklist = [
    ...plan.checklist.slice(0, 4),
    'UTMs configuradas',
    'Criativos aprovados',
    'Segmentos monitorados',
    ...(strategy?.checklistAdditions || [])
  ];
  const effectiveSegments = strategy?.segments || segments;
  const effectiveBudget = strategy ? `${formatCurrency(strategy.budgetPerDay)} / dia` : `${formatCurrency(baseBudget)} / dia`;
  const providerConfidence = Math.min(95, provider === 'Gemini' ? 90 : 84);
  return {
    campaignName,
    objective: input.objective,
    budgetPerDay: effectiveBudget,
    segments: effectiveSegments,
    checklist,
    simulations,
    utmTemplate,
    providerName: provider,
    providerConfidence,
    note: strategy?.title || note
  };
};

const defaultGenerationOptions: GenerationOptions = {
  pageType: PageType.SALES,
  primaryColor: '#2563eb',
  secondaryColor: '#f59e0b',
  backgroundColor: 'dark',
  fontPair: 'Modern',
  tone: 'Persuasive',
  visualPreset: 'agency-premium',
  visualScale: 'balanced',
  prompt: '',
  referenceUrl: '',
  regenMode: 'full',
  creativeFreedom: 'medium',
  authorLayoutMode: 'fixed',
  designSystem: {
    segment: '',
    style: '',
    strength: 'medium',
    globalRules: '',
    segmentSystem: '',
    projectOverride: '',
    sectionOverrides: {},
    nichePreset: 'auto'
  },
  extractionFlags: { structure: true, copy: true, colors: true }
};

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<NavModule>('strategy');
  const [uiTheme, setUiTheme] = useState<'light' | 'dark'>(() => (safeLocalStorage.read('lb_ui_theme', 'dark') as 'light' | 'dark'));
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [activeExpert, setActiveExpert] = useState<Producer | null>(null);
  const [activeProduct, setActiveProduct] = useState<ProductInfo | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [projectVersions, setProjectVersions] = useState<Project[]>([]);

  const [editingExpert, setEditingExpert] = useState<Producer | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductInfo | null>(null);

  const [sections, setSections] = useState<Section[]>([]);
  const [variationSections, setVariationSections] = useState<Section[]>([]);
  const [studioImages, setStudioImages] = useState<StudioImage[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [activeEbookId, setActiveEbookId] = useState<string | null>(null);
  const [vslScript, setVslScript] = useState<VslScript | null>(null);
  const [marketingPlan, setMarketingPlan] = useState<PaidCampaignPlan | null>(null);
  const [paidCampaignInput, setPaidCampaignInput] = useState<PaidCampaignInput | null>(null);
  const [marketingPlanProvider, setMarketingPlanProvider] = useState<'Gemini' | 'OpenRouter' | 'Unknown'>('Gemini');
  const [creativeIdeas, setCreativeIdeas] = useState<CreativeIdea[]>([]);
  const [builderPlan, setBuilderPlan] = useState<BuilderPlan | null>(null);
  const [builderNote, setBuilderNote] = useState<string | undefined>(undefined);
  const [isGeneratingCreatives, setIsGeneratingCreatives] = useState(false);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(STRATEGY_SUGGESTIONS[0]?.id || '');
  const [marketingError, setMarketingError] = useState<string | null>(null);
  const [fallbackLog, setFallbackLog] = useState<AiFallbackLog | null>(null);
  const [isFallbackDetailsOpen, setFallbackDetailsOpen] = useState(false);

  const [marketing, setMarketing] = useState<MarketingSettings>({ metaPixelId: '', googleAnalyticsId: '' });
  const [seo, setSeo] = useState<SeoSettings>({ title: '', description: '', keywords: '' });
  const [currentOptions, setCurrentOptions] = useState<GenerationOptions>(defaultGenerationOptions);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activeElement, setActiveElement] = useState<ActiveElement | null>(null);
  
  const saveTimeoutRef = useRef<number | null>(null);
  const selectedStrategy = useMemo(
    () => STRATEGY_SUGGESTIONS.find((strategy) => strategy.id === selectedStrategyId) || null,
    [selectedStrategyId]
  );

  useEffect(() => {
    if (!marketingPlan || !paidCampaignInput) {
      setBuilderPlan(null);
      return;
    }
    const plan = buildBuilderPlan(
      marketingPlan,
      paidCampaignInput,
      marketingPlanProvider,
      builderNote,
      selectedStrategy || undefined
    );
    setBuilderPlan(plan);
  }, [marketingPlan, paidCampaignInput, marketingPlanProvider, builderNote, selectedStrategy]);

  const buildProjectOptions = () => ({
    ...currentOptions,
    marketing,
    seo,
    marketingPlan,
    paidCampaignInput,
    marketingPlanProvider,
    selectedStrategyId,
    builderNote
  });

  useEffect(() => {
    const init = async () => {
      try {
        const experts = await getAllExperts();
        const savedExpertId = safeLocalStorage.read('lb_active_expert_id', '');
        if (experts.length > 0) {
          const found = experts.find(e => e.id === savedExpertId);
          setActiveExpert(found || experts[0]);
        }
        const imgs = await getAllStudioImages();
        setStudioImages(imgs.sort((a,b) => b.timestamp - a.timestamp));
      } catch (err) {
        console.error("Erro na inicialização:", err);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (activeExpert) {
      safeLocalStorage.write('lb_active_expert_id', activeExpert.id);
      const savedProductId = safeLocalStorage.read('lb_active_product_id', '');
      
      getProductsByExpert(activeExpert.id).then(prods => {
        if (prods.length > 0) {
          const found = prods.find(p => p.id === savedProductId);
          setActiveProduct(found || prods[0]);
        } else {
          setActiveProduct(null);
        }
      });
    }
  }, [activeExpert]);

  const getDefaultVersionName = () => {
    const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ');
    return `Versão ${stamp}`;
  };

  const mergeProjectOptions = (proj: Project) => {
    if (!proj.options) return null;
    return {
      ...defaultGenerationOptions,
      ...proj.options,
      designSystem: {
        ...defaultGenerationOptions.designSystem,
        ...(proj.options.designSystem || {}),
        sectionOverrides: {
          ...(defaultGenerationOptions.designSystem?.sectionOverrides || {}),
          ...(proj.options.designSystem?.sectionOverrides || {})
        }
      },
      extractionFlags: {
        ...defaultGenerationOptions.extractionFlags,
        ...(proj.options.extractionFlags || {})
      }
    } as GenerationOptions;
  };

  const describeImageFallback = (reason?: ImageFallbackReason) => {
    if (!reason) return '';
    const labels: Record<ImageFallbackReason, string> = {
      quota: ' - modo leve (cota)',
      model: ' - modelo alternativo',
      reference: ' - versão sem referência',
      other: ' - fallback'
    };
    return labels[reason] || '';
  };

  const applyProject = (proj: Project | null) => {
    if (!proj) {
      setActiveProject(null);
      setSections([]);
      setMarketingPlan(null);
      setPaidCampaignInput(null);
      setMarketingPlanProvider('Gemini');
      setBuilderPlan(null);
      setBuilderNote(undefined);
      setCreativeIdeas([]);
      return;
    }

    setActiveProject(proj);
    setSections(proj.sections);

    const mergedOptions = mergeProjectOptions(proj);
    if (mergedOptions) {
      setCurrentOptions(mergedOptions);
      if (proj.options?.marketing) setMarketing(proj.options.marketing);
      if (proj.options?.seo) setSeo(proj.options.seo);
      const storedPlan = proj.options?.marketingPlan || null;
      const storedInput = proj.options?.paidCampaignInput || null;
      const provider = proj.options?.marketingPlanProvider || 'Gemini';
      setMarketingPlanProvider(provider);
      setPaidCampaignInput(storedInput);
      setMarketingPlan(storedPlan);
      setBuilderNote(proj.options?.builderNote);
      setSelectedStrategyId(proj.options?.selectedStrategyId || STRATEGY_SUGGESTIONS[0]?.id || '');
      setCreativeIdeas([]);
    }
  };

  useEffect(() => {
    if (activeProduct) {
      safeLocalStorage.write('lb_active_product_id', activeProduct.id);
      getEbooksByProduct(activeProduct.id).then(setEbooks);
      getVslScriptsByProduct(activeProduct.id).then(scripts => {
        setVslScript(scripts && scripts.length > 0 ? scripts[0] : null);
      });
      
      getProjectsByProduct(activeProduct.id).then(projs => {
        if (projs.length > 0) {
          const sorted = [...projs].sort((a, b) => (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt));
          setProjectVersions(sorted);
          const primary = sorted.find(p => p.isPrimary);
          const latestProj = sorted[sorted.length - 1];
          const selected = primary || latestProj;
          applyProject(selected || null);
        } else {
          setProjectVersions([]);
          setSections([]);
          setActiveProject(null);
        }
      });
    } else {
      setEbooks([]);
      setSections([]);
      setVslScript(null);
      setProjectVersions([]);
    }
  }, [activeProduct]);

  const checkApiKey = async () => {
    if (window.aistudio && !(await window.aistudio.hasSelectedApiKey())) {
      await window.aistudio.openSelectKey();
      return true; // Proceed assuming selection success or user will try again
    }
    return true;
  };

  const handleSaveProject = async (overrideSections?: Section[]) => {
    if (!activeProduct) return;
    const finalSections = overrideSections || sections;
    const versionName = activeProject?.versionName || getDefaultVersionName();
    const project: Project = {
      id: activeProject?.id || `proj-${Date.now()}`, 
      productId: activeProduct.id, 
      name: `Funil: ${activeProduct.name}`,
      versionName,
      isPrimary: activeProject?.isPrimary ?? (projectVersions.length === 0),
      sections: finalSections, 
      options: buildProjectOptions(),
      createdAt: activeProject?.createdAt || Date.now(), 
      updatedAt: Date.now()
    };
    try {
      await saveProject(project);
      setActiveProject(project);
      setProjectVersions(prev => {
        const next = prev.filter(p => p.id !== project.id).concat(project);
        next.sort((a, b) => (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt));
        return next;
      });
      setSaveMessage("✅ Alterações Salvas");
    } catch (e) {
      setSaveMessage("❌ Erro ao Salvar");
    }
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const debouncedSaveProject = (nextSections: Section[]) => {
    if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = window.setTimeout(() => {
      handleSaveProject(nextSections);
    }, 1500);
  };

  const selectPageVersion = (id: string) => {
    const target = projectVersions.find(p => p.id === id);
    if (!target) return;
    applyProject(target);
  };

  const createPageVersion = async (name?: string, source?: Project | null) => {
    if (!activeProduct) return;
    const now = Date.now();
    const versionName = name || getDefaultVersionName();
    const base = source || activeProject;
    const projectOptions = base?.options ? { ...base.options, ...buildProjectOptions() } : buildProjectOptions();
    const project: Project = {
      id: `proj-${now}`,
      productId: activeProduct.id,
      name: `Funil: ${activeProduct.name}`,
      versionName,
      isPrimary: projectVersions.length === 0,
      sections: base?.sections || sections,
      options: projectOptions,
      createdAt: now,
      updatedAt: now
    };
    try {
      await saveProject(project);
      setProjectVersions(prev => {
        const next = prev.concat(project);
        next.sort((a, b) => (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt));
        return next;
      });
      applyProject(project);
      setSaveMessage("✅ Nova versão criada");
    } catch (e) {
      setSaveMessage("❌ Erro ao criar versão");
    }
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const duplicatePageVersion = async (id: string) => {
    const source = projectVersions.find(p => p.id === id);
    if (!source) return;
    const name = `${source.versionName || 'Versão'} (cópia)`;
    await createPageVersion(name, source);
  };

  const deletePageVersion = async (id: string) => {
    const target = projectVersions.find(p => p.id === id);
    if (!target) return;
    const confirmDelete = window.confirm(`Excluir a versão "${target.versionName || target.name}"?`);
    if (!confirmDelete) return;
    try {
      await deleteProject(id);
      const next = projectVersions.filter(p => p.id !== id);
      setProjectVersions(next);
      if (activeProject?.id === id) {
        const fallback = next.find(p => p.isPrimary) || next[next.length - 1] || null;
        applyProject(fallback);
      }
      setSaveMessage("✅ Versão excluída");
    } catch (e) {
      setSaveMessage("❌ Erro ao excluir versão");
    }
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleSectionUpdate = (id: string, content: string) => {
    const cleanedContent = content
      .replace(/<div[^>]*class=["'][^"']*section-badge[^"']*["'][^>]*>.*?<\/div>/gi, '')
      .replace(/\scontenteditable=["']?true["']?/gi, '')
      .replace(/\sdata-lb-editable=["']?true["']?/gi, '');
    const shouldHydrate = /__EXPERT_|__PRODUCT_|__CHECKOUT_URL__/.test(content);
    const hydratedContent = shouldHydrate && activeExpert && activeProduct
      ? hydrateSectionContent(cleanedContent, activeExpert, activeProduct)
      : cleanedContent;

    const updateList = (list: Section[]) => {
      let updated = false;
      const next = list.map(s => {
        if (s.id !== id) return s;
        updated = true;
        return { ...s, content: hydratedContent };
      });
      return { next, updated };
    };

    const base = updateList(sections);
    const variation = updateList(variationSections);

    if (base.updated) setSections(base.next);
    if (variation.updated) setVariationSections(variation.next);

    if (!base.updated && !variation.updated) return;

    if (!activeProduct) {
      setSaveMessage("⚠️ Selecione uma oferta para salvar");
      setTimeout(() => setSaveMessage(null), 2000);
      return;
    }

    if (base.updated) {
      setActiveProject(prev => prev ? { ...prev, sections: base.next, updatedAt: Date.now() } : prev);
      setSaveMessage("💾 Salvando...");
      debouncedSaveProject(base.next);
      return;
    }

    setSaveMessage("✅ Alteração aplicada na variação");
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const raw = event.target?.result as string;
        if (!raw) return;
        const data = JSON.parse(raw);
        
        setIsLoading(true);
        setSaveMessage("⏳ Restaurando Backup...");
        
        await clearAllData();

        const safeSave = async (list: any[], saveFn: (x: any) => Promise<any>) => {
          if (!list || !Array.isArray(list)) return;
          for (const item of list) {
            if (item && item.id) {
              await saveFn(item).catch(err => console.error(`Erro:`, err));
            }
          }
        };

        await safeSave(data.experts, saveExpert);
        await safeSave(data.products, saveProduct);
        await safeSave(data.projects, saveProject);
        await safeSave(data.studio_images, saveStudioImage);
        await safeSave(data.ebooks, saveEbook);
        await safeSave(data.vsl_scripts, saveVslScript);

        if (data.activeExpertId) safeLocalStorage.write('lb_active_expert_id', data.activeExpertId);
        if (data.activeProductId) safeLocalStorage.write('lb_active_product_id', data.activeProductId);
        if (data.marketing) setMarketing(data.marketing);
        if (data.marketingPlan) setMarketingPlan(data.marketingPlan);
        if (data.marketingPlanProvider) setMarketingPlanProvider(data.marketingPlanProvider);
        if (data.paidCampaignInput) setPaidCampaignInput(data.paidCampaignInput);
        if (data.builderPlan) setBuilderPlan(data.builderPlan);
        if (data.selectedStrategyId) setSelectedStrategyId(data.selectedStrategyId);

        setSaveMessage("📦 Sucesso! Reiniciando...");
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) { 
        alert("Falha na restauração. JSON inválido."); 
        setIsLoading(false);
      } 
    };
    reader.readAsText(file);
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      const db = await openDB();
      const stores = ["experts", "products", "projects", "studio_images", "ebooks", "vsl_scripts"];
      const backup: any = { timestamp: Date.now(), version: "8.0" };
      for (const store of stores) {
        const tx = db.transaction(store, "readonly");
        const req = tx.objectStore(store).getAll();
        backup[store] = await new Promise((res) => { req.onsuccess = () => res(req.result); });
      }
      backup.marketing = marketing;
      backup.marketingPlan = marketingPlan;
      backup.marketingPlanProvider = marketingPlanProvider;
      backup.paidCampaignInput = paidCampaignInput;
      backup.builderPlan = builderPlan;
      backup.selectedStrategyId = selectedStrategyId;
      backup.activeExpertId = activeExpert?.id;
      backup.activeProductId = activeProduct?.id;
      downloadFile(JSON.stringify(backup, null, 2), `backup-full-${Date.now()}.json`, 'application/json');
      setSaveMessage("📦 Exportação Concluída");
    } catch (e) { alert("Erro ao exportar."); } 
    finally { setIsLoading(false); setTimeout(() => setSaveMessage(null), 2000); }
  };

  const handleGeneratePage = async (opts: GenerationOptions) => {
    if (!activeExpert || !activeProduct) return alert("Configure expert e oferta primeiro.");
    await checkApiKey();
    setIsLoading(true);
    try {
      const gen = await generateLandingPage(opts, activeExpert, activeProduct);
      if (gen && gen.length > 0) {
        const filtered = gen.filter(section => {
          if (!section.content) return false;
          const hasText = section.content.replace(/<[^>]*>/g, '').trim().length > 0;
          const hasVisual = /<img|background-image|__PRODUCT_IMAGE__/i.test(section.content);
          return hasText || hasVisual;
        });
        const shouldCreateVersion = activeProject && sections.length > 0
          ? window.confirm("Criar uma nova versão da página antes de substituir a atual?")
          : false;
        if (shouldCreateVersion) {
          const now = Date.now();
          const versionName = getDefaultVersionName();
          const nextProject: Project = {
            id: `proj-${now}`,
            productId: activeProduct.id,
            name: `Funil: ${activeProduct.name}`,
            versionName,
            isPrimary: false,
            sections: [],
            options: buildProjectOptions(),
            createdAt: now,
            updatedAt: now
          };
          setActiveProject(nextProject);
          setProjectVersions(prev => {
            const next = prev.concat(nextProject);
            next.sort((a, b) => (a.updatedAt || a.createdAt) - (b.updatedAt || b.createdAt));
            return next;
          });
        }
        setSections(filtered);
        setActiveModule('builder');
        setTimeout(() => handleSaveProject(filtered), 500);
      }
    } catch (e: any) {
      const message = String(e?.message || '');
      if (/ERR_CONNECTION_CLOSED|Failed to fetch|NetworkError/i.test(message)) {
        alert("Falha de rede ao acessar a IA. Verifique sua conexão ou Brave Shields/DNS e tente novamente.");
      } else if (e?.error?.code === 429 || e?.code === 429 || /quota|rate\s*limit|429/i.test(message)) {
        alert("Você atingiu o limite de uso da API (quota). Verifique seu plano/chave ou aguarde a janela de limite.");
      } else if (e?.error?.code === 503 || e?.code === 503 || /overloaded|unavailable|503/i.test(message)) {
        alert("O modelo está sobrecarregado no momento. Tente novamente em alguns minutos.");
      } else {
        console.error("Erro na geração:", e);
        alert(`Erro na geração. ${message || 'Tente novamente.'}`);
      }
    }
    finally { setIsLoading(false); }
  };

  const handleGenerateBook = async (title: string, topic: string, author: string, config: EbookConfig) => {
    if (!activeProduct) return;
    await checkApiKey();
    setIsLoading(true);
    try {
      const outline = await generateBookOutline(title, topic, author, activeProduct, config);
      const newBook: Ebook = {
        id: `ebook-${Date.now()}`,
        productId: activeProduct.id,
        title: outline.title || title,
        author: outline.author || author,
        introduction: outline.introduction || '',
        conclusion: outline.conclusion || '',
        chapters: (outline.chapters || []).map((ch: any) => ({
          ...ch,
          id: ch.id || `ch-${Math.random().toString(36).substring(2, 11)}`,
          status: 'pending',
          content: ch.content || '',
          notes: ch.notes || '',
          layout: ch.layout || 'standard',
          exerciseRequired: typeof ch.exerciseRequired === 'boolean' ? ch.exerciseRequired : undefined
        })),
        coverPrompt: outline.coverPrompt || '',
        config,
        visualSettings: outline.visualSettings || {
          fontFamily: 'sans',
          theme: 'clean',
          accentColor: '#2563eb'
        },
        updatedAt: Date.now()
      };
      await saveEbook(newBook);
      setEbooks(prev => [...prev, newBook]);
      setActiveEbookId(newBook.id);
      setActiveModule('ebook');
      setSaveMessage("📚 E-book estruturado!");
    } catch (e) {
      console.error("Erro ao gerar e-book:", e);
      alert("Erro ao estruturar e-book. Tente novamente.");
    } finally {
      setIsLoading(false);
      setTimeout(() => setSaveMessage(null), 2000);
    }
  };

  const handleReviewChapter = async (bookId: string, chapterId: string) => {
    if (!activeExpert || !activeProduct) return alert("Selecione expert e oferta.");
    const book = ebooks.find(b => b.id === bookId);
    if (!book) return;
    await checkApiKey();
    setIsLoading(true);
    try {
      if (chapterId === 'intro') {
        const next = await reviewChapterContent(book.title, 'Introdução', book.introduction, activeExpert, activeProduct, book.config, false);
        const updated = { ...book, introduction: next };
        await saveEbook(updated);
        setEbooks(prev => prev.map(b => b.id === bookId ? updated : b));
      } else if (chapterId === 'conclusion') {
        const next = await reviewChapterContent(book.title, 'Conclusão', book.conclusion, activeExpert, activeProduct, book.config, false);
        const updated = { ...book, conclusion: next };
        await saveEbook(updated);
        setEbooks(prev => prev.map(b => b.id === bookId ? updated : b));
      } else {
        const chapter = book.chapters.find(c => c.id === chapterId);
        if (!chapter) return;
        const next = await reviewChapterContent(book.title, chapter.title, chapter.content, activeExpert, activeProduct, book.config, !!chapter.exerciseRequired);
        const updated = {
          ...book,
          chapters: book.chapters.map(c => c.id === chapterId ? { ...c, content: next, reviewedAt: Date.now() } : c)
        };
        await saveEbook(updated);
        setEbooks(prev => prev.map(b => b.id === bookId ? updated : b));
      }
      setSaveMessage("✅ Capítulo revisado");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (e) {
      console.error("Erro ao revisar capítulo:", e);
      alert("Falha ao revisar capítulo.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateEbookCover = async (bookId: string) => {
    if (!activeProduct) return alert("Selecione uma oferta antes.");
    const book = ebooks.find(b => b.id === bookId);
    if (!book) return;
    await checkApiKey();
    setIsLoading(true);
    try {
      const theme = book.visualSettings?.theme || 'clean';
      const styleMap: Record<string, VisualStyle> = {
        clean: 'Minimalist',
        'soft-blue': 'Minimalist',
        sepia: 'Lifestyle',
        dark: 'Luxury',
        'premium-black': 'Luxury'
      };
      const style = styleMap[theme] || 'Product Commercial';
      const prompt = book.coverPrompt || `Capa editorial moderna para o e-book "${book.title}"`;
      const { url } = await generateStudioImage(null, prompt, style, '3:4', 'standard', 'image/png', 1, 'Ebook Cover');
      const updated = { ...book, coverImageUrl: url };
      await saveEbook(updated);
      setEbooks(prev => prev.map(b => b.id === bookId ? updated : b));
      setSaveMessage("📘 Capa gerada");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (e) {
      console.error("Erro ao gerar capa:", e);
      alert("Falha ao gerar capa.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEbookSettings = async (bookId: string, settings: any) => {
    const book = ebooks.find(b => b.id === bookId);
    if (!book) return;
    const updated = { ...book, config: { ...(book.config || {}), ...settings }, updatedAt: Date.now() };
    await saveEbook(updated);
    setEbooks(prev => prev.map(b => b.id === bookId ? updated : b));
    setSaveMessage("⚙️ Configurações do e-book atualizadas");
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleDeleteEbook = async (id: string) => {
    try {
      await deleteEbook(id);
      setEbooks(prev => {
        const next = prev.filter(b => b.id !== id);
        if (activeEbookId === id) {
          setActiveEbookId(next[0]?.id || null);
        }
        return next;
      });
      setSaveMessage("🗑️ E-book removido");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (e) {
      console.error("Erro ao excluir e-book:", e);
      alert("Falha ao excluir e-book.");
    }
  };

  const handleGenerateImageRequest = async (
    b: string | null, p: string, s: VisualStyle, r: ImageAspectRatio, 
    q: 'standard' | 'ultra', f: ImageExportFormat, ql: number, 
    pr: AssetPreset, strictRef: boolean = false, ac?: string, at?: string
  ) => {
    if (q === 'ultra') await checkApiKey();
    setIsLoading(true); 
    try { 
      let baseImage = b;
      const resizeToDataUrl = (img: HTMLImageElement, maxSize: number, mimeType: string, quality?: number) =>
        new Promise<string>((resolve, reject) => {
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(img.width * scale);
          canvas.height = Math.round(img.height * scale);
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error("Falha ao processar imagem de referência."));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL(mimeType, quality);
          resolve(dataUrl);
        });
      if (strictRef && !baseImage) {
        throw new Error("Referência obrigatória no modo estrito.");
      }
      if (baseImage && !baseImage.startsWith('data:')) {
        try {
          const response = await fetch(baseImage);
          const blob = await response.blob();
          baseImage = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = () => reject(new Error("Falha ao ler imagem de referência."));
            reader.readAsDataURL(blob);
          });
        } catch (err) {
          console.warn("Falha ao converter imagem de referência para base64, gerando sem referência.", err);
          baseImage = null;
        }
      }
      if (baseImage) {
        try {
          baseImage = await new Promise<string>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              const maxSize = strictRef || q === 'ultra' ? 1024 : 768;
              resizeToDataUrl(img, maxSize, 'image/png')
                .then(async (dataUrl) => {
                  if (dataUrl.length > 2_500_000) {
                    const compressed = await resizeToDataUrl(img, 768, 'image/jpeg', 0.88);
                    resolve(compressed);
                  } else {
                    resolve(dataUrl);
                  }
                })
                .catch(reject);
            };
            img.onerror = () => reject(new Error("Falha ao carregar imagem de referência."));
            img.src = baseImage as string;
          });
        } catch (err) {
          console.warn("Falha ao redimensionar imagem de referência, gerando sem referência.", err);
          baseImage = null;
        }
      }
      if (baseImage && !baseImage.startsWith('data:image/')) {
        console.warn("Referência inválida, gerando sem referência.");
        baseImage = null;
      }
      if (strictRef && !baseImage) {
        throw new Error("Referência inválida ou ausente no modo estrito.");
      }
      const attemptGenerate = async (nextBase: string | null, qualityOverride?: 'standard' | 'ultra', promptOverride?: string) =>
        generateStudioImage(nextBase, promptOverride || p, s, r, qualityOverride || q, f, ql, pr, strictRef, ac, at);

      const loadImage = (src: string) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = () => reject(new Error("Falha ao carregar imagem."));
          img.src = src;
        });

      const isNearWhite = (r: number, g: number, b: number) => r > 235 && g > 235 && b > 235;
      const colorDist = (a: number[], b: number[]) => {
        const dr = a[0] - b[0];
        const dg = a[1] - b[1];
        const db = a[2] - b[2];
        return Math.sqrt(dr * dr + dg * dg + db * db);
      };
      const colorBrightness = (c: number[]) => (c[0] + c[1] + c[2]) / 3;
      const colorSpread = (c: number[]) => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);

      const detectBackdrop = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
        const samples = [
          ctx.getImageData(4, 4, 1, 1).data,
          ctx.getImageData(w - 5, 4, 1, 1).data,
          ctx.getImageData(4, h - 5, 1, 1).data,
          ctx.getImageData(w - 5, h - 5, 1, 1).data
        ].map(d => [d[0], d[1], d[2]]);
        const avg = samples.reduce((acc, c) => [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]], [0, 0, 0]).map(v => Math.round(v / samples.length));
        const similar = samples.every(c => colorDist(c, avg) < 18);
        const bright = colorBrightness(avg) > 200;
        const neutral = colorSpread(avg) < 22;
        return { avg, eligible: similar && (bright || neutral), isWhite: isNearWhite(avg[0], avg[1], avg[2]) };
      };

      const buildProductCutout = (img: HTMLImageElement) => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return { canvas, bbox: { x: 0, y: 0, w: img.width, h: img.height }, hasAlpha: false };
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const hasAlpha = data.some((_, i) => i % 4 === 3 && data[i] < 255);
        const backdrop = detectBackdrop(ctx, canvas.width, canvas.height);
        if (!hasAlpha && backdrop.eligible) {
          const threshold = backdrop.isWhite ? 240 : 220;
          const target = backdrop.avg;
          for (let i = 0; i < data.length; i += 4) {
            const dr = data[i] - target[0];
            const dg = data[i + 1] - target[1];
            const db = data[i + 2] - target[2];
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);
            if (dist < threshold) data[i + 3] = 0;
          }
          ctx.putImageData(imageData, 0, 0);
        }
        // Feather edges lightly
        for (let i = 0; i < data.length; i += 4) {
          const a = data[i + 3];
          if (a > 0 && a < 40) data[i + 3] = 0;
          else if (a >= 40 && a < 120) data[i + 3] = Math.round(a * 0.7);
        }
        let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
        for (let y = 0; y < canvas.height; y += 2) {
          for (let x = 0; x < canvas.width; x += 2) {
            const idx = (y * canvas.width + x) * 4 + 3;
            if (data[idx] > 20) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }
        if (minX > maxX || minY > maxY) {
          return { canvas, bbox: { x: 0, y: 0, w: canvas.width, h: canvas.height }, hasAlpha };
        }
        return { canvas, bbox: { x: minX, y: minY, w: maxX - minX, h: maxY - minY }, hasAlpha: hasAlpha || backdrop.eligible };
      };

      let result;
      try {
        if (strictRef && baseImage) {
          const bgPrompt = `Background only. No product, no packaging, no replicas, no text. ${p || 'Clean studio backdrop, subtle props allowed in background only.'}`;
          const bgResult = await attemptGenerate(null, q, bgPrompt);
          const bgImage = await loadImage(bgResult.url);
          const productImage = await loadImage(baseImage);

          const outCanvas = document.createElement('canvas');
          outCanvas.width = bgImage.width;
          outCanvas.height = bgImage.height;
          const outCtx = outCanvas.getContext('2d');
          if (!outCtx) throw new Error("Falha ao compor imagem.");
          outCtx.drawImage(bgImage, 0, 0);

          const { canvas: cutout, bbox } = buildProductCutout(productImage);
          const targetH = outCanvas.height * (r === '9:16' ? 0.6 : r === '16:9' || r === '1.91:1' ? 0.55 : 0.58);
          const scale = Math.min(targetH / bbox.h, (outCanvas.width * 0.55) / bbox.w);
          const drawW = bbox.w * scale;
          const drawH = bbox.h * scale;
          const drawX = (outCanvas.width - drawW) / 2;
          const drawY = (outCanvas.height - drawH) / 2;

          // Soft shadow for grounding
          outCtx.save();
          outCtx.shadowColor = 'rgba(0,0,0,0.25)';
          outCtx.shadowBlur = Math.max(18, outCanvas.width * 0.02);
          outCtx.shadowOffsetY = Math.max(8, outCanvas.height * 0.01);
          outCtx.drawImage(cutout, bbox.x, bbox.y, bbox.w, bbox.h, drawX, drawY, drawW, drawH);
          outCtx.restore();

          const compositeUrl = outCanvas.toDataURL(f, ql);
          result = {
            url: compositeUrl,
            model: bgResult.model,
            usedReference: true,
            fallbackUsed: bgResult.fallbackUsed,
            fallbackReason: bgResult.fallbackReason
          };
        } else {
          result = await attemptGenerate(baseImage);
        }
      } catch (err: any) {
        if (strictRef && baseImage && /OTHER/i.test(err?.message || '')) {
          try {
            const reduced = await new Promise<string>((resolve, reject) => {
              const img = new Image();
              img.onload = () => {
                resizeToDataUrl(img, 512, 'image/jpeg', 0.85)
                  .then(resolve)
                  .catch(reject);
              };
              img.onerror = () => reject(new Error("Falha ao carregar imagem de referência (retry)."));
              img.src = baseImage as string;
            });
            result = await attemptGenerate(reduced, 'standard');
            baseImage = reduced;
          } catch (retryErr) {
            throw err;
          }
        } else {
          throw err;
        }
      }
      const img: StudioImage = {
        id: `img-${Date.now()}`,
        url: result.url,
        prompt: p,
        style: s,
        aspectRatio: r,
        preset: pr,
        format: f,
        quality: ql,
        timestamp: Date.now(),
        modelUsed: result.model,
        usedReference: result.usedReference,
        fallbackUsed: result.fallbackUsed,
        fallbackReason: result.fallbackReason,
        adCopy: ac,
        adType: at
      }; 
      await saveStudioImage(img); 
      setStudioImages(prev => [img, ...prev]); 
      const fallbackLabel = describeImageFallback(result.fallbackReason);
      setSaveMessage(`✨ Arte Renderizada (${result.model}${fallbackLabel})`);
    } catch (err: any) { 
      if (err.message.includes("Requested entity was not found")) {
        alert("Sua chave API precisa de faturamento. Selecione outra.");
        await window.aistudio.openSelectKey();
      } else if (/OTHER/i.test(err?.message || '')) {
        alert("Erro no Estúdio: falha no modelo. Sugestão: tente Qualidade Standard ou reenvie a imagem do produto.");
      } else if (err?.error?.code === 429 || err?.code === 429 || /quota|rate\s*limit|429/i.test(err?.message || '')) {
        alert("Você atingiu o limite de uso da API (quota). Verifique seu plano/chave ou aguarde a janela de limite.");
      } else {
        alert("Erro no Estúdio: " + err.message);
      }
    } 
    finally { setIsLoading(false); setTimeout(() => setSaveMessage(null), 3000); }
  };

  const handleGenerateMarketingIdeas = async () => {
    if (!activeExpert || !activeProduct) {
      alert("Selecione expert e oferta.");
      return [];
    }
    await checkApiKey();
    return generateMarketingIdeas(activeExpert, activeProduct);
  };

  const handleGeneratePaidAdsPlan = async (objective: string, platform: string, budget: string) => {
    if (!activeExpert || !activeProduct) {
      alert("Selecione expert e oferta.");
      return {};
    }
    await checkApiKey();
    return generatePaidAdsPlan(activeExpert, activeProduct, objective, platform, budget);
  };

  const fetchCreativeIdeas = async (strategy?: StrategySuggestion): Promise<CreativeIdea[]> => {
    if (!activeExpert || !activeProduct) return [];
    setIsGeneratingCreatives(true);
    try {
      await checkApiKey();
      const ideas = await generateCreativeCampaign(sections, activeExpert, activeProduct, strategy);
      setCreativeIdeas(ideas);
      return ideas;
    } catch (err) {
      console.error("Erro ao gerar criativos:", err);
      return [];
    } finally {
      setIsGeneratingCreatives(false);
    }
  };

  const handleSyncCreatives = async () => {
    if (!activeExpert || !activeProduct) {
      alert("Selecione expert e oferta.");
      return [];
    }
    return fetchCreativeIdeas(selectedStrategy ?? undefined);
  };

  const handleRefreshCreatives = () => fetchCreativeIdeas(selectedStrategy ?? undefined);

  const handleSelectStrategy = async (strategyId: string) => {
    const nextStrategy = STRATEGY_SUGGESTIONS.find((strategy) => strategy.id === strategyId) || null;
    if (nextStrategy) {
      setSelectedStrategyId(strategyId);
      await fetchCreativeIdeas(nextStrategy);
    } else {
      setSelectedStrategyId(strategyId);
    }
  };

  const handleSaveCanvasImage = async (dataUrl: string, meta: { prompt: string; preset: AssetPreset }) => {
    const presetAspect: Record<AssetPreset, ImageAspectRatio> = {
      'Ebook Cover': '3:4',
      'Facebook Cover': '16:9',
      'Instagram Story': '9:16',
      'VSL Thumbnail': '16:9',
      'Google Display': '16:9',
      'LinkedIn Banner': '16:9',
      'IG Feed': '1:1',
      'IG Portrait': '4:5',
      'IG Story': '9:16',
      'Reels Cover': '9:16',
      'TikTok 9:16': '9:16',
      'YouTube Thumbnail': '16:9',
      'LinkedIn Post': '1.91:1',
      'Facebook Post': '1.91:1',
      'Custom': '1:1'
    };
    const inferredStyle: VisualStyle =
      meta.prompt.includes('Social Studio') && meta.prompt.includes('Impact')
        ? 'Social Impact'
        : meta.prompt.includes('Social Studio') && meta.prompt.includes('Tech')
          ? 'Social Tech'
          : meta.prompt.includes('Social Studio')
            ? 'Social Editorial'
            : 'Minimalist';
    const img: StudioImage = {
      id: `img-${Date.now()}`,
      url: dataUrl,
      prompt: meta.prompt,
      style: inferredStyle,
      aspectRatio: presetAspect[meta.preset] || '1:1',
      preset: meta.preset,
      format: 'image/png',
      quality: 1,
      timestamp: Date.now()
    };
    await saveStudioImage(img);
    setStudioImages(prev => [img, ...prev]);
    setSaveMessage("✨ Arte Premium gerada!");
    setTimeout(() => setSaveMessage(null), 2000);
  };

  const handleRegenerateSection = async (sectionId: string, sectionType: string) => {
    if (!activeExpert || !activeProduct) return alert("Selecione expert e oferta.");
    await checkApiKey();
    setIsLoading(true);
    try {
      const currentSection = sections.find(s => s.id === sectionId);
      const newContent = await regenerateSectionWithCRO(
        sectionType,
        currentOptions,
        activeExpert,
        activeProduct,
        currentSection?.content || ''
      );
      const next = sections.map(s => s.id === sectionId ? { ...s, content: newContent } : s);
      setSections(next);
      handleSaveProject(next);
      setSaveMessage("✅ Seção reconstruída");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (e) {
      console.error(e);
      alert("Falha ao reconstruir seção.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeneratePaidStrategy = async (input: PaidCampaignInput) => {
    if (!activeExpert || !activeProduct) return alert("Selecione expert e oferta.");
    setMarketingPlanProvider('Gemini');
    setBuilderPlan(null);
    setCreativeIdeas([]);
    await checkApiKey();
    setIsLoading(true);
    setMarketingError(null);
    try {
      const result: AiPlanResult = await generatePaidCampaignStrategy(activeExpert, activeProduct, input);
      const plan = result.plan;
      const provider = result.provider;
      if (provider === 'OpenRouter') {
        triggerAiFallback(result.notice || 'Fallback para OpenRouter após quota do Gemini.');
      }
    setMarketingPlan(plan);
    setMarketingPlanProvider(provider);
    setBuilderNote(result.notice);
    setPaidCampaignInput(input);
      setActiveModule('marketing');
      handleSaveProject();
      if (sections.length > 0) {
        await fetchCreativeIdeas(selectedStrategy ?? undefined);
      }
      setSaveMessage("✅ Plano de campanha gerado");
      setTimeout(() => setSaveMessage(null), 2000);
    } catch (e) {
      console.error(e);
      const message = formatMarketingError(e);
      if (/quota|exceeded|429/i.test(message)) {
        triggerAiFallback(message);
      }
      setMarketingError(message);
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const constructFullHTML = () => {
    const cleanForExport = (html: string) =>
      html
        .replace(/<div[^>]*class=["'][^"']*section-badge[^"']*["'][^>]*>.*?<\/div>/gi, '')
        .replace(/<div[^>]*class=["'][^"']*section-container[^"']*["'][^>]*>/gi, '')
        .replace(/<\/div>\s*<!--\s*SECTION_CONTAINER_CLOSE\s*-->/gi, '')
        .replace(/\scontenteditable=["']?true["']?/gi, '')
        .replace(/\sdata-lb-editable=["']?true["']?/gi, '');
    const htmlContent = sections.map(s => cleanForExport(s.content)).join('\n');
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${seo.title}</title><script src="https://cdn.tailwindcss.com?plugins=typography"></script></head><body>${htmlContent}</body></html>`;
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${uiTheme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <nav className="w-16 bg-slate-900 flex flex-col items-center py-6 gap-6 z-50 shrink-0 border-r border-white/5">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div className="flex-1 flex flex-col gap-5">
          {(['strategy', 'product', 'vsl', 'ebook', 'studio', 'builder', 'library', 'analytics', 'marketing'] as NavModule[]).map(id => (
            <button key={id} onClick={() => setActiveModule(id)} className={`p-3 rounded-xl transition-all ${activeModule === id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-white hover:bg-slate-800'}`}>
               <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                 {{
                   strategy: <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 01-12 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
                   product: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
                   vsl: <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
                   ebook: <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
                   studio: <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />,
                   builder: <path d="M13 10V3L4 14h7v7l9-11h-7z" />,
                   library: <path d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />,
                   analytics: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
                   marketing: <path d="M3 12h3l3-7 3 14 3-7h3" />
                 }[id]}
               </svg>
            </button>
          ))}
        </div>
        <button
          onClick={() => {
            const nextTheme = uiTheme === 'light' ? 'dark' : 'light';
            setUiTheme(nextTheme);
            safeLocalStorage.write('lb_ui_theme', nextTheme);
          }}
          className="p-3 text-slate-500 hover:text-white"
        >
          {uiTheme === 'light' ? '🌙' : '☀️'}
        </button>
      </nav>

      <Sidebar 
        module={activeModule} uiTheme={uiTheme} onModuleChange={setActiveModule}
        activeExpert={activeExpert} onSelectExpert={setActiveExpert}
        activeProduct={activeProduct} onSelectProduct={setActiveProduct}
        editingExpert={editingExpert} setEditingExpert={setEditingExpert}
        editingProduct={editingProduct} setEditingProduct={setEditingProduct}
        onGenerate={handleGeneratePage} onSaveProject={() => handleSaveProject()}
        pageVersions={projectVersions}
        activePageVersionId={activeProject?.id || null}
        onSelectPageVersion={selectPageVersion}
        onCreatePageVersion={() => {
          const name = window.prompt("Nome da nova versão (opcional):") || undefined;
          createPageVersion(name);
        }}
        onDuplicatePageVersion={duplicatePageVersion}
        onDeletePageVersion={deletePageVersion}
        onExportJSON={handleExportJSON} onImportJSON={handleImportJSON}
        isLoading={isLoading} sections={sections}
        ebooks={ebooks} activeEbookId={activeEbookId} onSelectEbook={setActiveEbookId}
        onGenerateBookOutline={handleGenerateBook} marketing={marketing} setMarketing={setMarketing}
        seo={seo} setSeo={setSeo} generationOptions={currentOptions} setGenerationOptions={setCurrentOptions}
        onDownload={() => downloadFile(constructFullHTML(), 'landing.html', 'text/html')}
        onOpenPreview={() => {
          const win = window.open('about:blank', '_blank');
          if (win) { win.document.write(constructFullHTML()); win.document.close(); }
        }}
        onInjectAsset={(type, asset) => injectAssetIntoPage(type, asset, activeExpert!, activeProduct!).then(s => setSections(prev => [...prev, s]))}
        onGenerateImage={handleGenerateImageRequest}
        onSyncCreatives={handleSyncCreatives}
        onGenerateMarketingIdeas={handleGenerateMarketingIdeas}
        onGeneratePaidAdsPlan={handleGeneratePaidAdsPlan}
        onSaveCanvasImage={handleSaveCanvasImage}
        onGeneratePaidStrategy={handleGeneratePaidStrategy}
        marketingError={marketingError}
        fallbackLog={fallbackLog}
        isFallbackDetailsOpen={isFallbackDetailsOpen}
        onShowFallbackDetails={() => setFallbackDetailsOpen(true)}
        onCloseFallbackDetails={() => setFallbackDetailsOpen(false)}
        onRetryWithGemini={handleRetryGemini}
        onGenerateSeo={async () => {
          if (!activeProduct) return alert("Selecione uma oferta antes.");
          if (sections.length === 0) return alert("Gere uma página antes.");
          await checkApiKey();
          setIsLoading(true);
          try {
            const nextSeo = await generateSeoFromSections(sections, activeProduct);
            setSeo(prev => ({ ...prev, ...nextSeo }));
            setSaveMessage("🔎 SEO gerado!");
          } catch (e) {
            console.error(e);
            alert("Falha ao otimizar SEO. Tente novamente.");
          } finally {
            setIsLoading(false);
            setTimeout(() => setSaveMessage(null), 2000);
          }
        }}
        onDeleteEbook={handleDeleteEbook}
        onRegenerateSection={handleRegenerateSection}
      />

      <main className="flex-1 relative min-w-0 flex flex-col bg-slate-100 dark:bg-black overflow-hidden h-full">
        {saveMessage && <div className="absolute top-6 right-6 bg-emerald-600 text-white px-6 py-3 rounded-full shadow-2xl z-[100] animate-in slide-in-from-right-10 text-[10px] font-black uppercase">{saveMessage}</div>}
        {isLoading && <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md flex flex-col items-center justify-center z-[100]"><div className="w-12 h-12 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div><p className="text-[10px] font-black uppercase text-slate-500 mt-4 tracking-widest">Estúdio em Operação...</p></div>}

        {activeModule === 'studio' && <StudioPanel images={studioImages} uiTheme={uiTheme} onDeleteImage={(id) => deleteStudioImage(id).then(() => getAllStudioImages().then(setStudioImages))} isGenerating={isLoading} />}
        {activeModule === 'ebook' && <BookPanel ebook={ebooks.find(b => b.id === activeEbookId) || null} uiTheme={uiTheme} onGenerateChapter={async (bid, cid) => {
           const book = ebooks.find(b => b.id === bid); if (!book || !activeExpert || !activeProduct) return;
           await checkApiKey();
           setIsLoading(true);
           try {
             const chapterObj = cid === 'intro'
               ? { title: 'Introdução', exerciseRequired: false }
               : cid === 'conclusion'
                 ? { title: 'Conclusão', exerciseRequired: false }
                 : book.chapters.find(c => c.id === cid)!;
             const chapterIndex = cid === 'intro' || cid === 'conclusion'
               ? -1
               : book.chapters.findIndex(c => c.id === cid);
             const content = await generateChapterContent(
               book.title,
               { ...chapterObj, chapterIndex },
               activeExpert,
               activeProduct,
               book.config
             );
             let updatedBook = { ...book };
             if (cid === 'intro') updatedBook.introduction = content;
             else if (cid === 'conclusion') updatedBook.conclusion = content;
             else updatedBook.chapters = book.chapters.map(c => c.id === cid ? { ...c, content, status: 'completed' } : c);
             await saveEbook(updatedBook); setEbooks(prev => prev.map(b => b.id === bid ? updatedBook : b));
           } finally { setIsLoading(false); }
         }} onReviewChapter={handleReviewChapter} onGenerateCover={handleGenerateEbookCover} onUpdateSettings={handleUpdateEbookSettings} onIllustrateChapter={() => {}} />}
        {activeModule === 'vsl' && <VslPanel script={vslScript} uiTheme={uiTheme} isLoadingAudio={false} setIsLoadingAudio={() => {}} />}
        {activeModule === 'marketing' && (
          <MarketingWorkflowPanel
            plan={marketingPlan}
            creativeIdeas={creativeIdeas}
            builderPlan={builderPlan}
            expert={activeExpert}
            product={activeProduct}
            onRefreshCreatives={handleRefreshCreatives}
            isGeneratingCreatives={isGeneratingCreatives}
            onSavePlan={() => handleSaveProject()}
            marketing={marketing}
            strategySuggestions={STRATEGY_SUGGESTIONS}
            selectedStrategyId={selectedStrategyId}
            onSelectStrategy={handleSelectStrategy}
          />
        )}
        
        {['strategy', 'product', 'builder', 'analytics', 'library'].includes(activeModule) && (
          <PreviewPanel 
            sections={sections} variationSections={variationSections} selectedSectionId={selectedSectionId} activeElement={activeElement} studioImages={studioImages}
            onUpdateSectionContent={handleSectionUpdate}
            onSelectSection={setSelectedSectionId} onElementSelect={setActiveElement}
            onRegenerateSection={handleRegenerateSection}
            onDownload={() => {}} onOpenPreview={() => {
              const win = window.open('about:blank', '_blank');
              if (win) { win.document.write(constructFullHTML()); win.document.close(); }
            }} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
  const triggerAiFallback = (message: string) => {
    setFallbackLog({
      timestamp: Date.now(),
      error: message,
      previous: 'Gemini',
      current: 'OpenRouter',
      message,
    });
    setFallbackDetailsOpen(true);
  };

  const handleRetryGemini = () => {
    setFallbackLog(null);
    setFallbackDetailsOpen(false);
    setSaveMessage("⚡ Tentando Gemini novamente...");
    setTimeout(() => setSaveMessage(null), 2000);
  };
