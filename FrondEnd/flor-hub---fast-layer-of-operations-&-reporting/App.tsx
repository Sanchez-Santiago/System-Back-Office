// App.tsx
// Main App Component with React Query implementation

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { SaleModal } from './components/SaleModal';
import { CommentModal } from './components/CommentModal';
import { QuickActionFAB } from './components/QuickActionFAB';
import { UpdateMenu } from './components/UpdateMenu';
import { AdvancedFilters } from './components/AdvancedFilters';
import { SaleFormModal } from './components/SaleFormModal';
import { NominaModal } from './components/NominaModal';
import { FilterBar } from './components/FilterBar';
import { GestionPage } from './pages/GestionPage';
import { SeguimientoPage } from './pages/SeguimientoPage';
import { ReportesPage } from './pages/ReportesPage';
import { OfertasPage } from './pages/OfertasPage';

import { AppTab, Sale, SaleStatus, ProductType, LogisticStatus, LineStatus } from './types';

// Hooks y servicios de API
import { useAuth } from './hooks/useAuth';
import { useAuthCheck, VerifiedUser } from './hooks/useAuthCheck';
import { useVentasQuery } from './hooks/useVentasQuery';
import { useVentaDetalle } from './hooks/useVentaDetalle';

import { getSaleDetailById } from './mocks/ventasDetalle';

// Componentes Zod (mantener por compatibilidad)
import { EstadoVentaFormModal } from './components/EstadoVentaFormModal';
import { CorreoFormModal } from './components/CorreoFormModal';
import { EstadoCorreoFormModal } from './components/EstadoCorreoFormModal';

// Páginas
import { LoginPage } from './pages/LoginPage';



