import { Eye, X, Calendar, User, Package, DollarSign, Hash, MapPin, Phone, Mail } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface Sale {
  id: string;
  cliente: string;
  producto: string;
  cantidad: number;
  precio: number;
  fecha: string;
  estado: 'Completada' | 'Pendiente' | 'Cancelada';
  vendedor: string;
}

interface SaleDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale;
}

export function SaleDetailsDialog({ isOpen, onClose, sale }: SaleDetailsDialogProps) {
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
      month: 'long',
      year: 'numeric'
    });
  };

  // Mock data adicional para detalles completos
  const mockDetails = {
    telefono: '+34 666 777 888',
    email: sale.cliente.toLowerCase().replace(' ', '.') + '@email.com',
    direccion: 'Calle Principal 123, 28001 Madrid, España',
    metodoPago: 'Tarjeta de Crédito',
    numeroTransaccion: 'TXN-' + sale.id + '-2024',
    notas: 'Cliente VIP - Envío prioritario solicitado',
    fechaEntrega: '2024-01-20',
    estado_envio: sale.estado === 'Completada' ? 'Entregado' : 'En preparación'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <Eye className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-slate-900">
                  Detalles de Venta #{sale.id}
                </DialogTitle>
                <DialogDescription className="text-slate-600">
                  Información completa de la venta incluyendo datos del cliente, producto y transacción
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(sale.estado)}>
                    {sale.estado}
                  </Badge>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-600">{formatDate(sale.fecha)}</span>
                </div>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="hover:bg-slate-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6">
          {/* Grid de información principal */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Cliente */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-slate-900">
                <User className="h-5 w-5 text-blue-500" />
                Información del Cliente
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-slate-600">Nombre</label>
                  <p className="text-slate-900">{sale.cliente}</p>
                </div>
                <div>
                  <label className="text-slate-600 flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Teléfono
                  </label>
                  <p className="text-slate-900">{mockDetails.telefono}</p>
                </div>
                <div>
                  <label className="text-slate-600 flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <p className="text-slate-900">{mockDetails.email}</p>
                </div>
                <div>
                  <label className="text-slate-600 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Dirección
                  </label>
                  <p className="text-slate-900">{mockDetails.direccion}</p>
                </div>
              </div>
            </div>

            {/* Información del Producto */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-slate-900">
                <Package className="h-5 w-5 text-purple-500" />
                Información del Producto
              </h3>
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-slate-600">Producto</label>
                  <p className="text-slate-900">{sale.producto}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-600">Cantidad</label>
                    <p className="text-slate-900">{sale.cantidad} unidades</p>
                  </div>
                  <div>
                    <label className="text-slate-600">Precio Unitario</label>
                    <p className="text-slate-900">{formatPrice(sale.precio)}</p>
                  </div>
                </div>
                <Separator />
                <div>
                  <label className="text-slate-600">Total</label>
                  <p className="text-slate-900">{formatPrice(sale.precio * sale.cantidad)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de la Transacción */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-slate-900">
              <DollarSign className="h-5 w-5 text-green-500" />
              Información de la Transacción
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-slate-600">Método de Pago</label>
                  <p className="text-slate-900">{mockDetails.metodoPago}</p>
                </div>
                <div>
                  <label className="text-slate-600">Número de Transacción</label>
                  <p className="text-slate-900 text-mono">{mockDetails.numeroTransaccion}</p>
                </div>
                <div>
                  <label className="text-slate-600">Vendedor</label>
                  <p className="text-slate-900">{sale.vendedor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Información de Envío */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-slate-900">
              <Calendar className="h-5 w-5 text-orange-500" />
              Información de Envío
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-600">Fecha de Venta</label>
                  <p className="text-slate-900">{formatDate(sale.fecha)}</p>
                </div>
                <div>
                  <label className="text-slate-600">Fecha de Entrega</label>
                  <p className="text-slate-900">{formatDate(mockDetails.fechaEntrega)}</p>
                </div>
              </div>
              <div className="mt-3">
                <label className="text-slate-600">Estado del Envío</label>
                <p className="text-slate-900">{mockDetails.estado_envio}</p>
              </div>
            </div>
          </div>

          {/* Notas Adicionales */}
          {mockDetails.notas && (
            <div className="space-y-4">
              <h3 className="text-slate-900">Notas Adicionales</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">{mockDetails.notas}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex justify-end">
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}