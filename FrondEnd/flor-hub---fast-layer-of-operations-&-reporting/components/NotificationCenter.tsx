
import React from 'react';
import { NOTIFICATIONS } from '../constants';

interface NotificationCenterProps {
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onClose }) => {
  const critical = NOTIFICATIONS.filter(n => n.type === 'CRITICAL');
  const recent = NOTIFICATIONS.filter(n => n.type === 'RECENT');

  return (
    <div 
      className="absolute top-16 right-0 w-[420px] glass-panel rounded-[36px] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] z-[100] overflow-hidden border border-white/60 animate-in fade-in slide-in-from-top-6 duration-500"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header Premium */}
      <div className="p-7 bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 text-white flex justify-between items-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        <div className="relative z-10">
          <h3 className="text-[11px] font-black tracking-[0.25em] text-indigo-300 uppercase leading-none mb-1">Centro de Mando</h3>
          <p className="text-lg font-black tracking-tighter uppercase italic">Alertas & Eventos</p>
        </div>
        <button 
          onClick={onClose} 
          className="relative z-10 w-10 h-10 flex items-center justify-center rounded-2xl bg-white/10 hover:bg-rose-500 hover:rotate-90 transition-all duration-300 group"
        >
          <svg className="w-5 h-5 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      </div>
      
      <div className="max-h-[580px] overflow-y-auto no-scrollbar bg-slate-50/90 backdrop-blur-xl">
        {/* Sección Crítica */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em]">Prioridad Crítica</p>
            </div>
            <span className="text-[9px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full uppercase">{critical.length} Alertas</span>
          </div>

          <div className="space-y-3">
            {critical.map(n => (
              <div key={n.id} className="group relative p-4 bg-white rounded-[24px] border border-rose-100 shadow-sm hover:shadow-md hover:border-rose-300 transition-all duration-300 overflow-hidden cursor-pointer active:scale-[0.98]">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500 opacity-80"></div>
                <div className="flex justify-between items-start mb-1.5 pl-2">
                  <h4 className="text-[13px] font-black text-slate-900 leading-tight uppercase tracking-tighter group-hover:text-rose-600 transition-colors">{n.title}</h4>
                  <span className="text-[9px] font-black text-slate-400 whitespace-nowrap opacity-60 uppercase">{n.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed pl-2 mb-3">{n.message}</p>
                <div className="flex justify-end gap-2 pl-2">
                  <button className="text-[8px] font-black uppercase tracking-widest bg-rose-50 text-rose-600 px-3 py-1.5 rounded-lg hover:bg-rose-600 hover:text-white transition-all">Gestionar Ahora</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Divisor Bento */}
        <div className="px-6 py-2 flex items-center gap-4 opacity-30">
          <div className="h-px bg-indigo-900/20 flex-1"></div>
          <div className="w-1.5 h-1.5 bg-indigo-900 rounded-full"></div>
          <div className="h-px bg-indigo-900/20 flex-1"></div>
        </div>

        {/* Sección Reciente */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]"></span>
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Notificaciones Hub</p>
            </div>
          </div>

          <div className="space-y-3">
            {recent.map(n => (
              <div key={n.id} className="group p-4 bg-white/60 border border-white rounded-[24px] hover:bg-white hover:border-indigo-100 transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer active:scale-[0.98]">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-[12px] font-black text-slate-800 uppercase tracking-tighter leading-none">{n.title}</h4>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">{n.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{n.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Acciones */}
      <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-center gap-4">
        <button className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-[0.2em] transition-all flex items-center gap-2 group">
          Limpiar Todo
          <svg className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
      </div>
    </div>
  );
};