export default function App() {
  // Verificación de autenticación al inicio
  const { isAuthenticated, isLoading: isAuthChecking, user: authUser, refetch, setIsAuthenticated } = useAuthCheck();
  
  // Autenticación con API (para login/logout)
  const { login, error: authError, syncUser } = useAuth();

  // Sincronizar usuario entre useAuthCheck y useAuth
  useEffect(() => {
    if (authUser) {
      syncUser(authUser);
    } else if (!isAuthChecking && !isAuthenticated) {
      // Si terminó de cargar y no está autenticado, limpiar usuario
      syncUser(null);
    }
  }, [authUser, isAuthChecking, isAuthenticated, syncUser]);

  // Estado de la aplicación
  const [activeTab, setActiveTab] = useState<AppTab>('GESTIÓN');
  const [trackingSubTab, setTrackingSubTab] = useState<'AGENDADOS' | 'ENTREGADOS_PORTA' | 'NO_ENTREGADOS_PORTA' | 'NO_ENTREGADOS_LN' | 'PENDIENTE_PIN'>('AGENDADOS');

  // Estado de Filtros Principales
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filters, setFilters] = useState({ status: 'TODOS', logisticStatus: 'TODOS', productType: 'TODOS', originMarket: 'TODOS', advisor: 'TODOS', plan: 'TODOS', promotion: 'TODOS' });

  // Estado de Interfaz
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showNomina, setShowNomina] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'TODOS'>(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Estado de Modales
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [commentingSale, setCommentingSale] = useState<Sale | null>(null);
  const [creatingSale, setCreatingSale] = useState<Partial<Sale> | null>(null);

  // Modales Zod
  const [editingEstadoVenta, setEditingEstadoVenta] = useState<Sale | null>(null);
  const [editingCorreo, setEditingCorreo] = useState<Sale | null>(null);
  const [editingEstadoCorreo, setEditingEstadoCorreo] = useState<{sale: Sale, currentEstado?: string} | null>(null);

  // Datos de ventas con React Query (solo si está autenticado)
  const { ventas: sales, isLoading: isVentasLoading, error: ventasError, pagination } = useVentasQuery(
    isAuthenticated ? currentPage : 1, 
    isAuthenticated ? (rowsPerPage === 'TODOS' ? 1000 : rowsPerPage) : 0,
    {
      startDate,
      endDate,
      searchQuery,
      advisor: filters.advisor || '',
      status: filters.status || '',
      logisticStatus: filters.logisticStatus || ''
    }
  );

  // Lazy loading para detalles completos de venta seleccionada
  const { ventaDetalle, isLoading: isDetalleLoading, error: detalleError } = useVentaDetalle(selectedSale ? parseInt(selectedSale.id) : null);

  // Lógica de Filtrado Global
  const filteredSales = useMemo(() => sales?.filter(sale => {
    const matchesSearch = sale.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sale.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sale.dni.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         sale.phoneNumber.includes(searchQuery);
    const matchesStatus = filters.status === 'TODOS' || sale.status === filters.status;
    const matchesLogistic = filters.logisticStatus === 'TODOS' || sale.logisticStatus === filters.logisticStatus;
    const matchesProduct = filters.productType === 'TODOS' || sale.productType === filters.productType;
    const matchesAdvisor = filters.advisor === 'TODOS' || sale.advisor === filters.advisor;
    const matchesDate = (!startDate || sale.date >= startDate) && (!endDate || sale.date <= endDate);
    
    return matchesSearch && matchesStatus && matchesLogistic && matchesProduct && matchesAdvisor && matchesDate;
  }), [searchQuery, filters, startDate, endDate, sales]);

  // Lista única de asesores para los filtros avanzados
  const uniqueAdvisors = useMemo(() => 
    Array.from(new Set(sales?.map(s => s.advisor).filter(Boolean) || [])), 
    [sales]
  );

  // Agrupación para Seguimiento
  const trackingGroups = useMemo(() => {
    const groups = { agendados: [] as Sale[], entregadosPorta: [] as Sale[], noEntregadosPorta: [] as Sale[], noEntregadosLN: [] as Sale[], pendientePin: [] as Sale[] };
    filteredSales?.forEach(sale => {
      const isDelivered = [LogisticStatus.ENTREGADO, LogisticStatus.RENDIDO_AL_CLIENTE].includes(sale.logisticStatus);
      const isPorta = sale.productType === ProductType.PORTABILITY;
      const isLN = sale.productType === ProductType.NEW_LINE;
      if (sale.lineStatus === LineStatus.PENDIENTE_PORTABILIDAD) groups.pendientePin.push(sale);
      else if (isDelivered && isPorta) groups.entregadosPorta.push(sale);
      else if (!isDelivered && isPorta && sale.logisticStatus !== LogisticStatus.INICIAL) groups.noEntregadosPorta.push(sale);
      else if (!isDelivered && isLN && sale.logisticStatus !== LogisticStatus.INICIAL) groups.noEntregadosLN.push(sale);
      else if (sale.status === SaleStatus.EN_PROCESO || sale.logisticStatus === LogisticStatus.ASIGNADO) groups.agendados.push(sale);
    });
    return groups;
  }, [filteredSales]);

  const currentVisibleInTracking = useMemo(() => {
    switch (trackingSubTab) {
      case 'AGENDADOS': return trackingGroups.agendados;
      case 'ENTREGADOS_PORTA': return trackingGroups.entregadosPorta;
      case 'NO_ENTREGADOS_PORTA': return trackingGroups.noEntregadosPorta;
      case 'NO_ENTREGADOS_LN': return trackingGroups.noEntregadosLN;
      case 'PENDIENTE_PIN': return trackingGroups.pendientePin;
      default: return [];
    }
  }, [trackingSubTab, trackingGroups]);

  // Calcular total de registros filtrados para el componente de paginación
  const currentTotalRecords = filteredSales?.length;

  // Exportar a CSV helper
  const exportToCSV = (data: Sale[], filename: string) => {
    const headers = ['ID', 'Cliente', 'DNI', 'Teléfono', 'Estado', 'Logística', 'Producto', 'Mercado', 'Plan', 'Asesor', 'Supervisor', 'Fecha', 'Monto'];
    const csvContent = [
      headers.join(','),
      ...data.map(s => [
        s.id,
        `"${s.customerName}"`,
        s.dni,
        s.phoneNumber,
        s.status,
        `"${s.logisticStatus}"`,
        s.productType,
        `"${s.originMarket}"`,
        `"${s.plan}"`,
        `"${s.advisor}"`,
        `"${s.supervisor}"`,
        s.date,
        s.amount
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Mostrar loading mientras autentica */}
      {isAuthChecking && (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white font-bold text-lg">Verificando autenticación...</p>
          </div>
        </div>
      )}

      {/* Mostrar login solo si terminó de verificar y no está autenticado */}
      {!isAuthChecking && !isAuthenticated && (
        <LoginPage 
          onLogin={async (email, password) => {
            const success = await login(email, password);
            if (success) {
              // Si el login fue exitoso, directamente marcar como autenticado
              setIsAuthenticated(true);
            }
            return success;
          }}
          error={authError} 
        />
      )}

      {/* Solo mostrar el contenido principal si está autenticado */}
      {isAuthenticated && (
        <div className="min-h-screen pb-40">
          <Header 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onOpenNomina={() => setShowNomina(true)} 
          />
          
          {showAdvancedFilters && <div className="fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setShowAdvancedFilters(false)}></div>}
          
          <main className="max-w-[1440px] mx-auto px-6 mt-10">
            {(activeTab === 'GESTIÓN' || activeTab === 'SEGUIMIENTO') && (
              <FilterBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                onExport={() => exportToCSV(filteredSales, `FLORHUB_Export`)}
                totalRecords={currentTotalRecords}
              />
            )}

            {showAdvancedFilters && (
              <AdvancedFilters 
                onClose={() => setShowAdvancedFilters(false)} 
                filters={filters} 
                setFilters={setFilters}
                uniqueAdvisors={uniqueAdvisors}
              />
            )}


            <QuickActionFAB />

            {/* Renderizar contenido según la pestaña activa */}
            {activeTab === 'GESTIÓN' && (
              <GestionPage
                sales={filteredSales || []}
                selectedIds={selectedIds}
                onToggleSelect={(id) => {
                  setSelectedIds(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(id)) {
                      newSet.delete(id);
                    } else {
                      newSet.add(id);
                    }
                    return newSet;
                  });
                }}
                onViewSale={(sale) => setSelectedSale(sale)}
                onCommentSale={(sale) => setCommentingSale(sale)}
              />
            )}

            {activeTab === 'SEGUIMIENTO' && (
              <SeguimientoPage
                trackingSubTab={trackingSubTab}
                setTrackingSubTab={setTrackingSubTab}
                sales={currentVisibleInTracking || []}
                selectedIds={selectedIds}
                onToggleSelect={(id) => {
                  setSelectedIds(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(id)) {
                      newSet.delete(id);
                    } else {
                      newSet.add(id);
                    }
                    return newSet;
                  });
                }}
                onViewSale={(sale) => setSelectedSale(sale)}
                onCommentSale={(sale) => setCommentingSale(sale)}
                counts={{
                  agendados: trackingGroups.agendados.length,
                  entregadosPorta: trackingGroups.entregadosPorta.length,
                  noEntregadosPorta: trackingGroups.noEntregadosPorta.length,
                  noEntregadosLN: trackingGroups.noEntregadosLN.length,
                  pendientePin: trackingGroups.pendientePin.length
                }}
              />
            )}

          {activeTab === 'REPORTES' && (
            <ReportesPage 
              advisors={Array.from(new Set(sales?.map(s => s.advisor).filter(Boolean) || []))}
              supervisors={Array.from(new Set(sales?.map(s => s.supervisor).filter(Boolean) || []))}
            />
          )}

            {activeTab === 'OFERTAS' && (
              <OfertasPage />
            )}
          </main>

          {/* Overlays y Modales Globales */}
          {selectedIds.size > 0 && (
            <UpdateMenu 
              selectedCount={selectedIds.size} 
              onUpdateStatus={(s) => { 
                // Update would be handled by React Query invalidation
                setSelectedIds(new Set()); 
              }} 
              onUpdateLogistic={(l) => { 
                // Update would be handled by React Query invalidation
                setSelectedIds(new Set()); 
              }} 
              onUpdateLine={(line) => { 
                // Update would be handled by React Query invalidation
                setSelectedIds(new Set()); 
              }} 
              onClear={() => setSelectedIds(new Set())} 
            />
          )}
          
          {editingEstadoVenta && (
            <EstadoVentaFormModal
              sale={editingEstadoVenta}
              onClose={() => setEditingEstadoVenta(null)}
              onSubmit={(data) => {
                // Update would be handled by React Query invalidation
                setEditingEstadoVenta(null);
              }}
            />
          )}
          
          {editingCorreo && (
            <CorreoFormModal
              sale={editingCorreo}
              onClose={() => setEditingCorreo(null)}
              onSubmit={(data) => {
                console.log('Correo creado/actualizado:', data);
                setEditingCorreo(null);
              }}
            />
          )}
          
          {editingEstadoCorreo && (
            <EstadoCorreoFormModal
              sapId={editingEstadoCorreo.sale.id}
              currentEstado={editingEstadoCorreo.currentEstado}
              onClose={() => setEditingEstadoCorreo(null)}
              onSubmit={(data) => {
                // Update would be handled by React Query invalidation
                setEditingEstadoCorreo(null);
              }}
            />
          )}
          
          {showNomina && <NominaModal onClose={() => setShowNomina(false)} />}
        </div>
      )}
    </>
  );
}