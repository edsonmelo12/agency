
import React from 'react';
import { Project } from '../../types';
import { Button } from '../ui/BaseComponents';

interface Props {
  projects: Project[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

const ProjectsModule: React.FC<Props> = ({ projects, activeId, onSelect, onDelete, onNew }) => {
  return (
    <div className="space-y-4 animate-in fade-in">
      <button onClick={onNew} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-[10px] font-black uppercase text-slate-400 hover:border-blue-600 hover:text-blue-600 transition-all">
        + Iniciar Novo Projeto
      </button>
      <div className="space-y-3">
        {projects.map(p => (
          <div key={p.id} className={`p-4 rounded-xl border-2 transition-all group relative ${activeId === p.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            <div className="cursor-pointer" onClick={() => onSelect(p.id)}>
              <h4 className="text-xs font-black uppercase">{p.name}</h4>
              <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(p.updatedAt).toLocaleDateString()}</span>
            </div>
            <button onClick={() => onDelete(p.id)} className="absolute top-4 right-4 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862" /></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsModule;
