// hooks/useVentaDetalle.ts
// Hook para obtener detalles completos de una venta con cacheo inteligente

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getVentaCompleta, VentaCompletaResponse } from '../services/ventaDetalle';

interface UseVentaDetalleReturn {
  ventaDetalle: VentaCompletaResponse | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
}

import { getInspectionDetailById } from '../mocks/ventasInspeccion';

export const useVentaDetalle = (ventaId: number | string | null): UseVentaDetalleReturn => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['ventaCompleta', ventaId],
    queryFn: async () => {
      if (!ventaId) return null;
      
      // Si es un ID de inspección, retornar mock local
      if (typeof ventaId === 'string' && ventaId.startsWith('INS-')) {
        return getInspectionDetailById(ventaId);
      }
      
      return getVentaCompleta(ventaId);
    },
    enabled: !!ventaId, // Solo ejecutar si hay un ID
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
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