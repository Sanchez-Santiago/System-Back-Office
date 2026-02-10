
import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { SaleModal } from './components/SaleModal';
import { CommentModal } from './components/CommentModal';
import { QuickActionFAB } from './components/QuickActionFAB';
import { UpdateMenu } from './components/UpdateMenu';
import { AdvancedFilters } from './components/AdvancedFilters';
import { SaleFormModal } from './components/SaleFormModal';
import { NominaModal } from './components/NominaModal';
import { FilterBar } from './components/FilterBar';

// Nuevos modales con validación Zod
import { EstadoVentaFormModal } from './components/EstadoVentaFormModal';
import { CorreoFormModal } from './components/CorreoFormModal';
import { EstadoCorreoFormModal } from './components/EstadoCorreoFormModal';

// Páginas
import { LoginPage } from './pages/LoginPage';
import { GestionPage } from './pages/GestionPage';
import { SeguimientoPage } from './pages/SeguimientoPage';
import { ReportesPage } from './pages/ReportesPage';
import { OfertasPage } from './pages/OfertasPage';

import { MOCK_SALES } from './constants';
import { AppTab, Sale, SaleStatus, ProductType, LogisticStatus, LineStatus } from './types';

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
      s.originMarket,
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

export default function App() {
  // Autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Estado de Navegación
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

  // Estado de Datos y Modales
  const [sales, setSales] = useState<Sale[]>(MOCK_SALES);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [commentingSale, setCommentingSale] = useState<Sale | null>(null);
  const [creatingSale, setCreatingSale] = useState<Partial<Sale> | null>(null);

  // Nuevos estados para modales Zod
  const [editingEstadoVenta, setEditingEstadoVenta] = useState<Sale | null>(null);
  const [editingCorreo, setEditingCorreo] = useState<Sale | null>(null);
  const [editingEstadoCorreo, setEditingEstadoCorreo] = useState<{sale: Sale, currentEstado?: string} | null>(null);

  const uniqueAdvisors = useMemo(() => Array.from(new Set(sales.map(s => s.advisor))), [sales]);
  const uniqueSupervisors = useMemo(() => Array.from(new Set(sales.map(s => s.supervisor))), [sales]);

  // Lógica de Filtrado Global
  const filteredSales = useMemo(() => sales.filter(sale => {
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

  // Agrupación para Seguimiento
  const trackingGroups = useMemo(() => {
    const groups = { agendados: [] as Sale[], entregadosPorta: [] as Sale[], noEntregadosPorta: [] as Sale[], noEntregadosLN: [] as Sale[], pendientePin: [] as Sale[] };
    filteredSales.forEach(sale => {
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

  // Paginación y Visibilidad
  const currentTotalRecords = activeTab === 'SEGUIMIENTO' ? currentVisibleInTracking.length : filteredSales.length; 
  const visibleSales = useMemo(() => {
    const list = activeTab === 'SEGUIMIENTO' ? currentVisibleInTracking : filteredSales;
    if (rowsPerPage === 'TODOS') return list;
    const start = (currentPage - 1) * (rowsPerPage as number);
    return list.slice(start, start + (rowsPerPage as number));
  }, [filteredSales, currentVisibleInTracking, currentPage, rowsPerPage, activeTab]);

  const handleToggleSelect = (id: string) => { 
    setSelectedIds(prev => { 
      const next = new Set(prev); 
      if (next.has(id)) next.delete(id); else next.add(id); 
      return next; 
    }); 
  };

  const renderContent = () => {
    switch(activeTab) {
      case 'GESTIÓN':
        return (
          <GestionPage 
            sales={visibleSales} 
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onViewSale={setSelectedSale}
            onCommentSale={setCommentingSale}
          />
        );
      case 'SEGUIMIENTO':
        return (
          <SeguimientoPage 
            trackingSubTab={trackingSubTab}
            setTrackingSubTab={setTrackingSubTab}
            sales={visibleSales}
            selectedIds={selectedIds}
            onToggleSelect={handleToggleSelect}
            onViewSale={setSelectedSale}
            onCommentSale={setCommentingSale}
            counts={{
              agendados: trackingGroups.agendados.length,
              entregadosPorta: trackingGroups.entregadosPorta.length,
              noEntregadosPorta: trackingGroups.noEntregadosPorta.length,
              noEntregadosLN: trackingGroups.noEntregadosLN.length,
              pendientePin: trackingGroups.pendientePin.length
            }}
          />
        );
      case 'REPORTES':
        return <ReportesPage advisors={uniqueAdvisors} supervisors={uniqueSupervisors} />;
      case 'OFERTAS':
        return <OfertasPage onSell={setCreatingSale} />;
      default:
        return null;
    }
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
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
            setEndDate={setEndDate}
            showAdvancedFilters={showAdvancedFilters}
            setShowAdvancedFilters={setShowAdvancedFilters}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            onExport={() => exportToCSV(visibleSales, `FLORHUB_Export`)}
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

        {renderContent()}
      </main>

      {/* Overlays y Modales Globales */}
      {selectedIds.size > 0 && (
        <UpdateMenu 
          selectedCount={selectedIds.size} 
          onUpdateStatus={(s) => { 
            setSales(prev => prev.map(sale => selectedIds.has(sale.id) ? {...sale, status: s} : sale)); 
            setSelectedIds(new Set()); 
          }} 
          onUpdateLogistic={(l) => { 
            setSales(prev => prev.map(sale => selectedIds.has(sale.id) ? {...sale, logisticStatus: l} : sale)); 
            setSelectedIds(new Set()); 
          }} 
          onUpdateLine={(line) => { 
            setSales(prev => prev.map(sale => selectedIds.has(sale.id) ? {...sale, logisticStatus: LogisticStatus.INICIAL, lineStatus: line} : sale)); 
            setSelectedIds(new Set()); 
          }} 
          onClear={() => setSelectedIds(new Set())} 
        />
      )}

      <QuickActionFAB onAction={(type) => setCreatingSale({ productType: type === 'PORTA' ? ProductType.PORTABILITY : ProductType.NEW_LINE })} />
      
      {selectedSale && <SaleModal sale={selectedSale} onClose={() => setSelectedSale(null)} />}
      
      {commentingSale && (
        <CommentModal 
          sale={commentingSale} 
          onClose={() => setCommentingSale(null)} 
          onAddComment={(comm) => { 
            setSales(prev => prev.map(s => s.id === commentingSale.id ? { ...s, comments: [...s.comments, { id: `c-${Date.now()}`, ...comm, date: new Date().toISOString().slice(0, 16).replace('T', ' '), author: 'OPERADOR_ADMIN' }] } : s)); 
            setCommentingSale(null); 
          }} 
        />
      )}
      
      {creatingSale && (
        <SaleFormModal 
          initialData={creatingSale} 
          onClose={() => setCreatingSale(null)} 
          onSubmit={(data) => { 
            setSales([{ id: `V-${11000 + sales.length}`, status: SaleStatus.INICIAL, logisticStatus: LogisticStatus.INICIAL, lineStatus: LineStatus.PENDIENTE_PRECARGA, date: new Date().toISOString().split('T')[0], amount: data.amount || 0, comments: [], advisor: 'OPERADOR_ADMIN', supervisor: data.supervisor || 'Alberto Gómez', customerName: data.customerName || 'Nuevo Cliente', dni: data.dni || '', phoneNumber: data.phoneNumber || '', ...data } as Sale, ...sales]); 
            setCreatingSale(null); 
            setActiveTab('GESTIÓN'); 
          }} 
        />
      )}

      {/* Nuevos modales Zod */}
      {editingEstadoVenta && (
        <EstadoVentaFormModal
          sale={editingEstadoVenta}
          onClose={() => setEditingEstadoVenta(null)}
          onSubmit={(data) => {
            // Aquí se implementaría la lógica para guardar el cambio de estado
            setSales(prev => prev.map(s => 
              s.id === editingEstadoVenta.id 
                ? { ...s, status: data.estado as SaleStatus } 
                : s
            ));
            setEditingEstadoVenta(null);
          }}
        />
      )}

      {editingCorreo && (
        <CorreoFormModal
          sale={editingCorreo}
          onClose={() => setEditingCorreo(null)}
          onSubmit={(data) => {
            // Aquí se implementaría la lógica para guardar el correo
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
            // Aquí se implementaría la lógica para cambiar estado de correo
            setSales(prev => prev.map(s => 
              s.id === editingEstadoCorreo.sale.id 
                ? { ...s, logisticStatus: data.estado as LogisticStatus } 
                : s
            ));
            setEditingEstadoCorreo(null);
          }}
        />
      )}
      
      {showNomina && <NominaModal onClose={() => setShowNomina(false)} />}
    </div>
  );
}
