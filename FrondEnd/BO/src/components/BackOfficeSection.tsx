import { useState, useMemo } from 'react';
import { Users, AlertTriangle, CheckCircle, Clock, Search, Filter, FileText } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { BackOfficeItem } from './BackOfficeItem';
import { BackOfficeMetrics } from './BackOfficeMetrics';

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

interface BackOfficeSectionProps {
  sales: Sale[];
}

export function BackOfficeSection({ sales }: BackOfficeSectionProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Enhance sales with back office specific data
  const enhancedSales = useMemo(() => {
    return sales.map(sale => {
      const totalValue = sale.precio * sale.cantidad;
      let priority = 'Normal';
      let reason = '';

      // Determine priority and reason for back office follow-up
      if (sale.estado === 'Cancelada') {
        priority = 'Alta';
        reason = 'Venta cancelada - Requiere análisis';
      } else if (totalValue > 1000) {
        priority = 'Alta';
        reason = 'Alto valor - Verificación requerida';
      } else if (sale.estado === 'Pendiente') {
        const daysSinceOrder = Math.floor((new Date().getTime() - new Date(sale.fecha).getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceOrder > 3) {
          priority = 'Alta';
          reason = 'Venta pendiente más de 3 días';
        } else {
          priority = 'Media';
          reason = 'Venta pendiente - Seguimiento rutinario';
        }
      } else if (totalValue > 500) {
        priority = 'Media';
        reason = 'Valor medio-alto - Verificación estándar';
      }

      return {
        ...sale,
        priority,
        reason,
        totalValue,
        assignedTo: 'Sin asignar',
        lastUpdate: sale.fecha,
        notes: ''
      };
    });
  }, [sales]);

  // Apply filters
  const filteredSales = useMemo(() => {
    let filtered = enhancedSales;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sale =>
        sale.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.id.includes(searchTerm.toLowerCase()) ||
        sale.reason.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sale => sale.estado === statusFilter);
    }

    // Priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(sale => sale.priority === priorityFilter);
    }

    return filtered.sort((a, b) => {
      // Sort by priority: Alta > Media > Normal
      const priorityOrder = { 'Alta': 3, 'Media': 2, 'Normal': 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  }, [enhancedSales, searchTerm, statusFilter, priorityFilter]);

  return (
    <div className="space-y-6">
      {/* Back Office Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900">Back Office - Seguimiento</h1>
            <p className="text-slate-600">Gestión y seguimiento de ventas que requieren atención especial</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline"
            className="border-purple-200 hover:bg-purple-50 text-purple-700"
          >
            <FileText className="h-4 w-4 mr-2" />
            Exportar Reporte
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            Asignar Tareas
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <BackOfficeMetrics sales={enhancedSales} />

      {/* Filters */}
      <Card className="p-4 bg-white/90 backdrop-blur-sm border-slate-200/50">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por cliente, producto, ID o motivo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-slate-200 focus:border-purple-500 focus:ring-purple-500/20">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority Filter */}
          <div className="w-full lg:w-40">
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="border-slate-200 focus:border-purple-500 focus:ring-purple-500/20">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="Alta">Alta</SelectItem>
                <SelectItem value="Media">Media</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Button */}
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:border-purple-300"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-slate-600">
          Mostrando <span className="text-purple-600">{filteredSales.length}</span> casos de {enhancedSales.length} total
        </p>
        
        {/* Priority Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-slate-600">Prioridad Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-slate-600">Prioridad Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-slate-600">Prioridad Normal</span>
          </div>
        </div>
      </div>

      {/* Sales List for Back Office */}
      <div className="space-y-3">
        {filteredSales.length > 0 ? (
          filteredSales.map((sale) => (
            <BackOfficeItem key={sale.id} sale={sale} />
          ))
        ) : (
          <Card className="p-8 text-center bg-white/90 backdrop-blur-sm border-slate-200/50">
            <div className="flex flex-col items-center gap-3">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="text-slate-900">No hay casos para revisar</h3>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                  ? 'No se encontraron casos que coincidan con los filtros aplicados.'
                  : 'Todas las ventas están en orden y no requieren seguimiento especial.'}
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}