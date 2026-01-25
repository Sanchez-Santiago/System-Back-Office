import { SalesItem } from './SalesItem';
import type { Sale } from '../types/sales';

interface SalesListProps {
  sales: Sale[];
  onRefresh?: () => void;
}

export function SalesList({ sales, onRefresh }: SalesListProps) {
  if (sales.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-200 to-purple-200"></div>
        </div>
        <h3 className="text-slate-600 mb-2">No se encontraron ventas</h3>
        <p className="text-slate-500">Intenta ajustar los filtros de búsqueda</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sales.map((sale) => (
        <SalesItem key={sale.id} sale={sale} />
      ))}
    </div>
  );
}