
import React from 'react';
import { SaleCard } from '../components/SaleCard';
import { Sale } from '../types';

interface GestionPageProps {
  sales: Sale[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onViewSale: (sale: Sale) => void;
  onCommentSale: (sale: Sale) => void;
}

export const GestionPage: React.FC<GestionPageProps> = ({ 
  sales, selectedIds, onToggleSelect, onViewSale, onCommentSale 
}) => {
  if (sales.length === 0) {
    return (
      <div className="p-20 text-center glass-panel rounded-[32px] animate-in fade-in duration-500">
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay registros para mostrar con los filtros aplicados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
    </div>
  );
};
