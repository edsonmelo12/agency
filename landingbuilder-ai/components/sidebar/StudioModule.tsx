
import React, { useState, useRef } from 'react';
import { Label, TextArea, Button, Card, Select } from '../ui/BaseComponents';
import { ImageAspectRatio, VisualStyle, ImageExportFormat, AssetPreset, ProductInfo } from '../../types';

interface CreativeConcept {
  type: string;
  adCopy: string;
  imagePrompt: string;
  visualStyle: VisualStyle;
}

interface Props {
  activeProduct?: ProductInfo | null;
  onGenerateImage: (
    base64: string | null, 
    prompt: string, 
    style: VisualStyle, 
    ratio: ImageAspectRatio, 
    quality: 'standard' | 'ultra',
    exportFormat: ImageExportFormat,
    exportQuality: number,
    preset: AssetPreset,
    adCopy?: string,
    adType?: string
  ) => void;
  onSyncCreatives: () => Promise<CreativeConcept[]>;
  isLoading: boolean;
}

const StudioModule: React.FC<Props> = ({ activeProduct, onGenerateImage, onSyncCreatives, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'sync'>('generate');
  const [prompt, setPrompt] = useState('');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<'standard' | 'ultra'>('standard');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [style, setStyle] = useState<VisualStyle>('Product Commercial');
  const [preset, setPreset] = useState<AssetPreset>('Custom');
  const [exportFormat, setExportFormat] = useState<ImageExportFormat>('image/webp');
  const [exportQuality, setExportQuality] = useState(0.85);
  
  const [pendingAdCopy, setPendingAdCopy] = useState<string | undefined>();
  const [pendingAdType, setPendingAdType] = useState<string | undefined>();
  
  const [syncConcepts, setSyncConcepts] = useState<CreativeConcept[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const fileRef = useRef<HTMLInputElement>(null);

  const presets: { id: AssetPreset; ratio: ImageAspectRatio; label: string }[] = [
    { id: 'Ebook Cover', ratio: '3:4', label: 'Capa E-book' },
    { id: 'Facebook Cover', ratio: '16:9', label: 'Capa Facebook' },
    { id: 'Instagram Story', ratio: '9:16', label: 'Story IG' },
    { id: 'VSL Thumbnail', ratio: '16:9', label: 'Thumbnail VSL' },
    { id: 'Google Display', ratio: '16:9', label: 'Google Ads' },
    { id: 'LinkedIn Banner', ratio: '16:9', label: 'LinkedIn' },
    { id: 'Custom', ratio: '1:1', label: 'Livre' }
  ];

  const handlePresetChange = (p: AssetPreset) => {
    setPreset(p);
    const config = presets.find(item => item.id === p);
    if (config) setAspectRatio(config.ratio);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setBaseImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const concepts = await onSyncCreatives();
      setSyncConcepts(concepts);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSyncing(false);
    }
  };

  const applyConcept = (concept: CreativeConcept) => {
    setPrompt(concept.imagePrompt);
    setStyle(concept.visualStyle);
    setPendingAdCopy(concept.adCopy);
    setPendingAdType(concept.type);
    
    // Se o produto ativo tiver uma imagem real, usa ela como base automaticamente
    if (activeProduct?.imageUrl) {
      setBaseImage(activeProduct.imageUrl);
    }
    
    setActiveTab('generate');
  };

  const handleGenerateClick = () => {
    onGenerateImage(
      baseImage, 
      prompt, 
      style, 
      aspectRatio, 
      quality, 
      exportFormat, 
      exportQuality, 
      preset,
      pendingAdCopy, 
      pendingAdType
    );
    setPendingAdCopy(undefined);
    setPendingAdType(undefined);
  };

  const styles: VisualStyle[] = ['Product Commercial', 'Minimalist', 'Luxury', 'Nature', 'Cyberpunk', 'Lifestyle', 'Photorealistic'];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1">
         <button onClick={() => setActiveTab('generate')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'generate' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>Gerar Arte</button>
         <button onClick={() => setActiveTab('sync')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all ${activeTab === 'sync' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-400'}`}>Canais de Mídia</button>
      </div>

      {activeTab === 'generate' ? (
        <>
          <div className="space-y-4">
            <Label color="blue">Preset de Destino</Label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map(p => (
                <button 
                  key={p.id}
                  onClick={() => handlePresetChange(p.id)}
                  className={`p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${preset === p.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg scale-[1.02]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 hover:border-blue-200'}`}
                >
                  <span className="text-[9px] font-black uppercase whitespace-nowrap">{p.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label color="indigo">Estilo Visual</Label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map(s => (
                <button 
                  key={s}
                  onClick={() => setStyle(s)}
                  className={`py-3 px-2 rounded-xl text-[9px] font-black uppercase border transition-all text-center ${style === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label color="blue">Imagem de Referência (Produto Real)</Label>
              {baseImage && <button onClick={() => setBaseImage(null)} className="text-[9px] font-black text-rose-500 uppercase">Remover</button>}
            </div>
            <div 
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden shadow-sm transition-colors"
            >
              {baseImage ? (
                <img src={baseImage} className="w-full h-full object-contain" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                   <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Produto Real</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
            <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase">Dica: Use a foto real do produto para que a IA crie cenários ao redor dele.</p>
          </div>
          
          <div>
            <Label color="blue">Cenário Sugerido / Detalhes</Label>
            <TextArea 
              value={prompt} 
              onChange={e => setPrompt(e.target.value)}
              className="h-24" 
              placeholder="Ex: Em cima de uma mesa de escritório moderna, iluminação cinematográfica..." 
            />
          </div>

          <Button 
            variant="primary"
            onClick={handleGenerateClick}
            disabled={isLoading || (prompt === '' && !baseImage)}
            className="w-full py-5"
          >
            {isLoading ? 'Renderizando...' : 'Gerar Arte com Produto Real'}
          </Button>
        </>
      ) : (
        <div className="space-y-6">
           <Card color="indigo">
              <h4 className="text-[10px] font-black uppercase text-indigo-600 mb-2">Sync de Ativos Reais</h4>
              <p className="text-[11px] leading-relaxed text-slate-500 font-medium italic">A IA criará conceitos de anúncios usando a imagem do seu produto real como âncora visual.</p>
              <Button onClick={handleSync} disabled={isSyncing} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-3">
                 {isSyncing ? 'Analisando Funil...' : 'Sugerir Ativos de Mídia'}
              </Button>
           </Card>

           <div className="space-y-4">
              {syncConcepts.map((concept, idx) => (
                <div key={idx} className="p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded-md">{concept.type}</span>
                      <span className="text-[8px] font-black uppercase text-slate-400">{concept.visualStyle}</span>
                   </div>
                   <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                      <p className="text-[10px] font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic line-clamp-3">"{concept.adCopy}"</p>
                   </div>
                   <Button onClick={() => applyConcept(concept)} variant="secondary" className="w-full py-2 text-[9px]">Estilizar com Produto Real</Button>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default StudioModule;
