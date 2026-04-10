import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useVentasQuery } from './useVentasQuery';
import { Sale, SaleStatus, LogisticStatus, ProductType } from '../types';

export function useSalesManager(isAuthenticated: boolean, effectiveCountry: string | null, trackingSubTab: string) {
  const queryClient = useQueryClient();
  const { addToast } = useToast();

  // --- Search & Date Filters ---
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- Advanced Filters ---
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

  const [planesData, setPlanesData] = useState<any[]>([]);
  const [promocionesData, setPromocionesData] = useState<any[]>([]);
  const [empresasOrigenData, setEmpresasOrigenData] = useState<any[]>([]);
  const [celulasData, setCelulasData] = useState<number[]>([]);

  // --- UI State ---
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isUpdatingBulk, setIsUpdatingBulk] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'TODOS'>(50);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch filter metadata
  useEffect(() => {
    const fetchFilterData = async () => {
      if (!isAuthenticated) return;

      const isInspectionMode = localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        setEmpresasOrigenData([
          { empresa_origen_id: 1, nombre_empresa: 'Personal AR', pais: 'Argentina' },
          { empresa_origen_id: 2, nombre_empresa: 'Claro AR', pais: 'Argentina' }
        ]);
        setPlanesData([{ plan_id: 1, nombre: 'Plan Personal 5GB AR', descripcion: 'Datos libres AR' }]);
        setPromocionesData([{ promocion_id: 1, nombre: 'Promo Verano AR 50%', descuento: 50 }]);
        setCelulasData([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        return;
      }

      const withPais = (path: string) => {
        if (!effectiveCountry) return path;
        return `${path}${path.includes('?') ? '&' : '?'}pais=${encodeURIComponent(effectiveCountry)}`;
      };
      
      try {
        const [empresasRes, planesRes, promoRes] = await Promise.all([
          api.get(withPais('/empresa-origen')),
          api.get(withPais('/planes')),
          api.get(withPais('/promociones'))
        ]);

        if (empresasRes.success) setEmpresasOrigenData(empresasRes.data || []);
        if (planesRes.success) setPlanesData(planesRes.data || []);
        if (promoRes.success) setPromocionesData(promoRes.data || []);
        setCelulasData([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      } catch (error) {
        console.error('Error cargando datos de filtros:', error);
      }
    };

    fetchFilterData();
  }, [isAuthenticated, effectiveCountry]);

  // Main entries query
  const { ventas, isLoading, error, total, refetch } = useVentasQuery(
    isAuthenticated ? currentPage : 1, 
    isAuthenticated ? (rowsPerPage === 'TODOS' ? 1000 : rowsPerPage) : 0,
    { startDate, endDate, search: searchQuery }
  );

  const sales = useMemo(() => ventas || [], [ventas]);

  // Global Filtering Logic
  const filteredSales = useMemo(() => sales.filter(sale => {
    const query = searchQuery.toLowerCase();
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
  }), [searchQuery, filters, startDate, endDate, sales]);

  const uniqueAdvisors = useMemo(() => 
    Array.from(new Set(sales.map(s => s.advisor).filter(Boolean))), 
    [sales]
  );

  // Tracking Groups Logic
  const trackingGroups = useMemo(() => {
    const groups = { agendados: [] as Sale[], entregadosPorta: [] as Sale[], noEntregadosPorta: [] as Sale[], noEntregadosLN: [] as Sale[], pendientePin: [] as Sale[], rechazados: [] as Sale[], sinDocumentacion: [] as Sale[] };
    filteredSales.forEach(sale => {
      const isPorta = sale.productType === ProductType.PORTABILITY;
      const isLN = sale.productType === ProductType.NEW_LINE;
      const isDelivered = sale.logisticStatus === 'ENTREGADO' || sale.logisticStatus === 'RENDIDO_AL_CLIENTE' || sale.logisticStatus === 'ESIM';
      const statusVenta = sale.status as string;
      
      if (isPorta && !sale.documentacion) groups.sinDocumentacion.push(sale);

      const isPendientePin = ['CREADO', 'PENDIENTE DOCU/PIN', 'PIN INGRESADO', 'PENDIENTE CARGA PIN'].includes(statusVenta);
      const isRechazado = statusVenta === 'RECHAZADO DONANTE' || statusVenta === 'RECHAZADO ABD';
      
      if (isRechazado) groups.rechazados.push(sale);
      else if (isPendientePin) groups.pendientePin.push(sale);
      else if (statusVenta === 'AGENDADO' || statusVenta === 'APROBADO ABD') groups.agendados.push(sale);
      else if (isPorta && isDelivered) groups.entregadosPorta.push(sale);
      else if (isPorta && !isDelivered) groups.noEntregadosPorta.push(sale);
      else if (isLN && !isDelivered) groups.noEntregadosLN.push(sale);
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
      case 'SIN_DOCUMENTACION': return trackingGroups.sinDocumentacion;
      default: return [];
    }
  }, [trackingSubTab, trackingGroups]);

  const totalPages = Math.ceil(total / (rowsPerPage === 'TODOS' ? 1000 : rowsPerPage)) || 1;

  // Reset page on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [startDate, endDate, searchQuery, filters]);

  // --- Bulk Actions ---
  const handleKPIFilter = useCallback((filtersKPI: any) => {
    setFilters(prev => ({ ...prev, ...filtersKPI }));
  }, []);

  const handleUpdateStatus = useCallback(async (status: SaleStatus) => {
    if (selectedIds.size === 0) return;
    setIsUpdatingBulk(true);
    try {
      const estadosToUpdate = Array.from(selectedIds).map(id => ({
        venta_id: Number(id.replace('V-', '')),
        estado: status,
        descripcion: 'Actualización masiva desde UI'
      }));

      const response = await api.post('/estados/bulk', { estados: estadosToUpdate });
      
      if (response.success) {
        addToast({ type: 'success', title: 'Estados Actualizados', message: `Se actualizaron ${selectedIds.size} ventas` });
        queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
        setSelectedIds(new Set());
      }
    } finally {
      setIsUpdatingBulk(false);
    }
  }, [selectedIds, queryClient, addToast]);

  const handleUpdateLogistic = useCallback(async (status: LogisticStatus) => {
    if (selectedIds.size === 0) return;
    setIsUpdatingBulk(true);
    try {
      const ventasConCorreos = sales.filter(s => selectedIds.has(s.id) && s.sap);
      const correosToUpdate = ventasConCorreos.map(venta => ({
        sap_id: venta.sap,
        estado: status,
        descripcion: 'Actualización masiva desde UI'
      }));

      if (correosToUpdate.length > 0) {
        const response = await api.post('/estados-correo/bulk', { estados: correosToUpdate });
        if (response.success) {
          addToast({ type: 'success', title: 'Correos Actualizados', message: `Se actualizaron ${correosToUpdate.length} correos` });
          queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
          setSelectedIds(new Set());
        }
      }
    } finally {
      setIsUpdatingBulk(false);
    }
  }, [selectedIds, sales, queryClient, addToast]);

  return {
    sales, filteredSales, trackingGroups, currentVisibleInTracking, uniqueAdvisors,
    isLoading, total, totalPages, currentPage, rowsPerPage, 
    setCurrentPage, setRowsPerPage,
    searchQuery, setSearchQuery, 
    startDate, setStartDate, 
    endDate, setEndDate,
    filters, setFilters, 
    planesData, promocionesData, empresasOrigenData, celulasData,
    showAdvancedFilters, setShowAdvancedFilters,
    selectedIds, setSelectedIds, isUpdatingBulk,
    handleKPIFilter, handleUpdateStatus, handleUpdateLogistic,
    refetchSales: refetch
  };
}
