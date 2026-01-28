
import React, { useRef, useMemo } from 'react';
import { 
  GenerationOptions, Section, MarketingSettings, SeoSettings, 
  Producer, ProductInfo, VisualStyle, ImageAspectRatio, Ebook, VslScript, ImageExportFormat, EbookConfig, Project, PaidCampaignInput
} from '../types';

// Modules
import StrategyModule from './sidebar/StrategyModule';
import MarketingModule from './sidebar/MarketingModule';
import ProductModule from './sidebar/ProductModule';
import BuilderModule from './sidebar/BuilderModule';
import StudioModule from './sidebar/StudioModule';
import AnalyticsModule from './sidebar/AnalyticsModule';
import BookModule from './sidebar/BookModule';
import VslModule from './sidebar/VslModule';
import PromptLibraryModule from './sidebar/PromptLibraryModule';

interface SidebarProps {
  module: string;
  uiTheme: 'light' | 'dark';
  onModuleChange: (module: any) => void;
  activeExpert: Producer | null;
  onSelectExpert: (expert: Producer) => void;
  activeProduct: ProductInfo | null;
  onSelectProduct: (product: ProductInfo) => void;
  editingExpert: Producer | null;
  setEditingExpert: (p: Producer | null) => void;
  editingProduct: ProductInfo | null;
  setEditingProduct: (p: ProductInfo | null) => void;
  onAnalyzeProductUrl?: (url: string) => void;
  onGenerate: (options: GenerationOptions) => void;
  onInjectAsset: (type: 'ebook' | 'vsl', asset: any) => void;
  generationOptions: GenerationOptions;
  setGenerationOptions: (o: GenerationOptions) => void;
  isLoading: boolean;
  sections: Section[];
  onRegenerateSection: (sectionId: string, sectionType: string) => void;
  onSaveProject: () => void;
  pageVersions: Project[];
  activePageVersionId: string | null;
  onSelectPageVersion: (id: string) => void;
  onCreatePageVersion: () => void;
  onDuplicatePageVersion: (id: string) => void;
  onDeletePageVersion: (id: string) => void;
  onDownload: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerateSeo: () => void;
  onGenerateImage: (
    base64: string | null, 
    prompt: string, 
    style: VisualStyle, 
    ratio: ImageAspectRatio, 
    quality: 'standard' | 'ultra', 
    format: ImageExportFormat, 
    qlt: number,
    preset: any,
    strictReference?: boolean,
    adCopy?: string,
    adType?: string
  ) => void;
  onSyncCreatives: () => Promise<any[]>;
  onGenerateMarketingIdeas: () => Promise<any[]>;
  onGeneratePaidAdsPlan: (objective: string, platform: string, budget: string) => Promise<any>;
  onSaveCanvasImage: (dataUrl: string, meta: { prompt: string; preset: any }) => Promise<void>;
  onGeneratePaidStrategy: (input: PaidCampaignInput) => void;
  
  ebooks: Ebook[];
  vslScript?: VslScript | null;
  activeEbookId: string | null;
  onSelectEbook: (id: string) => void;
  onGenerateBookOutline: (title: string, topic: string, author: string, config: EbookConfig) => void;
  onDeleteEbook: (id: string) => void;
  onGenerateVsl?: (model: string, duration: string) => void;
  
  marketing: MarketingSettings;
  setMarketing: (m: MarketingSettings) => void;
  seo: SeoSettings;
  setSeo: (s: SeoSettings) => void;
}

