import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface PerformanceChartProps {
  sales: Sale[];
}

export function PerformanceChart({ sales }: PerformanceChartProps) {
  const performanceData = useMemo(() => {
    // Group sales by vendor
    const salesByVendor = sales.reduce((acc, sale) => {
      if (!acc[sale.vendedor]) {
        acc[sale.vendedor] = {
          vendedor: sale.vendedor,
          totalVentas: 0,
          ventasCompletadas: 0,
          ingresosTotales: 0,
          ingresosCompletados: 0
        };
      }
      
      acc[sale.vendedor].totalVentas += 1;
      acc[sale.vendedor].ingresosTotales += sale.precio * sale.cantidad;
      
      if (sale.estado === 'Completada') {
        acc[sale.vendedor].ventasCompletadas += 1;
        acc[sale.vendedor].ingresosCompletados += sale.precio * sale.cantidad;
      }
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and calculate additional metrics
    return Object.values(salesByVendor).map((vendor: any) => ({
      ...vendor,
      tasaConversion: vendor.totalVentas > 0 
        ? ((vendor.ventasCompletadas / vendor.totalVentas) * 100).toFixed(1)
        : 0,
      ventaPromedio: vendor.ventasCompletadas > 0
        ? vendor.ingresosCompletados / vendor.ventasCompletadas
        : 0
    })).sort((a: any, b: any) => b.ingresosCompletados - a.ingresosCompletados);
  }, [sales]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (performanceData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={performanceData} margin={{ top: 5, right: 30, left: 20, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="vendedor" 
            stroke="#64748b"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
            formatter={(value: any, name: string) => {
              switch (name) {
                case 'ingresosCompletados':
                  return [formatCurrency(value), 'Ingresos'];
                case 'ventasCompletadas':
                  return [value, 'Ventas Completadas'];
                case 'totalVentas':
                  return [value, 'Total Ventas'];
                default:
                  return [value, name];
              }
            }}
            labelFormatter={(label) => `Vendedor: ${label}`}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                    <p className="font-medium text-slate-900 mb-2">{label}</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-600">
                        Ventas: {data.ventasCompletadas}/{data.totalVentas}
                      </p>
                      <p className="text-green-600">
                        Ingresos: {formatCurrency(data.ingresosCompletados)}
                      </p>
                      <p className="text-purple-600">
                        Tasa de conversión: {data.tasaConversion}%
                      </p>
                      <p className="text-orange-600">
                        Venta promedio: {formatCurrency(data.ventaPromedio)}
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar 
            dataKey="ingresosCompletados" 
            fill="url(#colorGradient)"
            radius={[4, 4, 0, 0]}
          />
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}