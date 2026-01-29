
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import PreviewPanel from './components/PreviewPanel';
import StudioPanel from './components/StudioPanel';
import BookPanel from './components/BookPanel';
import VslPanel from './components/VslPanel';
import { 
  GenerationOptions, Section, ActiveElement, Project, 
  PageType, MarketingSettings, SeoSettings, Producer, ProductInfo, StudioImage, VisualStyle, ImageAspectRatio, ImageExportFormat,
  Ebook, VslScript, AssetPreset
} from './types';
import { generateLandingPage, generateStudioImage, generateBookOutline, generateChapterContent, generateVslScript, refineLandingPageContent, injectAssetIntoPage, generateCreativeCampaign, generateABVariation } from './services/genaiClient';
import { getAllExperts, getProductsByExpert, getProjectsByProduct, saveProject, getAllStudioImages, saveStudioImage, deleteStudioImage, saveEbook, getEbooksByProduct, saveProduct, saveExpert, deleteEbook, saveVslScript, getVslScriptsByProduct, openDB, clearAllData } from './services/dbService';

type NavModule = 'strategy' | 'product' | 'builder' | 'analytics' | 'studio' | 'ebook' | 'vsl' | 'library';

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

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<NavModule>('strategy');
  const [uiTheme, setUiTheme] = useState<'light' | 'dark'>((localStorage.getItem('lb_ui_theme') as any) || 'light');
  const [isLoading, setIsLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const [activeExpert, setActiveExpert] = useState<Producer | null>(null);
  const [activeProduct, setActiveProduct] = useState<ProductInfo | null>(null);
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  const [editingExpert, setEditingExpert] = useState<Producer | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductInfo | null>(null);

  const [sections, setSections] = useState<Section[]>([]);
  const [variationSections, setVariationSections] = useState<Section[]>([]);
  const [studioImages, setStudioImages] = useState<StudioImage[]>([]);
  const [ebooks, setEbooks] = useState<Ebook[]>([]);
  const [activeEbookId, setActiveEbookId] = useState<string | null>(null);
  const [vslScript, setVslScript] = useState<VslScript | null>(null);

  const [marketing, setMarketing] = useState<MarketingSettings>({ metaPixelId: '', googleAnalyticsId: '' });
  const [seo, setSeo] = useState<SeoSettings>({ title: '', description: '', keywords: '' });
  const [currentOptions, setCurrentOptions] = useState<GenerationOptions>({
    pageType: PageType.SALES, primaryColor: '#2563eb', secondaryColor: '#f59e0b',
    backgroundColor: 'light', fontPair: 'Modern', tone: 'Persuasive',
    prompt: '', referenceUrl: '', extractionFlags: { structure: true, copy: true, colors: true }
  });

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [activeElement, setActiveElement] = useState<ActiveElement | null>(null);
  
  const saveTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const experts = await getAllExperts();
        const savedExpertId = localStorage.getItem('lb_active_expert_id');
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
      localStorage.setItem('lb_active_expert_id', activeExpert.id);
      const savedProductId = localStorage.getItem('lb_active_product_id');
      
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

  useEffect(() => {
    if (activeProduct) {
      localStorage.setItem('lb_active_product_id', activeProduct.id);
      getEbooksByProduct(activeProduct.id).then(setEbooks);
      getVslScriptsByProduct(activeProduct.id).then(scripts => {
        setVslScript(scripts && scripts.length > 0 ? scripts[0] : null);
      });
      
      getProjectsByProduct(activeProduct.id).then(projs => {
        if (projs.length > 0) {
          const latestProj = projs[projs.length - 1];
          setActiveProject(latestProj);
          setSections(latestProj.sections);
          if (latestProj.options) {
             setCurrentOptions(latestProj.options);
             if (latestProj.options.marketing) setMarketing(latestProj.options.marketing);
             if (latestProj.options.seo) setSeo(latestProj.options.seo);
          }
        } else {
          setSections([]);
          setActiveProject(null);
        }
      });
    } else {
      setEbooks([]);
      setSections([]);
      setVslScript(null);
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
    const project: Project = {
      id: activeProject?.id || `proj-${Date.now()}`, 
      productId: activeProduct.id, 
      name: `Funil: ${activeProduct.name}`,
      sections: finalSections, 
      options: { ...currentOptions, marketing, seo }, 
      createdAt: activeProject?.createdAt || Date.now(), 
      updatedAt: Date.now()
    };
    try {
      await saveProject(project);
      setActiveProject(project);
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

        if (data.activeExpertId) localStorage.setItem('lb_active_expert_id', data.activeExpertId);
        if (data.activeProductId) localStorage.setItem('lb_active_product_id', data.activeProductId);

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
        setSections(gen);
        setActiveModule('builder');
        setTimeout(() => handleSaveProject(gen), 500);
      }
    } catch (e) { alert("Erro na geração. Tente novamente."); }
    finally { setIsLoading(false); }
  };

  const handleGenerateBook = async (title: string, topic: string, author: string) => {
    if (!activeProduct) return;
    await checkApiKey();
    setIsLoading(true);
    try {
      const outline = await generateBookOutline(title, topic, author, activeProduct);
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
          layout: ch.layout || 'standard'
        })),
        coverPrompt: outline.coverPrompt || '',
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

  const handleGenerateImageRequest = async (
    b: string | null, p: string, s: VisualStyle, r: ImageAspectRatio, 
    q: 'standard' | 'ultra', f: ImageExportFormat, ql: number, 
    pr: AssetPreset, ac?: string, at?: string
  ) => {
    if (q === 'ultra') await checkApiKey();
    setIsLoading(true); 
    try { 
      const result = await generateStudioImage(b, p, s, r, q, f, ql, pr, false, ac, at); 
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
        adCopy: ac,
        adType: at
      }; 
      await saveStudioImage(img); 
      setStudioImages(prev => [img, ...prev]); 
      setSaveMessage(`✨ Arte Renderizada (${result.model})`);
    } catch (err: any) { 
      if (err.message.includes("Requested entity was not found")) {
        alert("Sua chave API precisa de faturamento. Selecione outra.");
        await window.aistudio.openSelectKey();
      } else if (/OTHER/i.test(err?.message || '')) {
        alert("Erro no Estúdio: falha no modelo. Sugestão: tente Qualidade Standard ou reenvie a imagem do produto.");
      } else {
        alert("Erro no Estúdio: " + err.message);
      }
    } 
    finally { setIsLoading(false); setTimeout(() => setSaveMessage(null), 3000); }
  };

  const constructFullHTML = () => {
    const htmlContent = sections.map(s => s.content).join('\n');
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>${seo.title}</title><script src="https://cdn.tailwindcss.com?plugins=typography"></script></head><body>${htmlContent}</body></html>`;
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden ${uiTheme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <nav className="w-16 bg-slate-900 flex flex-col items-center py-6 gap-6 z-50 shrink-0 border-r border-white/5">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shrink-0">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
        </div>
        <div className="flex-1 flex flex-col gap-5">
          {(['strategy', 'product', 'vsl', 'ebook', 'studio', 'builder', 'library', 'analytics'] as NavModule[]).map(id => (
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
                   analytics: <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                 }[id]}
               </svg>
            </button>
          ))}
        </div>
        <button onClick={() => setUiTheme(uiTheme === 'light' ? 'dark' : 'light')} className="p-3 text-slate-500 hover:text-white"> {uiTheme === 'light' ? '🌙' : '☀️'} </button>
      </nav>

      <Sidebar 
        module={activeModule} uiTheme={uiTheme} onModuleChange={setActiveModule}
        activeExpert={activeExpert} onSelectExpert={setActiveExpert}
        activeProduct={activeProduct} onSelectProduct={setActiveProduct}
        editingExpert={editingExpert} setEditingExpert={setEditingExpert}
        editingProduct={editingProduct} setEditingProduct={setEditingProduct}
        onGenerate={handleGeneratePage} onSaveProject={() => handleSaveProject()}
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
        onGenerateVariation={async (h) => { setIsLoading(true); try { const v = await generateABVariation(sections, h, activeExpert!, activeProduct!); setVariationSections(v); } finally { setIsLoading(false); } }}
        onGenerateImage={handleGenerateImageRequest}
        onSyncCreatives={() => generateCreativeCampaign(sections, activeExpert!, activeProduct!)}
        onGenerateSeo={() => {}}
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
             const content = await generateChapterContent(book.title, cid === 'intro' ? {title:'Introdução'} : cid === 'conclusion' ? {title:'Conclusão'} : book.chapters.find(c => c.id === cid)!, activeExpert, activeProduct);
             let updatedBook = { ...book };
             if (cid === 'intro') updatedBook.introduction = content;
             else if (cid === 'conclusion') updatedBook.conclusion = content;
             else updatedBook.chapters = book.chapters.map(c => c.id === cid ? { ...c, content, status: 'completed' } : c);
             await saveEbook(updatedBook); setEbooks(prev => prev.map(b => b.id === bid ? updatedBook : b));
           } finally { setIsLoading(false); }
         }} onUpdateSettings={() => {}} onIllustrateChapter={() => {}} />}
        {activeModule === 'vsl' && <VslPanel script={vslScript} uiTheme={uiTheme} isLoadingAudio={false} setIsLoadingAudio={() => {}} />}
        
        {['strategy', 'product', 'builder', 'analytics', 'library'].includes(activeModule) && (
          <PreviewPanel 
            sections={sections} variationSections={variationSections} selectedSectionId={selectedSectionId} activeElement={activeElement} studioImages={studioImages}
            onUpdateSectionContent={(id, content) => { const next = sections.map(s => s.id === id ? { ...s, content } : s); setSections(next); debouncedSaveProject(next); }}
            onSelectSection={setSelectedSectionId} onElementSelect={setActiveElement}
            onDownload={() => {}} onOpenPreview={() => {}} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
