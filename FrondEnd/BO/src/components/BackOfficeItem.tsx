import { useState } from 'react';
import { MessageSquare, Eye, User, Calendar, AlertTriangle, CheckCircle, Clock, FileText, Edit3 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CommentDialog } from './CommentDialog';
import { SaleDetailsDialog } from './SaleDetailsDialog';
import { BackOfficeTaskDialog } from './BackOfficeTaskDialog';

interface EnhancedSale {
  id: string;
  cliente: string;
  producto: string;
  cantidad: number;
  precio: number;
  fecha: string;
  estado: 'Completada' | 'Pendiente' | 'Cancelada';
  vendedor: string;
  priority: string;
  reason: string;
  totalValue: number;
  assignedTo: string;
  lastUpdate: string;
  notes: string;
}

interface BackOfficeItemProps {
  sale: EnhancedSale;
}

export function BackOfficeItem({ sale }: BackOfficeItemProps) {
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isTaskOpen, setIsTaskOpen] = useState(false);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return <AlertTriangle className="h-3 w-3" />;
      case 'Media':
        return <Clock className="h-3 w-3" />;
      case 'Normal':
        return <CheckCircle className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Media':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Normal':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'Completada':
        return 'bg-green-100 text-green-700';
      case 'Pendiente':
        return 'bg-blue-100 text-blue-700';
      case 'Cancelada':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
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

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <>
      <Card className="p-4 hover:shadow-lg transition-all duration-200 bg-white/90 backdrop-blur-sm border-slate-200/50 hover:border-purple-300/50">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content */}
          <div className="flex-1 space-y-3">
            {/* Header Row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`${getPriorityColor(sale.priority)} text-xs border`}
                >
                  {getPriorityIcon(sale.priority)}
                  <span className="ml-1">{sale.priority}</span>
                </Badge>
                
                <Badge 
                  variant="secondary" 
                  className={`${getStatusColor(sale.estado)} text-xs`}
                >
                  {sale.estado}
                </Badge>
                
                <span className="text-slate-500 text-sm">#{sale.venta_id}</span>
              </div>
              
              <div className="text-right text-sm text-slate-500">
                <p>{formatDate(sale.fecha)}</p>
                <p>{getDaysAgo(sale.fecha)} días</p>
              </div>
            </div>

            {/* Client and Product Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-slate-900">{sale.cliente}</p>
                <p className="text-slate-600 text-sm">{sale.producto}</p>
                <p className="text-slate-500 text-xs">Cant: {sale.cantidad} • {sale.vendedor}</p>
              </div>
              <div className="text-right md:text-left">
                <p className="text-slate-900">{formatPrice(sale.totalValue)}</p>
                <p className="text-slate-600 text-sm">Total de la venta</p>
              </div>
            </div>

            {/* Reason for Back Office */}
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-purple-800 text-sm">{sale.reason}</p>
                  {sale.assignedTo !== 'Sin asignar' && (
                    <p className="text-purple-600 text-xs mt-1">
                      Asignado a: {sale.assignedTo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment Status */}
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-slate-600">
                {sale.assignedTo === 'Sin asignar' 
                  ? 'No asignado' 
                  : `Asignado a ${sale.assignedTo}`}
              </span>
              {sale.assignedTo === 'Sin asignar' && (
                <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                  Pendiente asignación
                </Badge>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTaskOpen(true)}
              className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 hover:from-purple-100 hover:to-indigo-100 hover:border-purple-300 text-purple-700"
            >
              <Edit3 className="h-3 w-3 mr-1" />
              Gestionar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailsOpen(true)}
              className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:from-blue-100 hover:to-purple-100 hover:border-blue-300 text-blue-700"
            >
              <Eye className="h-3 w-3 mr-1" />
              Ver
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCommentOpen(true)}
              className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 hover:from-slate-100 hover:to-slate-200 hover:border-slate-300 text-slate-700"
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              Notas
            </Button>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <BackOfficeTaskDialog
        isOpen={isTaskOpen}
        onClose={() => setIsTaskOpen(false)}
        sale={sale}
      />
      
      <SaleDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        sale={sale}
      />
      
      <CommentDialog
        isOpen={isCommentOpen}
        onClose={() => setIsCommentOpen(false)}
saleId={sale.venta_id}
        cliente={`${sale.cliente_nombre} ${sale.cliente_apellido}`}
      />
    </>
  );
}