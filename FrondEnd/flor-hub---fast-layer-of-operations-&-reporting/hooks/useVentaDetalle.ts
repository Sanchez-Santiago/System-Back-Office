// hooks/useVentaDetalle.ts
// Hook para obtener detalles completos de una venta con cacheo inteligente
// Usa el endpoint optimizado /ventas/:id/detalle

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getVentaDetalleCompleto, VentaDetalleCompletoResponse } from '../services/ventas';

interface UseVentaDetalleReturn {
  ventaDetalle: VentaDetalleCompletoResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useVentaDetalle = (ventaId: number | string | null): UseVentaDetalleReturn => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['ventaDetalleCompleto', ventaId],
    queryFn: async () => {
      if (!ventaId) return null;
      
      const envInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true';
      const isInspectionMode = envInspectionMode || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
          venta: { venta_id: Number(ventaId), sap: 'MOCK-SAP-001', sds: null, stl: null, chip: 'SIM', tipo_venta: 'PORTABILIDAD', fecha_creacion: new Date().toISOString() },
          cliente: { persona_id: 1, nombre: 'Empresa', apellido: 'Demo SA', documento: '30712345678', email: 'contacto@empresademo.com', telefono: '1122334455' },
          vendedor: { persona_id: 2, nombre: 'Asesor', apellido: 'Prueba', email: 'asesor@florhub.com' },
          plan: { plan_id: 1, nombre: 'Plan Premium Plus 100GB', precio: 15000, gigabyte: 100, descripcion: 'Plan ideal empresa' },
          promocion: { descuento: 50 },
          historial_estados: [], historial_correo: [], comentarios: []
        } as any;
      }
      
      return getVentaDetalleCompleto(ventaId);
    },
    enabled: !!ventaId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    ventaDetalle: data || null,
    isLoading,
    isError,
    error,
    refetch: refetch || (() => {})
  };
};

export default useVentaDetalle;