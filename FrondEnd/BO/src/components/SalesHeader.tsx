import { useState } from 'react';
import { Search, Filter, BarChart3, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { useAuth } from '../contexts/AuthContext';

interface SalesHeaderProps {
  onSearch: (searchTerm: string) => void;
  onFilter: (filterType: string, filterValue: string) => void;
  totalSales: number;
  onCreateSale?: () => void;
}

export function SalesHeader({ onSearch, onFilter, totalSales, onCreateSale }: SalesHeaderProps) {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div>
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900">Gestión de Ventas</h1>
            <p className="text-slate-600">
              <span className="text-blue-600">{totalSales}</span> ventas encontradas
            </p>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3">
          {onCreateSale && (
            <Button
              onClick={onCreateSale}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
          )}
          <div className="text-right">
            <p className="text-slate-600">{user?.nombre} {user?.apellido}</p>
            <p className="text-slate-500">{user?.email}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
            <span className="text-white">
              {user?.nombre?.[0]}{user?.apellido?.[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Compact Search and Filters */}
      <Card className="p-4 bg-white/90 backdrop-blur-sm border-slate-200/50 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
          {/* Search Input */}
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por cliente, producto, vendedor o ID..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="w-full lg:w-40">
            <Select onValueChange={(value) => onFilter('tipo_venta', value)}>
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Tipo de Venta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PORTABILIDAD">Portabilidad</SelectItem>
                <SelectItem value="LINEA_NUEVA">Línea Nueva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-40">
            <Select onValueChange={(value) => onFilter('estado', value)}>
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="Completada">Completada</SelectItem>
                <SelectItem value="Pendiente">Pendiente</SelectItem>
                <SelectItem value="Cancelada">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Button */}
          <Button 
            variant="outline" 
            size="sm"
            className="border-slate-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-300"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
}