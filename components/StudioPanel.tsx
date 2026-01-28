
import React, { useState, useMemo, useEffect } from 'react';
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

  useEffect(() => {
    if (!selectedImage) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setSelectedImage(null);
      setRemoveBackground(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage]);

  const filteredImages = useMemo(() => {
    if (filter === 'ebook') return images.filter(img => img.preset === 'Ebook Cover');
    if (filter === 'social')
      return images.filter(img =>
        [
          'Facebook Cover',
          'Instagram Story',
          'LinkedIn Banner',
          'IG Feed',
          'IG Portrait',
          'IG Story',
          'Reels Cover',
          'TikTok 9:16',
          'YouTube Thumbnail',
          'LinkedIn Post',
          'Facebook Post'
        ].includes(img.preset)
      );
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
      case '1.91:1': return 'aspect-[1.91/1]';
      default: return 'aspect-square';
    }
  };

  const downloadProcessedImage = async (img: StudioImage) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const imageEl = new Image();
    imageEl.crossOrigin = "anonymous"; // Crucial for external images

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
          const threshold = 240;
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i]; const g = data[i + 1]; const b = data[i + 2];
            if (r > threshold && g > threshold && b > threshold) {
              data[i + 3] = 0;
            }
          }
          ctx.putImageData(imageData, 0, 0);
        }

        // --- SOLUÇÃO 1: OVERLAY DE TEXTO PROFISSIONAL ---
        if (img.adCopy) {
          const padding = canvas.width * 0.05;
          const maxWidth = canvas.width - (padding * 2);

          // Estilo do Box de Fundo (Glassmorphism simulado)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';

          // Configuração de Fonte
          const fontSize = Math.max(24, canvas.width * 0.04);
          ctx.font = `900 ${fontSize}px "Inter", sans-serif`;
          ctx.fillStyle = 'white';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // Quebra de linha simples
          const words = img.adCopy.split(' ');
          let line = '';
          const lines = [];
          for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > maxWidth && n > 0) {
              lines.push(line);
              line = words[n] + ' ';
            } else {
              line = testLine;
            }
          }
          lines.push(line);

          // Renderizar Box e Texto
          const lineHeight = fontSize * 1.2;
          const totalHeight = lines.length * lineHeight;
          const startY = canvas.height - totalHeight - (padding * 2);

          // Overlay de gradiente no fundo para legibilidade
          const grad = ctx.createLinearGradient(0, canvas.height, 0, startY - padding);
          grad.addColorStop(0, 'rgba(0,0,0,0.8)');
          grad.addColorStop(1, 'transparent');
          ctx.fillStyle = grad;
          ctx.fillRect(0, startY - padding, canvas.width, canvas.height - (startY - padding));

          ctx.fillStyle = 'white';
          lines.forEach((l, i) => {
            ctx.fillText(l.trim(), canvas.width / 2, startY + (i * lineHeight) + (lineHeight / 2));
          });
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
    <div className="flex-1 flex flex-col h-full overflow-hidden transition-colors duration-300 bg-paper text-ink">
      <div className="h-16 border-b px-8 flex items-center justify-between backdrop-blur-xl z-20 border-border bg-panel/70">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </div>
            <h2 className="text-sm font-display uppercase tracking-widest">Ativos do Funil</h2>
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
                className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${filter === f.id ? 'bg-panel text-primary shadow-sm' : 'text-slate hover:text-ink'}`}
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
            <div className="aspect-square rounded-3xl animate-pulse flex flex-col items-center justify-center p-8 text-center border-2 border-dashed bg-panel border-border shadow-card">
              <div className="w-12 h-12 border-4 border-slate-300 dark:border-slate-600 border-t-primary rounded-full animate-spin mb-4"></div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate">Criando Arte Profissional...</p>
            </div>
          </div>
        )}

        {filteredImages.length === 0 && !isGenerating ? (
          <div className="h-full flex flex-col items-center justify-center opacity-80 max-w-md mx-auto text-center">
            <div className="w-full max-w-sm mb-6 shadow-card border border-border rounded-3xl overflow-hidden bg-panel">
              <img src="/assets/estudio-ai-visual.png" alt="Estúdio AI Visual" className="w-full h-auto" />
            </div>
            <h3 className="text-lg font-display uppercase tracking-tighter mb-2">Sem artes nesta categoria</h3>
            <p className="text-xs font-bold leading-relaxed text-slate">Gere capas ou banners no painel lateral usando os Presets inteligentes.</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {filteredImages.map((img) => (
              <div
                key={img.id}
                className="group relative break-inside-avoid rounded-3xl overflow-hidden border transition-all shadow-card bg-panel border-border hover:border-primary"
              >
                <img src={img.url} className={`w-full h-auto object-cover ${getAspectRatioClass(img.aspectRatio)}`} alt="IA Visual" />

                {img.adCopy && (
                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
                    <p className="text-[9px] font-black text-white uppercase leading-tight line-clamp-2 text-center drop-shadow-md">
                      {img.adCopy}
                    </p>
                  </div>
                )}

                <div className="absolute top-4 left-4 z-10 flex gap-2">
                  <span className="px-2 py-1 bg-primary text-white text-[8px] font-black uppercase rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
                    {img.preset}
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-primary text-white text-[8px] font-black uppercase rounded-md">{img.style}</span>
                    <span className="px-2 py-0.5 bg-white/20 text-white text-[8px] font-black uppercase rounded-md backdrop-blur-md">{img.format.split('/')[1]}</span>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={() => setSelectedImage(img)} className="flex-1 py-2 bg-panel text-ink text-[10px] font-black uppercase rounded-lg hover:bg-blue-50 transition-all">Ver Detalhes</button>
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
        <div
          className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-300"
          role="button"
          tabIndex={0}
          aria-label="Fechar detalhes do asset"
          onClick={() => { setSelectedImage(null); setRemoveBackground(false); }}
          onKeyDown={(e) => {
            if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setSelectedImage(null);
              setRemoveBackground(false);
            }
          }}
        >
          <div className="max-w-6xl w-full rounded-[40px] overflow-hidden shadow-2xl border flex flex-col md:flex-row transition-colors h-[85vh] bg-panel border-border" onClick={e => e.stopPropagation()}>
            <div className="md:w-3/5 bg-slate-200 dark:bg-black flex items-center justify-center overflow-hidden h-full relative" style={{ backgroundImage: removeBackground ? 'radial-gradient(#ccc 1px, transparent 1px), radial-gradient(#ccc 1px, transparent 1px)' : 'none', backgroundSize: '20px 20px', backgroundPosition: '0 0, 10px 10px' }}>
              <img src={selectedImage.url} className={`max-w-full max-h-full object-contain ${removeBackground ? 'filter contrast-125' : ''}`} style={{ mixBlendMode: removeBackground ? 'multiply' : 'normal' }} alt="Preview Full" />

              {selectedImage.adCopy && (
                <div className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none">
                  <p className="text-xl md:text-2xl font-black text-white uppercase leading-tight text-center drop-shadow-2xl max-w-prose mx-auto">
                    {selectedImage.adCopy}
                  </p>
                </div>
              )}
              <div className="absolute top-6 left-6 flex flex-col gap-2">
                <span className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase rounded-2xl">{selectedImage.aspectRatio}</span>
                <span className="px-4 py-2 bg-primary text-white text-[10px] font-black uppercase rounded-2xl shadow-xl">{selectedImage.preset}</span>
              </div>
            </div>
            <div className="md:w-2/5 p-12 flex flex-col justify-between overflow-y-auto custom-scrollbar h-full">
              <div className="space-y-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-display uppercase tracking-tighter">Asset de Branding</h3>
                    <p className="text-[10px] font-black text-slate uppercase tracking-widest mt-1">Estúdio AI Professional</p>
                  </div>
                  <button onClick={() => { setSelectedImage(null); setRemoveBackground(false); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">✕</button>
                </div>

                {(selectedImage.format === 'image/png' || selectedImage.format === 'image/webp') && (
                  <Card color="indigo">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase text-indigo-600">Remover Fundo Branco</p>
                        <p className="text-[9px] font-bold text-slate mt-0.5">Ative para transparência na logo</p>
                      </div>
                      <Toggle checked={removeBackground} onChange={setRemoveBackground} />
                    </div>
                  </Card>
                )}

                {selectedImage.adCopy && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-slate uppercase tracking-widest">Copy Sincronizada</span>
                      <button onClick={() => copyAdText(selectedImage.adCopy!)} className="text-[10px] font-black text-primary uppercase hover:underline">Copiar</button>
                    </div>
                    <div className="p-6 bg-panel dark:bg-slate-800/50 rounded-[32px] border border-border dark:border-slate-800">
                      <p className="text-sm font-bold text-slate dark:text-slate-300 leading-relaxed italic">
                        "{selectedImage.adCopy}"
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate uppercase tracking-widest">Estilo</span>
                    <p className="text-sm font-bold text-primary">{selectedImage.style}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate uppercase tracking-widest">Formato Web</span>
                    <p className="text-sm font-bold uppercase">{selectedImage.format.split('/')[1]}</p>
                  </div>
                </div>
                {(selectedImage.modelUsed || selectedImage.usedReference !== undefined) && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate uppercase tracking-widest">Modelo</span>
                      <p className="text-sm font-bold">{selectedImage.modelUsed || 'n/d'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-slate uppercase tracking-widest">Referência</span>
                      <p className="text-sm font-bold uppercase">
                        {selectedImage.usedReference ? 'Sim' : 'Não'}
                        {selectedImage.fallbackUsed ? ' (fallback)' : ''}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-10">
                <button
                  onClick={() => downloadProcessedImage(selectedImage)}
                  className="w-full py-5 bg-primary text-white font-black uppercase text-xs tracking-widest rounded-3xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
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
