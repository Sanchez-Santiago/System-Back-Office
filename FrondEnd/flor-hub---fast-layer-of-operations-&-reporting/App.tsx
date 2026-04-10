// App.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Components
import { Header } from './components/layout/Header';
import { SaleModal } from './components/sale/SaleModal';
import { CommentModal } from './components/modals/CommentModal';
import { QuickActionFAB } from './components/layout/QuickActionFAB';
import { AIChatFAB } from './components/layout/AIChatFAB';
import { AIChatModal } from './components/layout/AIChatModal';
import { UpdateMenu } from './components/layout/UpdateMenu';
import { AdvancedFilters } from './components/layout/AdvancedFilters';
import { SaleFormModal } from './components/modals/SaleFormModal';
import { NominaModal } from './components/modals/NominaModal';
import { FilterBar } from './components/layout/FilterBar';
import { KPICards } from './components/analytics/KPICards';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { TransitionOverlay } from './components/common/TransitionOverlay';
import { LoginPage } from './pages/LoginPage';
import { GestionPage } from './pages/GestionPage';
import { SeguimientoPage } from './pages/SeguimientoPage';
import { ReportesPage } from './pages/ReportesPage';
import { OfertasPage } from './pages/OfertasPage';

// Forms
import { EstadoVentaFormModal } from './components/modals/EstadoVentaFormModal';
import { CorreoFormModal } from './components/modals/CorreoFormModal';
import { EstadoCorreoFormModal } from './components/modals/EstadoCorreoFormModal';

// Hooks & Contexts
import { useAuth } from './hooks/useAuth';
import { useAuthCheck } from './hooks/useAuthCheck';
import { useVentaDetalle } from './hooks/useVentaDetalle';
import { useCountry } from './contexts/CountryContext';
import { useToast } from './contexts/ToastContext';
import { useAppTheme } from './hooks/useAppTheme';
import { useSalesManager } from './hooks/useSalesManager';

// Utils & Types
import { api } from './services/api';
import { exportToCSV } from './utils/exportUtils';
import { AppTab, Sale, SaleStatus, ProductType, LogisticStatus } from './types';

