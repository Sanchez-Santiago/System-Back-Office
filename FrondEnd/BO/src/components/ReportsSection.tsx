import { useState, useMemo, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { SalesChart } from './SalesChart';
import { PerformanceChart } from './PerformanceChart';
import { TopProductsChart } from './TopProductsChart';
import { SalesMetrics } from './SalesMetrics';
import type { Sale, SalesStats } from '../types/sales';
import { salesApi } from '../services/salesApi';

interface ReportsSectionProps {
  sales: Sale[];
}

export function ReportsSection({ sales }: ReportsSectionProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('last30');
  const [selectedVendedor, setSelectedVendedor] = useState('all');
  const [stats, setStats] = useState<SalesStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Load statistics from API
  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      try {
        const statsData = await salesApi.fetchSalesStats();
        setStats(statsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    loadStats();
  }, []);

  // Get unique vendors from current sales data
  const vendedores = useMemo(() => {
    const unique = [...new Set(sales.map(sale => `${sale.vendedor_nombre} ${sale.vendedor_apellido}`))];
    return unique.sort();
  }, [sales]);

  // Filter sales based on selected filters
  const filteredSales = useMemo(() => {
    let filtered = sales;

    // Filter by vendor
    if (selectedVendedor !== 'all') {
      filtered = filtered.filter(sale =>
        `${sale.vendedor_nombre} ${sale.vendedor_apellido}` === selectedVendedor
      );
    }

    // Filter by period
    const now = new Date();
    const periodStart = new Date();

    switch (selectedPeriod) {
      case 'last7':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'last30':
        periodStart.setDate(now.getDate() - 30);
        break;
      case 'last90':
        periodStart.setDate(now.getDate() - 90);
        break;
      case 'last365':
        periodStart.setDate(now.getDate() - 365);
        break;
      default:
        return filtered;
    }

    filtered = filtered.filter(sale => new Date(sale.fecha_creacion) >= periodStart);
    return filtered;
  }, [sales, selectedPeriod, selectedVendedor]);

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'last7': return 'Últimos 7 días';
      case 'last30': return 'Últimos 30 días';
      case 'last90': return 'Últimos 90 días';
      case 'last365': return 'Último año';
      default: return 'Todos los tiempos';
    }
  };

  return (
    <div className="space-y-6">
      {/* Reports Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-slate-900">Reportes y Analytics</h1>
            <p className="text-slate-600">Análisis de rendimiento y métricas de ventas</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="w-full sm:w-48">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Últimos 7 días</SelectItem>
                <SelectItem value="last30">Últimos 30 días</SelectItem>
                <SelectItem value="last90">Últimos 90 días</SelectItem>
                <SelectItem value="last365">Último año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-full sm:w-48">
            <Select value={selectedVendedor} onValueChange={setSelectedVendedor}>
              <SelectTrigger className="border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                <SelectValue placeholder="Todos los vendedores" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los vendedores</SelectItem>
                {vendedores.map(vendedor => (
                  <SelectItem key={vendedor} value={vendedor}>
                    {vendedor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <SalesMetrics 
        sales={filteredSales} 
        period={getPeriodLabel(selectedPeriod)}
        selectedVendedor={selectedVendedor}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-slate-200/50">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h3 className="text-slate-900">Tendencia de Ventas</h3>
          </div>
          <SalesChart sales={filteredSales} />
        </Card>

        {/* Performance by Vendor */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-slate-200/50">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-purple-500" />
            <h3 className="text-slate-900">Rendimiento por Vendedor</h3>
          </div>
          <PerformanceChart sales={filteredSales} />
        </Card>

        {/* Top Products */}
        <Card className="p-6 bg-white/90 backdrop-blur-sm border-slate-200/50 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-green-500" />
            <h3 className="text-slate-900">Productos Más Vendidos</h3>
          </div>
          <TopProductsChart sales={filteredSales} />
        </Card>
      </div>

      {/* Additional Info */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h4 className="text-blue-900">Información del Reporte</h4>
        </div>
        <p className="text-blue-800">
          {selectedVendedor === 'all' 
            ? `Mostrando datos de todos los vendedores para ${getPeriodLabel(selectedPeriod).toLowerCase()}`
            : `Mostrando datos de ${selectedVendedor} para ${getPeriodLabel(selectedPeriod).toLowerCase()}`
          }
        </p>
        <p className="text-blue-700 mt-1">
          Total de registros analizados: {filteredSales.length} ventas
        </p>
      </Card>
    </div>
  );
}