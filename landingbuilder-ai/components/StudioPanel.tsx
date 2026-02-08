
import React, { useState, useMemo } from 'react';
import { StudioImage } from '../types';
// Fix: Added missing Card import from BaseComponents
import { Toggle, Card } from './ui/BaseComponents';

interface StudioPanelProps {
  images: StudioImage[];
  uiTheme: 'light' | 'dark';
  onDeleteImage: (id: string) => void;
  isGenerating: boolean;
}

const StudioPanel: React.FC<StudioPanelProps> = ({ images, uiTheme, onDeleteImage, isGenerating }) => {
  const [selectedImage, setSelectedImage] = useState<StudioImage | null>(null);
  const [filter, setFilter] = useState<'all' | 'ebook' | 'social' | 'ads'>('all');
  const [removeBackground, setRemoveBackground] = useState(false);

  const filteredImages = useMemo(() => {
    if (filter === 'ebook') return images.filter(img => img.preset === 'Ebook Cover');
    if (filter === 'social') return images.filter(img => ['Facebook Cover', 'Instagram Story', 'LinkedIn Banner'].includes(img.preset));
    if (filter === 'ads') return images.filter(img => !!img.adCopy || img.preset === 'VSL Thumbnail' || img.preset === 'Google Display');
    return images;
  }, [images, filter]);

  const getAspectRatioClass = (ratio: string) => {
    switch (ratio) {
      case '16:9': return 'aspect-video';
      case '9:16': return 'aspect-[9/16]';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4]';
      case '2:3': return 'aspect-[2/3]';
      default: return 'aspect-square';
    }
  };

  const downloadProcessedImage = async (img: StudioImage) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imageEl = new Image();
    
    imageEl.onload = () => {
      canvas.width = imageEl.width;
      canvas.height = imageEl.height;
      if (ctx) {
        // Se for JPG, sempre fundo branco
        if (img.format === 'image/jpeg') {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        ctx.drawImage(imageEl, 0, 0);

        // Algoritmo de Remoção de Fundo (Chromakey Branco para Alpha)
        if (removeBackground && (img.format === 'image/png' || img.format === 'image/webp')) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Sensibilidade do branco (threshold)
          const threshold = 240; 
          
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i+1];
            const b = data[i+2];
            
            // Se o pixel for próximo ao branco, torna-o transparente
            if (r > threshold && g > threshold && b > threshold) {
              data[i + 3] = 0; // Alpha = 0
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }
        
        const dataUrl = canvas.toDataURL(img.format, img.quality);
        const link = document.createElement('a');
        const ext = img.format.split('/')[1];
        link.href = dataUrl;
        link.download = `LB-Asset-${img.preset.replace(/\s+/g, '-')}-${img.id}.${ext}`;
        link.click();
      }
    };
    imageEl.src = img.url;
  };

  const copyAdText = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Texto do anúncio copiado!");
  };

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300 ${uiTheme === 'dark' ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <div className={`h-16 border-b px-8 flex items-center justify-between backdrop-blur-xl z-20 ${uiTheme === 'dark' ? 'border-slate-800 bg-slate-900/50' : 'border-slate-200 bg-white/50'}`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-sm font-black uppercase tracking-widest">Ativos do Funil</h2>
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl gap-1">
             {[
               { id: 'all', label: 'Tudo' },
               { id: 'ebook', label: 'Capas Book' },
               { id: 'social', label: 'Social' },
               { id: 'ads', label: 'Ads/VSL' }
             ].map(f => (
               <button 
                 key={f.id}
                 onClick={() => setFilter(f.id as any)}
                 className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${filter === f.id ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
               >
                 {f.label}
               </button>
             ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {isGenerating && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className={`aspect-square rounded-3xl animate-pulse flex flex-col items-center justify-center p-8 text-center border-2 border-dashed ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
               <div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin mb-4"></div>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Criando Arte Profissional...</p>
            </div>
          </div>
        )}

        {filteredImages.length === 0 && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40 max-w-sm mx-auto text-center">
             <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             </div>
             <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Sem artes nesta categoria</h3>
             <p className="text-xs font-bold leading-relaxed">Gere capas ou banners no painel lateral usando os Presets inteligentes.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredImages.map((img) => (
              <div 
                key={img.id} 
                className={`group relative break-inside-avoid rounded-3xl overflow-hidden border transition-all shadow-lg ${uiTheme === 'dark' ? 'bg-slate-800 border-slate-700 hover:border-blue-500' : 'bg-white border-slate-100 hover:border-blue-500'}`}
              >
                <img src={img.url} className={`w-full h-auto object-cover ${getAspectRatioClass(img.aspectRatio)}`} alt="IA Visual" />
                
                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className="px-2 py-1 bg-blue-600 text-white text-[8px] font-black uppercase rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
                    {img.preset}
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                   <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-[8px] font-black uppercase rounded-md">{img.style}</span>
                      <span className="px-2 py-0.5 bg-white/20 text-white text-[8px] font-black uppercase rounded-md backdrop-blur-md">{img.format.split('/')[1]}</span>
                   </div>
                   
                   <div className="flex gap-2">
                      <button onClick={() => setSelectedImage(img)} className="flex-1 py-2 bg-white text-slate-900 text-[10px] font-black uppercase rounded-lg hover:bg-blue-50 transition-all">Ver Detalhes</button>
                      <button onClick={() => onDeleteImage(img.id)} className="p-2 bg-rose-600/20 text-rose-500 rounded-lg hover:bg-rose-600 hover:text-white transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300" onClick={() => { setSelectedImage(null); setRemoveBackground(false); }}>
           <div className={`max-w-6xl w-full rounded-[40px] overflow-hidden shadow-2xl border flex flex-col md:flex-row transition-colors h-[85vh] ${uiTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`} onClick={e => e.stopPropagation()}>
              <div className="md:w-3/5 bg-slate-200 dark:bg-black flex items-center justify-center overflow-hidden h-full relative" style={{ backgroundImage: removeBackground ? 'radial-gradient(#ccc 1px, transparent 1px), radial-gradient(#ccc 1px, transparent 1px)' : 'none', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
                <img src={selectedImage.url} className={`max-w-full max-h-full object-contain ${removeBackground ? 'filter contrast-125' : ''}`} style={{ mixBlendMode: removeBackground ? 'multiply' : 'normal' }} alt="Preview Full" />
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                  <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase rounded-2xl">{selectedImage.aspectRatio}</span>
                  <span className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase rounded-2xl shadow-xl">{selectedImage.preset}</span>
                </div>
              </div>
              <div className="md:w-2/5 p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar h-full">
                <div className="space-y-8">
                   <div className="flex justify-between items-start">
                     <div>
                       <h3 className="text-2xl font-black uppercase tracking-tighter">Asset de Branding</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Estúdio AI Professional</p>
                     </div>
                     <button onClick={() => { setSelectedImage(null); setRemoveBackground(false); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">✕</button>
                   </div>

                   {(selectedImage.format === 'image/png' || selectedImage.format === 'image/webp') && (
                     <Card color="indigo">
                        <div className="flex items-center justify-between">
                           <div>
                              <p className="text-[10px] font-black uppercase text-indigo-600">Remover Fundo Branco</p>
                              <p className="text-[9px] font-bold text-slate-400 mt-0.5">Ative para transparência na logo</p>
                           </div>
                           <Toggle checked={removeBackground} onChange={setRemoveBackground} />
                        </div>
                     </Card>
                   )}

                   {selectedImage.adCopy && (
                      <div className="space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Copy Sincronizada</span>
                            <button onClick={() => copyAdText(selectedImage.adCopy!)} className="text-[10px] font-black text-blue-600 uppercase hover:underline">Copiar</button>
                         </div>
                         <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800">
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed italic">
                               "{selectedImage.adCopy}"
                            </p>
                         </div>
                      </div>
                   )}

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estilo</span>
                         <p className="text-sm font-bold text-blue-600">{selectedImage.style}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Formato Web</span>
                         <p className="text-sm font-bold uppercase">{selectedImage.format.split('/')[1]}</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-10">
                   <button 
                     onClick={() => downloadProcessedImage(selectedImage)}
                     className="w-full py-5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                     Baixar {selectedImage.format.split('/')[1].toUpperCase()} {removeBackground ? '(Alpha)' : ''}
                   </button>
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default StudioPanel;