export default function App() {
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  
  // --- Auth & Country ---
  const { isAuthenticated, isLoading: isAuthChecking, user: authUser, refetch, setIsAuthenticated } = useAuthCheck();
  const { login, error: authError, syncUser } = useAuth();
  const { setIsAdminView, setUserCountry, effectiveCountry } = useCountry();

  useEffect(() => {
    if (authUser) {
      syncUser(authUser);
      const permisos = authUser?.permisos?.map((p) => String(p).toUpperCase()) || [];
      setIsAdminView(permisos.includes('ADMIN') || permisos.includes('SUPERADMIN'));
      setUserCountry(authUser?.pais_venta || null);
    } else if (!isAuthChecking && !isAuthenticated) {
      syncUser(null);
    }
  }, [authUser, isAuthChecking, isAuthenticated, syncUser, setIsAdminView, setUserCountry]);

  // --- Theme ---
  const { isDarkMode, setIsDarkMode, themeStyle, setThemeStyle, toggleDarkMode } = useAppTheme();

  // --- Inspection Mode ---
  const [inspectionMode, setInspectionMode] = useState(() => localStorage.getItem('inspectionMode') === 'true');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  const handleLogoClick = () => {
    setLogoClickCount(prev => {
        const newCount = prev + 1;
        if (newCount === 5) {
            const newMode = !inspectionMode;
            setInspectionMode(newMode);
            localStorage.setItem('inspectionMode', String(newMode));
            return 0;
        }
        return newCount;
    });
  };

  useEffect(() => {
    if (logoClickCount > 0) {
      const timer = setTimeout(() => setLogoClickCount(0), 3000);
      return () => clearTimeout(timer);
    }
  }, [logoClickCount]);

  // --- Navigation States ---
  const [activeTab, setActiveTab] = useState<AppTab>(() => (localStorage.getItem('activeTab') as AppTab) || 'GESTIÓN');
  const [trackingSubTab, setTrackingSubTab] = useState<'AGENDADOS' | 'ENTREGADOS_PORTA' | 'NO_ENTREGADOS_PORTA' | 'NO_ENTREGADOS_LN' | 'PENDIENTE_PIN' | 'RECHAZADOS' | 'SIN_DOCUMENTACION'>(() => 
    (localStorage.getItem('trackingSubTab') as any) || 'AGENDADOS'
  );

  useEffect(() => { localStorage.setItem('activeTab', activeTab); }, [activeTab]);
  useEffect(() => { localStorage.setItem('trackingSubTab', trackingSubTab); }, [trackingSubTab]);

  // --- Sales Manager (Hook Decomposed) ---
  const salesManager = useSalesManager(isAuthenticated, effectiveCountry, trackingSubTab);
  const { 
    sales, filteredSales, trackingGroups, currentVisibleInTracking, uniqueAdvisors,
    isLoading: isVentasLoading, totalPages, currentPage, rowsPerPage, 
    setCurrentPage, setRowsPerPage,
    searchQuery, setSearchQuery, 
    startDate, setStartDate, 
    endDate, setEndDate,
    filters, setFilters, 
    planesData, promocionesData, empresasOrigenData, celulasData,
    showAdvancedFilters, setShowAdvancedFilters,
    selectedIds, setSelectedIds, isUpdatingBulk,
    handleKPIFilter, handleUpdateStatus, handleUpdateLogistic
  } = salesManager;

  // --- Local UI States (Modals, etc.) ---
  const [showNomina, setShowNomina] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [commentingSale, setCommentingSale] = useState<Sale | null>(null);
  const [creatingSale, setCreatingSale] = useState<Partial<Sale> | null>(null);
  const [editingEstadoVenta, setEditingEstadoVenta] = useState<Sale | null>(null);
  const [editingCorreo, setEditingCorreo] = useState<Sale | null>(null);
  const [editingEstadoCorreo, setEditingEstadoCorreo] = useState<{sale: Sale, currentEstado?: string} | null>(null);

  // Persistence for open modal
  useEffect(() => {
    if (selectedSale) localStorage.setItem('selectedSaleId', String(selectedSale.id));
    else localStorage.removeItem('selectedSaleId');
  }, [selectedSale]);

  useEffect(() => {
    const savedId = localStorage.getItem('selectedSaleId');
    if (savedId && sales?.length > 0 && !selectedSale) {
      const foundSale = sales.find(s => String(s.id) === savedId);
      if (foundSale) setSelectedSale(foundSale);
    }
  }, [sales, selectedSale]);

  // Shortcuts
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

  // --- Logic Handlers (Detailed Updates) ---
  const handleUpdateBoth = useCallback(async (saleStatus: SaleStatus | null, logisticStatus: LogisticStatus | null) => {
    if (selectedIds.size === 0) return;
    try {
      if (saleStatus) await handleUpdateStatus(saleStatus);
      if (logisticStatus) await handleUpdateLogistic(logisticStatus);
      addToast({ type: 'success', title: 'Actualización Exitosa', message: 'Se procesaron los estados correctamente' });
      queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: 'Falla parcial en actualización masiva' });
    } finally {
      setSelectedIds(new Set());
    }
  }, [selectedIds, handleUpdateStatus, handleUpdateLogistic, queryClient, addToast, setSelectedIds]);

  const handleUpdateSale = useCallback(async (updatedSale: any) => {
    try {
      const ventaId = String(updatedSale.id).replace('V-', '');
      const ventaData = {
        sds: updatedSale.sds, chip: updatedSale.chip, stl: updatedSale.stl,
        tipo_venta: updatedSale.tipoVenta, sap: updatedSale.sap,
        cliente_id: updatedSale.cliente?.id,
        plan_id: updatedSale.plan?.id || updatedSale.plan_id,
        promocion_id: updatedSale.promocion?.id || updatedSale.promocion_id,
        empresa_origen_id: updatedSale.empresa_origen_id,
        portabilidad: updatedSale.portabilidad
      };
      const response = await api.put(`/ventas/${ventaId}`, ventaData);
      if (response.success) {
        addToast({ type: 'success', title: 'Venta Actualizada', message: 'Cambios guardados' });
        queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
      }
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    }
  }, [queryClient, addToast]);

  const handleSingleUpdateStatus = useCallback(async (status: SaleStatus, comment: string) => {
    if (!selectedSale) return;
    try {
      const ventaId = String(selectedSale.id).replace('V-', '');
      const response = await api.post('/estados/bulk', {
        estados: [{ venta_id: Number(ventaId), estado: status, descripcion: comment }]
      });
      if (response.success) {
        addToast({ type: 'success', title: 'Estado Actualizado', message: 'Correcto' });
        queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
        queryClient.invalidateQueries({ queryKey: ['ventaDetalleCompleto', ventaId] });
      }
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    }
  }, [selectedSale, queryClient, addToast]);

  const handleSingleUpdateLogistic = useCallback(async (status: LogisticStatus, comment: string) => {
    if (!selectedSale || !selectedSale.sap) return;
    try {
      const response = await api.post('/estados-correo/bulk', {
        estados: [{ sap_id: selectedSale.sap, estado: status, descripcion: comment }]
      });
      if (response.success) {
        addToast({ type: 'success', title: 'Envío Actualizado', message: 'Correcto' });
        queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
        const ventaId = String(selectedSale.id).replace('V-', '');
        queryClient.invalidateQueries({ queryKey: ['ventaDetalleCompleto', ventaId] });
      }
    } catch (e: any) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    }
  }, [selectedSale, queryClient, addToast]);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-900 dark:text-white font-black text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated && !transitioning) {
    return (
      <LoginPage 
        onLogin={async (email, password) => {
          const success = await login(email, password);
          if (success) { setIsAuthenticated(true); setTransitioning(true); await refetch(); }
          return success;
        }}
        error={authError}
      />
    );
  }

  return (
    <>
      <ToastContainer />
      {transitioning && <TransitionOverlay onComplete={() => setTransitioning(false)} />}
      
      {isAuthenticated && !transitioning && (
        <div className="min-h-screen pb-40">
          <Header 
            activeTab={activeTab} setActiveTab={setActiveTab} onOpenNomina={() => setShowNomina(true)} 
            onLogoClick={handleLogoClick} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
            themeStyle={themeStyle} setThemeStyle={setThemeStyle}
          />

          {inspectionMode && (
            <div className="fixed bottom-[2vh] left-1/2 -translate-x-1/2 z-[100] px-[2vw] py-[1vh] bg-indigo-600/90 backdrop-blur-md text-white font-black rounded-full shadow-2xl flex items-center gap-[1vw] border border-white/20 animate-bounce">
              <div className="w-[1vh] h-[1vh] rounded-full bg-yellow-400 animate-pulse"></div>
              <span className="text-[clamp(0.7rem,1.4vh,1.8rem)] uppercase tracking-[0.2em]">Modo Inspección Activo</span>
              <button onClick={() => { setInspectionMode(false); localStorage.setItem('inspectionMode', 'false'); }} className="ml-[1vw] bg-white/20 hover:bg-white/40 p-[0.5vh] rounded-full transition-colors">
                <svg className="w-[2vh] h-[2vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
          )}
          
          <div className="w-[98vw] mx-auto px-[1vw] mb-[2vh] relative z-20">
            <KPICards sales={sales || []} onFilterChange={handleKPIFilter} />
          </div>

          <main className="w-[98vw] max-w-none mx-auto px-[1vw] mt-[2vh]">
            {(activeTab === 'GESTIÓN' || activeTab === 'SEGUIMIENTO') && (
              <FilterBar 
                searchQuery={searchQuery} setSearchQuery={setSearchQuery} startDate={startDate} setStartDate={setStartDate} endDate={endDate} setEndDate={setEndDate}
                showAdvancedFilters={showAdvancedFilters} setShowAdvancedFilters={setShowAdvancedFilters}
                rowsPerPage={rowsPerPage} setRowsPerPage={setRowsPerPage}
                onExport={() => exportToCSV(filteredSales, `FLORHUB_Export`)}
                totalRecords={filteredSales.length} currentPage={currentPage} totalPages={totalPages}
                onPrevPage={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                onNextPage={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
              />
            )}

            {showAdvancedFilters && (
              <AdvancedFilters 
                onClose={() => setShowAdvancedFilters(false)} filters={filters} setFilters={setFilters}
                uniqueAdvisors={uniqueAdvisors} planes={planesData} promociones={promocionesData}
                empresasOrigen={empresasOrigenData} celulas={celulasData}
              />
            )}

            <QuickActionFAB onAction={(type) => setCreatingSale({ productType: type === 'PORTA' ? ProductType.PORTABILITY : ProductType.NEW_LINE })} />
            <AIChatFAB onClick={() => setShowAIChat(true)} />

            {activeTab === 'GESTIÓN' && (
              <GestionPage
                sales={filteredSales || []} isLoading={isVentasLoading} selectedIds={selectedIds}
                onToggleSelect={(id) => setSelectedIds(prev => (prev.has(id) ? (p => { p.delete(id); return new Set(p); })(new Set(prev)) : new Set(prev).add(id)))}
                onViewSale={setSelectedSale} onCommentSale={setCommentingSale}
              />
            )}

            {activeTab === 'SEGUIMIENTO' && (
              <SeguimientoPage
                trackingSubTab={trackingSubTab} setTrackingSubTab={setTrackingSubTab}
                sales={currentVisibleInTracking || []} selectedIds={selectedIds}
                onToggleSelect={(id) => setSelectedIds(prev => (prev.has(id) ? (p => { p.delete(id); return new Set(p); })(new Set(prev)) : new Set(prev).add(id)))}
                onViewSale={setSelectedSale} onCommentSale={setCommentingSale}
                counts={{
                  agendados: trackingGroups.agendados.length, entregadosPorta: trackingGroups.entregadosPorta.length,
                  noEntregadosPorta: trackingGroups.noEntregadosPorta.length, noEntregadosLN: trackingGroups.noEntregadosLN.length,
                  pendientePin: trackingGroups.pendientePin.length, rechazados: trackingGroups.rechazados.length,
                  sinDocumentacion: trackingGroups.sinDocumentacion.length
                }}
              />
            )}

            {activeTab === 'REPORTES' && (
              <ReportesPage 
                advisors={Array.from(new Set(sales?.map(s => s.advisor).filter(Boolean) || []))}
                supervisors={Array.from(new Set(sales?.map(s => s.supervisor).filter(Boolean) || []))}
              />
            )}

            {activeTab === 'OFERTAS' && <OfertasPage onSell={(data) => setCreatingSale(data)} />}
          </main>

          {selectedIds.size > 0 && (
            <UpdateMenu 
              selectedCount={selectedIds.size} onUpdateBoth={handleUpdateBoth}
              onClear={() => setSelectedIds(new Set())} isUpdating={isUpdatingBulk}
            />
          )}
          
          {editingEstadoVenta && <EstadoVentaFormModal sale={editingEstadoVenta} onClose={() => setEditingEstadoVenta(null)} onSubmit={() => setEditingEstadoVenta(null)} />}
          {editingCorreo && <CorreoFormModal sale={editingCorreo} onClose={() => setEditingCorreo(null)} onSubmit={() => setEditingCorreo(null)} />}
          {editingEstadoCorreo && <EstadoCorreoFormModal sapId={editingEstadoCorreo.sale.id} currentEstado={editingEstadoCorreo.currentEstado} onClose={() => setEditingEstadoCorreo(null)} onSubmit={() => setEditingEstadoCorreo(null)} />}
          {creatingSale && <SaleFormModal initialData={creatingSale} onClose={() => setCreatingSale(null)} onVentaCreada={() => { setCreatingSale(null); queryClient.invalidateQueries({ queryKey: ['ventasUI'] }); }} />}
          {showNomina && <NominaModal onClose={() => setShowNomina(false)} />}
          
          {selectedSale && <SaleModal sale={selectedSale as any} onClose={() => setSelectedSale(null)} onUpdate={handleUpdateSale} onUpdateStatus={handleSingleUpdateStatus} onUpdateLogistic={handleSingleUpdateLogistic} />}
          
          {showCommandPalette && (
            <CommandPalette 
              onClose={() => setShowCommandPalette(false)} 
              onNavigate={(tab) => { setActiveTab(tab); setShowCommandPalette(false); }}
              onSearch={(q) => { setSearchQuery(q); setShowCommandPalette(false); }}
              onAction={(action) => {
                if (action === 'NEW_SALE') setCreatingSale({ productType: ProductType.PORTABILITY });
                if (action === 'TOGGLE_THEME') toggleDarkMode();
                setShowCommandPalette(false);
              }}
            />
          )}

          {showAIChat && <AIChatModal onClose={() => setShowAIChat(false)} />}
          {commentingSale && (
            <CommentModal 
              ventaId={Number(commentingSale.id.replace('V-', ''))} customerName={commentingSale.customerName}
              onClose={() => setCommentingSale(null)} onSuccess={() => { setCommentingSale(null); queryClient.invalidateQueries({ queryKey: ['ventasUI'] }); }}
            />
          )}
        </div>
      )}
    </>
  );
}
