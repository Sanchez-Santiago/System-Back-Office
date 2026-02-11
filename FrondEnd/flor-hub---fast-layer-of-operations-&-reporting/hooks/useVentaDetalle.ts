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

export const useVentaDetalle = (ventaId: number | null): UseVentaDetalleReturn => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['ventaCompleta', ventaId],
    queryFn: () => {
      if (!ventaId) return null;
      return getVentaCompleta(ventaId);
    },
    enabled: !!ventaId, // Solo ejecutar si hay un ID
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: 2,
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