
import React, { useState, useEffect, useRef } from 'react';
import { Producer, BrandTone, SocialLinks } from '../../types';
import { Label, Input, TextArea, Select, Button, Card } from '../ui/BaseComponents';
import { getAllExperts, saveExpert, deleteExpert } from '../../services/dbService';

interface Props {
  activeExpert: Producer | null;
  onSelectExpert: (expert: Producer) => void;
  editData: Producer | null;
  setEditData: (p: Producer | null) => void;
}

const StrategyModule: React.FC<Props> = ({ activeExpert, onSelectExpert, editData, setEditData }) => {
  const [experts, setExperts] = useState<Producer[]>([]);
  
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    const all = await getAllExperts();
    setExperts(all);
    if (all.length > 0 && !activeExpert) {
      onSelectExpert(all[0]);
    }
  };

  const handleSave = async () => {
    if (!editData) return;
    await saveExpert(editData);
    await loadExperts();
    onSelectExpert(editData);
    setEditData(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'photoUrl') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (editData) {
          setEditData({
            ...editData,
            brandKit: { ...editData.brandKit, [field]: ev.target?.result as string }
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const startNew = () => {
    const newExp: Producer = {
      id: `exp-${Date.now()}`,
      name: '',
      authority: '',
      tone: 'Persuasive',
      socialLinks: { instagram: '', facebook: '', tiktok: '', youtube: '', linkedin: '', email: '', whatsapp: '' },
      brandKit: { primaryColor: '#2563eb', secondaryColor: '#f59e0b' },
      testimonials: [],
      createdAt: Date.now()
    };
    setEditData(newExp);
  };

  if (editData) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-left-4 pb-20">
        <div className="flex items-center justify-between">
           <Label color="blue">Perfil da Autoridade</Label>
           <button onClick={() => setEditData(null)} className="text-[10px] font-black text-slate-400 uppercase">Voltar</button>
        </div>
        
        <Card>
          <Label color="slate">Identidade & Autoridade</Label>
          <div className="space-y-4">
            <Input 
              value={editData.name} 
              onChange={e => setEditData({...editData, name: e.target.value})} 
              placeholder="Nome do Expert ou Marca" 
            />
            <TextArea 
              value={editData.authority} 
              onChange={e => setEditData({...editData, authority: e.target.value})} 
              className="h-24" 
              placeholder="Bio: Por que o público deve confiar em você?" 
            />
            <Select 
              value={editData.tone} 
              onChange={e => setEditData({...editData, tone: e.target.value as BrandTone})}
            >
              <option value="Persuasive">Persuasivo (Foco em Vendas)</option>
              <option value="Professional">Profissional (Corporativo)</option>
              <option value="Friendly">Amigável (Acolhedor)</option>
              <option value="Urgent">Agressivo (Escassez)</option>
            </Select>
          </div>
        </Card>

        <Card color="indigo">
          <Label color="indigo">Contatos & Canais Digitais</Label>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">WhatsApp</span>
                <Input 
                  value={editData.socialLinks?.whatsapp || ''} 
                  onChange={e => setEditData({...editData, socialLinks: {...(editData.socialLinks || {}), whatsapp: e.target.value}})} 
                  placeholder="(00) 00000-0000" 
                />
              </div>
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-400 uppercase">E-mail</span>
                <Input 
                  value={editData.socialLinks?.email || ''} 
                  onChange={e => setEditData({...editData, socialLinks: {...(editData.socialLinks || {}), email: e.target.value}})} 
                  placeholder="contato@exemplo.com" 
                />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Instagram</span>
              <Input 
                value={editData.socialLinks?.instagram || ''} 
                onChange={e => setEditData({...editData, socialLinks: {...(editData.socialLinks || {}), instagram: e.target.value}})} 
                placeholder="@perfil" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">TikTok</span>
              <Input 
                value={editData.socialLinks?.tiktok || ''} 
                onChange={e => setEditData({...editData, socialLinks: {...(editData.socialLinks || {}), tiktok: e.target.value}})} 
                placeholder="@perfil_tiktok" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Facebook</span>
              <Input 
                value={editData.socialLinks?.facebook || ''} 
                onChange={e => setEditData({...editData, socialLinks: {...(editData.socialLinks || {}), facebook: e.target.value}})} 
                placeholder="facebook.com/seu-perfil" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">YouTube</span>
              <Input 
                value={editData.socialLinks?.youtube || ''} 
                onChange={e => setEditData({...editData, socialLinks: {...(editData.socialLinks || {}), youtube: e.target.value}})} 
                placeholder="youtube.com/@seu-canal" 
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-bold text-slate-400 uppercase">LinkedIn</span>
              <Input 
                value={editData.socialLinks?.linkedin || ''} 
                onChange={e => setEditData({...editData, socialLinks: {...(editData.socialLinks || {}), linkedin: e.target.value}})} 
                placeholder="linkedin.com/in/voce" 
              />
            </div>
          </div>
        </Card>

        <Card color="blue">
          <Label color="blue">Fotos & Identidade Visual</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Logo da Marca</span>
              <div 
                onClick={() => logoInputRef.current?.click()}
                className="w-full aspect-square bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden shadow-sm transition-all"
              >
                {editData.brandKit.logoUrl ? (
                  <img src={editData.brandKit.logoUrl} className="w-full h-full object-contain p-4" alt="Expert Logo" />
                ) : (
                  <div className="p-2">
                    <svg className="w-6 h-6 text-slate-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <span className="text-[8px] font-black uppercase text-slate-400">Logo</span>
                  </div>
                )}
              </div>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'logoUrl')} />
            </div>

            <div className="space-y-2 text-center">
              <span className="text-[9px] font-bold text-slate-400 uppercase">Foto Expert</span>
              <div 
                onClick={() => photoInputRef.current?.click()}
                className="w-full aspect-square bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 overflow-hidden shadow-sm transition-all"
              >
                {editData.brandKit.photoUrl ? (
                  <img src={editData.brandKit.photoUrl} className="w-full h-full object-cover" alt="Expert Photo" />
                ) : (
                  <div className="p-2">
                    <svg className="w-6 h-6 text-slate-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    <span className="text-[8px] font-black uppercase text-slate-400">Foto</span>
                  </div>
                )}
              </div>
              <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'photoUrl')} />
            </div>
          </div>
        </Card>

        <Button onClick={handleSave} className="w-full py-5">Salvar Perfil Completo</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in pb-20">
      <div className="flex items-center justify-between mb-4">
         <Label color="slate">Seus Especialistas</Label>
         <button onClick={startNew} className="text-[10px] font-black text-blue-600 uppercase">+ Novo Expert</button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {experts.map(exp => (
          <div 
            key={exp.id} 
            onClick={() => onSelectExpert(exp)}
            className={`p-4 rounded-[24px] border-2 transition-all cursor-pointer group relative ${activeExpert?.id === exp.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/5' : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-200'}`}
          >
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                  {exp.brandKit?.photoUrl ? <img src={exp.brandKit.photoUrl} className="w-full h-full object-cover" /> : exp.brandKit?.logoUrl ? <img src={exp.brandKit.logoUrl} className="w-full h-full object-contain p-1" /> : <div className="font-black text-xs text-slate-300">{exp.name.slice(0, 2).toUpperCase()}</div>}
               </div>
               <div className="flex-1 overflow-hidden">
                  <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white truncate">{exp.name || 'Sem Nome'}</h4>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">{exp.authority.slice(0, 30)}...</p>
               </div>
            </div>
            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={(e) => { e.stopPropagation(); setEditData(exp); }} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:text-blue-600 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
               </button>
               <button onClick={(e) => { e.stopPropagation(); deleteExpert(exp.id).then(loadExperts); }} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-rose-400 hover:text-rose-600 shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
               </button>
            </div>
          </div>
        ))}
        {experts.length === 0 && <p className="text-center py-10 text-[10px] font-black text-slate-300 uppercase">Nenhum expert cadastrado.</p>}
      </div>
    </div>
  );
};

export default StrategyModule;
