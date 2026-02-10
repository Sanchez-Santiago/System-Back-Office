
import React, { useState } from 'react';

interface QuickActionFABProps {
  onAction: (type: 'PORTA' | 'LN') => void;
}

export const QuickActionFAB: React.FC<QuickActionFABProps> = ({ onAction }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-3">
      {isOpen && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <button 
            className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-indigo-100/50 group hover:bg-indigo-600 transition-all"
            onClick={() => { onAction('PORTA'); setIsOpen(false); }}
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-white/20">
              <svg className="w-4 h-4 text-indigo-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <span className="text-[11px] font-black text-slate-700 group-hover:text-white uppercase tracking-widest">Cargar Portabilidad</span>
          </button>

          <button 
            className="flex items-center gap-3 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-purple-100/50 group hover:bg-purple-600 transition-all"
            onClick={() => { onAction('LN'); setIsOpen(false); }}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center group-hover:bg-white/20">
              <svg className="w-4 h-4 text-purple-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-[11px] font-black text-slate-700 group-hover:text-white uppercase tracking-widest">Cargar Línea Nueva</span>
          </button>
        </div>
      )}

      <div className="relative group">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-[20px] bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white shadow-2xl flex items-center justify-center transition-all duration-500 transform ${isOpen ? 'rotate-45 scale-90' : 'hover:scale-110'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
};
