
import React, { useState, useMemo } from 'react';
import { Ebook, EbookChapter } from '../types';
import { Button } from './ui/BaseComponents';

interface BookPanelProps {
  ebook: Ebook | null;
  uiTheme: 'light' | 'dark';
  onGenerateChapter: (bookId: string, chapterId: string) => void;
  onUpdateSettings: (bookId: string, settings: any) => void;
  onIllustrateChapter: (bookId: string, chapterId: string, prompt: string) => void;
}

const renderEditorialMarkdown = (text: string, titleToSkip?: string) => {
  if (!text) return '';
  
  let html = text.trim();

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
        if (lineClean === titleToSkip.toLowerCase() || lineClean.includes(titleToSkip.toLowerCase().substring(0, 10))) {
          lines.splice(i, 1);
          html = lines.join('\n').trim();
          break;
        }
      }
    }
  }

  // Markdown Editorial - Sem forced uppercase e fontes equilibradas para melhor leitura
  html = html.replace(/^# (.*$)/gim, '<h1 style="font-size: 1.75rem; font-weight: 900; margin-bottom: 1.5rem; border-bottom: 1.5px solid #2563eb; padding-bottom: 0.5rem; color: #0f172a; text-transform: none;">$1</h1>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="font-size: 1.25rem; font-weight: 800; margin-top: 1.75rem; margin-bottom: 0.75rem; color: #1e293b; text-transform: none;">$1</h2>');
  html = html.replace(/^### (.*$)/gim, '<h3 style="font-size: 1rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #334155; text-transform: none;">$1</h3>');
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

const BookPanel: React.FC<BookPanelProps> = ({ ebook, onGenerateChapter }) => {
  const [currentPageId, setCurrentPageId] = useState<string>('cover');

  const activeChapter = useMemo(() => {
    return ebook?.chapters.find(c => c.id === currentPageId);
  }, [ebook, currentPageId]);

  if (!ebook) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return alert("Habilite pop-ups para gerar o PDF.");

    const introHtml = renderEditorialMarkdown(ebook.introduction, "Introdução");
    const conclusionHtml = renderEditorialMarkdown(ebook.conclusion, "Conclusão");
    const chaptersHtml = ebook.chapters.map((ch, i) => `
      <div style="page-break-before: always; padding: 60px;">
        <span style="text-transform: uppercase; font-size: 10px; font-weight: 900; color: #94a3b8; letter-spacing: 2px;">Capítulo ${i + 1}</span>
        <h1 style="font-size: 26px; font-weight: 900; margin-top: 8px; margin-bottom: 25px; text-transform: none; color: #0f172a;">${ch.title}</h1>
        ${renderEditorialMarkdown(ch.content, ch.title)}
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>${ebook.title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; margin: 0; color: #0f172a; line-height: 1.5; background: white; }
            .cover { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 80px; border-top: 15px solid #2563eb; }
            .content-page { padding: 60px; page-break-before: always; }
            h1, h2, h3 { line-height: 1.2; text-transform: none; }
            p { margin-bottom: 1.15em; text-align: justify; font-size: 12pt; }
            li { font-size: 12pt; margin-bottom: 0.5em; }
          </style>
        </head>
        <body>
          <div class="cover">
            <div style="width: 80px; height: 4px; background: #2563eb; margin-bottom: 50px;"></div>
            <span style="text-transform: uppercase; font-weight: 900; font-size: 14px; color: #64748b; letter-spacing: 4px;">${ebook.author}</span>
            <h1 style="font-size: 52px; margin: 30px 0; font-weight: 900; letter-spacing: -1.5px; text-transform: none;">${ebook.title}</h1>
            <div style="margin-top: 60px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px;">
              Edição Editorial Digital • LandingBuilder AI
            </div>
          </div>
          <div class="content-page">
            <h1 style="font-size: 32px; font-weight: 900; border-bottom: 2.5px solid #2563eb; padding-bottom: 15px; margin-bottom: 35px; color: #0f172a;">Introdução</h1>
            ${introHtml}
          </div>
          ${chaptersHtml}
          <div class="content-page">
            <h1 style="font-size: 32px; font-weight: 900; border-bottom: 2.5px solid #2563eb; padding-bottom: 15px; margin-bottom: 35px; color: #0f172a;">Conclusão</h1>
            ${conclusionHtml}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 1200);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100 dark:bg-slate-950">
      {/* Navegação Editorial */}
      <div className="w-80 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 bg-white dark:bg-slate-900 shadow-xl z-20 print:hidden transition-all">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
           <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest block mb-2">Editor BookBuilder</span>
           <h3 className="text-xs font-black leading-tight line-clamp-2 text-slate-800 dark:text-slate-100">{ebook.title}</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
           <button 
              onClick={() => setCurrentPageId('cover')} 
              className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${currentPageId === 'cover' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
           >
              Capa do E-book
           </button>
           <button 
              onClick={() => setCurrentPageId('intro')} 
              className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase transition-all ${currentPageId === 'intro' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
           >
              Prólogo / Introdução
           </button>
           
           <div className="pt-8 pb-3 px-5 text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">Conteúdo Estruturado</div>
           
           <div className="space-y-1.5">
            {ebook.chapters.map((ch, idx) => (
              <button 
                key={ch.id} 
                onClick={() => setCurrentPageId(ch.id)} 
                className={`w-full text-left p-4 rounded-2xl text-[10px] font-bold transition-all ${currentPageId === ch.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                {String(idx + 1).padStart(2, '0')}. {ch.title}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPageId('conclusion')} 
              className={`w-full text-left p-4 rounded-2xl text-[10px] font-black uppercase transition-all mt-4 ${currentPageId === 'conclusion' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Conclusão Final
           </button>
           </div>
        </div>

        <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
           <Button variant="primary" onClick={handlePrint} className="w-full !rounded-3xl py-4 shadow-xl">Baixar PDF Final</Button>
           <p className="text-[8px] font-bold text-slate-400 uppercase text-center mt-3 tracking-widest italic">Isola apenas o e-book para impressão</p>
        </div>
      </div>

      {/* Visualização de Conteúdo */}
      <div className="flex-1 overflow-y-auto p-12 flex justify-center custom-scrollbar bg-slate-100 dark:bg-black transition-colors duration-500">
         <div className="bg-white max-w-3xl w-full shadow-2xl rounded-[60px] overflow-hidden flex flex-col relative min-h-[1000px] border-t-[12px] border-blue-600">
            
            <div className="p-16 md:p-24 flex-1 flex flex-col items-center">
              <div className="w-full max-w-prose">
                
                {currentPageId === 'cover' ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-20 animate-in fade-in zoom-in-95 duration-500">
                    <div className="w-32 h-1 bg-blue-600 mb-12"></div>
                    <span className="text-[12px] font-black uppercase tracking-[0.4em] text-slate-400 mb-6">{ebook.author}</span>
                    <h1 className="text-4xl md:text-5xl font-black leading-[1.1] text-slate-900 tracking-tight mb-12 text-balance">{ebook.title}</h1>
                    <div className="w-full aspect-[3/4] bg-slate-50 rounded-3xl border border-slate-200 mb-12 flex items-center justify-center overflow-hidden shadow-inner group relative">
                       {ebook.coverImageUrl ? <img src={ebook.coverImageUrl} className="w-full h-full object-cover" /> : (
                         <div className="text-center opacity-30">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <p className="text-[10px] font-black uppercase">Capa Visual AI Pendente</p>
                         </div>
                       )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Editora Digital LandingBuilder AI</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-14 pb-8 border-b border-slate-100 relative">
                      <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
                        {currentPageId === 'intro' ? 'Início da Leitura' : currentPageId === 'conclusion' ? 'Encerramento' : `Capítulo ${ebook.chapters.findIndex(c => c.id === activeChapter?.id) + 1}`}
                      </span>
                      <h1 className="text-3xl font-black leading-tight mt-4 text-slate-900 tracking-tight text-balance">
                          {currentPageId === 'intro' ? 'Introdução' : currentPageId === 'conclusion' ? 'Conclusão' : activeChapter?.title}
                      </h1>
                    </div>

                    <div className="editorial-view antialiased">
                      {((currentPageId === 'intro' && ebook.introduction && ebook.introduction.length > 50) || 
                        (currentPageId === 'conclusion' && ebook.conclusion && ebook.conclusion.length > 50) ||
                        (activeChapter && activeChapter.content && activeChapter.content.length > 50)) ? (
                        <div 
                          className="max-w-none text-slate-700"
                          dangerouslySetInnerHTML={{ __html: renderEditorialMarkdown(currentPageId === 'intro' ? ebook.introduction : currentPageId === 'conclusion' ? ebook.conclusion : (activeChapter?.content || ""), currentPageId === 'intro' ? "Introdução" : currentPageId === 'conclusion' ? "Conclusão" : activeChapter?.title) }} 
                        />
                      ) : (
                        <div className="py-40 flex flex-col items-center justify-center text-center space-y-8">
                           <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                           </div>
                           <div className="space-y-2">
                              <p className="text-lg font-black uppercase text-slate-900 tracking-tighter">Conteúdo Não Redigido</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">A IA gerará um texto editorial completo sem repetições.</p>
                           </div>
                           <Button onClick={() => onGenerateChapter(ebook.id, currentPageId)} className="px-16 py-6 !rounded-full shadow-2xl hover:scale-105 transition-transform">Redigir agora com IA</Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="px-20 pb-16 pt-10 border-t border-slate-50 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-300">
               <span>Página {currentPageId === 'cover' ? '0' : currentPageId === 'intro' ? 'i' : currentPageId === 'conclusion' ? 'Final' : ebook.chapters.findIndex(c => c.id === currentPageId) + 1}</span>
               <span className="truncate max-w-[300px]">{ebook.title}</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default BookPanel;
