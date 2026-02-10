
import React from 'react';
import { SaleCard } from '../components/SaleCard';
import { Sale } from '../types';

interface SeguimientoPageProps {
  trackingSubTab: string;
  setTrackingSubTab: (tab: any) => void;
  sales: Sale[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewSale: (sale: Sale) => void;
  onCommentSale: (sale: Sale) => void;
  counts: Record<string, number>;
}

export const SeguimientoPage: React.FC<SeguimientoPageProps> = ({ 
  trackingSubTab, setTrackingSubTab, sales, selectedIds, onToggleSelect, onViewSale, onCommentSale, counts
}) => {
  const TABS = [
    { id: 'AGENDADOS', label: 'Agendados', icon: '📅', count: counts.agendados },
    { id: 'ENTREGADOS_PORTA', label: 'Entregados Porta', icon: '✅', count: counts.entregadosPorta },
    { id: 'NO_ENTREGADOS_PORTA', label: 'No Entregados Porta', icon: '❌', count: counts.noEntregadosPorta },
    { id: 'NO_ENTREGADOS_LN', label: 'No Entregados LN', icon: '📱', count: counts.noEntregadosLN },
    { id: 'PENDIENTE_PIN', label: 'Pendiente de PIN', icon: '🔑', count: counts.pendientePin }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2 bg-slate-100/50 p-2 rounded-[24px] border border-slate-200/50">
        {TABS.map(tab => (
          <button 
            key={tab.id} 
            onClick={() => setTrackingSubTab(tab.id)} 
            className={`flex-1 min-w-[140px] flex items-center justify-between gap-3 px-5 py-3.5 rounded-2xl transition-all duration-300 ${trackingSubTab === tab.id ? 'bg-white shadow-lg shadow-indigo-100/50 ring-2 ring-indigo-500/20' : 'hover:bg-white/60 text-slate-400'}`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{tab.icon}</span>
              <span className={`text-[10px] font-black uppercase tracking-tighter ${trackingSubTab === tab.id ? 'text-slate-900' : 'text-slate-500'}`}>{tab.label}</span>
            </div>
            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black ${trackingSubTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {sales.length === 0 ? (
          <div className="p-20 text-center glass-panel rounded-[32px]">
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay registros en esta etapa de seguimiento.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sales.map((sale) => (
              <SaleCard 
                key={sale.id} 
                sale={sale} 
                isSelected={selectedIds.has(sale.id)} 
                onToggleSelect={onToggleSelect} 
                onClick={onViewSale} 
                onComment={onCommentSale} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
