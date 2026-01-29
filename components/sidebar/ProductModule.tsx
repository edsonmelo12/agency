
import React, { useState, useEffect, useRef } from 'react';
import { ProductInfo, Producer } from '../../types';
import { Label, Input, TextArea, Card, Button, Toggle, Select } from '../ui/BaseComponents';
import { getProductsByExpert, saveProduct, deleteProduct } from '../../services/dbService';
import { analyzeExternalProduct } from '../../services/genaiClient';

interface Props {
  activeExpert: Producer | null;
  activeProduct: ProductInfo | null;
  onSelectProduct: (product: ProductInfo) => void;
  isLoading: boolean;
  editData: ProductInfo | null;
  setEditData: (p: ProductInfo | null) => void;
}

const ProductModule: React.FC<Props> = ({ 
  activeExpert, activeProduct, onSelectProduct, isLoading: isGlobalLoading, editData, setEditData 
}) => {
  const [products, setProducts] = useState<ProductInfo[]>([]);
  const [isAiFilling, setIsAiFilling] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'base' | 'strategy' | 'proof'>('base');
  const productImgRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeExpert) {
      getProductsByExpert(activeExpert.id).then(setProducts);
    }
  }, [activeExpert]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (editData) setEditData(null);
      if (activeTab !== 'base') setActiveTab('base');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editData, activeTab, setEditData]);

  const handleImportUrl = async () => {
    if (!activeExpert) return alert("Selecione um Expert primeiro!");
    if (!importUrl.startsWith('http')) return alert("Insira uma URL válida.");
    
    setIsAiFilling(true);
    try {
      const data = await analyzeExternalProduct(importUrl);
      const newProd: ProductInfo = {
        id: `prod-${Date.now()}`,
        producerId: activeExpert.id,
        name: data.name || '',
        description: data.description || '',
        price: data.price || '',
        anchorPrice: data.anchorPrice || '',
        anchorSavings: data.anchorSavings || '',
        learningGoals: data.learningGoals || '',
        imageUrl: '',
        guaranteeDays: data.guaranteeDays || 7,
        bonusDescription: data.bonusDescription || '',
        uniqueMechanism: data.uniqueMechanism || '',
        testimonials: data.testimonials || [],
        proofStats: data.proofStats || '',
        scarcityText: data.scarcityText || '',
        faq: data.faq || [],
        isExternal: true,
        externalUrl: importUrl,
        persona: {
          niche: data.persona?.niche || '',
          ageRange: data.persona?.ageRange || '',
          gender: data.persona?.gender || 'Ambos',
          audience: data.persona?.audience || '',
          pains: data.persona?.pains || '',
          desires: data.persona?.desires || '',
          objections: data.persona?.objections || ''
        },
        orderBump: { active: false, name: '', price: '', description: '' },
        upsell: { active: false, name: '', price: '', description: '' },
        createdAt: Date.now()
      };
      setEditData(newProd);
    } catch (e) {
      alert("Erro ao analisar URL.");
    } finally {
      setIsAiFilling(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editData) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setEditData({ ...editData, imageUrl: ev.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const addTestimonial = () => {
    if (editData) {
      setEditData({
        ...editData,
        testimonials: [...(editData.testimonials || []), ""]
      });
    }
  };

  const updateTestimonial = (index: number, val: string) => {
    if (editData && editData.testimonials) {
      const newList = [...editData.testimonials];
      newList[index] = val;
      setEditData({ ...editData, testimonials: newList });
    }
  };

  const addFaq = () => {
    if (editData) {
      setEditData({
        ...editData,
        faq: [...(editData.faq || []), { question: "", answer: "" }]
      });
    }
  };

  const updateFaq = (index: number, field: 'question' | 'answer', val: string) => {
    if (editData && editData.faq) {
      const newList = [...editData.faq];
      newList[index] = { ...newList[index], [field]: val };
      setEditData({ ...editData, faq: newList });
    }
  };

  const handleSave = async () => {
    if (!editData || !activeExpert) return;
    const finalData = { ...editData, producerId: activeExpert.id };
    await saveProduct(finalData);
    const updatedList = await getProductsByExpert(activeExpert.id);
    setProducts(updatedList);
    onSelectProduct(finalData);
    setEditData(null);
  };

  const startNew = () => {
    if (!activeExpert) return;
    setEditData({
      id: `prod-${Date.now()}`, producerId: activeExpert.id, name: '', description: '', price: '', learningGoals: '',
      imageUrl: '', guaranteeDays: 7, bonusDescription: '',
      uniqueMechanism: '',
      testimonials: [], proofStats: '', scarcityText: '', faq: [],
      isExternal: false, externalUrl: '', persona: { niche: '', ageRange: '', gender: 'Ambos', audience: '', pains: '', desires: '', objections: '' },
      orderBump: { active: false, name: '', price: '', description: '' },
      upsell: { active: false, name: '', price: '', description: '' }, createdAt: Date.now()
    });
  };

  if (!activeExpert) return <div className="text-center py-20 opacity-40 uppercase text-[10px] font-black">Selecione um Expert primeiro.</div>;

  if (editData) {
    return (
      <div className="space-y-6 animate-in fade-in pb-20">
        <div className="flex items-center justify-between">
           <Label color="indigo">Estratégia da Oferta</Label>
           <button onClick={() => setEditData(null)} className="text-[10px] font-black text-slate uppercase">Voltar</button>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl gap-1">
           <button onClick={() => setActiveTab('base')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${activeTab === 'base' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate'}`}>Oferta</button>
           <button onClick={() => setActiveTab('strategy')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${activeTab === 'strategy' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate'}`}>Estratégia</button>
           <button onClick={() => setActiveTab('proof')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${activeTab === 'proof' ? 'bg-white dark:bg-slate-700 text-primary dark:text-white shadow-sm' : 'text-slate'}`}>Provas</button>
        </div>

        {activeTab === 'base' && (
          <div className="space-y-6 animate-in slide-in-from-left-4">
            <Card>
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate uppercase tracking-widest">Nome do Produto</span>
                  <Input value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} placeholder="Ex: Masterclass Venda Infinita" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest font-bold">Preço de Venda</span>
                      <Input value={editData.price} onChange={e => setEditData({...editData, price: e.target.value})} placeholder="Ex: R$ 997,00" className="!border-primary" />
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate uppercase tracking-widest">Garantia (Dias)</span>
                      <Input type="number" value={editData.guaranteeDays} onChange={e => setEditData({...editData, guaranteeDays: parseInt(e.target.value) || 0})} placeholder="7" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate uppercase tracking-widest">Preço Cheio (Ancoragem)</span>
                      <Input value={editData.anchorPrice || ''} onChange={e => setEditData({...editData, anchorPrice: e.target.value})} placeholder="Ex: R$ 1.497,00" />
                   </div>
                   <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate uppercase tracking-widest">Economia</span>
                      <Input value={editData.anchorSavings || ''} onChange={e => setEditData({...editData, anchorSavings: e.target.value})} placeholder="Ex: Economize R$ 500" />
                   </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate uppercase tracking-widest">Promessa Irresistível (Headline)</span>
                  <TextArea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} className="h-20" placeholder="Qual a transformação única do seu produto?" />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate uppercase tracking-widest">Mecanismo Único (Por que funciona)</span>
                  <TextArea value={editData.uniqueMechanism || ''} onChange={e => setEditData({...editData, uniqueMechanism: e.target.value})} className="h-16" placeholder="Ex: Método X reduz o esforço porque..." />
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-black text-slate uppercase tracking-widest">Nicho / Sub-nicho</span>
                  <Input value={editData.persona.niche} onChange={e => setEditData({...editData, persona: {...editData.persona, niche: e.target.value}})} placeholder="Ex: Emagrecimento / Dieta Keto" />
                </div>

                <div className="space-y-2">
                   <span className="text-[9px] font-black text-slate uppercase tracking-widest">Mockup / Visual do Produto</span>
                   <div
                     onClick={() => productImgRef.current?.click()}
                     role="button"
                     tabIndex={0}
                     onKeyDown={(e) => {
                       if (e.key === 'Enter' || e.key === ' ') {
                         e.preventDefault();
                         productImgRef.current?.click();
                       }
                     }}
                     className="w-full h-32 bg-panel dark:bg-slate-800 border-2 border-dashed border-border dark:border-slate-700 rounded-2xl flex items-center justify-center cursor-pointer hover:border-primary overflow-hidden shadow-inner transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                   >
                     {editData.imageUrl ? (
                       <img src={editData.imageUrl} className="w-full h-full object-contain p-2" alt="Product" />
                     ) : (
                       <div className="text-center">
                         <svg className="w-6 h-6 text-indigo-500 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                         <span className="text-[8px] font-black uppercase text-slate">Inserir Mockup 3D</span>
                       </div>
                     )}
                   </div>
                   <input type="file" ref={productImgRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                </div>
              </div>
            </Card>

            <Card color="indigo">
               <Label color="indigo">Gatilhos de Escassez</Label>
               <Input value={editData.scarcityText} onChange={e => setEditData({...editData, scarcityText: e.target.value})} placeholder="Ex: Apenas 15 vagas restantes com bônus..." />
            </Card>

            <Card color="blue">
               <div className="flex items-center justify-between mb-2">
                  <Label color="blue">Checkout Externo</Label>
                  <Toggle checked={editData.isExternal} onChange={val => setEditData({...editData, isExternal: val})} />
               </div>
               {editData.isExternal && <Input value={editData.externalUrl} onChange={e => setEditData({...editData, externalUrl: e.target.value})} placeholder="https://pay.hotmart.com/..." />}
            </Card>
          </div>
        )}

        {activeTab === 'strategy' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <Card color="indigo">
               <div className="space-y-4">
                  <div className="space-y-1">
                     <span className="text-[9px] font-black text-slate uppercase tracking-widest">O que eles vão aprender?</span>
                     <TextArea value={editData.learningGoals} onChange={e => setEditData({...editData, learningGoals: e.target.value})} className="h-24 text-[10px]" placeholder="Liste os principais módulos ou pilares..." />
                  </div>
                  <div className="space-y-1">
                     <span className="text-[9px] font-black text-slate uppercase tracking-widest">Entregáveis & Bônus</span>
                     <TextArea value={editData.bonusDescription} onChange={e => setEditData({...editData, bonusDescription: e.target.value})} className="h-24 text-[10px]" placeholder="Ex: Planilha de Gestão, Mentorias Gravadas..." />
                  </div>
               </div>
            </Card>

            <Card color="slate">
               <Label color="slate">Avatar / Persona</Label>
               <div className="space-y-4">
                  <div className="space-y-1">
                     <span className="text-[9px] font-black text-slate uppercase">Público Alvo / Persona</span>
                     <Input value={editData.persona.audience} onChange={e => setEditData({...editData, persona: {...editData.persona, audience: e.target.value}})} placeholder="Ex: Pequenos empresários cansados..." />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate uppercase">Faixa Etária</span>
                      <Input value={editData.persona.ageRange} onChange={e => setEditData({...editData, persona: {...editData.persona, ageRange: e.target.value}})} placeholder="Ex: 25-45 anos" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] font-black text-slate uppercase">Gênero</span>
                      <Select value={editData.persona.gender} onChange={e => setEditData({...editData, persona: {...editData.persona, gender: e.target.value}})}>
                        <option value="Ambos">Ambos</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                     <span className="text-[9px] font-black text-slate uppercase">Desejos & Sonhos</span>
                     <TextArea value={editData.persona.desires} onChange={e => setEditData({...editData, persona: {...editData.persona, desires: e.target.value}})} className="h-20 text-[10px]" placeholder="O que eles realmente querem alcançar?" />
                  </div>
                  <div className="space-y-1">
                     <span className="text-[9px] font-black text-slate uppercase">Dores & Problemas</span>
                     <TextArea value={editData.persona.pains} onChange={e => setEditData({...editData, persona: {...editData.persona, pains: e.target.value}})} className="h-20 text-[10px]" />
                  </div>
                  <div className="space-y-1">
                     <span className="text-[9px] font-black text-slate uppercase">Objeções Principais</span>
                     <TextArea value={editData.persona.objections} onChange={e => setEditData({...editData, persona: {...editData.persona, objections: e.target.value}})} className="h-20 text-[10px]" placeholder="O que impede eles de comprar agora?" />
                  </div>
               </div>
            </Card>
          </div>
        )}

        {activeTab === 'proof' && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <Card color="emerald">
              <Label color="emerald">Provas Concretas</Label>
              <TextArea
                value={editData.proofStats || ''}
                onChange={e => setEditData({ ...editData, proofStats: e.target.value })}
                className="h-20 text-[10px]"
                placeholder='Ex: +2.300 alunos, Nota 4.9, Selo "Top 1"'
              />
            </Card>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label color="emerald">Depoimentos / Prova Social</Label>
                <button onClick={addTestimonial} className="text-[9px] font-black text-primary uppercase">+ Adicionar</button>
              </div>
              <div className="space-y-2">
                {(editData.testimonials || []).map((t, i) => (
                  <TextArea key={i} value={t} onChange={e => updateTestimonial(i, e.target.value)} className="h-16 text-[10px]" placeholder={`Relato do cliente ${i+1}...`} />
                ))}
                {(!editData.testimonials || editData.testimonials.length === 0) && <p className="text-center py-4 text-[9px] font-bold text-slate uppercase">Nenhum depoimento cadastrado.</p>}
              </div>
            </div>

            <div className="space-y-3">
               <div className="flex items-center justify-between">
                  <Label color="indigo">FAQ da Oferta</Label>
                  <button onClick={addFaq} className="text-[9px] font-black text-primary uppercase">+ Adicionar</button>
               </div>
               <div className="space-y-4">
                  {(editData.faq || []).map((f, i) => (
                    <div key={i} className="p-4 bg-panel dark:bg-slate-800 rounded-2xl space-y-2 border border-border dark:border-slate-700">
                       <Input value={f.question} onChange={e => updateFaq(i, 'question', e.target.value)} placeholder="Pergunta..." className="!p-2 !bg-white" />
                       <TextArea value={f.answer} onChange={e => updateFaq(i, 'answer', e.target.value)} placeholder="Resposta..." className="h-16 !p-2 !bg-white" />
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        <Button onClick={handleSave} className="w-full py-5 shadow-indigo-500/10">Sincronizar Estratégia</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <Card color="indigo">
          <Label color="indigo">Análise de Competitividade</Label>
          <div className="flex gap-2">
            <Input value={importUrl} onChange={e => setImportUrl(e.target.value)} placeholder="URL de Vendas para Clonar Copy" className="flex-1 !p-3" />
            <Button onClick={handleImportUrl} disabled={isAiFilling} className="!py-3 !px-4 bg-primary min-w-[80px]">
               {isAiFilling ? '...' : 'Analisar'}
            </Button>
          </div>
       </Card>

       <div className="flex items-center justify-between">
          <Label color="slate">Suas Ofertas</Label>
          <button onClick={startNew} className="text-[10px] font-black text-primary uppercase hover:underline">+ Criar Oferta</button>
       </div>
       
       <div className="space-y-3">
          {products.map(prod => (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProduct(prod);
                }
              }}
              className={`p-4 rounded-[32px] border-2 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 group relative ${activeProduct?.id === prod.id ? 'border-primary bg-indigo-50 dark:bg-indigo-900/10 shadow-lg' : 'border-border dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-200'}`}
            >
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 border rounded-2xl overflow-hidden flex items-center justify-center shadow-inner">
                    {prod.imageUrl ? <img src={prod.imageUrl} className="w-full h-full object-contain p-1" /> : <div className="text-[10px] font-black text-slate-300">N/A</div>}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h4 className="text-xs font-black uppercase truncate pr-8 tracking-tighter">{prod.name || 'Sem Nome'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="text-[10px] font-black text-primary">{prod.price || 'R$ 0,00'}</span>
                       <span className="text-[8px] font-bold text-slate uppercase">• {prod.guaranteeDays}d Garantia</span>
                    </div>
                  </div>
               </div>
               <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); setEditData(prod); }} className="p-2 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-slate hover:text-primary shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); if(confirm('Excluir oferta?')) deleteProduct(prod.id).then(() => getProductsByExpert(activeExpert.id).then(setProducts)); }} className="p-2 bg-white dark:bg-slate-800 border border-border dark:border-slate-700 rounded-xl text-rose-400 hover:text-rose-600 shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862" /></svg>
                  </button>
               </div>
            </div>
          ))}
          {products.length === 0 && <div className="text-center py-10 opacity-30 text-[9px] font-black uppercase tracking-widest">Nenhuma oferta definida</div>}
       </div>
    </div>
  );
};

export default ProductModule;
