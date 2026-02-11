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
      return 'bg-emerald-500/25 text-emerald-800 border-emerald-500/30 font-extrabold';
    case SaleStatus.CANCELADO:
    case SaleStatus.RECHAZADO: 
      return 'bg-rose-500/25 text-rose-800 border-rose-500/30 font-extrabold';
    case SaleStatus.INICIAL:
    case SaleStatus.EN_PROCESO:
    case SaleStatus.PENDIENTE_DOCUMENTACION: 
      return 'bg-amber-500/25 text-amber-800 border-amber-500/30 font-extrabold';
    default: 
      return 'bg-slate-500/25 text-slate-800 border-slate-500/30 font-extrabold';
  }
};

const getLogisticStatusStyles = (status: LogisticStatus) => {
  switch (status) {
    case LogisticStatus.ENTREGADO:
    case LogisticStatus.RENDIDO_AL_CLIENTE:
      return 'bg-emerald-600/15 text-emerald-900 border-emerald-600/20 font-extrabold';
    case LogisticStatus.PIEZA_EXTRAVIADA:
    case LogisticStatus.NO_ENTREGADO:
      return 'bg-rose-600/15 text-rose-900 border-rose-600/20 font-extrabold';
    default: 
      return 'bg-indigo-600/15 text-indigo-900 border-indigo-600/20 font-extrabold';
  }
};