const Sidebar: React.FC<SidebarProps> = (props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const renderModule = () => {
    switch (props.module) {
      case 'strategy':
        return (
          <StrategyModule 
            activeExpert={props.activeExpert} 
            onSelectExpert={props.onSelectExpert} 
            editData={props.editingExpert}
            setEditData={props.setEditingExpert}
          />
        );
      case 'marketing':
        return (
          <MarketingModule
            onGenerate={props.onGeneratePaidStrategy}
            isLoading={props.isLoading}
            activeProduct={props.activeProduct}
          />
        );
      case 'product':
        return (
          <ProductModule 
            activeExpert={props.activeExpert}
            activeProduct={props.activeProduct} 
            onSelectProduct={props.onSelectProduct}
            isLoading={props.isLoading}
            editData={props.editingProduct}
            setEditData={props.setEditingProduct}
          />
        );
      case 'vsl':
        return <VslModule onGenerate={props.onGenerateVsl || (() => {})} isLoading={props.isLoading} />;
      case 'builder':
        return (
          <BuilderModule 
            options={props.generationOptions}
            setOptions={props.setGenerationOptions} 
            onGenerate={props.onGenerate}
            onInjectAsset={props.onInjectAsset}
            isLoading={props.isLoading}
            availableEbooks={props.ebooks}
            availableVsl={props.vslScript || undefined}
            sections={props.sections.map(s => ({ id: s.id, type: s.type }))}
            onRegenerateSection={props.onRegenerateSection}
            pageVersions={props.pageVersions}
            activePageVersionId={props.activePageVersionId}
            onSelectPageVersion={props.onSelectPageVersion}
            onCreatePageVersion={props.onCreatePageVersion}
            onDuplicatePageVersion={props.onDuplicatePageVersion}
            onDeletePageVersion={props.onDeletePageVersion}
          />
        );
      case 'studio':
        return (
          <StudioModule
            activeProduct={props.activeProduct}
            onGenerateImage={props.onGenerateImage}
            onSyncCreatives={props.onSyncCreatives}
            onGenerateMarketingIdeas={props.onGenerateMarketingIdeas}
            onGeneratePaidAdsPlan={props.onGeneratePaidAdsPlan}
            onSaveCanvasImage={props.onSaveCanvasImage}
            isLoading={props.isLoading}
          />
        );
      case 'analytics':
        return (
          <AnalyticsModule 
            marketing={props.marketing} 
            setMarketing={props.setMarketing} 
            seo={props.seo} 
            setSeo={props.setSeo} 
            onAutoSeo={props.onGenerateSeo}
            isLoading={props.isLoading}
          />
        );
      case 'ebook':
        return (
          <BookModule 
            activeExpert={props.activeExpert}
            activeProduct={props.activeProduct}
            onSelectExpert={props.onSelectExpert}
            onSelectProduct={props.onSelectProduct}
            ebooks={props.ebooks}
            activeId={props.activeEbookId}
            onSelect={props.onSelectEbook}
            onGenerateOutline={props.onGenerateBookOutline}
            onDelete={props.onDeleteEbook}
            isLoading={props.isLoading}
          />
        );
      case 'library':
        return <PromptLibraryModule />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full md:w-96 border-r border-border flex flex-col overflow-hidden shadow-2xl z-20 transition-all duration-300 bg-panel">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
           <span className="text-[10px] font-black text-primary uppercase tracking-widest truncate max-w-[120px]">{props.activeExpert?.name || 'Expert'}</span>
           <span className="text-slate-300">/</span>
           <span className="text-[10px] font-black text-slate uppercase tracking-widest truncate max-w-[150px]">{props.activeProduct?.name || 'Oferta'}</span>
        </div>
        <h2 className="text-xl font-display uppercase tracking-tighter text-ink">
          {props.module === 'strategy' ? 'Estratégia' : 
           props.module === 'product' ? 'Oferta' : 
           props.module === 'builder' ? 'Gerador' : 
           props.module === 'analytics' ? 'Avançado' : 
           props.module === 'studio' ? 'Estúdio AI' : 
           props.module === 'vsl' ? 'VSL Studio' :
           props.module === 'ebook' ? 'BookBuilder' :
           props.module === 'library' ? 'Biblioteca' :
           props.module === 'marketing' ? 'Marketing' : 'Módulo'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {renderModule()}
      </div>

      <div className="p-4 border-t border-border flex flex-col gap-3">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${props.activeProduct ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-danger shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${props.activeProduct ? 'text-success' : 'text-danger'}`}>
                 {props.activeProduct ? 'Contexto Pronto' : 'Falta Selecionar Oferta'}
               </span>
            </div>
            <button 
              onClick={props.onSaveProject} 
              className={`text-[10px] font-black uppercase transition-all ${props.activeProduct ? 'text-primary hover:underline' : 'text-slate-300 cursor-not-allowed'}`}
              title={props.activeProduct ? 'Salvar progresso local' : 'Crie uma oferta primeiro para salvar'}
            >
              Salvar Local
            </button>
         </div>
         <div className="flex gap-2">
            <button onClick={props.onExportJSON} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase rounded-lg text-slate hover:bg-slate-200 transition-colors">Exportar Backup</button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase rounded-lg text-slate hover:bg-slate-200 transition-colors">Importar Backup</button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={props.onImportJSON} />
         </div>
         <button onClick={props.onDownload} className="w-full py-2 bg-slate-900 text-[9px] font-black uppercase rounded-lg text-white hover:bg-slate-800 transition-colors">
           Exportar HTML
         </button>
      </div>
    </div>
  );
};

export default Sidebar;
