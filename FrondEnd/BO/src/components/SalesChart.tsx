import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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

interface SalesChartProps {
  sales: Sale[];
}

export function SalesChart({ sales }: SalesChartProps) {
  const chartData = useMemo(() => {
    // Group sales by date
    const salesByDate = sales.reduce((acc, sale) => {
      const date = sale.fecha;
      if (!acc[date]) {
        acc[date] = {
          date,
          ventas: 0,
          ingresos: 0,
          completadas: 0
        };
      }
      acc[date].ventas += 1;
      acc[date].ingresos += sale.precio * sale.cantidad;
      if (sale.estado === 'Completada') {
        acc[date].completadas += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by date
    const data = Object.values(salesByDate).sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Format dates for display
    return data.map((item: any) => ({
      ...item,
      fechaDisplay: new Date(item.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short'
      })
    }));
  }, [sales]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="fechaDisplay" 
            stroke="#64748b"
            fontSize={12}
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
              if (name === 'ingresos') {
                return [formatCurrency(value), 'Ingresos'];
              }
              return [value, name === 'ventas' ? 'Total Ventas' : 'Completadas'];
            }}
            labelFormatter={(label) => `Fecha: ${label}`}
          />
          <Line 
            type="monotone" 
            dataKey="ventas" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
          />
          <Line 
            type="monotone" 
            dataKey="completadas" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}