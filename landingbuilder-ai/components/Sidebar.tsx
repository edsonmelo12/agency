
import React, { useRef, useMemo } from 'react';
import { 
  GenerationOptions, Section, MarketingSettings, SeoSettings, 
  Producer, ProductInfo, VisualStyle, ImageAspectRatio, Ebook, VslScript, ImageExportFormat
} from '../types';

// Modules
import StrategyModule from './sidebar/StrategyModule';
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
  onGenerateVariation: (hypothesis: string) => void;
  generationOptions: GenerationOptions;
  setGenerationOptions: (o: GenerationOptions) => void;
  isLoading: boolean;
  sections: Section[];
  onSaveProject: () => void;
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
    adCopy?: string,
    adType?: string
  ) => void;
  onSyncCreatives: () => Promise<any[]>;
  
  ebooks: Ebook[];
  vslScript?: VslScript | null;
  activeEbookId: string | null;
  onSelectEbook: (id: string) => void;
  onGenerateBookOutline: (title: string, topic: string, author: string, ref?: string) => void;
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
            onGenerateVariation={props.onGenerateVariation}
            isLoading={props.isLoading}
            availableEbooks={props.ebooks}
            availableVsl={props.vslScript || undefined}
          />
        );
      case 'studio':
        return <StudioModule activeProduct={props.activeProduct} onGenerateImage={props.onGenerateImage} onSyncCreatives={props.onSyncCreatives} isLoading={props.isLoading} />;
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
            onDelete={() => {}}
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
    <div className={`w-full md:w-96 border-r flex flex-col overflow-hidden shadow-2xl z-20 transition-all duration-300 ${props.uiTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className={`p-6 border-b ${props.uiTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
        <div className="flex items-center gap-2 mb-1">
           <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest truncate max-w-[120px]">{props.activeExpert?.name || 'Expert'}</span>
           <span className="text-slate-300">/</span>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[150px]">{props.activeProduct?.name || 'Oferta'}</span>
        </div>
        <h2 className={`text-xl font-black uppercase tracking-tighter ${props.uiTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
          {props.module === 'strategy' ? 'Estratégia' : 
           props.module === 'product' ? 'Oferta' : 
           props.module === 'builder' ? 'Gerador' : 
           props.module === 'analytics' ? 'Avançado' : 
           props.module === 'studio' ? 'Estúdio AI' : 
           props.module === 'vsl' ? 'VSL Studio' :
           props.module === 'ebook' ? 'BookBuilder' :
           props.module === 'library' ? 'Biblioteca' : 'Módulo'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        {renderModule()}
      </div>

      <div className={`p-4 border-t flex flex-col gap-3 ${props.uiTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${props.activeProduct ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
               <span className={`text-[10px] font-black uppercase tracking-widest ${props.activeProduct ? 'text-emerald-600' : 'text-rose-500'}`}>
                 {props.activeProduct ? 'Contexto Pronto' : 'Falta Selecionar Oferta'}
               </span>
            </div>
            <button 
              onClick={props.onSaveProject} 
              className={`text-[10px] font-black uppercase transition-all ${props.activeProduct ? 'text-blue-600 hover:underline' : 'text-slate-300 cursor-not-allowed'}`}
              title={props.activeProduct ? 'Salvar progresso local' : 'Crie uma oferta primeiro para salvar'}
            >
              Salvar Local
            </button>
         </div>
         <div className="flex gap-2">
            <button onClick={props.onExportJSON} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase rounded-lg text-slate-500 hover:bg-slate-200 transition-colors">Exportar Backup</button>
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-[9px] font-black uppercase rounded-lg text-slate-500 hover:bg-slate-200 transition-colors">Importar Backup</button>
            <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={props.onImportJSON} />
         </div>
      </div>
    </div>
  );
};

export default Sidebar;
