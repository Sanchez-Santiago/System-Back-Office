import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/Auth/LoginForm';
import { SalesHeader } from './components/SalesHeader';
import { SalesList } from './components/SalesList';
import { SalesForm } from './components/Sales/SalesForm';
import { ReportsSection } from './components/ReportsSection';
import { BackOfficeSection } from './components/BackOfficeSection';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { salesApi } from './services/salesApi';
import type { Sale, SalesFilters } from './types/sales';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from './components/ui/button';

function AppContent() {
  const { isAuthenticated, logout, user } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [filteredSales, setFilteredSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('sales');
  const [currentFilters, setCurrentFilters] = useState<SalesFilters>({});
  const [isSalesFormOpen, setIsSalesFormOpen] = useState(false);

  // Load sales from API
  const loadSales = async (filters: SalesFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesApi.fetchSales(filters);
      if (response.success) {
        setSales(response.data);
        setFilteredSales(response.data);
      } else {
        setError('Error al cargar las ventas');
      }
    } catch (err) {
      console.error('Error loading sales:', err);
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSales();
    }
  }, [isAuthenticated]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setFilteredSales(sales);
      return;
    }

    const filtered = sales.filter(sale =>
      sale.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.cliente_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.vendedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.vendedor_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.sds.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.plan_nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSales(filtered);
  };

  const handleFilter = async (filterType: string, filterValue: string) => {
    const newFilters = { ...currentFilters };

    if (filterType === 'tipo_venta') {
      newFilters.tipo_venta = filterValue === 'all' ? undefined : filterValue;
    } else if (filterType === 'estado') {
      // For now, we'll filter client-side for status since API might not have direct status filter
      if (filterValue && filterValue !== 'all') {
        const filtered = sales.filter(sale => sale.estado_actual === filterValue);
        setFilteredSales(filtered);
        return;
      }
    }

    setCurrentFilters(newFilters);
    await loadSales(newFilters);
  };

  // Filter sales that require back office follow-up
  const backOfficeSales = sales.filter(sale =>
    sale.estado_actual === 'Pendiente' ||
    sale.estado_actual === 'Cancelada'
  );

  const handleCreateSale = () => {
    setIsSalesFormOpen(true);
  };

  const handleSalesFormSuccess = () => {
    loadSales(currentFilters);
  };

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (loading && sales.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando ventas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Header with logout */}
      <div className="sticky top-0 z-50 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50/95 backdrop-blur-sm border-b border-slate-200/50">
        <div className="container mx-auto px-4 py-2 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">System Back Office</h1>
            {user && (
              <p className="text-sm text-gray-600">
                Bienvenido, {user.nombre} {user.apellido}
              </p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Fixed Tabs Navigation */}
      <div className="sticky top-16 z-40 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50/95 backdrop-blur-sm border-b border-slate-200/50">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 my-4 bg-white/80 backdrop-blur-sm h-12">
              <TabsTrigger
                value="sales"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all duration-200"
              >
                Gestión de Ventas
              </TabsTrigger>
              <TabsTrigger
                value="backoffice"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white transition-all duration-200"
              >
                Back Office
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white transition-all duration-200"
              >
                Reportes y Analytics
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Sales Header - Only show for sales tab */}
        {activeTab === 'sales' && (
          <div className="border-t border-slate-200/50">
            <div className="container mx-auto px-4 py-4">
              <SalesHeader
                onSearch={handleSearch}
                onFilter={handleFilter}
                totalSales={filteredSales.length}
                onCreateSale={handleCreateSale}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
            <Button
              onClick={() => loadSales(currentFilters)}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Reintentar
            </Button>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="sales" className="mt-0">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                Cargando ventas...
              </div>
            ) : (
              <SalesList sales={filteredSales} onRefresh={() => loadSales(currentFilters)} />
            )}
          </TabsContent>

          <TabsContent value="backoffice" className="mt-0">
            <BackOfficeSection sales={backOfficeSales} />
          </TabsContent>

          <TabsContent value="reports" className="mt-0">
            <ReportsSection sales={sales} />
          </TabsContent>
        </Tabs>

        {/* Sales Form Modal */}
        <SalesForm
          isOpen={isSalesFormOpen}
          onClose={() => setIsSalesFormOpen(false)}
          onSuccess={handleSalesFormSuccess}
        />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}