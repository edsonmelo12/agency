
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Section, ActiveElement, StudioImage } from '../types';

interface PreviewPanelProps {
  sections: Section[];
  variationSections?: Section[];
  selectedSectionId: string | null;
  activeElement: ActiveElement | null;
  studioImages: StudioImage[];
  onDownload: () => void;
  onOpenPreview: () => void;
  onUpdateSectionContent: (id: string, newContent: string) => void;
  onSelectSection: (id: string | null) => void;
  onElementSelect: (el: ActiveElement | null) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({ 
  sections, 
  variationSections,
  selectedSectionId,
  onUpdateSectionContent,
  onSelectSection,
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isIframeReady, setIsIframeReady] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentSections = useMemo(() => {
    return (variationSections && variationSections.length > 0) ? variationSections : sections;
  }, [sections, variationSections]);

  const createShell = () => `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
        <style>
          body { font-family: sans-serif; margin: 0; background: white; overflow-x: hidden; min-height: 100vh; }
          .section-container { position: relative; width: 100%; transition: outline 0.1s; cursor: pointer; }
          .section-container.active { outline: 3px solid #3b82f6; outline-offset: -3px; z-index: 10; }
          [contenteditable="true"] { cursor: text; outline: none; transition: background 0.1s; }
          [contenteditable="true"]:hover { background: rgba(59, 130, 246, 0.03); }
          [contenteditable="true"]:focus { background: white; box-shadow: 0 0 0 2px #3b82f6; border-radius: 4px; }
          img { max-width: 100%; height: auto; cursor: pointer; }
          * { -webkit-user-modify: read-write-plaintext-only; }
          [contenteditable="false"], [contenteditable="false"] * { -webkit-user-modify: read-only; }
        </style>
      </head>
      <body>
        <div id="root-canvas"></div>
        <script>
          const root = document.getElementById('root-canvas');
          let lastReceivedHtml = "";

          function makeEditable(node) {
            const tags = ['H1','H2','H3','H4','H5','H6','P','SPAN','BUTTON','A','LI','B','STRONG','DIV'];
            if (tags.includes(node.tagName) && node.childNodes.length > 0 && Array.from(node.childNodes).some(c => c.nodeType === 3 && c.textContent.trim() !== "")) {
              node.setAttribute('contenteditable', 'true');
              node.setAttribute('data-lb-editable', 'true');
              node.spellcheck = false;
            }
            node.children && Array.from(node.children).forEach(makeEditable);
          }

          document.addEventListener('input', (e) => {
            const section = e.target.closest('.section-container');
            if (section) {
              lastReceivedHtml = root.innerHTML;
              window.parent.postMessage({ 
                type: 'CHANGE', 
                id: section.id, 
                content: section.innerHTML 
              }, '*');
            }
          });

          window.addEventListener('message', (e) => {
            if (e.data.type === 'SYNC') {
              const newHtml = e.data.sections.map(s => \`
                <div id="\${s.id}" class="section-container \${e.data.selectedId === s.id ? 'active' : ''}">
                  \${s.content}
                </div>
              \`).join('');
              
              if (lastReceivedHtml !== newHtml) {
                root.innerHTML = newHtml;
                lastReceivedHtml = newHtml;
                makeEditable(root);
              }
            }
          });

          document.addEventListener('click', (e) => {
            const section = e.target.closest('.section-container');
            if (section) {
              window.parent.postMessage({ type: 'SELECT', sectionId: section.id }, '*');
            }
          });

          window.parent.postMessage({ type: 'READY' }, '*');
        </script>
      </body>
    </html>`;

  useEffect(() => {
    if (iframeRef.current) {
      const blob = new Blob([createShell()], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      iframeRef.current.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, []);

  const sync = useCallback(() => {
    if (isIframeReady && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage({ 
        type: 'SYNC', 
        sections: currentSections, 
        selectedId: selectedSectionId 
      }, '*');
    }
  }, [isIframeReady, currentSections, selectedSectionId]);

  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (e.data.type === 'READY') setIsIframeReady(true);
      if (e.data.type === 'CHANGE') onUpdateSectionContent(e.data.id, e.data.content);
      if (e.data.type === 'SELECT') onSelectSection(e.data.sectionId);
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [onUpdateSectionContent, onSelectSection]);

  useEffect(() => { sync(); }, [sync]);

  return (
    <div className="flex-1 flex flex-col bg-slate-200 overflow-hidden h-full">
      <div className="h-14 bg-white border-b px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => setViewMode('desktop')} className={`px-4 py-1 text-[10px] font-black uppercase rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Desktop</button>
          <button onClick={() => setViewMode('mobile')} className={`px-4 py-1 text-[10px] font-black uppercase rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}>Mobile</button>
        </div>
        <div className="flex gap-2">
           <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[9px] font-black text-emerald-600 uppercase">Editor Visual Ativo</span>
           </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div className={`transition-all duration-500 relative bg-white shadow-2xl overflow-hidden ${viewMode === 'desktop' ? 'w-full h-full rounded-none' : 'w-[375px] h-[95%] rounded-[40px] border-[10px] border-slate-900 shadow-blue-500/20'}`}>
          <iframe 
            ref={iframeRef} 
            title="Preview" 
            className={`w-full h-full border-none transition-opacity duration-300 ${isIframeReady ? 'opacity-100' : 'opacity-0'}`} 
          />
          {!isIframeReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white gap-4">
               <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
               <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Iniciando Engine de Edição...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
