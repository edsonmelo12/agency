
import React, { useState, useRef, useEffect } from 'react';
import { Label, TextArea, Button, Card, Select, Input, Toggle } from '../ui/BaseComponents';
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
    strictReference?: boolean,
    adCopy?: string,
    adType?: string
  ) => void;
  onSyncCreatives: () => Promise<CreativeConcept[]>;
  onGenerateMarketingIdeas: () => Promise<any[]>;
  onGeneratePaidAdsPlan: (objective: string, platform: string, budget: string) => Promise<any>;
  onSaveCanvasImage: (dataUrl: string, meta: { prompt: string; preset: AssetPreset }) => Promise<void>;
  isLoading: boolean;
}

const StudioModule: React.FC<Props> = ({ activeProduct, onGenerateImage, onSyncCreatives, onGenerateMarketingIdeas, onGeneratePaidAdsPlan, onSaveCanvasImage, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'generate' | 'sync' | 'campaigns'>('generate');
  const [prompt, setPrompt] = useState('');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [quality, setQuality] = useState<'standard' | 'ultra'>('standard');
  const [aspectRatio, setAspectRatio] = useState<ImageAspectRatio>('1:1');
  const [style, setStyle] = useState<VisualStyle>('Product Commercial');
  const [preset, setPreset] = useState<AssetPreset>('Custom');
  const [exportFormat, setExportFormat] = useState<ImageExportFormat>('image/webp');
  const [exportQuality, setExportQuality] = useState(0.85);
  const [strictReference, setStrictReference] = useState(true);
  
  const [pendingAdCopy, setPendingAdCopy] = useState<string | undefined>();
  const [pendingAdType, setPendingAdType] = useState<string | undefined>();
  
  const [syncConcepts, setSyncConcepts] = useState<CreativeConcept[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [marketingIdeas, setMarketingIdeas] = useState<any[]>([]);
  const [paidPlan, setPaidPlan] = useState<any | null>(null);
  const [objective, setObjective] = useState('Conversões');
  const [platform, setPlatform] = useState('Meta (Facebook/Instagram)');
  const [budget, setBudget] = useState('R$ 2.000/mês');
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingPaidPlan, setIsGeneratingPaidPlan] = useState(false);
  const [canvasHeadline, setCanvasHeadline] = useState('Respire e conduza seu ritmo');
  const [canvasSubhead, setCanvasSubhead] = useState('Micro decisoes que reduzem ansiedade e aumentam presenca.');
  const [canvasTag, setCanvasTag] = useState('ENGAJAMENTO');
  const [socialPreset, setSocialPreset] = useState<AssetPreset>('IG Feed');
  const [socialPhilosophy, setSocialPhilosophy] = useState<'Editorial Calm' | 'Impact Bold' | 'Tech Minimal'>('Editorial Calm');
  const [socialHeadline, setSocialHeadline] = useState('Respire e recupere o ritmo');
  const [socialSubhead, setSocialSubhead] = useState('Micro decisões, grandes mudanças na presença.');
  const [socialTag, setSocialTag] = useState('SERIE');
  const [socialNoText, setSocialNoText] = useState(false);
  const [socialHighContrast, setSocialHighContrast] = useState(false);
  const [socialUseProductImage, setSocialUseProductImage] = useState(true);
  const [socialCollectionMode, setSocialCollectionMode] = useState(false);
  const [socialCollectionCount, setSocialCollectionCount] = useState(3);
  
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (activeTab !== 'generate') setActiveTab('generate');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);

  const presets: { id: AssetPreset; ratio: ImageAspectRatio; label: string }[] = [
    { id: 'Ebook Cover', ratio: '3:4', label: 'Capa E-book' },
    { id: 'Facebook Cover', ratio: '16:9', label: 'Capa Facebook' },
    { id: 'Instagram Story', ratio: '9:16', label: 'Story IG' },
    { id: 'VSL Thumbnail', ratio: '16:9', label: 'Thumbnail VSL' },
    { id: 'Google Display', ratio: '16:9', label: 'Google Ads' },
    { id: 'LinkedIn Banner', ratio: '16:9', label: 'LinkedIn' },
    { id: 'IG Feed', ratio: '1:1', label: 'IG Feed' },
    { id: 'IG Portrait', ratio: '4:5', label: 'IG 4:5' },
    { id: 'IG Story', ratio: '9:16', label: 'IG Story' },
    { id: 'Reels Cover', ratio: '9:16', label: 'Reels Cover' },
    { id: 'TikTok 9:16', ratio: '9:16', label: 'TikTok' },
    { id: 'YouTube Thumbnail', ratio: '16:9', label: 'YouTube' },
    { id: 'LinkedIn Post', ratio: '1.91:1', label: 'LinkedIn Post' },
    { id: 'Facebook Post', ratio: '1.91:1', label: 'FB Post' },
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
      const message = String((e as any)?.message || '');
      console.error(e);
      if (/overloaded|unavailable|503/i.test(message)) {
        alert("O modelo está sobrecarregado no momento. Tente novamente em alguns minutos.");
      } else if (/ERR_NAME_NOT_RESOLVED|Failed to fetch|NetworkError/i.test(message)) {
        alert("Falha de rede/DNS ao acessar a IA. Verifique sua conexão e se o domínio generativelanguage.googleapis.com está liberado (Brave Shields/DNS).");
      } else {
        alert("Erro ao sugerir ativos de mídia. Tente novamente.");
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMarketingIdeas = async () => {
    setIsGeneratingIdeas(true);
    try {
      const ideas = await onGenerateMarketingIdeas();
      setMarketingIdeas(ideas || []);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar ideias de marketing.");
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const handlePaidPlan = async () => {
    setIsGeneratingPaidPlan(true);
    try {
      const plan = await onGeneratePaidAdsPlan(objective, platform, budget);
      setPaidPlan(plan || null);
    } catch (e) {
      console.error(e);
      alert("Erro ao gerar plano de campanhas pagas.");
    } finally {
      setIsGeneratingPaidPlan(false);
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
      setStrictReference(true);
    }
    
    setActiveTab('generate');
  };

  const handleGenerateClick = () => {
    if (strictReference && !baseImage) {
      alert("Ative uma imagem de referência para usar o modo Estrito.");
      return;
    }
    onGenerateImage(
      baseImage, 
      prompt, 
      style, 
      aspectRatio, 
      quality, 
      exportFormat, 
      exportQuality, 
      preset,
      strictReference,
      pendingAdCopy, 
      pendingAdType
    );
    setPendingAdCopy(undefined);
    setPendingAdType(undefined);
  };

  const handleCanvasStory = async () => {
    if (!baseImage) {
      alert("Envie uma imagem de referencia do produto.");
      return;
    }
    try {
      const img = new Image();
      img.onload = async () => {
        const W = 1080;
        const H = 1920;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const navy = '#0e1826';
        const slate = '#e8edf2';
        const accent = '#ffd9c7';
        const overlay = 'rgba(15, 24, 36, 0.72)';

        const coverScale = Math.max(W / img.width, H / img.height);
        const coverW = img.width * coverScale;
        const coverH = img.height * coverScale;
        const coverX = (W - coverW) / 2;
        const coverY = (H - coverH) / 2;
        ctx.drawImage(img, coverX, coverY, coverW, coverH);

        ctx.fillStyle = overlay;
        ctx.fillRect(0, 1050, W, 870);

        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.fillRect(80, 1110, W - 160, 650);

        const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
          const words = text.split(/\s+/);
          let line = '';
          for (let i = 0; i < words.length; i += 1) {
            const testLine = line + words[i] + ' ';
            const { width } = ctx.measureText(testLine);
            if (width > maxWidth && i > 0) {
              ctx.fillText(line.trim(), x, y);
              line = words[i] + ' ';
              y += lineHeight;
            } else {
              line = testLine;
            }
          }
          if (line.trim()) ctx.fillText(line.trim(), x, y);
          return y;
        };

        ctx.fillStyle = accent;
        ctx.font = '20px monospace';
        ctx.fillText(canvasTag.toUpperCase(), 120, 1180);

        ctx.fillStyle = slate;
        ctx.font = '64px serif';
        let textY = 1250;
        textY = wrapText(canvasHeadline, 120, textY, W - 240, 78) + 12;

        ctx.fillStyle = slate;
        ctx.font = '28px sans-serif';
        wrapText(canvasSubhead, 120, textY + 16, W - 240, 40);

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(120, 1680, 380, 64);
        ctx.fillStyle = navy;
        ctx.font = '24px sans-serif';
        ctx.fillText('Quero saber mais', 150, 1722);

        const dataUrl = canvas.toDataURL('image/png');
        await onSaveCanvasImage(dataUrl, { prompt: 'Canvas Editorial Story', preset: 'Instagram Story' });
      };
      img.onerror = () => alert('Falha ao carregar a imagem de referencia.');
      img.src = baseImage;
    } catch (e) {
      console.error(e);
      alert('Falha ao gerar arte editorial.');
    }
  };

  const socialPresets: { id: AssetPreset; w: number; h: number; label: string }[] = [
    { id: 'IG Feed', w: 1080, h: 1080, label: 'Instagram 1:1' },
    { id: 'IG Portrait', w: 1080, h: 1350, label: 'Instagram 4:5' },
    { id: 'IG Story', w: 1080, h: 1920, label: 'Story 9:16' },
    { id: 'Reels Cover', w: 1080, h: 1920, label: 'Reels 9:16' },
    { id: 'TikTok 9:16', w: 1080, h: 1920, label: 'TikTok 9:16' },
    { id: 'YouTube Thumbnail', w: 1280, h: 720, label: 'YouTube 16:9' },
    { id: 'LinkedIn Post', w: 1200, h: 628, label: 'LinkedIn 1.91:1' },
    { id: 'Facebook Post', w: 1200, h: 628, label: 'Facebook 1.91:1' }
  ];

  const getSocialPresetConfig = (id: AssetPreset) => {
    return socialPresets.find(p => p.id === id) || socialPresets[0];
  };

  const handleSocialCanvas = async () => {
    const presetConfig = getSocialPresetConfig(socialPreset);
    if (!presetConfig) return;

    const loadCanvasFont = async (family: string, url: string) => {
      try {
        // Skip reloading if already available
        if (document.fonts && Array.from(document.fonts).some(f => f.family === family)) return;
        const face = new FontFace(family, `url(${url})`);
        await face.load();
        document.fonts.add(face);
      } catch (_) {
        // Fallback to system fonts if custom font isn't available
      }
    };

    const ensureCanvasFonts = async () => {
      const flag = (window as any).__lbCanvasFontsReady;
      if (flag) return;
      await loadCanvasFont('Sora', '/canvas-fonts/Sora-SemiBold.woff2');
      await loadCanvasFont('Space Grotesk', '/canvas-fonts/SpaceGrotesk-Medium.woff2');
      await loadCanvasFont('IBM Plex Mono', '/canvas-fonts/IBMPlexMono-Medium.woff2');
      (window as any).__lbCanvasFontsReady = true;
    };

    await ensureCanvasFonts();

    const renderVariant = async (variantIndex: number, variantTotal: number) => {
      const scale = 2;
      const W = presetConfig.w;
      const H = presetConfig.h;
      const canvas = document.createElement('canvas');
      canvas.width = W * scale;
      canvas.height = H * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.scale(scale, scale);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const palettes = {
        'Editorial Calm': { bg: '#f6f5f2', ink: '#0d1117', muted: '#6b7280', accent: '#f59e0b', grid: '#e4e4e7' },
        'Impact Bold': { bg: '#0b0f14', ink: '#ffffff', muted: '#cbd5f5', accent: '#22d3ee', grid: '#1f2937' },
        'Tech Minimal': { bg: '#0f172a', ink: '#e2e8f0', muted: '#94a3b8', accent: '#38bdf8', grid: '#1e293b' }
      } as const;

      const palette = { ...palettes[socialPhilosophy] };
      if (socialHighContrast) {
        palette.bg = '#0b0f14';
        palette.ink = '#ffffff';
        palette.muted = '#cbd5e1';
        palette.accent = '#f97316';
        palette.grid = '#1f2937';
      }

      const safeTop = ['IG Story', 'Reels Cover', 'TikTok 9:16'].includes(socialPreset) ? 0.18 : 0.08;
      const safeBottom = ['IG Story', 'Reels Cover', 'TikTok 9:16'].includes(socialPreset) ? 0.18 : 0.08;
      const safeSide = ['LinkedIn Post', 'Facebook Post'].includes(socialPreset) ? 0.08 : 0.08;

      const contentX = W * safeSide;
      const contentY = H * safeTop;
      const contentW = W * (1 - safeSide * 2);
      const contentH = H * (1 - safeTop - safeBottom);

      // Background
      ctx.fillStyle = palette.bg;
      ctx.fillRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = palette.grid;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 1;
      const gridStep = Math.max(24, Math.round(W / 24));
      for (let x = contentX; x <= contentX + contentW; x += gridStep) {
        ctx.beginPath();
        ctx.moveTo(x, contentY);
        ctx.lineTo(x, contentY + contentH);
        ctx.stroke();
      }
      for (let y = contentY; y <= contentY + contentH; y += gridStep) {
        ctx.beginPath();
        ctx.moveTo(contentX, y);
        ctx.lineTo(contentX + contentW, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      const variantSlot = variantIndex % 3;
      const layoutModes = ['split-left', 'split-right', 'center-stack', 'image-dominant', 'text-dominant'] as const;
      const layoutMode = layoutModes[variantIndex % layoutModes.length];
      const blockW = W * (variantSlot === 2 ? 0.2 : 0.16);
      const blockH = H * 0.02;
      const blockX = variantSlot === 1 ? contentX + contentW - blockW : contentX;
      const blockY = contentY + contentH - blockH - (H * 0.02);
      ctx.fillStyle = palette.accent;
      ctx.globalAlpha = 0.9;
      ctx.fillRect(blockX, blockY, blockW, blockH);
      ctx.globalAlpha = 1;

      const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) => {
        if (!text) return y;
        const words = text.split(/\s+/);
        let line = '';
        let lineCount = 0;
        for (let i = 0; i < words.length; i += 1) {
          const testLine = line + words[i] + ' ';
          const { width } = ctx.measureText(testLine);
          if (width > maxWidth && i > 0) {
            ctx.fillText(line.trim(), x, y);
            line = words[i] + ' ';
            y += lineHeight;
            lineCount += 1;
            if (lineCount >= maxLines) return y;
          } else {
            line = testLine;
          }
        }
        if (line.trim()) ctx.fillText(line.trim(), x, y);
        return y;
      };

      // Optional product image
      const imageUrl = socialUseProductImage ? (baseImage || activeProduct?.imageUrl || null) : null;
      if (imageUrl) {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        await new Promise<void>((resolve) => {
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = imageUrl;
        });
        if (img.width && img.height) {
          const isWide = ['YouTube Thumbnail', 'LinkedIn Post', 'Facebook Post'].includes(socialPreset);
          let imageArea = { x: contentX, y: contentY, w: contentW, h: contentH };
          if (layoutMode === 'split-left') {
            imageArea = isWide
              ? { x: contentX, y: contentY, w: contentW * 0.42, h: contentH }
              : { x: contentX, y: contentY + contentH * 0.08, w: contentW * 0.45, h: contentH * 0.84 };
          } else if (layoutMode === 'split-right') {
            imageArea = isWide
              ? { x: contentX + contentW * 0.58, y: contentY, w: contentW * 0.42, h: contentH }
              : { x: contentX + contentW * 0.55, y: contentY + contentH * 0.08, w: contentW * 0.45, h: contentH * 0.84 };
          } else if (layoutMode === 'center-stack') {
            imageArea = { x: contentX + contentW * 0.2, y: contentY + contentH * 0.22, w: contentW * 0.6, h: contentH * 0.56 };
          } else if (layoutMode === 'image-dominant') {
            imageArea = { x: contentX + contentW * 0.05, y: contentY + contentH * 0.02, w: contentW * 0.9, h: contentH * 0.76 };
          } else if (layoutMode === 'text-dominant') {
            imageArea = isWide
              ? { x: contentX + contentW * 0.6, y: contentY + contentH * 0.2, w: contentW * 0.35, h: contentH * 0.6 }
              : { x: contentX + contentW * 0.58, y: contentY + contentH * 0.18, w: contentW * 0.36, h: contentH * 0.64 };
          }
          const coverScale = Math.max(imageArea.w / img.width, imageArea.h / img.height);
          const coverW = img.width * coverScale;
          const coverH = img.height * coverScale;
          const coverX = imageArea.x + (imageArea.w - coverW) / 2;
          const coverY = imageArea.y + (imageArea.h - coverH) / 2;
          ctx.save();
          ctx.beginPath();
          ctx.rect(imageArea.x, imageArea.y, imageArea.w, imageArea.h);
          ctx.clip();
          ctx.drawImage(img, coverX, coverY, coverW, coverH);
          ctx.restore();
        }
      }

      if (!socialNoText) {
        // Tag
        const tagX = layoutMode === 'split-right' || layoutMode === 'text-dominant'
          ? contentX + contentW * 0.05
          : layoutMode === 'split-left'
            ? contentX + contentW * 0.5
            : contentX;
        ctx.fillStyle = palette.accent;
        ctx.font = `600 ${Math.max(16, Math.round(W * 0.018))}px "Space Grotesk", "IBM Plex Mono", monospace`;
        ctx.fillText(socialTag.toUpperCase(), tagX, contentY + Math.max(18, Math.round(H * 0.03)));

        // Headline
        const headlineX = layoutMode === 'split-right' || layoutMode === 'text-dominant'
          ? contentX + contentW * 0.05
          : layoutMode === 'split-left'
            ? contentX + contentW * 0.5
            : contentX + contentW * 0.08;
        ctx.fillStyle = palette.ink;
        const headlineScale =
          layoutMode === 'image-dominant' ? 0.055 :
          layoutMode === 'center-stack' ? 0.058 :
          layoutMode === 'text-dominant' ? 0.065 :
          0.06;
        ctx.font = `700 ${Math.max(34, Math.round(W * headlineScale))}px "Sora", "Space Grotesk", sans-serif`;
        const headlineY =
          layoutMode === 'center-stack'
            ? contentY + contentH * 0.08
            : contentY + Math.max(70, Math.round(H * 0.12));
        const headlineMaxBase = ['YouTube Thumbnail', 'LinkedIn Post', 'Facebook Post'].includes(socialPreset)
          ? contentW * 0.56
          : contentW * 0.72;
        const headlineMax =
          layoutMode === 'split-left' || layoutMode === 'split-right'
            ? headlineMaxBase * 0.52
            : layoutMode === 'text-dominant'
              ? headlineMaxBase * 0.62
              : layoutMode === 'center-stack'
                ? headlineMaxBase * 0.85
                : headlineMaxBase;
        const nextY = wrapText(socialHeadline, headlineX, headlineY, headlineMax, Math.round(W * 0.065), 3);

        // Subhead
        ctx.fillStyle = palette.muted;
        ctx.font = `500 ${Math.max(18, Math.round(W * 0.022))}px "Space Grotesk", "Inter", sans-serif`;
        const subheadOffset = layoutMode === 'image-dominant' ? Math.round(W * 0.03) : Math.round(W * 0.02);
        wrapText(socialSubhead, headlineX, nextY + subheadOffset, headlineMax, Math.round(W * 0.03), 2);
      }

      const dataUrl = canvas.toDataURL('image/png');
      const metaPrompt = `Social Studio • ${socialPreset} • ${socialPhilosophy} • V${variantIndex + 1}/${variantTotal}`;
      await onSaveCanvasImage(dataUrl, { prompt: metaPrompt, preset: socialPreset });
    };

    const total = socialCollectionMode ? Math.min(6, Math.max(3, socialCollectionCount)) : 1;
    for (let i = 0; i < total; i += 1) {
      await renderVariant(i, total);
    }
  };

  const styles: VisualStyle[] = ['Product Commercial', 'Minimalist', 'Luxury', 'Nature', 'Cyberpunk', 'Lifestyle', 'Photorealistic'];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1">
         <button onClick={() => setActiveTab('generate')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${activeTab === 'generate' ? 'bg-panel text-primary shadow-sm' : 'text-slate'}`}>Gerar Arte</button>
         <button onClick={() => setActiveTab('sync')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${activeTab === 'sync' ? 'bg-panel text-primary shadow-sm' : 'text-slate'}`}>Canais de Mídia</button>
         <button onClick={() => setActiveTab('campaigns')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${activeTab === 'campaigns' ? 'bg-panel text-primary shadow-sm' : 'text-slate'}`}>Campanhas</button>
      </div>

      {activeTab === 'generate' ? (
        <>
          <div className="space-y-4">
            <Label color="blue">Preset de Destino</Label>
            <Select value={preset} onChange={(e) => handlePresetChange(e.target.value as AssetPreset)}>
              {presets.map(p => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </Select>
          </div>

          <div className="space-y-4">
            <Label color="indigo">Estilo Visual</Label>
            <Select value={style} onChange={(e) => setStyle(e.target.value as VisualStyle)}>
              {styles.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </Select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label color="blue">Imagem de Referência (Produto Real)</Label>
              {baseImage && (
                <button
                  onClick={() => {
                    setBaseImage(null);
                    setStrictReference(false);
                  }}
                  className="text-[9px] font-black text-rose-500 uppercase"
                >
                  Remover
                </button>
              )}
            </div>
            <div 
              onClick={() => fileRef.current?.click()}
              className="w-full aspect-video bg-panel border-2 border-dashed border-border rounded-3xl flex items-center justify-center cursor-pointer hover:border-primary overflow-hidden shadow-sm transition-colors"
            >
              {baseImage ? (
                <img src={baseImage} className="w-full h-full object-contain" alt="Preview" />
              ) : (
                <div className="flex flex-col items-center gap-2">
                   <svg className="w-8 h-8 text-slate" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                   <span className="text-[10px] font-bold text-slate uppercase tracking-widest">Upload Produto Real</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileRef} className="hidden" accept="image/*" onChange={handleFile} />
            <p className="text-[8px] font-bold text-slate mt-2 uppercase">Dica: Use a foto real do produto para que a IA crie cenários ao redor dele.</p>
          </div>

          <div className="flex items-center justify-between p-3 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/40 rounded-xl">
            <div>
              <p className="text-[10px] font-black uppercase text-primary">Preservar Produto (Estrito)</p>
              <p className="text-[10px] text-slate">Mantém formato, cor e textura da referência.</p>
            </div>
            <button
              onClick={() => setStrictReference(!strictReference)}
              className={`w-12 h-6 rounded-full transition-colors ${strictReference ? 'bg-primary' : 'bg-slate-300'}`}
              aria-label="Alternar modo estrito"
            >
              <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${strictReference ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div className="space-y-2">
            <Label color="blue">Qualidade de Render</Label>
            <Select value={quality} onChange={(e) => setQuality(e.target.value as 'standard' | 'ultra')}>
              <option value="standard">Standard (mais estável)</option>
              <option value="ultra">Ultra (maior definição)</option>
            </Select>
            <p className="text-[8px] font-bold text-slate uppercase">Standard é mais estável; Ultra gera maior definição.</p>
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
            disabled={isLoading || (prompt === '' && !baseImage) || (strictReference && !baseImage)}
            className="w-full py-5"
          >
            {isLoading ? 'Renderizando...' : baseImage ? 'Gerar Arte com Produto Real' : 'Gerar Arte'}
          </Button>

          <Card color="slate">
            <h4 className="text-[10px] font-black uppercase text-white">Arte Premium (Canvas)</h4>
            <p className="text-[11px] leading-relaxed text-slate-300">Story editorial usando a foto do produto como base.</p>
            <div className="space-y-3">
              <Input value={canvasHeadline} onChange={(e) => setCanvasHeadline(e.target.value)} placeholder="Headline" />
              <Input value={canvasSubhead} onChange={(e) => setCanvasSubhead(e.target.value)} placeholder="Subhead curta" />
              <Input value={canvasTag} onChange={(e) => setCanvasTag(e.target.value)} placeholder="Tag (ex: ENGAGEMENT)" />
            </div>
            <Button onClick={handleCanvasStory} className="w-full mt-4 bg-slate-900 hover:bg-black text-white py-3">
              Gerar Story Editorial
            </Button>
          </Card>

          <Card color="indigo">
            <h4 className="text-[10px] font-black uppercase text-primary">Social Studio</h4>
            <p className="text-[11px] leading-relaxed text-slate">Artes editoriais para posts sociais com filosofia visual.</p>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Select value={socialPreset} onChange={(e) => setSocialPreset(e.target.value as AssetPreset)}>
                  {socialPresets.map(p => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </Select>
                <Select value={socialPhilosophy} onChange={(e) => setSocialPhilosophy(e.target.value as any)}>
                  <option>Editorial Calm</option>
                  <option>Impact Bold</option>
                  <option>Tech Minimal</option>
                </Select>
              </div>
              <Input value={socialHeadline} onChange={(e) => setSocialHeadline(e.target.value)} placeholder="Headline curta" />
              <Input value={socialSubhead} onChange={(e) => setSocialSubhead(e.target.value)} placeholder="Subhead curta (opcional)" />
              <Input value={socialTag} onChange={(e) => setSocialTag(e.target.value)} placeholder="Tag (ex: SERIE)" />
              <div className="flex items-center justify-between p-3 bg-panel border border-border rounded-xl">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate">Sem texto</p>
                  <p className="text-[9px] text-slate">Gera só a composição visual.</p>
                </div>
                <Toggle checked={socialNoText} onChange={setSocialNoText} />
              </div>
              <div className="flex items-center justify-between p-3 bg-panel border border-border rounded-xl">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate">Alto contraste</p>
                  <p className="text-[9px] text-slate">Aumenta impacto em feed.</p>
                </div>
                <Toggle checked={socialHighContrast} onChange={setSocialHighContrast} />
              </div>
              <div className="flex items-center justify-between p-3 bg-panel border border-border rounded-xl">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate">Usar produto</p>
                  <p className="text-[9px] text-slate">Aplica a imagem enviada/ativa.</p>
                </div>
                <Toggle checked={socialUseProductImage} onChange={setSocialUseProductImage} />
              </div>
              <div className="flex items-center justify-between p-3 bg-panel border border-border rounded-xl">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate">Modo coleção</p>
                  <p className="text-[9px] text-slate">Gera variações para carrossel.</p>
                </div>
                <Toggle checked={socialCollectionMode} onChange={setSocialCollectionMode} />
              </div>
              {socialCollectionMode && (
                <Select value={String(socialCollectionCount)} onChange={(e) => setSocialCollectionCount(parseInt(e.target.value, 10))}>
                  <option value="3">3 variações</option>
                  <option value="4">4 variações</option>
                  <option value="5">5 variações</option>
                  <option value="6">6 variações</option>
                </Select>
              )}
            </div>
            <Button onClick={handleSocialCanvas} className="w-full mt-4 bg-primary hover:bg-blue-700 text-white py-3">
              {socialCollectionMode ? 'Gerar Coleção Social' : 'Gerar Arte Social'}
            </Button>
          </Card>
        </>
      ) : activeTab === 'sync' ? (
        <div className="space-y-6">
           <Card color="indigo">
              <h4 className="text-[10px] font-black uppercase text-primary mb-2">Sync de Ativos Reais</h4>
              <p className="text-[11px] leading-relaxed text-slate font-medium italic">A IA criará conceitos de anúncios usando a imagem do seu produto real como âncora visual.</p>
              <Button onClick={handleSync} disabled={isSyncing} className="w-full mt-4 bg-primary hover:bg-blue-700 text-white py-3">
                 {isSyncing ? 'Analisando Funil...' : 'Sugerir Ativos de Mídia'}
              </Button>
           </Card>

           <div className="space-y-4">
              {syncConcepts.map((concept, idx) => (
                <div key={idx} className="p-4 bg-panel border border-border rounded-2xl shadow-sm space-y-3">
                   <div className="flex justify-between items-center">
                      <span className="px-2 py-0.5 bg-blue-50 text-primary text-[8px] font-black uppercase rounded-md">{concept.type}</span>
                      <span className="text-[8px] font-black uppercase text-slate">{concept.visualStyle}</span>
                   </div>
                   <div className="p-3 bg-panel rounded-xl border border-border">
                      <p className="text-[10px] font-bold text-slate leading-relaxed italic line-clamp-3">"{concept.adCopy}"</p>
                   </div>
                   <Button onClick={() => applyConcept(concept)} variant="secondary" className="w-full py-2 text-[9px]">Estilizar com Produto Real</Button>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="space-y-6">
          <Card color="indigo">
            <h4 className="text-[10px] font-black uppercase text-primary mb-2">Ideias de Marketing</h4>
            <p className="text-[11px] leading-relaxed text-slate font-medium italic">Sugestões estratégicas com base no produto e persona.</p>
            <Button onClick={handleMarketingIdeas} disabled={isGeneratingIdeas} className="w-full mt-4 bg-primary hover:bg-blue-700 text-white py-3">
              {isGeneratingIdeas ? 'Gerando ideias...' : 'Gerar Ideias'}
            </Button>
          </Card>

          {marketingIdeas.length > 0 && (
            <div className="space-y-3">
              {marketingIdeas.map((idea, idx) => (
                <div key={idx} className="p-4 bg-panel border border-border rounded-2xl shadow-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="px-2 py-0.5 bg-blue-50 text-primary text-[8px] font-black uppercase rounded-md">{idea.categoria}</span>
                  </div>
                  <p className="text-[11px] font-black text-ink">{idea.ideia}</p>
                  <p className="text-[10px] text-slate">{idea.por_que_funciona}</p>
                  <p className="text-[10px] text-slate"><strong>Primeiros passos:</strong> {idea.primeiros_passos}</p>
                </div>
              ))}
            </div>
          )}

          <Card color="blue">
            <h4 className="text-[10px] font-black uppercase text-primary mb-2">Plano de Campanhas Pagas</h4>
            <div className="space-y-3">
              <Select value={objective} onChange={(e) => setObjective(e.target.value)}>
                <option>Conversões</option>
                <option>Leads</option>
                <option>Tráfego</option>
                <option>Reconhecimento</option>
              </Select>
              <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option>Meta (Facebook/Instagram)</option>
                <option>Google Ads</option>
                <option>LinkedIn Ads</option>
                <option>TikTok Ads</option>
              </Select>
              <Input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Orçamento (ex: R$ 2.000/mês)" />
            </div>
            <Button onClick={handlePaidPlan} disabled={isGeneratingPaidPlan} className="w-full mt-4 bg-primary hover:bg-blue-700 text-white py-3">
              {isGeneratingPaidPlan ? 'Gerando plano...' : 'Gerar Plano'}
            </Button>
          </Card>

          {paidPlan && (
            <div className="space-y-3">
              {['estrutura', 'segmentacao', 'criativos', 'metricas'].map((key) => (
                <div key={key} className="p-4 bg-panel border border-border rounded-2xl shadow-sm space-y-2">
                  <p className="text-[10px] font-black uppercase text-slate">{key}</p>
                  <p className="text-[11px] text-ink">{paidPlan[key]}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudioModule;
