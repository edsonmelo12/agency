
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Section, ActiveElement, StudioImage } from '../types';
import { simulateHeatmap, rewriteElementText } from '../services/genaiClient';
import HeatmapOverlay from './HeatmapOverlay';
import { Input } from './ui/BaseComponents';

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
  onRegenerateSection?: (sectionId: string, sectionType: string) => void;
}

const PreviewPanel: React.FC<PreviewPanelProps> = ({
  sections,
  variationSections,
  selectedSectionId,
  activeElement,
  studioImages,
  onUpdateSectionContent,
  onSelectSection,
  onElementSelect,
  onOpenPreview,
  onRegenerateSection,
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [isEditingText, setIsEditingText] = useState(false);
  const [heatmapPoints, setHeatmapPoints] = useState<any[] | null>(null);
  const [isSimulatingHeatmap, setIsSimulatingHeatmap] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isSectionMenuOpen, setIsSectionMenuOpen] = useState(false);
  const [textTab, setTextTab] = useState<'text' | 'color' | 'section'>('text');
  const [popoverOffset, setPopoverOffset] = useState({ x: 0, y: 0 });
  const [isDraggingPopover, setIsDraggingPopover] = useState(false);
  const [popoverSize, setPopoverSize] = useState({ width: 260, height: 160 });
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const removeInvalidSvgPaths = (html: string) => {
    return html.replace(/<path\b[^>]*\sd=(["'])(?![Mm])[^"']*\1[^>]*>(?:<\/path>)?/gi, '');
  };

  const currentSections = useMemo(() => {
    return (variationSections && variationSections.length > 0) ? variationSections : sections;
  }, [sections, variationSections]);

  const activeSection = useMemo(() => {
    if (!activeElement?.sectionId) return null;
    return currentSections.find(section => section.id === activeElement.sectionId) || null;
  }, [activeElement?.sectionId, currentSections]);

  const toHex = (value?: string) => {
    if (!value) return '';
    const hexMatch = value.match(/#([0-9a-fA-F]{3,8})/);
    if (hexMatch) {
      const hex = hexMatch[1];
      if (hex.length === 3) {
        return `#${hex.split('').map((c) => c + c).join('')}`;
      }
      return `#${hex.slice(0, 6)}`;
    }
    const rgbMatch = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!rgbMatch) return '';
    const r = Number(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = Number(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = Number(rgbMatch[3]).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  };

  const textColorPalette = useMemo(() => {
    const html = currentSections.map((s) => s.content || '').join(' ');
    const matches = html.match(/#(?:[0-9a-fA-F]{3,8})/g) || [];
    const unique = Array.from(new Set(matches.map((c) => c.toLowerCase())));
    const withDefaults = Array.from(new Set(['#ffffff', ...unique, '#0f172a']));
    const limited = withDefaults.slice(0, 8);
    if (limited.length > 0) return limited;
    return ['#0f172a', '#111827', '#1f2937', '#334155', '#64748b', '#94a3b8', '#e2e8f0', '#ffffff'];
  }, [currentSections]);

  useEffect(() => {
    setIsSectionMenuOpen(false);
  }, [activeElement?.sectionId]);

  useEffect(() => {
    if (textTab !== 'section') setIsSectionMenuOpen(false);
  }, [textTab]);

  useEffect(() => {
    if (!activeElement) return;
    if (['P', 'SPAN', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'A', 'BUTTON', 'DIV'].includes(activeElement.tagName)) {
      setTextTab('text');
    }
  }, [activeElement?.tagName]);

  const initialHtml = currentSections.map(s => `
    <div id="${s.id}" class="section-container ${selectedSectionId === s.id ? 'active' : ''}" data-section-type="${s.type?.toLowerCase() || ''}">
      ${removeInvalidSvgPaths(s.content || '')}
    </div>
  `).join('');

  const createShell = () => `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <script>
          window.__tailwindReady = false;
          window.__tailwindPendingRefresh = false;
          window.__tailwindConfig = {
            darkMode: 'class',
            theme: {
              extend: {
                fontFamily: { sans: ['Inter', 'sans-serif'] }
              }
            }
          }
        </script>
        <script defer src="https://cdn.tailwindcss.com?plugins=typography" onload="window.__tailwindReady = true; if (window.__tailwindConfig && window.tailwind && window.tailwind.config) { window.tailwind.config = window.__tailwindConfig; } if (window.__tailwindPendingRefresh && window.tailwind && typeof window.tailwind.refresh === 'function') { window.tailwind.refresh(); window.__tailwindPendingRefresh = false; }"></script>
        <style>
          body { font-family: sans-serif; margin: 0; background: white; overflow-x: hidden; min-height: 100vh; }
          .section-container { position: relative; width: 100%; transition: outline 0.1s; cursor: pointer; }
          .section-container.active { outline: 3px solid #3b82f6; outline-offset: -3px; z-index: 10; }
          .section-container[data-section-type="author"],
          .section-container[data-section-type="testimonial"],
          .section-container[data-section-type="quote"] {
            display: flex;
            justify-content: center;
            align-items: center;
            text-align: center;
            min-height: 320px;
            padding: 2rem;
          }
          .section-container[data-section-type="author"] > *,
          .section-container[data-section-type="testimonial"] > *,
          .section-container[data-section-type="quote"] > * {
            width: 100%;
          }
          .section-badge { display: none; }
          [contenteditable="true"] { cursor: text; outline: none; transition: background 0.1s; }
          [contenteditable="true"]:hover { background: rgba(59, 130, 246, 0.03); }
          [contenteditable="true"]:focus { background: white; box-shadow: 0 0 0 2px #3b82f6; border-radius: 4px; }
          img { max-width: 100%; height: auto; cursor: pointer; }
          * { -webkit-user-modify: read-write-plaintext-only; }
          [contenteditable="false"], [contenteditable="false"] * { -webkit-user-modify: read-only; }
        </style>
      </head>
      <body>
        <div id="root-canvas">${initialHtml}</div>
        <script>
          const root = document.getElementById('root-canvas');
          let lastReceivedHtml = root.innerHTML;

          function makeEditable(node) {
            const tags = ['H1','H2','H3','H4','H5','H6','P','SPAN','BUTTON','A','LI','B','STRONG','DIV'];
            if (tags.includes(node.tagName) && node.childNodes.length > 0 && Array.from(node.childNodes).some(c => c.nodeType === 3 && c.textContent.trim() !== "")) {
              node.setAttribute('contenteditable', 'true');
              node.setAttribute('data-lb-editable', 'true');
              node.spellcheck = false;
            }
            node.children && Array.from(node.children).forEach(makeEditable);
          }

          const findSection = (target) => {
            if (!target) return null;
            if (target.nodeType === Node.TEXT_NODE) target = target.parentElement;
            if (!(target instanceof Element)) return null;
            return target.closest('.section-container');
          };

          const pickImageAtPoint = (section, x, y) => {
            if (!section) return null;
            const imgs = section.querySelectorAll('img');
            for (const img of imgs) {
              const rect = img.getBoundingClientRect();
              if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return img;
              }
            }
            return null;
          };

          makeEditable(root);

          const serializeSection = (section) => {
            const clone = section.cloneNode(true);
            const badges = clone.querySelectorAll('.section-badge');
            badges.forEach((b) => b.remove());
            const editables = clone.querySelectorAll('[contenteditable], [data-lb-editable]');
            editables.forEach((el) => {
              el.removeAttribute('contenteditable');
              el.removeAttribute('data-lb-editable');
            });
            return clone.innerHTML;
          };

          const notifyChange = (target) => {
            const section = findSection(target);
            if (!section) return;
            lastReceivedHtml = root.innerHTML;
            window.parent.postMessage({ 
              type: 'CHANGE', 
              id: section.id, 
              content: serializeSection(section) 
            }, '*');
          };

          const dirtySections = new Set();
          const markDirty = (target) => {
            const section = findSection(target);
            if (section) dirtySections.add(section);
          };

          const flushDirty = () => {
            if (dirtySections.size === 0) return;
            dirtySections.forEach((section) => sendSectionUpdate(section));
            dirtySections.clear();
          };

          let notifyTimer = null;
          let lastNotifyTarget = null;
          const scheduleNotify = (target) => {
            lastNotifyTarget = target;
            if (notifyTimer) clearTimeout(notifyTimer);
            notifyTimer = setTimeout(() => {
              notifyTimer = null;
              notifyChange(lastNotifyTarget);
            }, 700);
          };

          document.addEventListener('input', (e) => { markDirty(e.target); scheduleNotify(e.target); });
          document.addEventListener('change', (e) => { markDirty(e.target); scheduleNotify(e.target); });
          document.addEventListener('keyup', (e) => { markDirty(e.target); scheduleNotify(e.target); });
          document.addEventListener('paste', (e) => { markDirty(e.target); scheduleNotify(e.target); });
          document.addEventListener('blur', (e) => { markDirty(e.target); notifyChange(e.target); }, true);
          document.addEventListener('focusin', (e) => {
            const target = e.target;
            if (target && target.getAttribute && target.getAttribute('contenteditable') === 'true') {
              window.parent.postMessage({ type: 'EDITING', value: true }, '*');
            }
          }, true);
          document.addEventListener('focusout', (e) => {
            const target = e.target;
            if (target && target.getAttribute && target.getAttribute('contenteditable') === 'true') {
              window.parent.postMessage({ type: 'EDITING', value: false }, '*');
            }
          }, true);

          const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
              if (mutation.type === 'characterData' || mutation.type === 'childList') {
                markDirty(mutation.target);
                scheduleNotify(mutation.target);
              }
            }
          });
          observer.observe(root, { subtree: true, childList: true, characterData: true });

          const sendSectionUpdate = (section) => {
            if (!section) return;
            lastReceivedHtml = root.innerHTML;
            window.parent.postMessage({ 
              type: 'CHANGE', 
              id: section.id, 
              content: serializeSection(section) 
            }, '*');
          };

          setInterval(flushDirty, 1200);

          document.addEventListener('dblclick', (e) => {
            const target = e.target;
            const section = findSection(target);
            if (!section) return;

            if (target && target.tagName === 'IMG') {
              const img = target;
              const nextSrc = window.prompt('Nova URL da imagem:', img.getAttribute('src') || '');
              if (nextSrc && nextSrc.trim()) {
                img.setAttribute('src', nextSrc.trim());
                sendSectionUpdate(section);
              }
              return;
            }

            if (target && target instanceof Element && target.getAttribute('contenteditable') !== 'true') {
              const style = window.getComputedStyle(target);
              const currentBgImage = style.backgroundImage && style.backgroundImage !== 'none' ? style.backgroundImage : '';
              const currentBgColor = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)' ? style.backgroundColor : '';
              const currentValue = currentBgImage || currentBgColor;
              const nextBackground = window.prompt(
                'Novo background (cor hex/rgb ou URL da imagem):',
                currentValue
              );
              if (nextBackground !== null) {
                const value = nextBackground.trim();
                if (value === '') return;
                const isUrl = /^https?:\/\//i.test(value) || /^data:/i.test(value) || value.startsWith('url(');
                if (isUrl) {
                  const bg = value.startsWith('url(') ? value : 'url("' + value + '")';
                  target.style.backgroundImage = bg;
                  target.style.backgroundColor = '';
                } else {
                  target.style.backgroundColor = value;
                  target.style.backgroundImage = 'none';
                }
                sendSectionUpdate(section);
              }
            }
          });

          window.addEventListener('message', (e) => {
            if (e.data.type === 'SYNC') {
              const newHtml = e.data.sections.map(s => \`
                <div id="\${s.id}" data-lb-section="\${s.type}" class="section-container \${e.data.selectedId === s.id ? 'active' : ''}">
                  \${s.content}
                </div>
              \`).join('');
              
              if (lastReceivedHtml !== newHtml) {
                root.innerHTML = newHtml;
                lastReceivedHtml = newHtml;
                makeEditable(root);
                if (window.__tailwindReady && window.tailwind && typeof window.tailwind.refresh === 'function') {
                  window.tailwind.refresh();
                } else {
                  window.__tailwindPendingRefresh = true;
                }
              }
            }
          });

          document.addEventListener('click', (e) => {
            const target = e.target;
            const section = findSection(target);
            if (section) {
              window.parent.postMessage({ type: 'SELECT', sectionId: section.id }, '*');
            }

            const el = target && target.nodeType === Node.TEXT_NODE ? target.parentElement : target;
            if (el && el instanceof Element) {
              const rawTarget = e.target;
              if (rawTarget && rawTarget.tagName === 'IMG') {
                e.stopPropagation();
              }
              const imgHit = pickImageAtPoint(section, e.clientX, e.clientY);
              const imgEl = imgHit || (el.tagName === 'IMG' ? el : el.closest('img'));
              const linkEl = el.closest('a');
              if (linkEl) {
                e.preventDefault();
                e.stopPropagation();
              }
              let activeEl = imgEl || linkEl || el;
              if (!imgEl && activeEl.tagName !== 'IMG') {
                const img = activeEl.querySelector('img');
                const hasText = (activeEl.textContent || '').trim().length > 0;
                if (img && !hasText) activeEl = img;
              }
              window.__activeElement = activeEl;
              const rect = activeEl.getBoundingClientRect();
              const computed = window.getComputedStyle(activeEl);
              window.parent.postMessage({
                type: 'ELEMENT_SELECT',
                element: {
                  sectionId: section ? section.id : '',
                  tagName: activeEl.tagName,
                  content: activeEl.textContent || '',
                  src: activeEl.getAttribute('src') || '',
                  href: activeEl.getAttribute('href') || '',
                  backgroundColor: computed.backgroundColor || '',
                  color: computed.color || '',
                  fontSize: computed.fontSize || '',
                  lineHeight: computed.lineHeight || '',
                  textAlign: computed.textAlign || '',
                  rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
                }
              }, '*');
            }
          });

          window.addEventListener('message', (e) => {
            if (e.data.type === 'UPDATE_ACTIVE_ELEMENT') {
              const el = window.__activeElement;
              if (!el) return;
              const section = findSection(el);
              if (!section) return;
              const { action, value } = e.data.payload || {};
              if (action === 'SET_TEXT') el.textContent = value || '';
              if (action === 'SET_SRC') el.setAttribute('src', value || '');
              if (action === 'SET_HREF') el.setAttribute('href', value || '');
              if (action === 'SET_IMG_WIDTH') {
                const px = parseInt(value, 10);
                if (!Number.isNaN(px)) {
                  el.style.width = px + 'px';
                  el.style.height = 'auto';
                }
              }
              if (action === 'SET_IMG_WIDTH_PERCENT') {
                const pct = parseInt(value, 10);
                if (!Number.isNaN(pct)) {
                  el.style.width = pct + '%';
                  el.style.height = 'auto';
                }
              }
              if (action === 'RESET_IMG_SIZE') {
                el.style.width = '';
                el.style.height = '';
              }
              if (action === 'SET_IMG_ALIGN') {
                const align = value || 'left';
                el.style.display = 'block';
                if (align === 'center') {
                  el.style.marginLeft = 'auto';
                  el.style.marginRight = 'auto';
                } else if (align === 'right') {
                  el.style.marginLeft = 'auto';
                  el.style.marginRight = '0';
                } else {
                  el.style.marginLeft = '0';
                  el.style.marginRight = 'auto';
                }
              }
              if (action === 'SET_BG_COLOR') {
                el.style.backgroundColor = value || '';
                el.style.backgroundImage = 'none';
              }
              if (action === 'SET_TEXT_COLOR') {
                el.style.color = value || '';
              }
              if (action === 'SET_TEXT_ALIGN') {
                el.style.textAlign = value || '';
              }
              if (action === 'SET_FONT_SIZE') {
                const px = parseFloat(value);
                if (!Number.isNaN(px)) {
                  el.style.fontSize = px + 'px';
                }
              }
              if (action === 'SET_LINE_HEIGHT') {
                const lh = parseFloat(value);
                if (!Number.isNaN(lh)) {
                  el.style.lineHeight = String(lh);
                }
              }
              if (action === 'SET_SECTION_TEXT_COLOR') {
                const section = findSection(el);
                if (section) {
                  section.style.color = value || '';
                  sendSectionUpdate(section);
                }
              }
              if (action === 'SET_BG_IMAGE') {
                const bg = value && value.startsWith('url(') ? value : value ? 'url("' + value + '")' : '';
                el.style.backgroundImage = bg;
              }
              if (action === 'FOCUS') {
                el.setAttribute('contenteditable', 'true');
                el.focus();
              }
              if (action === 'BLUR_ACTIVE') {
                if (el && el.blur) el.blur();
                sendSectionUpdate(section);
              }
              if (action === 'CLEAR_SELECTION') {
                window.__activeElement = null;
              }
              if (action && action !== 'FOCUS' && action !== 'CLEAR_SELECTION') {
                sendSectionUpdate(section);
              }
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
      if (isEditingText) return;
      iframeRef.current.contentWindow.postMessage({
        type: 'SYNC',
        sections: currentSections,
        selectedId: selectedSectionId
      }, '*');
    }
  }, [isIframeReady, currentSections, selectedSectionId, isEditingText]);

  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (e.data.type === 'READY') setIsIframeReady(true);
      if (e.data.type === 'EDITING') setIsEditingText(!!e.data.value);
      if (e.data.type === 'CHANGE') onUpdateSectionContent(e.data.id, e.data.content);
      if (e.data.type === 'SELECT') onSelectSection(e.data.sectionId);
      if (e.data.type === 'ELEMENT_SELECT') onElementSelect(e.data.element || null);
    };
    window.addEventListener('message', handle);
    return () => window.removeEventListener('message', handle);
  }, [onUpdateSectionContent, onSelectSection, onElementSelect]);

  const handleSimulateHeatmap = async () => {
    if (isSimulatingHeatmap) return;
    setIsSimulatingHeatmap(true);
    try {
      const points = await simulateHeatmap(currentSections);
      setHeatmapPoints(points);
    } catch (error) {
      console.error("Heatmap simulation failed", error);
      alert("Falha ao simular heatmap.");
    } finally {
      setIsSimulatingHeatmap(false);
    }
  };

  useEffect(() => { sync(); }, [sync]);

  useEffect(() => {
    if (!isEditingText) sync();
  }, [isEditingText, sync]);

  const sendActiveElementCommand = useCallback((action: string, value?: string) => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({
      type: 'UPDATE_ACTIVE_ELEMENT',
      payload: { action, value }
    }, '*');
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isSectionMenuOpen) setIsSectionMenuOpen(false);
      if (heatmapPoints) setHeatmapPoints(null);
      if (activeElement) {
        onElementSelect(null);
        sendActiveElementCommand('CLEAR_SELECTION');
        setPopoverOffset({ x: 0, y: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeElement, heatmapPoints, isSectionMenuOpen, onElementSelect, sendActiveElementCommand]);

  useEffect(() => {
    setPopoverOffset({ x: 0, y: 0 });
  }, [activeElement?.sectionId, activeElement?.tagName, activeElement?.content, activeElement?.src]);

  useEffect(() => {
    if (!popoverRef.current) return;
    const measure = () => {
      if (!popoverRef.current) return;
      const rect = popoverRef.current.getBoundingClientRect();
      if (rect.width && rect.height) {
        setPopoverSize({ width: rect.width, height: rect.height });
      }
    };
    const frame = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [activeElement?.sectionId, activeElement?.tagName]);

  const popoverStyle = useMemo(() => {
    if (!activeElement || !iframeRef.current || !previewRef.current) return null;
    const iframeRect = iframeRef.current.getBoundingClientRect();
    const previewRect = previewRef.current.getBoundingClientRect();
    const rectTop = iframeRect.top - previewRect.top + activeElement.rect.top;
    const rectLeft = iframeRect.left - previewRect.left + activeElement.rect.left;
    const rectHeight = activeElement.rect.height || 0;
    const margin = 12;
    let top = rectTop - popoverSize.height - margin;
    if (top < 10) {
      top = rectTop + rectHeight + margin;
    }
    const maxLeft = Math.max(10, previewRect.width - popoverSize.width - 10);
    const left = Math.min(Math.max(10, rectLeft + popoverOffset.x), maxLeft);
    return { top: Math.max(10, top + popoverOffset.y), left, width: popoverSize.width };
  }, [activeElement, popoverOffset, popoverSize]);

  const isTextElement = activeElement && ['P','SPAN','H1','H2','H3','H4','H5','H6','LI','A','BUTTON','STRONG','B','DIV'].includes(activeElement.tagName);
  const isImageElement = activeElement && activeElement.tagName === 'IMG';
  const textAlignValue = activeElement?.textAlign || 'left';
  const fontSizeValue = useMemo(() => {
    const raw = activeElement?.fontSize || '';
    const parsed = parseFloat(raw);
    return Number.isNaN(parsed) ? 16 : Math.round(parsed);
  }, [activeElement?.fontSize]);
  const lineHeightValue = useMemo(() => {
    const raw = activeElement?.lineHeight || '';
    if (!raw || raw === 'normal') return 1.5;
    const parsed = parseFloat(raw);
    if (Number.isNaN(parsed)) return 1.5;
    if (raw.includes('px') && fontSizeValue) {
      return Math.max(1, Math.round((parsed / fontSizeValue) * 10) / 10);
    }
    return Math.round(parsed * 10) / 10;
  }, [activeElement?.lineHeight, fontSizeValue]);

  const handleRewrite = async () => {
    if (!activeElement?.content || isRewriting) return;
    const instruction = window.prompt('Como deseja reescrever este texto?', 'Mais curto e direto');
    if (!instruction) return;
    setIsRewriting(true);
    try {
      const rewritten = await rewriteElementText(activeElement.content, instruction);
      sendActiveElementCommand('SET_TEXT', rewritten);
    } catch (err) {
      console.error(err);
      alert('Falha ao reescrever texto.');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleFinishEditing = () => {
    sendActiveElementCommand('BLUR_ACTIVE');
    setIsEditingText(false);
  };

  const handleImageUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = () => sendActiveElementCommand('SET_SRC', String(reader.result));
    reader.readAsDataURL(file);
  };

  const handlePopoverDragStart = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDraggingPopover(true);
    const startX = event.clientX;
    const startY = event.clientY;
    const startOffset = { ...popoverOffset };

    const handleMove = (moveEvent: MouseEvent) => {
      const nextX = startOffset.x + (moveEvent.clientX - startX);
      const nextY = startOffset.y + (moveEvent.clientY - startY);
      setPopoverOffset({ x: nextX, y: nextY });
    };

    const handleUp = () => {
      setIsDraggingPopover(false);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-200 overflow-hidden h-full">
      <div className="h-14 bg-white border-b px-6 flex items-center justify-between shrink-0 z-20 shadow-sm">
        <div className="flex bg-slate-100 rounded-lg p-1">
          <button onClick={() => setViewMode('desktop')} className={`px-4 py-1 text-[10px] font-black uppercase rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${viewMode === 'desktop' ? 'bg-white shadow-sm text-primary' : 'text-slate'}`}>Desktop</button>
          <button onClick={() => setViewMode('mobile')} className={`px-4 py-1 text-[10px] font-black uppercase rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${viewMode === 'mobile' ? 'bg-white shadow-sm text-primary' : 'text-slate'}`}>Mobile</button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onOpenPreview}
            className="px-4 py-1 text-[10px] font-black uppercase rounded-lg border transition-all flex items-center gap-2 bg-panel text-primary border-border hover:bg-blue-100"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Visualizar
          </button>
          <button
            onClick={handleSimulateHeatmap}
            disabled={isSimulatingHeatmap}
            className={`px-4 py-1 text-[10px] font-black uppercase rounded-lg border transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isSimulatingHeatmap ? 'bg-panel text-slate border-border' : 'bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100'}`}
          >
            {isSimulatingHeatmap ? (
              <div className="w-2 h-2 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            )}
            {isSimulatingHeatmap ? 'Simulando...' : 'Simular Heatmap'}
          </button>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-emerald-600 uppercase">Editor Visual Ativo</span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div ref={previewRef} className={`transition-all duration-500 relative bg-white shadow-2xl overflow-hidden ${viewMode === 'desktop' ? 'w-full h-full rounded-none' : 'w-[375px] h-[95%] rounded-[40px] border-[10px] border-slate-900 shadow-blue-500/20'}`}>
          <iframe
            ref={iframeRef}
            title="Preview"
            className={`w-full h-full border-none transition-opacity duration-300 ${isIframeReady ? 'opacity-100' : 'opacity-0'}`}
          />
          {activeElement && popoverStyle && (
            <div
              ref={popoverRef}
              className="absolute z-[120] bg-white border border-border rounded-xl shadow-2xl p-3 text-[11px] text-ink"
              style={popoverStyle}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-slate">{activeElement.tagName}</span>
                <div className="flex items-center gap-2">
                  <button
                    onMouseDown={handlePopoverDragStart}
                    className={`text-[10px] font-black px-2 py-1 rounded-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${isDraggingPopover ? 'bg-slate-200 border-slate-300 text-ink' : 'bg-slate-100 border-border text-slate'}`}
                    title="Arrastar"
                  >
                    ⠿
                  </button>
                  <button
                    onClick={() => { onElementSelect(null); sendActiveElementCommand('CLEAR_SELECTION'); setPopoverOffset({ x: 0, y: 0 }); }}
                    className="text-[10px] font-black text-slate hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {isTextElement && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { key: 'text', label: 'Texto' },
                      { key: 'color', label: 'Cor' },
                      { key: 'section', label: 'Seção' },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setTextTab(tab.key as 'text' | 'color' | 'section')}
                        className={`px-2 py-1 rounded-md text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${textTab === tab.key ? 'bg-primary text-white border-primary' : 'bg-panel text-slate border-border hover:border-primary'}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
                {activeSection && onRegenerateSection && (!isTextElement || textTab === 'section') && (
                  <div className="space-y-2">
                    <span className="block text-[10px] font-black uppercase text-slate">Seção</span>
                    <div className="flex items-center justify-between px-2 py-2 rounded-lg bg-panel border border-border text-[10px] font-black uppercase text-slate">
                      <span>{activeSection.type || 'SECTION'}</span>
                      <span className="text-slate">{activeSection.id.slice(0, 6)}</span>
                    </div>
                    <div className="relative">
                      <button
                        onClick={() => setIsSectionMenuOpen(prev => !prev)}
                        className="w-full px-3 py-2 bg-amber-50 rounded-lg font-bold text-amber-700 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        Ações da Seção
                      </button>
                      {isSectionMenuOpen && (
                        <div className="absolute left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-xl overflow-hidden z-10">
                          <button
                            onClick={() => {
                              onRegenerateSection(activeSection.id, activeSection.type);
                              setIsSectionMenuOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-[10px] font-black uppercase text-ink hover:bg-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            Reconstruir Seção (CRO)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {isTextElement && textTab === 'text' && (
                  <>
                    <div className="space-y-2">
                      <span className="block text-[10px] font-black uppercase text-slate">Alinhamento</span>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { key: 'left', label: 'Esq.' },
                          { key: 'center', label: 'Centro' },
                          { key: 'right', label: 'Dir.' },
                          { key: 'justify', label: 'Just.' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => sendActiveElementCommand('SET_TEXT_ALIGN', opt.key)}
                            className={`px-2 py-2 rounded-md text-[9px] font-black uppercase border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${textAlignValue === opt.key ? 'bg-primary text-white border-primary' : 'bg-panel text-slate border-border hover:border-primary'}`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => sendActiveElementCommand('FOCUS')}
                        className="px-2 py-2 bg-slate-100 rounded-lg font-bold text-[10px] text-slate hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        Editar
                      </button>
                      <button
                        onClick={handleFinishEditing}
                        className={`px-2 py-2 rounded-lg font-bold text-[10px] ${isEditingText ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-panel text-slate cursor-not-allowed'}`}
                        disabled={!isEditingText}
                      >
                        Concluir
                      </button>
                      <button
                        onClick={handleRewrite}
                        disabled={isRewriting}
                        className="px-2 py-2 bg-panel rounded-lg font-bold text-[10px] text-primary hover:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        {isRewriting ? 'IA...' : 'IA'}
                      </button>
                    </div>
                    <div className="space-y-2">
                      <span className="block text-[10px] font-black uppercase text-slate">Tipografia</span>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1.5">
                          <span className="block text-[9px] font-black uppercase text-slate">Tamanho</span>
                          <input
                            type="range"
                            min="12"
                            max="64"
                            value={fontSizeValue}
                            onChange={(e) => sendActiveElementCommand('SET_FONT_SIZE', e.target.value)}
                            className="w-full"
                          />
                          <Input
                            value={fontSizeValue}
                            onChange={(e) => sendActiveElementCommand('SET_FONT_SIZE', e.target.value)}
                            className="h-8 text-[10px]"
                            placeholder="Fonte (px)"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <span className="block text-[9px] font-black uppercase text-slate">Altura</span>
                          <input
                            type="range"
                            min="1.1"
                            max="2.4"
                            step="0.1"
                            value={lineHeightValue}
                            onChange={(e) => sendActiveElementCommand('SET_LINE_HEIGHT', e.target.value)}
                            className="w-full"
                          />
                          <Input
                            value={lineHeightValue}
                            onChange={(e) => sendActiveElementCommand('SET_LINE_HEIGHT', e.target.value)}
                            className="h-8 text-[10px]"
                            placeholder="Line-height"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
                {isTextElement && textTab === 'color' && (
                  <div className="space-y-2">
                    <span className="block text-[10px] font-black uppercase text-slate">Cor do Texto</span>
                    <input
                      type="color"
                      value={toHex(activeElement.color) || '#0f172a'}
                      onChange={(e) => sendActiveElementCommand('SET_TEXT_COLOR', e.target.value)}
                      className="w-full h-9 rounded-lg cursor-pointer border border-border"
                    />
                    <div className="grid grid-cols-8 gap-2">
                      {textColorPalette.map((color) => (
                        <button
                          key={color}
                          onClick={() => sendActiveElementCommand('SET_TEXT_COLOR', color)}
                          className="h-6 w-6 rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <div className="pt-2 space-y-2">
                      <span className="block text-[10px] font-black uppercase text-slate">Cor da Seção</span>
                      <div className="grid grid-cols-8 gap-2">
                        {textColorPalette.map((color) => (
                        <button
                          key={`section-${color}`}
                          onClick={() => sendActiveElementCommand('SET_SECTION_TEXT_COLOR', color)}
                          className="h-6 w-6 rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                        ))}
                      </div>
                      <button
                        onClick={() => sendActiveElementCommand('SET_SECTION_TEXT_COLOR', toHex(activeElement.color) || '#0f172a')}
                        className="w-full px-3 py-2 bg-panel rounded-lg font-bold text-slate hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        Aplicar cor do elemento à seção
                      </button>
                    </div>
                  </div>
                )}
                {isImageElement && (
                  <>
                    <label className="w-full block">
                      <span className="block w-full px-3 py-2 bg-slate-100 rounded-lg font-bold text-slate hover:bg-slate-200 cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                        Upload de Imagem
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                      />
                    </label>
                    <div className="space-y-2">
                      <span className="block text-[10px] font-black uppercase text-slate">Tamanho</span>
                      <input
                        type="range"
                        min="80"
                        max="800"
                        value={Math.round(activeElement.rect.width)}
                        onChange={(e) => sendActiveElementCommand('SET_IMG_WIDTH', e.target.value)}
                        className="w-full"
                      />
                      <Input
                        value={Math.round(activeElement.rect.width)}
                        onChange={(e) => sendActiveElementCommand('SET_IMG_WIDTH', e.target.value)}
                        className="h-8 text-[10px]"
                        placeholder="Largura (px)"
                      />
                      <div className="grid grid-cols-3 gap-2">
                        {['50', '75', '100'].map(pct => (
                          <button
                            key={pct}
                            onClick={() => sendActiveElementCommand('SET_IMG_WIDTH_PERCENT', pct)}
                            className="px-2 py-1 rounded-md bg-slate-100 text-[9px] font-black text-slate hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => sendActiveElementCommand('RESET_IMG_SIZE')}
                        className="w-full px-3 py-2 bg-panel rounded-lg font-bold text-slate hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                      >
                        Resetar Tamanho
                      </button>
                    </div>
                    <div className="space-y-2">
                      <span className="block text-[10px] font-black uppercase text-slate">Alinhamento</span>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'left', label: 'Esq.' },
                          { key: 'center', label: 'Centro' },
                          { key: 'right', label: 'Dir.' }
                        ].map(opt => (
                          <button
                            key={opt.key}
                            onClick={() => sendActiveElementCommand('SET_IMG_ALIGN', opt.key)}
                            className="px-2 py-2 rounded-md bg-slate-100 text-[9px] font-black text-slate hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    {studioImages.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {studioImages.slice(0, 6).map(img => (
                          <button
                            key={img.id}
                            onClick={() => sendActiveElementCommand('SET_SRC', img.url)}
                            className="w-full h-14 rounded-lg overflow-hidden border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                          >
                            <img src={img.url} className="w-full h-full object-cover" alt="Asset" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-2 rounded-lg border border-dashed border-border p-3 text-center">
                        <p className="text-[9px] font-black uppercase text-slate">Sem imagens na biblioteca</p>
                        <label className="w-full block">
                          <span className="block w-full px-3 py-2 bg-slate-100 rounded-lg font-bold text-slate hover:bg-slate-200 cursor-pointer text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
                            Upload Rapido
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                          />
                        </label>
                      </div>
                    )}
                  </>
                )}
                <div className="space-y-2">
                  <span className="block text-[10px] font-black uppercase text-emerald-700">Background</span>
                  <div className="grid grid-cols-6 gap-2">
                    {[
                      '#0f172a', '#111827', '#1f2937', '#334155', '#94a3b8', '#e2e8f0',
                      '#ffffff', '#f8fafc', '#f1f5f9', '#e5e7eb', '#fef3c7', '#fde68a',
                      '#dcfce7', '#bbf7d0', '#a7f3d0', '#bae6fd', '#93c5fd', '#a5b4fc'
                    ].map(color => (
                      <button
                        key={color}
                        onClick={() => sendActiveElementCommand('SET_BG_COLOR', color)}
                        className="h-6 w-6 rounded-md border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      const value = window.prompt('URL da imagem de fundo:', '');
                      if (value) sendActiveElementCommand('SET_BG_IMAGE', value);
                    }}
                    className="w-full px-3 py-2 bg-emerald-50 rounded-lg font-bold text-emerald-700 hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Usar Imagem no Background
                  </button>
                </div>
                {activeElement.href !== undefined && activeElement.tagName === 'A' && (
                  <button
                    onClick={() => {
                      const value = window.prompt('Novo link:', activeElement.href || '');
                      if (value) sendActiveElementCommand('SET_HREF', value);
                    }}
                    className="w-full px-3 py-2 bg-slate-100 rounded-lg font-bold text-slate hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    Editar Link
                  </button>
                )}
              </div>
            </div>
          )}
          {heatmapPoints && (
            <HeatmapOverlay points={heatmapPoints} onClose={() => setHeatmapPoints(null)} />
          )}
          {!isIframeReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white gap-4">
              <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"></div>
              <span className="text-[10px] font-black uppercase text-slate tracking-widest">Iniciando Engine de Edição...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
