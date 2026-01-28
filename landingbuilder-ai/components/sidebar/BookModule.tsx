
import React, { useState, useEffect } from 'react';
import { Ebook, Producer, ProductInfo } from '../../types';
import { Label, Button, Card } from '../ui/BaseComponents';
import { getAllExperts, getProductsByExpert } from '../../services/dbService';

interface Props {
  activeExpert: Producer | null;
  activeProduct: ProductInfo | null;
  onSelectExpert: (expert: Producer) => void;
  onSelectProduct: (product: ProductInfo) => void;
  ebooks: Ebook[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onGenerateOutline: (title: string, topic: string, author: string, ref?: string) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

const BookModule: React.FC<Props> = ({ 
  activeExpert, activeProduct, onSelectExpert, onSelectProduct, ebooks, activeId, onSelect, onGenerateOutline, onDelete, isLoading 
}) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  
  const [allExperts, setAllExperts] = useState<Producer[]>([]);
  const [expertProducts, setExpertProducts] = useState<ProductInfo[]>([]);

  useEffect(() => {
    getAllExperts().then(setAllExperts);
  }, []);

  useEffect(() => {
    if (activeExpert) {
      getProductsByExpert(activeExpert.id).then(setExpertProducts);
    }
  }, [activeExpert]);

  const handleCreate = () => {
    if (!activeExpert) return alert("Selecione um Autor/Expert.");
    if (!activeProduct) return alert("Selecione um Produto de destino.");
    
    // Herda o título diretamente do nome da oferta (Produto)
    onGenerateOutline(activeProduct.name, activeProduct.learningGoals, activeExpert.name);
    setView('list');
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <Card color="slate">
         <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Contexto do Projeto</span>
         </div>
         <div className="space-y-3">
            <div>
               <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Expert Responsável</p>
               <select 
                 value={activeExpert?.id || ''} 
                 onChange={(e) => {
                   const exp = allExperts.find(x => x.id === e.target.value);
                   if (exp) onSelectExpert(exp);
                 }}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-[10px] font-bold text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
               >
                 <option value="" disabled>Selecionar...</option>
                 {allExperts.map(exp => (
                   <option key={exp.id} value={exp.id}>{exp.name}</option>
                 ))}
               </select>
            </div>
            <div>
               <p className="text-[8px] font-black uppercase text-slate-500 mb-1">Oferta de Origem</p>
               <select 
                 value={activeProduct?.id || ''} 
                 onChange={(e) => {
                   const prod = expertProducts.find(x => x.id === e.target.value);
                   if (prod) onSelectProduct(prod);
                 }}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-[10px] font-bold text-white outline-none focus:border-blue-500 transition-all cursor-pointer"
               >
                 <option value="" disabled>Selecionar...</option>
                 {expertProducts.map(prod => (
                   <option key={prod.id} value={prod.id}>{prod.name}</option>
                 ))}
               </select>
            </div>
         </div>
      </Card>

      <div className="h-px bg-slate-100 dark:bg-slate-800 my-2"></div>

      {view === 'list' ? (
        <div className="space-y-4">
          <Button variant="secondary" onClick={() => setView('create')} className="w-full border-dashed" disabled={!activeProduct}>
            + Criar Novo E-book
          </Button>

          <div className="space-y-3">
            {ebooks.map(book => (
              <div 
                key={book.id}
                onClick={() => onSelect(book.id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all group relative ${activeId === book.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10 shadow-md' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200'}`}
              >
                <h4 className="text-xs font-black uppercase line-clamp-1 pr-6">{book.title}</h4>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">{book.chapters.length} Capítulos</span>
                  <span className="text-[8px] font-black text-blue-500 uppercase">{book.author}</span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm('Excluir este ativo?')) onDelete(book.id); }}
                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-rose-300 hover:text-rose-600 transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862" /></svg>
                </button>
              </div>
            ))}
            {ebooks.length === 0 && (
              <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase italic">Nenhum ativo gerado para esta oferta.</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in slide-in-from-right-4">
          <div className="flex items-center justify-between">
            <Label color="blue">Novo Ativo Digital</Label>
            <button onClick={() => setView('list')} className="text-[9px] font-black text-slate-400 uppercase hover:text-rose-500 transition-colors">Cancelar</button>
          </div>

          <div className="space-y-4">
            {/* Título herdado visualmente para confirmação */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-2xl">
               <span className="text-[8px] font-black text-indigo-500 uppercase block mb-1 tracking-widest">Título Herdado da Oferta</span>
               <p className="text-xs font-black uppercase text-slate-800 dark:text-white leading-tight">
                  {activeProduct?.name || "Oferta não selecionada"}
               </p>
            </div>
            
            <div className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[24px] shadow-inner">
               <span className="text-[8px] font-black text-slate-400 uppercase block mb-2 tracking-widest">Base de Aprendizado (Herdada)</span>
               <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-bold italic line-clamp-10">
                  {activeProduct?.learningGoals || "⚠️ Sem dados de aprendizado na oferta."}
               </p>
            </div>

            <Button 
              onClick={handleCreate} 
              disabled={isLoading || !activeProduct?.learningGoals} 
              className="w-full py-5 !rounded-3xl shadow-xl shadow-blue-500/10"
            >
              {isLoading ? 'IA Estruturando Pauta...' : 'Gerar Pauta Estratégica'}
            </Button>
            
            <p className="text-[9px] font-bold text-slate-400 uppercase text-center leading-relaxed">
              A IA gerará a estrutura editorial completa baseada na sua oferta.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookModule;
