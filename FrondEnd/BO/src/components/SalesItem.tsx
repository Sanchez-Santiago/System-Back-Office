import { useState } from 'react';
import { MessageCircle, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CommentDialog } from './CommentDialog';
import { SaleDetailsDialog } from './SaleDetailsDialog';
import type { Sale } from '../types/sales';

interface SalesItemProps {
  sale: Sale;
}

export function SalesItem({ sale }: SalesItemProps) {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return <CheckCircle className="h-3 w-3" />;
      case 'Pendiente':
        return <Clock className="h-3 w-3" />;
      case 'Cancelada':
        return <XCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return 'bg-green-100 text-green-700 hover:bg-green-200';
      case 'Pendiente':
        return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
      case 'Cancelada':
        return 'bg-red-100 text-red-700 hover:bg-red-200';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <>
      <Card className="p-3 hover:shadow-lg transition-all duration-200 bg-white/90 backdrop-blur-sm border-slate-200/50 hover:border-blue-300/50">
        <div className="flex items-center justify-between gap-4">
          {/* Compact Single Row Layout */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 lg:gap-4 items-center">
            
            {/* ID */}
            <div className="flex items-center gap-1">
              <span className="text-slate-500 text-sm">#{sale.venta_id}</span>
            </div>

            {/* Status */}
            <div>
              <Badge
                variant="secondary"
                className={`${getStatusColor(sale.estado_actual || 'Pendiente')} transition-colors duration-200 text-xs`}
              >
                {getStatusIcon(sale.estado_actual || 'Pendiente')}
                <span className="ml-1">{sale.estado_actual || 'Pendiente'}</span>
              </Badge>
            </div>

            {/* Client */}
            <div className="min-w-0">
              <p className="text-slate-900 truncate">{sale.cliente_nombre} {sale.cliente_apellido}</p>
              <p className="text-slate-500 text-xs">Cliente</p>
            </div>

            {/* Product/Service */}
            <div className="min-w-0 col-span-2 lg:col-span-1">
              <p className="text-slate-900 truncate">{sale.plan_nombre}</p>
              <p className="text-slate-500 text-xs">{sale.tipo_venta}</p>
            </div>

            {/* Price */}
            <div className="text-right lg:text-left">
              <p className="text-slate-900">{formatPrice(sale.plan_precio)}</p>
              <p className="text-slate-500 text-xs">Plan</p>
            </div>

            {/* Date & Seller */}
            <div className="hidden lg:block">
              <p className="text-slate-900 text-sm">{formatDate(sale.fecha_creacion)}</p>
              <p className="text-slate-500 text-xs">{sale.vendedor_nombre} {sale.vendedor_apellido}</p>
            </div>

            {/* Mobile Date & Seller */}
            <div className="lg:hidden col-span-2 flex justify-between text-xs text-slate-500">
              <span>{formatDate(sale.fecha_creacion)}</span>
              <span>{sale.vendedor_nombre}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailsOpen(true)}
              className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:from-purple-100 hover:to-blue-100 hover:border-purple-300 text-purple-700"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCommentOpen(true)}
              className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 text-blue-700"
            >
              <MessageCircle className="h-3 w-3 mr-1" />
              Comentar
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <SaleDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        sale={sale}
      />
      
<CommentDialog
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
        saleId={sale.venta_id}
        cliente={sale.cliente}
      />
    </>
  );
}