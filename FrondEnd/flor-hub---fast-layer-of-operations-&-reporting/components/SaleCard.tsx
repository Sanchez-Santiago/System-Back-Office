
import React from 'react';
import { Sale, SaleStatus, LogisticStatus, ProductType } from '../types';

interface SaleCardProps {
  sale: Sale;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onClick: (sale: Sale) => void;
  onComment: (sale: Sale) => void;
}

const getStatusStyles = (status: SaleStatus) => {
  switch (status) {
    case SaleStatus.ACTIVADO:
    case SaleStatus.APROBADO: 
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    case SaleStatus.CANCELADO:
    case SaleStatus.RECHAZADO: 
      return 'bg-rose-500/10 text-rose-700 border-rose-500/20';
    case SaleStatus.INICIAL:
    case SaleStatus.EN_PROCESO:
    case SaleStatus.PENDIENTE_DOCUMENTACION: 
      return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    default: 
      return 'bg-slate-500/10 text-slate-700 border-slate-500/20';
  }
};

const getLogisticStatusStyles = (status: LogisticStatus) => {
  switch (status) {
    case LogisticStatus.ENTREGADO:
    case LogisticStatus.RENDIDO_AL_CLIENTE:
      return 'bg-emerald-600/5 text-emerald-800 border-emerald-600/10';
    case LogisticStatus.PIEZA_EXTRAVIADA:
    case LogisticStatus.NO_ENTREGADO:
      return 'bg-rose-600/5 text-rose-800 border-rose-600/10';
    default: 
      return 'bg-indigo-600/5 text-indigo-800 border-indigo-600/10';
  }
};

export const SaleCard: React.FC<SaleCardProps> = ({ sale, isSelected, onToggleSelect, onClick, onComment }) => {
  const isPorta = sale.productType === ProductType.PORTABILITY;
  const lastComment = sale.comments[sale.comments.length - 1];

  return (
    <div 
      className={`group bento-card rounded-[20px] px-6 py-3.5 flex flex-col lg:flex-row items-center gap-4 animate-in fade-in slide-in-from-left-4 duration-500 hover:translate-x-2 border-l-4 ${isSelected ? 'border-l-indigo-600 bg-indigo-50/50 scale-[1.01] shadow-xl ring-2 ring-indigo-100' : 'border-l-transparent'}`}
    >
      {/* Selection Checkbox */}
      <div className="flex items-center pr-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleSelect(sale.id); }}
          className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' : 'border-slate-200 bg-white hover:border-indigo-400'}`}
        >
          {isSelected && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>}
        </button>
      </div>

      {/* ID */}
      <div className="w-full lg:w-[8%] flex items-center">
        <span className="text-[10px] font-black tracking-widest text-indigo-900 bg-white/50 px-3 py-1.5 rounded-lg border border-white/80 shadow-sm uppercase">
          {sale.id}
        </span>
      </div>

      {/* Titular */}
      <div className="w-full lg:w-[18%] flex flex-col justify-center">
        <h3 className="text-[13px] font-black text-slate-900 truncate">
          {sale.customerName}
        </h3>
        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">DNI: {sale.dni}</span>
      </div>

      {/* Producto / Teléfono */}
      <div className="w-full lg:w-[12%] flex flex-col justify-center">
        <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isPorta ? 'bg-indigo-500' : 'bg-purple-500'}`}></span>
            <span className="text-[11px] font-black text-slate-800">{sale.phoneNumber}</span>
        </div>
        <div className="flex flex-col mt-0.5">
          <span className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">
            {isPorta ? (sale.originCompany || 'PORTA') : 'LÍNEA NUEVA'}
          </span>
          <span className="text-[7px] font-bold text-slate-400 uppercase tracking-tight">
            {sale.originMarket}
          </span>
        </div>
      </div>

      {/* ÚLTIMO COMENTARIO */}
      <div className="w-full lg:w-[18%] flex flex-col justify-center bg-indigo-50/30 px-3 py-1.5 rounded-xl border border-indigo-100/50">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[9px] font-black text-indigo-600 uppercase tracking-tighter truncate">
            {lastComment ? lastComment.title : 'SIN COMENTARIOS'}
          </span>
          {lastComment && (
            <span className="text-[7px] font-bold text-slate-400 whitespace-nowrap bg-white/60 px-1.5 py-0.5 rounded-md border border-white">
              {lastComment.date.split(' ')[0]}
            </span>
          )}
        </div>
        <span className="text-[9px] text-slate-500 font-medium truncate mt-0.5 italic">
          {lastComment ? lastComment.text : '-'}
        </span>
      </div>

      {/* FECHA REGISTRO */}
      <div className="w-full lg:w-[10%] flex flex-col items-center justify-center">
        <span className="text-[10px] font-black text-slate-800">{sale.date}</span>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5 text-center">Registro</span>
      </div>

      {/* Estado Venta */}
      <div className="w-full lg:w-[10%]">
        <div className={`px-2.5 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-tight border text-center ${getStatusStyles(sale.status)}`}>
          {sale.status.replace('_', ' ')}
        </div>
      </div>

      {/* Estado Logístico */}
      <div className="w-full lg:w-[10%]">
        <div className={`px-2.5 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-tight border text-center truncate ${getLogisticStatusStyles(sale.logisticStatus)}`}>
          {sale.logisticStatus}
        </div>
      </div>

      {/* Acciones */}
      <div className="w-full lg:w-[10%] flex items-center justify-end gap-2">
        <button 
          onClick={(e) => { e.stopPropagation(); onComment(sale); }}
          className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-indigo-200 shadow-sm"
          title="Ver Bitácora / Comentar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onClick(sale); }}
          className="w-8 h-8 rounded-lg bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all flex items-center justify-center border border-slate-200 shadow-sm"
          title="Detalles de Venta"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
};