export const SaleCard: React.FC<SaleCardProps> = ({ sale, isSelected, onToggleSelect, onClick, onComment }) => {
  const isPorta = sale.productType === ProductType.PORTABILITY;
  const lastComment = sale.comments[sale.comments.length - 1];

  return (
    <div 
      className={`group bento-card rounded-[2.5vh] px-[2.5vw] py-[1.5vh] flex flex-col lg:flex-row items-center gap-[1.5vw] animate-in fade-in slide-in-from-left-4 duration-500 hover:translate-x-2 border-l-[0.6vh] ${isSelected ? 'border-l-indigo-600 bg-indigo-50/50 scale-[1.01] shadow-xl ring-4 ring-indigo-100' : 'border-l-transparent'}`}
    >
      {/* Selection Checkbox */}
      <div className="flex items-center pr-[0.8vw]">
        <button 
          onClick={(e) => { e.stopPropagation(); onToggleSelect(sale.id); }}
          className={`w-[3vh] h-[3vh] rounded-[1vh] border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' : 'border-slate-200 bg-white hover:border-indigo-400'}`}
        >
          {isSelected && <svg className="w-[1.8vh] h-[1.8vh] text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"></path></svg>}
        </button>
      </div>

      {/* ID */}
      <div className="w-full lg:w-[8%] flex items-center">
        <span className="font-black tracking-widest text-indigo-950 bg-white/90 px-[1vw] py-[0.8vh] rounded-[1vh] border border-white shadow-sm uppercase text-[clamp(0.6rem,1.1vh,1.5rem)]">
          {sale.id}
        </span>
      </div>

      {/* Titular */}
      <div className="w-full lg:w-[18%] flex flex-col justify-center">
        <h3 className="font-black text-slate-900 truncate text-[clamp(0.85rem,1.8vh,2.5rem)]">
          {sale.customerName}
        </h3>
        <span className="font-bold text-slate-400 uppercase tracking-tight text-[clamp(0.6rem,1vh,1.2rem)]">DNI: {sale.dni}</span>
      </div>

      {/* Producto / Teléfono */}
      <div className="w-full lg:w-[14%] flex flex-col justify-center">
        <div className="flex items-center gap-[0.5vw]">
            <span className={`w-[1vh] h-[1vh] rounded-full ${isPorta ? 'bg-indigo-500' : 'bg-purple-500'}`}></span>
            <span className="font-black text-slate-800 text-[clamp(0.8rem,1.4vh,1.8rem)]">{sale.phoneNumber}</span>
        </div>
        <div className="flex flex-col mt-[0.2vh]">
          <span className="font-black text-indigo-600 uppercase tracking-widest text-[clamp(0.6rem,1vh,1.2rem)]">
            {isPorta ? (sale.originCompany || 'PORTA') : 'LÍNEA NUEVA'}
          </span>
          <span className="font-bold text-slate-400 uppercase tracking-tight text-[clamp(0.5rem,0.8vh,1rem)]">
            {sale.originMarket}
          </span>
        </div>
      </div>

      {/* ÚLTIMO COMENTARIO */}
      <div className="w-full lg:w-[20%] flex flex-col justify-center bg-white/90 px-[1.5vw] py-[1vh] rounded-[2vh] border border-white shadow-sm">
        <div className="flex justify-between items-center gap-[0.5vw]">
          <span className="font-black text-indigo-950 uppercase tracking-tighter truncate text-[clamp(0.65rem,1.1vh,1.4rem)]">
            {lastComment ? lastComment.title : 'SIN COMENTARIOS'}
          </span>
          {lastComment && (
            <span className="font-black text-indigo-600 whitespace-nowrap bg-indigo-50/80 px-[0.6vw] py-[0.3vh] rounded-[0.8vh] border border-indigo-100 text-[clamp(0.5rem,0.9vh,1rem)]">
              {lastComment.date.split(' ')[0]}
            </span>
          )}
        </div>
        <span className="text-slate-700 font-bold truncate mt-[0.5vh] italic text-[clamp(0.65rem,1.1vh,1.4rem)]">
          {lastComment ? lastComment.text : '-'}
        </span>
      </div>

      <div className="w-full lg:w-[10%] flex flex-col items-center justify-center">
        <span className="font-black text-slate-800 text-[clamp(0.7rem,1.2vh,1.5rem)] text-center leading-tight">
          {new Date(sale.date).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          <br />
          <span className="text-indigo-600">
            {new Date(sale.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </span>
        <span className="font-black text-slate-400 uppercase tracking-widest mt-[0.5vh] text-center text-[clamp(0.55rem,0.9vh,1.1rem)]">Registro</span>
      </div>

      {/* Estado Venta */}
      <div className="w-full lg:w-[12%] flex-shrink-0">
        <div 
          title={sale.status.replace('_', ' ')}
          className={`px-[1.5vh] py-[1.2vh] rounded-[1.8vh] font-black uppercase tracking-tight border text-center text-[clamp(0.75rem,1.3vh,1.6rem)] shadow-sm truncate whitespace-nowrap overflow-hidden ${getStatusStyles(sale.status)}`}
        >
          {sale.status.replace('_', ' ')}
        </div>
      </div>

      {/* Estado Logístico */}
      <div className="w-full lg:w-[12%] flex-shrink-0">
        <div 
          title={sale.logisticStatus}
          className={`px-[1.5vh] py-[1.2vh] rounded-[1.8vh] font-black uppercase tracking-tight border text-center truncate whitespace-nowrap text-[clamp(0.75rem,1.3vh,1.6rem)] shadow-sm overflow-hidden ${getLogisticStatusStyles(sale.logisticStatus)}`}
        >
          {sale.logisticStatus}
        </div>
      </div>

      {/* Acciones */}
      <div className="w-full lg:w-[10%] flex items-center justify-end gap-[0.8vw]">
        <button 
          onClick={(e) => { e.stopPropagation(); onComment(sale); }}
          className="w-[4.5vh] h-[4.5vh] rounded-[1.2vh] bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center border border-indigo-200 shadow-sm"
          title="Ver Bitácora / Comentar"
        >
          <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onClick(sale); }}
          className="w-[4.5vh] h-[4.5vh] rounded-[1.2vh] bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-600 transition-all flex items-center justify-center border border-slate-200 shadow-sm"
          title="Detalles de Venta"
        >
          <svg className="w-[2.2vh] h-[2.2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>
        </button>
      </div>
    </div>
  );
};
