import { useState } from 'react';
import { Edit3, X, User, Calendar, Flag, MessageSquare, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import type { Sale } from '../types/sales';

interface EnhancedSale extends Sale {
  priority: string;
  reason: string;
  totalValue: number;
  assignedTo: string;
  lastUpdate: string;
  notes: string;
}

interface BackOfficeTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sale: EnhancedSale;
}

export function BackOfficeTaskDialog({ isOpen, onClose, sale }: BackOfficeTaskDialogProps) {
  const [assignedTo, setAssignedTo] = useState(sale.assignedTo);
  const [priority, setPriority] = useState(sale.priority);
  const [notes, setNotes] = useState(sale.notes);
  const [status, setStatus] = useState('En proceso');

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

  const handleSave = () => {
    // Here you would typically save the changes to your backend
console.log('Saving changes:', {
      saleId: sale.venta_id,
      assignedTo,
      priority,
      notes,
      status
    });
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Alta':
        return 'bg-red-100 text-red-700';
      case 'Media':
        return 'bg-orange-100 text-orange-700';
      case 'Normal':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Mock team members
  const teamMembers = [
    'Sin asignar',
    'Ana García - Supervisor',
    'Carlos López - Analista Sr.',
    'María Rodríguez - Especialista',
    'José Martínez - Analista Jr.',
    'Laura Sánchez - Coordinadora'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
                <Edit3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-slate-900">
                  Gestionar Caso - Venta #{sale.id}
                </DialogTitle>
                <DialogDescription className="text-slate-600 mt-1">
                  Asignar, modificar prioridad y agregar notas para el seguimiento de esta venta
                </DialogDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getPriorityColor(sale.priority)}>
                    {sale.priority}
                  </Badge>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-600">{sale.cliente_nombre} {sale.cliente_apellido}</span>
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
          {/* Case Summary */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-slate-900 mb-3">Resumen del Caso</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
<div>
                <label className="text-slate-600">Cliente</label>
                <p className="text-slate-900">{sale.cliente_nombre} {sale.cliente_apellido}</p>
              </div>
              <div>
                <label className="text-slate-600">Producto</label>
                <p className="text-slate-900">{sale.plan_nombre}</p>
              </div>
              <div>
                <label className="text-slate-600">Valor Total</label>
                <p className="text-slate-900">{formatPrice(sale.plan_precio * sale.multiple)}</p>
              </div>
              <div>
                <label className="text-slate-600">Fecha</label>
                <p className="text-slate-900">{formatDate(sale.fecha_creacion)}</p>
              </div>
            </div>
            <div className="mt-3">
              <label className="text-slate-600">Motivo de Seguimiento</label>
              <p className="text-slate-900">{sale.reason}</p>
            </div>
          </div>

          <Separator />

          {/* Task Management */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-slate-900">
              <User className="h-5 w-5 text-purple-500" />
              Gestión de Tarea
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Assign To */}
              <div className="space-y-2">
                <label className="text-slate-700">Asignar a</label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger className="border-slate-200 focus:border-purple-500 focus:ring-purple-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map(member => (
                      <SelectItem key={member} value={member}>
                        {member}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-slate-700">Prioridad</label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="border-slate-200 focus:border-purple-500 focus:ring-purple-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Normal">Normal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <label className="text-slate-700">Estado de la Tarea</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="border-slate-200 focus:border-purple-500 focus:ring-purple-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pendiente">Pendiente</SelectItem>
                    <SelectItem value="En proceso">En proceso</SelectItem>
                    <SelectItem value="En revisión">En revisión</SelectItem>
                    <SelectItem value="Completada">Completada</SelectItem>
                    <SelectItem value="Escalada">Escalada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-slate-700">Fecha Límite</label>
                <div className="flex items-center gap-2 p-2 border border-slate-200 rounded-md bg-white text-slate-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Hoy + 2 días hábiles</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notes */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-slate-900">
              <MessageSquare className="h-5 w-5 text-indigo-500" />
              Notas y Observaciones
            </h3>
            
            <div className="space-y-2">
              <label className="text-slate-700">Agregar notas sobre este caso</label>
              <Textarea
                placeholder="Describe las acciones a tomar, observaciones importantes, o cualquier información relevante para el seguimiento..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[120px] border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Action History Placeholder */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-blue-900 mb-2">Historial de Acciones</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• {formatDate(sale.fecha)} - Caso creado automáticamente ({sale.reason})</p>
              <p>• {formatDate(new Date().toISOString())} - En revisión por Back Office</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200">
          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-slate-200 hover:bg-slate-50"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}