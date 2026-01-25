import { useMemo } from 'react';
import { AlertTriangle, Clock, CheckCircle, DollarSign, Users, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';

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

interface BackOfficeMetricsProps {
  sales: EnhancedSale[];
}

export function BackOfficeMetrics({ sales }: BackOfficeMetricsProps) {
  const metrics = useMemo(() => {
    const totalCases = sales.length;
    const highPriority = sales.filter(sale => sale.priority === 'Alta').length;
    const mediumPriority = sales.filter(sale => sale.priority === 'Media').length;
    const pendingCases = sales.filter(sale => sale.estado === 'Pendiente').length;
    const cancelledCases = sales.filter(sale => sale.estado === 'Cancelada').length;
    const totalValue = sales.reduce((acc, sale) => acc + sale.totalValue, 0);
    const avgValue = totalCases > 0 ? totalValue / totalCases : 0;

    // Calculate urgency rate (high priority cases / total cases)
    const urgencyRate = totalCases > 0 ? (highPriority / totalCases) * 100 : 0;

    return {
      totalCases,
      highPriority,
      mediumPriority,
      pendingCases,
      cancelledCases,
      totalValue,
      avgValue,
      urgencyRate
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
      title: 'Casos Totales',
      value: metrics.totalCases.toString(),
      icon: Users,
      color: 'purple',
      description: 'Ventas en seguimiento'
    },
    {
      title: 'Prioridad Alta',
      value: metrics.highPriority.toString(),
      icon: AlertTriangle,
      color: 'red',
      description: 'Requieren atención inmediata'
    },
    {
      title: 'Ventas Pendientes',
      value: metrics.pendingCases.toString(),
      icon: Clock,
      color: 'orange',
      description: 'En proceso de seguimiento'
    },
    {
      title: 'Ventas Canceladas',
      value: metrics.cancelledCases.toString(),
      icon: CheckCircle,
      color: 'red',
      description: 'Requieren análisis'
    },
    {
      title: 'Valor Total',
      value: formatCurrency(metrics.totalValue),
      icon: DollarSign,
      color: 'green',
      description: 'Importe en seguimiento'
    },
    {
      title: 'Valor Promedio',
      value: formatCurrency(metrics.avgValue),
      icon: TrendingUp,
      color: 'indigo',
      description: 'Por caso'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'from-purple-500 to-purple-600 text-purple-100',
      red: 'from-red-500 to-red-600 text-red-100',
      orange: 'from-orange-500 to-orange-600 text-orange-100',
      green: 'from-green-500 to-green-600 text-green-100',
      indigo: 'from-indigo-500 to-indigo-600 text-indigo-100',
      blue: 'from-blue-500 to-blue-600 text-blue-100'
    };
    return colors[color as keyof typeof colors] || colors.purple;
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

      {/* Urgency Rate Card */}
      <Card className="md:col-span-2 lg:col-span-3 xl:col-span-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200/50">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h4 className="text-purple-900 mb-1">Tasa de Urgencia</h4>
            <p className="text-purple-800">
              <span className="text-2xl">{metrics.urgencyRate.toFixed(1)}%</span>
              <span className="ml-2 text-sm">de casos de alta prioridad</span>
            </p>
            <p className="text-purple-700 text-sm mt-1">
              {metrics.highPriority} casos críticos de {metrics.totalCases} total
            </p>
          </div>
          
          <div className="mt-3 sm:mt-0 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-600">Alta: {metrics.highPriority}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-slate-600">Media: {metrics.mediumPriority}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-600">Normal: {metrics.totalCases - metrics.highPriority - metrics.mediumPriority}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}