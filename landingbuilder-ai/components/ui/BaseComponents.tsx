
import React from 'react';

export const Label: React.FC<{ children: React.ReactNode; color?: 'blue' | 'indigo' | 'slate' | 'emerald' }> = ({ children, color = 'blue' }) => {
  const colors = {
    blue: 'text-blue-600 dark:text-blue-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
    slate: 'text-slate-400 dark:text-slate-500',
    emerald: 'text-emerald-600 dark:text-emerald-400'
  };
  return <label className={`text-[11px] font-black uppercase tracking-widest block mb-2 ${colors[color]}`}>{children}</label>;
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input 
    {...props} 
    className={`w-full !bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white shadow-sm ${props.className || ''}`} 
  />
);

export const TextArea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea 
    {...props} 
    className={`w-full !bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all resize-none placeholder:text-slate-300 dark:placeholder:text-slate-600 text-slate-900 dark:text-white shadow-sm ${props.className || ''}`} 
  />
);

export const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ children, ...props }) => (
  <select 
    {...props} 
    className="w-full p-4 !bg-white dark:!bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none cursor-pointer text-slate-900 dark:text-white shadow-sm"
  >
    {children}
  </select>
);

export const Card: React.FC<{ children: React.ReactNode; color?: 'blue' | 'indigo' | 'slate' | 'white' }> = ({ children, color = 'white' }) => {
  const styles = {
    white: 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800',
    blue: 'bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-800/50',
    indigo: 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-800/50',
    slate: 'bg-slate-800 dark:bg-slate-950 border-slate-700 dark:border-slate-800 text-white'
  };
  return <div className={`p-5 border rounded-2xl shadow-sm space-y-4 ${styles[color]}`}>{children}</div>;
};

export const Button: React.FC<{ 
  children: React.ReactNode; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}> = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "px-6 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10",
    secondary: "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700",
    outline: "bg-transparent border-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-blue-600 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400",
    ghost: "bg-transparent text-slate-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 p-2 shadow-none",
    danger: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30"
  };
  return <button {...props} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

export const Toggle: React.FC<{ checked: boolean; onChange: (val: boolean) => void }> = ({ checked, onChange }) => (
  <label className="relative inline-flex items-center cursor-pointer scale-90">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
    <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
  </label>
);
