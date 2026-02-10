
import React from 'react';
import { SaleStatus, LogisticStatus, LineStatus } from '../types';

interface UpdateMenuProps {
  selectedCount: number;
  onUpdateStatus: (status: SaleStatus) => void;
  onUpdateLogistic: (status: LogisticStatus) => void;
  onUpdateLine: (status: LineStatus) => void;
  onClear: () => void;
}

export const UpdateMenu: React.FC<UpdateMenuProps> = ({ selectedCount, onUpdateStatus, onUpdateLogistic, onUpdateLine, onClear }) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-12 duration-500 ease-out w-full max-w-4xl px-4">
      <div className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 rounded-[40px] p-6 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] flex items-center justify-between gap-6 overflow-x-auto lg:overflow-visible no-scrollbar">
        
        {/* Counter Section */}
        <div className="flex items-center gap-5 pr-8 border-r border-white/10 shrink-0">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-[0_10px_20px_-5px_rgba(79,70,229,0.5)]">
              {selectedCount}
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></div>
          </div>
          <div>
            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em] leading-none">Ventas</p>
            <p className="text-[10px] font-black text-white uppercase tracking-widest mt-0.5">Seleccionadas</p>
            <button onClick={onClear} className="text-[9px] font-bold text-slate-400 hover:text-indigo-300 uppercase mt-1.5 transition-colors flex items-center gap-1">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              Cancelar
            </button>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-1 items-center gap-5 justify-center">
          {/* Status Venta */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">1. Status Venta</label>
            <div className="relative group">
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-[10px] font-black text-white outline-none cursor-pointer hover:bg-white/10 hover:border-indigo-500/50 transition-all uppercase appearance-none"
                onChange={(e) => e.target.value !== "" && onUpdateStatus(e.target.value as SaleStatus)}
                value=""
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Actualizar...</option>
                {Object.values(SaleStatus).map(s => <option key={s} value={s} className="bg-slate-900">{s.replace('_', ' ')}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Seguimiento Línea */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[8px] font-black text-indigo-400/80 uppercase tracking-[0.2em] ml-2">2. Seguimiento Línea</label>
            <div className="relative">
              <select 
                className="w-full bg-indigo-500/5 border border-indigo-500/20 rounded-2xl px-4 py-2.5 text-[10px] font-black text-white outline-none cursor-pointer hover:bg-indigo-500/10 hover:border-indigo-400 transition-all uppercase appearance-none"
                onChange={(e) => e.target.value !== "" && onUpdateLine(e.target.value as LineStatus)}
                value=""
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Actualizar...</option>
                {Object.values(LineStatus).map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-400/50">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* Correo / Logística */}
          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[8px] font-black text-purple-400/80 uppercase tracking-[0.2em] ml-2">3. Estado Correo</label>
            <div className="relative">
              <select 
                className="w-full bg-purple-500/5 border border-purple-500/20 rounded-2xl px-4 py-2.5 text-[10px] font-black text-white outline-none cursor-pointer hover:bg-purple-500/10 hover:border-purple-400 transition-all uppercase appearance-none"
                onChange={(e) => e.target.value !== "" && onUpdateLogistic(e.target.value as LogisticStatus)}
                value=""
              >
                <option value="" disabled className="bg-slate-900 text-slate-400">Actualizar...</option>
                {Object.values(LogisticStatus).map(s => <option key={s} value={s} className="bg-slate-900">{s}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400/50">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Group Section */}
        <div className="pl-8 border-l border-white/10 shrink-0">
          <button className="p-4 rounded-[20px] bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 group shadow-lg shadow-rose-900/10" title="Eliminar Selección">
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
          </button>
        </div>

      </div>
    </div>
  );
};
