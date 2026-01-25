import { useMemo } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, CheckCircle, Clock } from 'lucide-react';
import { Card } from './ui/card';

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

interface SalesMetricsProps {
  sales: Sale[];
  period: string;
  selectedVendedor: string;
}

export function SalesMetrics({ sales, period, selectedVendedor }: SalesMetricsProps) {
  const metrics = useMemo(() => {
    const totalSales = sales.length;
    const totalRevenue = sales.reduce((acc, sale) => acc + (sale.precio * sale.cantidad), 0);
    const completedSales = sales.filter(sale => sale.estado === 'Completada').length;
    const pendingSales = sales.filter(sale => sale.estado === 'Pendiente').length;
    const uniqueClients = new Set(sales.map(sale => sale.cliente)).size;
    const avgSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;
    const conversionRate = totalSales > 0 ? (completedSales / totalSales) * 100 : 0;

    return {
      totalSales,
      totalRevenue,
      completedSales,
      pendingSales,
      uniqueClients,
      avgSaleValue,
      conversionRate
    };
  }, [sales]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const metricCards = [
    {
      title: 'Ventas Totales',
      value: metrics.totalSales.toString(),
      icon: ShoppingCart,
      color: 'blue',
      description: 'Total de transacciones'
    },
    {
      title: 'Ingresos Totales',
      value: formatCurrency(metrics.totalRevenue),
      icon: DollarSign,
      color: 'green',
      description: 'Ingresos generados'
    },
    {
      title: 'Ventas Completadas',
      value: metrics.completedSales.toString(),
      icon: CheckCircle,
      color: 'emerald',
      description: 'Transacciones exitosas'
    },
    {
      title: 'Ventas Pendientes',
      value: metrics.pendingSales.toString(),
      icon: Clock,
      color: 'orange',
      description: 'En proceso'
    },
    {
      title: 'Clientes Únicos',
      value: metrics.uniqueClients.toString(),
      icon: Users,
      color: 'purple',
      description: 'Clientes diferentes'
    },
    {
      title: 'Valor Promedio',
      value: formatCurrency(metrics.avgSaleValue),
      icon: TrendingUp,
      color: 'indigo',
      description: 'Promedio por venta'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'from-blue-500 to-blue-600 text-blue-100',
      green: 'from-green-500 to-green-600 text-green-100',
      emerald: 'from-emerald-500 to-emerald-600 text-emerald-100',
      orange: 'from-orange-500 to-orange-600 text-orange-100',
      purple: 'from-purple-500 to-purple-600 text-purple-100',
      indigo: 'from-indigo-500 to-indigo-600 text-indigo-100'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {metricCards.map((metric, index) => (
        <Card key={index} className="p-4 bg-white/90 backdrop-blur-sm border-slate-200/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${getColorClasses(metric.color)}`}>
              <metric.icon className="h-4 w-4" />
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-slate-600 text-sm">{metric.title}</p>
            <p className="text-slate-900 text-xl">{metric.value}</p>
            <p className="text-slate-500 text-xs">{metric.description}</p>
          </div>
        </Card>
      ))}

      {/* Conversion Rate Card */}
      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-blue-900 mb-1">Tasa de Conversión</h4>
            <p className="text-blue-800">
              <span className="text-2xl">{metrics.conversionRate.toFixed(1)}%</span>
              <span className="ml-2 text-sm">de ventas completadas</span>
            </p>
            <p className="text-blue-700 text-sm mt-1">
              {selectedVendedor === 'all' ? 'Todos los vendedores' : selectedVendedor} • {period}
            </p>
          </div>
          
          <div className="mt-3 sm:mt-0 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-600">Completadas: {metrics.completedSales}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-slate-600">Pendientes: {metrics.pendingSales}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}