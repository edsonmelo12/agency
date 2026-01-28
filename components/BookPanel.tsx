
import React, { useState, useMemo, useEffect } from 'react';
import { Ebook, EbookChapter } from '../types';
import { Button } from './ui/BaseComponents';
import { generateEbookPDF, generateEbookChapterPDF } from '../services/pdfService';

interface BookPanelProps {
  ebook: Ebook | null;
  uiTheme: 'light' | 'dark';
  onGenerateChapter: (bookId: string, chapterId: string) => void;
  onReviewChapter: (bookId: string, chapterId: string) => void;
  onGenerateCover: (bookId: string) => void;
  onUpdateSettings: (bookId: string, settings: any) => void;
  onIllustrateChapter: (bookId: string, chapterId: string, prompt: string) => void;
}

const renderEditorialMarkdown = (text: string, titleToSkip?: string) => {
  if (!text) return '';

  let html = text.trim();

  // Escape any raw HTML to avoid layout breakouts
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  html = escapeHtml(html);

  // Sanitização de ruído JSON
  if (html.startsWith('{') || html.includes('":')) {
    try {
      const obj = JSON.parse(html);
      html = obj.introduction || obj.conclusion || obj.content || Object.values(obj)[0] as string;
    } catch (e) {
      html = html.replace(/^[^{]*{[^}]*intro(duction)?":\s*"/i, '').replace(/"\s*,?\s*"chapters":.*$/is, '').replace(/^["\s]+|["\s]+$/g, '');
    }
  }

  // Filtragem de títulos duplicados (se a IA repetiu o título no topo apesar das instruções)
  if (titleToSkip) {
    const lines = html.split('\n');
    if (lines.length > 0) {
      for (let i = 0; i < Math.min(3, lines.length); i++) {
        const lineClean = lines[i].replace(/^#+\s*/, '').trim().toLowerCase();
        const isChapterLine = /cap[ií]tulo\s*\d+/i.test(lines[i]);
        if (lineClean === titleToSkip.toLowerCase() || lineClean.includes(titleToSkip.toLowerCase().substring(0, 10)) || isChapterLine) {
          lines.splice(i, 1);
          html = lines.join('\n').trim();
          break;
        }
      }
    }
  }

  // Markdown Editorial - Sem forced uppercase e fontes equilibradas para melhor leitura
  // Normalize blockquotes and inline emphasis to plain text
  html = html.replace(/^>\s*/gim, '');
  html = html.replace(/\*([^*]+)\*/gim, '$1');
  html = html.replace(/_([^_]+)_/gim, '$1');
  // Convert markdown tables to Gatilho/Reação/Comportamento blocks
  const rawLines = html.split('\n');
  const out: string[] = [];
  let i = 0;
  const isSeparator = (line: string) => /^\|\s*:?-{2,}:?\s*\|\s*:?-{2,}:?\s*\|/.test(line.trim());
  while (i < rawLines.length) {
    const line = rawLines[i];
    if (line.trim().startsWith('|') && line.includes('|')) {
      const header = line.split('|').map(s => s.trim()).filter(Boolean).join('|').toLowerCase();
      const next = rawLines[i + 1] || '';
      const isTargetTable = /gatilho/.test(header) && /reação/.test(header) && /comportamento/.test(header) && isSeparator(next);
      if (isTargetTable) {
        i += 2;
        while (i < rawLines.length && rawLines[i].trim().startsWith('|')) {
          const cells = rawLines[i].split('|').map(s => s.trim()).filter(Boolean);
          if (cells.length >= 3) {
            out.push(`- **Gatilho:** ${cells[0]}`);
            out.push(`- **Reação:** ${cells[1]}`);
            out.push(`- **Comportamento:** ${cells[2]}`);
            out.push('');
          }
          i += 1;
        }
        continue;
      }
    }
    out.push(line);
    i += 1;
  }
  html = out.join('\n');
  // Normalize emphasis in list items to a consistent "- **Label:**" format
  html = html.replace(/^\*\s+\*(.+?)\*:\s*/gim, '- **$1:** ');
  html = html.replace(/^\*\s+\*\*(.+?)\*\*:\s*/gim, '- **$1:** ');
  html = html.replace(/^\*\s+_(.+?)_:\s*/gim, '- **$1:** ');
  html = html.replace(/^\-\s+\*(.+?)\*:\s*/gim, '- **$1:** ');
  html = html.replace(/^\-\s+\*\*(.+?)\*\*:\s*/gim, '- **$1:** ');
  html = html.replace(/^\-\s+_(.+?)_:\s*/gim, '- **$1:** ');
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 1.75rem; font-weight: 900; margin-bottom: 1.5rem; border-bottom: 1.5px solid #2563eb; padding-bottom: 0.5rem; color: #0f172a; text-transform: none;">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 1.75rem; margin-bottom: 0.75rem; color: #1e293b; text-transform: none;">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #334155; text-transform: none;">$1</h3>');
  html = html.replace(/^#### (.*$)/gim, '<h4 style="font-size: 0.95rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; color: #334155; text-transform: none;">$1</h4>');
  html = html.replace(/^\- (.*$)/gim, '<li style="margin-left: 1.25rem; list-style-type: disc; margin-bottom: 0.3rem; color: #475569; font-size: 0.9rem;">$1</li>');
  html = html.replace(/\*\*(.*)\*\*/gim, '<strong style="font-weight: 700; color: #0f172a;">$1</strong>');

  const lines = html.split('\n');
  const wrappedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('<')) {
      return `<p style="margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.6; color: #334155; text-align: justify;">${trimmed}</p>`;
    }
    return line;
  });

  return wrappedLines.join('\n');
};

const BookPanel: React.FC<BookPanelProps> = ({ ebook, onGenerateChapter, onReviewChapter, onGenerateCover, onUpdateSettings }) => {
  const [currentPageId, setCurrentPageId] = useState<string>('cover');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [readingMode, setReadingMode] = useState<'card' | 'continuous'>('card');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (currentPageId !== 'toc') setCurrentPageId('toc');
      if (readingMode !== 'card') setReadingMode('card');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPageId, readingMode]);

  const activeChapter = useMemo(() => {
    return ebook?.chapters.find(c => c.id === currentPageId);
  }, [ebook, currentPageId]);

  const currentContent = useMemo(() => {
    if (!ebook) return '';
    if (currentPageId === 'intro') return ebook.introduction || '';
    if (currentPageId === 'conclusion') return ebook.conclusion || '';
    return activeChapter?.content || '';
  }, [ebook, currentPageId, activeChapter]);

  const wordCount = useMemo(() => {
    const text = (currentContent || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!text) return 0;
    return text.split(' ').length;
  }, [currentContent]);
  const introWordLimit = 450;
  const isIntroPage = currentPageId === 'intro';
  const introOverLimit = isIntroPage && wordCount > introWordLimit;

  const trimmedContent = currentContent.trim();
  const canReview = trimmedContent.length > 80;
  const hasContent = trimmedContent.length > 0;

  if (!ebook) return null;

  const handleConfigChange = (updates: any) => {
    if (!ebook) return;
    onUpdateSettings(ebook.id, { ...(ebook.config || {}), ...updates });
  };

  const handleTypeChange = (type: 'lead_magnet' | 'principal') => {
    const nextCta = type === 'lead_magnet' ? 'soft' : 'direct';
    const nextExercise = type === 'lead_magnet' ? 'every_2' : 'every_1';
    handleConfigChange({ type, ctaStyle: nextCta, exerciseFrequency: nextExercise });
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      await generateEbookPDF(ebook);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-paper">
      {/* Navegação Editorial */}
      <div className="w-80 border-r border-border flex flex-col shrink-0 bg-panel shadow-xl z-20 print:hidden transition-all">
        <div className="p-8 border-b border-border">
          <span className="text-[10px] font-black uppercase text-primary tracking-widest block mb-2">Editor BookBuilder</span>
          <h3 className="text-xs font-display leading-tight line-clamp-2 text-ink">{ebook.title}</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
          <button
            onClick={() => setCurrentPageId('cover')}
            className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${currentPageId === 'cover' ? 'bg-primary text-white shadow-lg' : 'text-slate hover:bg-panel dark:hover:bg-slate-800'}`}
          >
            Capa do E-book
          </button>
          <button
            onClick={() => setCurrentPageId('toc')}
            className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${currentPageId === 'toc' ? 'bg-primary text-white shadow-lg' : 'text-slate hover:bg-panel dark:hover:bg-slate-800'}`}
          >
            Sumário
          </button>
          <button
            onClick={() => setCurrentPageId('intro')}
            className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${currentPageId === 'intro' ? 'bg-primary text-white shadow-lg' : 'text-slate hover:bg-panel dark:hover:bg-slate-800'}`}
          >
            Prólogo / Introdução
          </button>

          <div className="pt-8 pb-3 px-5 text-[9px] font-black uppercase text-slate tracking-[0.3em]">Conteúdo Estruturado</div>

          <div className="space-y-1.5">
            {ebook.chapters.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => setCurrentPageId(ch.id)}
                className={`w-full text-left p-4 rounded-2xl text-[10px] font-bold transition-all ${currentPageId === ch.id ? 'bg-primary text-white shadow-lg' : 'text-slate hover:bg-panel dark:hover:bg-slate-800'}`}
              >
                {String(idx + 1).padStart(2, '0')}. {ch.title}
              </button>
            ))}

            <button
              onClick={() => setCurrentPageId('conclusion')}
              className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase transition-all mt-4 ${currentPageId === 'conclusion' ? 'bg-primary text-white shadow-lg' : 'text-slate hover:bg-panel dark:hover:bg-slate-800'}`}
            >
              Conclusão Final
            </button>
          </div>
        </div>

        <div className="p-8 border-t border-border bg-panel">
          <Button
            variant="primary"
            onClick={handleDownloadPDF}
            disabled={isGeneratingPdf}
            className="w-full !rounded-3xl py-4 shadow-xl"
          >
            {isGeneratingPdf ? 'Gerando PDF...' : 'Baixar PDF Final'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => ebook && generateEbookChapterPDF(ebook, currentPageId)}
            className="w-full !rounded-3xl py-3 mt-3"
          >
            Exportar Capítulo Atual
          </Button>
          <p className="text-[8px] font-bold text-slate uppercase text-center mt-3 tracking-widest italic">Isola apenas o e-book para impressão</p>
        </div>
      </div>

      {/* Visualização de Conteúdo */}
      <div className="flex-1 overflow-y-auto p-12 flex justify-center items-start custom-scrollbar bg-paper transition-colors duration-500">
        <div className={`${readingMode === 'card' ? 'bg-panel shadow-2xl rounded-[60px] border-t-[12px] border-primary' : 'bg-transparent shadow-none rounded-none border-0'} max-w-3xl w-full overflow-visible flex flex-col relative self-start`}>

          <div className="p-16 md:p-24 flex flex-col items-center">
            <div className="w-full max-w-prose">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate">
                  <span>Modo de Leitura</span>
                  <button
                    onClick={() => setReadingMode(prev => prev === 'card' ? 'continuous' : 'card')}
                    className="px-3 py-1 rounded-full border border-border text-slate hover:text-ink hover:border-primary transition-colors"
                  >
                    {readingMode === 'card' ? 'Contínuo' : 'Card'}
                  </button>
                </div>
                {ebook.config && (
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate">
                    {ebook.config.type === 'lead_magnet' ? 'Isca' : 'Principal'} • {ebook.config.depth} • CTA {ebook.config.ctaStyle}
                  </div>
                )}
              </div>

              <div className="mb-10 p-4 rounded-2xl border border-border bg-panel">
                <div className="text-[9px] font-black uppercase tracking-widest text-slate mb-3">Config do E-book</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={ebook.config?.type || 'principal'}
                    onChange={(e) => handleTypeChange(e.target.value as 'lead_magnet' | 'principal')}
                    className="w-full bg-paper dark:bg-panel border border-border rounded-lg p-2 text-[10px] font-bold text-ink outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="lead_magnet">Isca Digital</option>
                    <option value="principal">Produto Principal</option>
                  </select>
                  <select
                    value={ebook.config?.depth || 'medium'}
                    onChange={(e) => handleConfigChange({ depth: e.target.value })}
                    className="w-full bg-paper dark:bg-panel border border-border rounded-lg p-2 text-[10px] font-bold text-ink outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="short">Curto</option>
                    <option value="medium">Médio</option>
                    <option value="deep">Profundo</option>
                  </select>
                  <select
                    value={ebook.config?.ctaStyle || 'direct'}
                    onChange={(e) => handleConfigChange({ ctaStyle: e.target.value })}
                    className="w-full bg-paper dark:bg-panel border border-border rounded-lg p-2 text-[10px] font-bold text-ink outline-none focus:border-primary transition-all cursor-pointer"
                  >
                    <option value="soft">CTA Soft</option>
                    <option value="direct">CTA Direto</option>
                  </select>
                </div>
              </div>

              {currentPageId === 'cover' ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in-95 duration-500">
                  <div className="w-32 h-1 bg-primary mb-12"></div>
                  <span className="text-[12px] font-black uppercase tracking-[0.4em] text-slate mb-6">{ebook.author}</span>
                  <h1 className="text-4xl md:text-5xl font-black leading-[1.1] text-ink tracking-tight mb-12 text-balance">{ebook.title}</h1>
                  <div className="w-full aspect-[3/4] bg-panel rounded-3xl border border-border mb-12 flex items-center justify-center overflow-hidden shadow-inner group relative">
                    {ebook.coverImageUrl ? <img src={ebook.coverImageUrl} className="w-full h-full object-cover" /> : (
                      <div className="text-center opacity-30">
                        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-[10px] font-black uppercase">Capa Visual AI Pendente</p>
                      </div>
                    )}
                  </div>
                  {!ebook.coverImageUrl && (
                    <Button
                      onClick={() => onGenerateCover(ebook.id)}
                      className="px-14 py-5 !rounded-full shadow-2xl hover:scale-105 transition-transform"
                    >
                      Gerar Capa com IA
                    </Button>
                  )}
                  <p className="text-[10px] font-bold text-slate uppercase tracking-[0.3em]">Editora Digital LandingBuilder AI</p>
                </div>
              ) : currentPageId === 'toc' ? (
                <div className="h-full flex flex-col text-left py-10">
                  <div className="mb-10 pb-6 border-b border-border">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate">Sumário</span>
                    <h1 className="text-3xl font-black leading-tight mt-4 text-ink tracking-tight text-balance">Mapa de Leitura</h1>
                  </div>
                  <div className="space-y-6">
                    {ebook.chapters.map((ch, index) => (
                      <div key={ch.id} className="flex items-start justify-between gap-6 border-b border-dashed border-border pb-4">
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 rounded-full bg-panel border border-border text-primary flex items-center justify-center text-[11px] font-black">
                            {String(index + 1).padStart(2, '0')}
                          </div>
                          <div>
                            <p className="text-sm font-black text-ink">{ch.title}</p>
                            {ch.notes && (
                              <p className="text-[10px] text-slate mt-2 max-w-[480px] leading-relaxed line-clamp-2">{ch.notes}</p>
                            )}
                          </div>
                        </div>
                        <span className="text-[9px] font-black uppercase text-slate bg-paper border border-border px-2 py-1 rounded-full">Capítulo</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-14 pb-8 border-b border-border relative">
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate">
                      {currentPageId === 'intro' ? 'Início da Leitura' : currentPageId === 'conclusion' ? 'Encerramento' : `Capítulo ${ebook.chapters.findIndex(c => c.id === activeChapter?.id) + 1}`}
                    </span>
                    <h1 className="text-3xl font-black leading-tight mt-4 text-ink tracking-tight text-balance">
                      {currentPageId === 'intro' ? 'Introdução' : currentPageId === 'conclusion' ? 'Conclusão' : activeChapter?.title}
                    </h1>
                    <div className="absolute right-0 top-0 flex items-center gap-3">
                      <Button
                        onClick={() => onGenerateChapter(ebook.id, currentPageId)}
                        className="px-6 py-3 !rounded-full shadow-lg"
                      >
                        {hasContent ? 'Reescrever com IA' : 'Redigir Capítulo'}
                      </Button>
                      {currentPageId === 'intro' && (
                        <Button
                          onClick={() => onReviewChapter(ebook.id, currentPageId)}
                          disabled={!canReview}
                          className="px-6 py-3 !rounded-full shadow-lg"
                        >
                          Enxugar Introdução
                        </Button>
                      )}
                      <Button
                        onClick={() => onReviewChapter(ebook.id, currentPageId)}
                        disabled={!canReview}
                        className="px-6 py-3 !rounded-full shadow-lg"
                      >
                        Revisar com IA
                      </Button>
                    </div>
                  </div>

                  <div className="editorial-view antialiased">
                    {((currentPageId === 'intro' && ebook.introduction && ebook.introduction.length > 50) ||
                      (currentPageId === 'conclusion' && ebook.conclusion && ebook.conclusion.length > 50) ||
                      (activeChapter && activeChapter.content && activeChapter.content.length > 50)) ? (
                      <div
                        className="max-w-none text-ink"
                        dangerouslySetInnerHTML={{ __html: renderEditorialMarkdown(currentPageId === 'intro' ? ebook.introduction : currentPageId === 'conclusion' ? ebook.conclusion : (activeChapter?.content || ""), currentPageId === 'intro' ? "Introdução" : currentPageId === 'conclusion' ? "Conclusão" : activeChapter?.title) }}
                      />
                    ) : (
                      <div className="py-40 flex flex-col items-center justify-center text-center space-y-8">
                        <div className="w-20 h-20 bg-panel border border-border rounded-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </div>
                        <div className="space-y-2">
                          <p className="text-lg font-black uppercase text-ink tracking-tighter">Conteúdo Não Redigido</p>
                          <p className="text-[10px] font-bold text-slate uppercase tracking-widest">A IA gerará um texto editorial completo sem repetições.</p>
                        </div>
                        <Button onClick={() => onGenerateChapter(ebook.id, currentPageId)} className="px-16 py-6 !rounded-full shadow-2xl hover:scale-105 transition-transform">Redigir agora com IA</Button>
                      </div>
                    )}
                  </div>

                  {isIntroPage && (
                    <div className={`mt-10 px-6 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${introOverLimit ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-border bg-panel text-slate'}`}>
                      {introOverLimit
                        ? 'Introdução longa — reduza para até 450 palavras'
                        : 'Introdução dentro do limite recomendado'}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="px-20 pb-16 pt-10 border-t border-border flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate">
            <span>Página {currentPageId === 'cover' ? '0' : currentPageId === 'intro' ? 'i' : currentPageId === 'conclusion' ? 'Final' : ebook.chapters.findIndex(c => c.id === currentPageId) + 1}</span>
            <span className="truncate max-w-[300px]">{ebook.title}</span>
            <span className={`text-[10px] font-black uppercase tracking-widest ${introOverLimit ? 'text-rose-500' : 'text-slate'}`}>
              {wordCount} palavras{isIntroPage ? ` / ${introWordLimit}` : ''}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BookPanel;
