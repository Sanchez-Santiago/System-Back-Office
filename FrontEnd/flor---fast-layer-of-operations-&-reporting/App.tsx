// App.tsx
/**
 * Punto de entrada principal de la aplicación FLOR.
 * Gestiona el estado global, autenticación, modo inspección y navegación principal.
 */

import React, { useState, useMemo, useEffect, useCallback, lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { QuickActionFAB } from './components/layout/QuickActionFAB';
import { AIChatFAB } from './components/layout/AIChatFAB';
import { AdvancedFilters } from './components/layout/AdvancedFilters';
import { FilterBar } from './components/layout/FilterBar';

import { KPICards } from './components/analytics/KPICards';
import { ToastContainer } from './components/common/ToastContainer';

import { useCountry, CountryOption } from './contexts/CountryContext';

import { AppTab, Sale, ProductType, LogisticStatus } from './types';

import { useAuth } from './hooks/useAuth';
import { useAuthCheck } from './hooks/useAuthCheck';
import { useVentasQuery } from './hooks/useVentasQuery';
import { useDebounce } from './hooks/useDebounce';
import { useVentaDetalle } from './hooks/useVentaDetalle';
import { useInspectionMode } from './hooks/useInspectionMode';
import { useTheme } from './hooks/useTheme';
import { useAppTabs } from './hooks/useAppTabs';
import { useFilterOptions } from './hooks/useFilterOptions';
import { usePagination } from './hooks/usePagination';
import { useModalState } from './hooks/useModalState';
import { useBulkUpdateViewModel } from './viewmodels/useBulkUpdateViewModel';
import { AppModals } from './components/layout/AppModals';

// Páginas y Transiciones
import { LoginPage } from './pages/LoginPage';

const GestionPage = lazy(() => import('./pages/GestionPage').then(m => ({ default: m.GestionPage })));
const SeguimientoPage = lazy(() => import('./pages/SeguimientoPage').then(m => ({ default: m.SeguimientoPage })));
const ReportesPage = lazy(() => import('./pages/ReportesPage').then(m => ({ default: m.ReportesPage })));
const OfertasPage = lazy(() => import('./pages/OfertasPage').then(m => ({ default: m.OfertasPage })));
import { TransitionOverlay } from './components/common/TransitionOverlay';

import { useQueryClient } from '@tanstack/react-query';

export default function App() {
  const queryClient = useQueryClient();
  
  const { isAuthenticated, isLoading: isAuthChecking, user: authUser, refetch, setIsAuthenticated } = useAuthCheck();
  
  const { login, error: authError, syncUser } = useAuth();
  const { setIsAdminView, setUserCountry, effectiveCountry } = useCountry();
  const { inspectionMode, handleLogoClick, disableInspectionMode } = useInspectionMode();
  const { isDarkMode, setIsDarkMode, themeStyle, setThemeStyle } = useTheme();
  const { activeTab, setActiveTab, trackingSubTab, setTrackingSubTab } = useAppTabs();

  const [transitioning, setTransitioning] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filters, setFilters] = useState({ 
    status: 'TODOS', 
    logisticStatus: 'TODOS', 
    productType: 'TODOS', 
    originMarket: 'TODOS', 
    advisor: 'TODOS', 
    plan: 'TODOS', 
    promotion: 'TODOS',
    empresaOrigen: 'TODOS',
    correoStatus: 'TODOS',
    celula: 'TODOS'
  });

  const { planesData, promocionesData, empresasOrigenData, celulasData } = useFilterOptions(isAuthenticated, authUser, effectiveCountry);

  const m = useModalState();
  const {
    showAdvancedFilters, setShowAdvancedFilters,
    showNomina, setShowNomina, showUserForm, setShowUserForm,
    userFormCelulas, setUserFormCelulas, userFormEditingUser, setUserFormEditingUser,
    nominaRefreshKey, setNominaRefreshKey,
    selectedIds, setSelectedIds,
    showCommandPalette, setShowCommandPalette, showAIChat, setShowAIChat,
    selectedSale, setSelectedSale, commentingSale, setCommentingSale,
    creatingSale, setCreatingSale,
    editingEstadoVenta, setEditingEstadoVenta,
    editingCorreo, setEditingCorreo, editingEstadoCorreo, setEditingEstadoCorreo,
  } = m;

  const { rowsPerPage, setRowsPerPage, currentPage, setCurrentPage } = usePagination();
  const handleKPIFilter = (filtersKPI: any) => {
    setFilters(prev => ({ ...prev, ...filtersKPI }));
  };

  // Sincronizar usuario entre useAuthCheck y useAuth
  useEffect(() => {
    if (authUser) {
      syncUser(authUser);
    } else if (!isAuthChecking && !isAuthenticated) {
      syncUser(null);
    }
  }, [authUser, isAuthChecking, isAuthenticated, syncUser]);

  useEffect(() => {
    const permisos = authUser?.permisos?.map((p) => (typeof p === 'string' ? p.toUpperCase() : String(p).toUpperCase())) || [];
    const esAdmin = permisos.includes('ADMIN') || permisos.includes('SUPERADMIN');
    setIsAdminView(esAdmin);
    setUserCountry((authUser?.pais_venta as CountryOption | null) || null);
  }, [authUser?.permisos, authUser?.pais_venta, setIsAdminView, setUserCountry]);

  // Datos de ventas con React Query (solo si está autenticado)
  const { ventas: ventasRaw, isLoading: isVentasLoading, error: ventasError, total, page, limit, refetch: refetchVentas } = useVentasQuery(
    isAuthenticated ? currentPage : 1, 
    isAuthenticated ? (rowsPerPage === 'TODOS' ? 1000 : rowsPerPage) : 0,
    {
      startDate,
      endDate,
      search: debouncedSearchQuery
    }
  );

  // Mapear ventas UI (ya viene mapeado de useVentasQuery con mapVentaUIToSale)
  const sales = useMemo(() => {
    return ventasRaw || [];
  }, [ventasRaw]);

  const { state: bulkState, actions: bulkActions } = useBulkUpdateViewModel(
    selectedIds,
    setSelectedIds,
    sales,
    selectedSale,
  );

  const currentLimit = rowsPerPage === 'TODOS' ? 1000 : rowsPerPage;
  const totalPages = Math.ceil(total / currentLimit) || 1;

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, debouncedSearchQuery, filters]);

  // Lazy loading para detalles completos de venta seleccionada
  const { ventaDetalle, isLoading: isDetalleLoading, error: detalleError } = useVentaDetalle(
    selectedSale ? (String(selectedSale.id).startsWith('INS-') ? selectedSale.id : parseInt(String(selectedSale.id))) : null
  );

  // Atajos de Teclado Globales (Spotlight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Persistencia de Modal Abierta
  useEffect(() => {
    if (selectedSale) {
      localStorage.setItem('selectedSaleId', String(selectedSale.id));
    } else {
      localStorage.removeItem('selectedSaleId');
    }
  }, [selectedSale]);

  // Recuperación automática de Modal al recargar
  useEffect(() => {
    const savedId = localStorage.getItem('selectedSaleId');
    if (savedId && sales?.length > 0 && !selectedSale) {
      const foundSale = sales.find(s => String(s.id) === savedId);
      if (foundSale) {
        setSelectedSale(foundSale);
      }
    }
  }, [sales, selectedSale]);

  // Lógica de Filtrado Global
  const filteredSales = useMemo(() => sales?.filter(sale => {
    const query = debouncedSearchQuery.toLowerCase();
    const matchesSearch = 
      String(sale.id).toLowerCase().includes(query) ||
      sale.customerName.toLowerCase().includes(query) ||
      String(sale.dni).toLowerCase().includes(query) ||
      String(sale.phoneNumber).includes(query) ||
      String(sale.sds || '').toLowerCase().includes(query) ||
      String(sale.sap || '').toLowerCase().includes(query) ||
      String(sale.stl || '').toLowerCase().includes(query) ||
      String(sale.portNumber || '').includes(query) ||
      String(sale.spn || '').toLowerCase().includes(query) ||
      String(sale.email || '').toLowerCase().includes(query);
    const matchesStatus = filters.status === 'TODOS' || sale.status === filters.status;
    const matchesLogistic = filters.logisticStatus === 'TODOS' || sale.logisticStatus === filters.logisticStatus;
    const matchesProduct = filters.productType === 'TODOS' || sale.productType === filters.productType;
    const matchesAdvisor = filters.advisor === 'TODOS' || sale.advisor === filters.advisor;
    const matchesDate = (!startDate || sale.date >= startDate) && (!endDate || sale.date <= endDate);
    
    return matchesSearch && matchesStatus && matchesLogistic && matchesProduct && matchesAdvisor && matchesDate;
  }), [debouncedSearchQuery, filters, startDate, endDate, sales]);

  const selectAllChecked = filteredSales.length > 0 && filteredSales.every(s => selectedIds.has(s.id));
  const handleToggleSelectAll = useCallback(() => {
    const visibleIds = filteredSales.map(s => s.id);
    const allSelected = visibleIds.every(id => selectedIds.has(id));
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleIds));
    }
  }, [filteredSales, selectedIds]);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  // Lista única de asesores para los filtros avanzados
  const uniqueAdvisors = useMemo(() => 
    Array.from(new Set(sales?.map(s => s.advisor).filter(Boolean) || [])), 
    [sales]
  );

  // Agrupación para Seguimiento
  const trackingGroups = useMemo(() => {
    const groups = { agendados: [] as Sale[], entregadosPorta: [] as Sale[], noEntregadosPorta: [] as Sale[], noEntregadosLN: [] as Sale[], pendientePin: [] as Sale[], rechazados: [] as Sale[] };
    filteredSales?.forEach(sale => {
      const isPorta = sale.productType === ProductType.PORTABILITY;
      const isLN = sale.productType === ProductType.NEW_LINE;
      const isDelivered = sale.logisticStatus === LogisticStatus.ENTREGADO || sale.logisticStatus === LogisticStatus.RENDIDO_AL_CLIENTE || sale.logisticStatus === LogisticStatus.ESIM;
      const statusVenta = sale.status as string;
      
      // PENDIENTE PIN: CREADO, PENDIENTE DOCU/PIN, PIN INGRESADO, PENDIENTE CARGA PIN
      const isPendientePin = ['CREADO', 'PENDIENTE DOCU/PIN', 'PIN INGRESADO', 'PENDIENTE CARGA PIN'].includes(statusVenta);
      
      // RECHAZADOS: RECHAZADO DONANTE o RECHAZADO ABD
      const isRechazado = statusVenta === 'RECHAZADO DONANTE' || statusVenta === 'RECHAZADO ABD';
      
      if (isRechazado) {
        groups.rechazados.push(sale);
      }
      else if (isPendientePin) {
        groups.pendientePin.push(sale);
      }
      // AGENDADOS: AGENDADO o APROBADO ABD
      else if (statusVenta === 'AGENDADO' || statusVenta === 'APROBADO ABD') {
        groups.agendados.push(sale);
      }
      // ENTREGADOS PORTA: PORTABILITY + ENTREGADO/RENDIDO_AL_CLIENTE/ESIM
      else if (isPorta && isDelivered) {
        groups.entregadosPorta.push(sale);
      }
      // NO ENTREGADOS PORTA: PORTABILITY + NO es ENTREGADO ni RENDIDO_AL_CLIENTE ni ESIM
      else if (isPorta && !isDelivered) {
        groups.noEntregadosPorta.push(sale);
      }
      // NO ENTREGADOS LN: LÍNEA NUEVA + NO es ENTREGADO ni RENDIDO_AL_CLIENTE ni ESIM
      else if (isLN && !isDelivered) {
        groups.noEntregadosLN.push(sale);
      }
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
      case 'RECHAZADOS': return trackingGroups.rechazados;
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

  // console.log('🔍 [APP] Renderizando con estados:', { isAuthChecking, isAuthenticated, user: authUser });

  return (
    <>
      {/* Mostrar loading mientras autentica */}
      {isAuthChecking && (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
          <div className="text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 border-4 border-indigo-200 dark:border-indigo-800 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-[5px] border-4 border-fuchsia-500/30 border-b-transparent rounded-full animate-spin animation-delay-500"></div>
            </div>
            <div className="space-y-3">
              <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded-full animate-pulse mx-auto"></div>
              <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded-full animate-pulse mx-auto"></div>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar login solo si terminó de verificar y no está autenticado */}
      {!isAuthChecking && !isAuthenticated && (
        <LoginPage 
          onLogin={async (email, password) => {
            const success = await login(email, password);
            if (success) {
              setIsAuthenticated(true);
              setTransitioning(true);
              await refetch();
            }
            return success;
          }}
          error={authError}
        />
      )}

      {/* Transición suave después del login */}
      {transitioning && <TransitionOverlay onComplete={() => setTransitioning(false)} />}

      {/* Solo mostrar el contenido principal si está autenticado y terminó la transición */}
      {isAuthenticated && !transitioning && (
        <div className="min-h-screen pb-40">
          <ToastContainer />
          <Header 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            onOpenNomina={() => setShowNomina(true)} 
            onLogoClick={handleLogoClick}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            themeStyle={themeStyle}
            setThemeStyle={setThemeStyle}
          />

          {/* Indicador de Modo Inspección */}
          {inspectionMode && (
            <div className="fixed bottom-[2vh] left-1/2 -translate-x-1/2 z-[100] px-[2vw] py-[1vh] bg-indigo-600/90 backdrop-blur-md text-white font-black rounded-full shadow-2xl flex items-center gap-[1vw] border border-white/20 animate-bounce">
              <div className="w-[1vh] h-[1vh] rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="text-[clamp(0.7rem,1.4vh,1.8rem)] uppercase tracking-[0.2em]">Modo Inspección Activo</span>
              <button 
                onClick={disableInspectionMode}
                className="ml-[1vw] bg-white/20 hover:bg-white/40 p-[0.5vh] rounded-full transition-colors"
              >
                <svg className="w-[2vh] h-[2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}
          
          {showAdvancedFilters && <div className="fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setShowAdvancedFilters(false)}></div>}
          
          {/* KPI Dashboard - High Impact */}
          <div className="w-[98vw] mx-auto px-[1vw] mb-[2vh] relative z-20">
            <KPICards sales={sales || []} onFilterChange={handleKPIFilter} />
          </div>

          <main className="w-[98vw] max-w-none mx-auto px-[1vw] mt-[2vh]">
            {(activeTab === 'GESTIÓN' || activeTab === 'SEGUIMIENTO') && (
              <FilterBar 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                showAdvancedFilters={showAdvancedFilters}
                setShowAdvancedFilters={setShowAdvancedFilters}
                rowsPerPage={rowsPerPage}
                setRowsPerPage={setRowsPerPage}
                onExport={() => exportToCSV(filteredSales, `FLOR_Export`)}
                totalRecords={currentTotalRecords}
                currentPage={currentPage}
                totalPages={totalPages}
                onPrevPage={handlePrevPage}
                onNextPage={handleNextPage}
              />
            )}

            {showAdvancedFilters && (
              <AdvancedFilters 
                onClose={() => setShowAdvancedFilters(false)} 
                filters={filters} 
                setFilters={setFilters}
                uniqueAdvisors={uniqueAdvisors}
                planes={planesData}
                promociones={promocionesData}
                empresasOrigen={empresasOrigenData}
                celulas={celulasData}
              />
            )}

            <QuickActionFAB onAction={(type) => setCreatingSale({ productType: type === 'PORTA' ? ProductType.PORTABILITY : ProductType.NEW_LINE })} />

            <AIChatFAB onClick={() => setShowAIChat(true)} />

            {/* Renderizar contenido según la pestaña activa */}
            <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
            {activeTab === 'GESTIÓN' && (
              <GestionPage
                sales={filteredSales || []}
                isLoading={isVentasLoading}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
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
                onToggleSelect={handleToggleSelect}
                onViewSale={(sale) => setSelectedSale(sale)}
                onCommentSale={(sale) => setCommentingSale(sale)}
                counts={{
                  agendados: trackingGroups.agendados.length,
                  entregadosPorta: trackingGroups.entregadosPorta.length,
                  noEntregadosPorta: trackingGroups.noEntregadosPorta.length,
                  noEntregadosLN: trackingGroups.noEntregadosLN.length,
                  pendientePin: trackingGroups.pendientePin.length,
                  rechazados: trackingGroups.rechazados.length
                }}
              />
            )}

            {activeTab === 'REPORTES' && (
              <ReportesPage />
            )}

            {activeTab === 'OFERTAS' && (
              <OfertasPage onSell={(data) => setCreatingSale(data)} />
            )}
            </Suspense>
          </main>

          <AppModals
            selectedIds={selectedIds}
            filteredSales={filteredSales}
            selectAllChecked={selectAllChecked}
            handleToggleSelectAll={handleToggleSelectAll}
            isUpdatingBulk={bulkState.isUpdatingBulk}
            handleUpdateBoth={bulkActions.handleUpdateBoth}
            onClearSelection={() => setSelectedIds(new Set())}
            editingEstadoVenta={editingEstadoVenta}
            setEditingEstadoVenta={setEditingEstadoVenta}
            editingCorreo={editingCorreo}
            setEditingCorreo={setEditingCorreo}
            editingEstadoCorreo={editingEstadoCorreo}
            setEditingEstadoCorreo={setEditingEstadoCorreo}
            creatingSale={creatingSale}
            setCreatingSale={setCreatingSale}
            showNomina={showNomina}
            setShowNomina={setShowNomina}
            showUserForm={showUserForm}
            setShowUserForm={setShowUserForm}
            userFormCelulas={userFormCelulas}
            setUserFormCelulas={setUserFormCelulas}
            userFormEditingUser={userFormEditingUser}
            setUserFormEditingUser={setUserFormEditingUser}
            nominaRefreshKey={nominaRefreshKey}
            setNominaRefreshKey={setNominaRefreshKey}
            selectedSale={selectedSale}
            setSelectedSale={setSelectedSale}
            commentingSale={commentingSale}
            setCommentingSale={setCommentingSale}
            handleUpdateSale={bulkActions.handleUpdateSale}
            handleSingleUpdateStatus={bulkActions.handleSingleUpdateStatus}
            handleSingleUpdateLogistic={bulkActions.handleSingleUpdateLogistic}
            showCommandPalette={showCommandPalette}
            setShowCommandPalette={setShowCommandPalette}
            showAIChat={showAIChat}
            setShowAIChat={setShowAIChat}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            authUser={authUser}
            queryClient={queryClient}
          />


        </div>
      )}
    </>
  );
}
