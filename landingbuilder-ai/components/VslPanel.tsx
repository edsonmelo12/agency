
import React, { useState, useRef } from 'react';
import { VslScript } from '../types';
import { Button } from './ui/BaseComponents';
import { generateSpeech } from '../services/genaiClient';

interface Props {
  script: VslScript | null;
  uiTheme: 'light' | 'dark';
  onPlayAudio?: () => void;
  isLoadingAudio: boolean;
  setIsLoadingAudio: (v: boolean) => void;
}

/**
 * Utilitários para decodificação de PCM Gemini (24kHz, 1 canal)
 */
function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, sampleRate);
  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return buffer;
}

const VslPanel: React.FC<Props> = ({ script, uiTheme, isLoadingAudio, setIsLoadingAudio }) => {
  const [isTeleprompter, setIsTeleprompter] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(2);
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleSpeechPreview = async () => {
    if (!script) return;
    setIsLoadingAudio(true);
    try {
      const base64Audio = await generateSpeech(script.content, script.voiceName);
      if (!base64Audio) throw new Error("Áudio vazio");

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      const audioBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(audioBytes, ctx, 24000);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      
      alert("Reproduzindo Guia de Voz AI (24kHz Mono)");
    } catch (e) {
      console.error(e);
      alert("Erro ao sintetizar áudio. Verifique sua chave API.");
    } finally {
      setIsLoadingAudio(false);
    }
  };

  if (!script) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-8">
        <div className="max-w-md text-center space-y-6 opacity-50">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">VSL Studio: Roteirização</h3>
          <p className="text-xs font-bold leading-relaxed">Gere um script de vendas magnético para transformar visitantes em compradores através de vídeo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-500 ${isTeleprompter ? 'bg-black' : 'bg-slate-50 dark:bg-slate-950'}`}>
      {/* Header do Painel */}
      <div className={`h-16 border-b px-8 flex items-center justify-between z-50 ${isTeleprompter ? 'border-white/10 bg-black' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm'}`}>
        <div className="flex items-center gap-3">
           <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded ${isTeleprompter ? 'bg-white/10 text-white' : 'bg-indigo-600 text-white'}`}>
             {script.model} Mode
           </span>
           <h3 className={`text-sm font-black uppercase ${isTeleprompter ? 'text-white' : 'text-slate-900 dark:text-white'}`}>{script.title}</h3>
        </div>
        <div className="flex items-center gap-4">
           {!isTeleprompter && (
             <button 
              onClick={handleSpeechPreview}
              disabled={isLoadingAudio}
              className="text-[10px] font-black uppercase text-indigo-600 hover:underline flex items-center gap-2 disabled:opacity-50"
             >
               {isLoadingAudio ? 'Sintetizando...' : 'Escutar Preview AI'}
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
             </button>
           )}
           <button 
            onClick={() => setIsTeleprompter(!isTeleprompter)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${isTeleprompter ? 'bg-rose-600 text-white' : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'}`}
           >
            {isTeleprompter ? 'Sair do Teleprompter' : 'Modo Teleprompter'}
           </button>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden flex flex-col items-center">
        {isTeleprompter && <div className="absolute top-1/2 left-0 w-full h-24 bg-white/5 pointer-events-none z-10 border-y border-white/10"></div>}
        <div ref={scrollRef} className={`w-full max-w-4xl flex-1 overflow-y-auto p-12 custom-scrollbar transition-all ${isTeleprompter ? 'text-center' : ''}`}>
          <div className={`space-y-8 ${isTeleprompter ? 'py-[40vh]' : ''}`}>
             {script.content.split('\n').map((line, idx) => {
               if (line.startsWith('[') && line.endsWith(']')) {
                 return !isTeleprompter ? (
                   <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                      <span className="text-[10px] font-black uppercase text-blue-600 block mb-1">Cena / Visual</span>
                      <p className="text-xs font-bold text-blue-900 dark:text-blue-100 italic">{line}</p>
                   </div>
                 ) : null;
               }
               return line.trim() && (
                 <p key={idx} className={`leading-relaxed transition-all duration-300 ${isTeleprompter ? 'text-4xl md:text-6xl font-black text-white' : 'text-lg font-medium text-slate-600 dark:text-slate-300'}`}>
                    {line}
                 </p>
               );
             })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VslPanel;
