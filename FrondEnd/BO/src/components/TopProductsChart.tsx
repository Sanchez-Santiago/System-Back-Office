import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

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

interface TopProductsChartProps {
  sales: Sale[];
}

export function TopProductsChart({ sales }: TopProductsChartProps) {
  const productData = useMemo(() => {
    // Group sales by product
    const salesByProduct = sales.reduce((acc, sale) => {
      if (!acc[sale.producto]) {
        acc[sale.producto] = {
          producto: sale.producto,
          cantidad: 0,
          ingresos: 0,
          ventas: 0
        };
      }
      
      acc[sale.producto].cantidad += sale.cantidad;
      acc[sale.producto].ingresos += sale.precio * sale.cantidad;
      acc[sale.producto].ventas += 1;
      
      return acc;
    }, {} as Record<string, any>);

    // Convert to array and sort by revenue
    const sortedData = Object.values(salesByProduct)
      .sort((a: any, b: any) => b.ingresos - a.ingresos)
      .slice(0, 8); // Top 8 products

    return sortedData;
  }, [sales]);

  const COLORS = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#84cc16', // lime
    '#f97316'  // orange
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const truncateProductName = (name: string, maxLength: number = 20) => {
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  if (productData.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-500">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="bar" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger value="bar">Gráfico de Barras</TabsTrigger>
        <TabsTrigger value="pie">Gráfico Circular</TabsTrigger>
      </TabsList>
      
      <TabsContent value="bar" className="mt-0">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productData} margin={{ top: 5, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="producto" 
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={100}
                formatter={(value) => truncateProductName(value, 15)}
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
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg max-w-xs">
                        <p className="font-medium text-slate-900 mb-2">{label}</p>
                        <div className="space-y-1 text-sm">
                          <p className="text-blue-600">
                            Ingresos: {formatCurrency(data.ingresos)}
                          </p>
                          <p className="text-purple-600">
                            Cantidad vendida: {data.cantidad}
                          </p>
                          <p className="text-green-600">
                            Número de ventas: {data.ventas}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar 
                dataKey="ingresos" 
                fill="url(#productGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="productGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
      
      <TabsContent value="pie" className="mt-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="ingresos"
                  label={({ producto, percent }) => 
                    `${truncateProductName(producto, 12)} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: any, name: string) => [formatCurrency(value), 'Ingresos']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend/Details */}
          <div className="space-y-3">
            <h4 className="text-slate-900 mb-3">Detalle por Producto</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {productData.map((product: any, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <div>
                      <p className="text-slate-900 text-sm">{truncateProductName(product.producto, 25)}</p>
                      <p className="text-slate-600 text-xs">
                        {product.cantidad} unidades • {product.ventas} ventas
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-900">{formatCurrency(product.ingresos)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}