// hooks/useVentasQuery.ts
// Hook para gestión de ventas con React Query

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getVentas, VentaListResponse, mapVentaToSale } from '../services/ventas';
import { Sale } from '../types';

interface UseVentasQueryReturn {
  ventas: Sale[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  pagination: VentaListResponse['pagination'];
  refetch: () => void;
}

export const useVentasQuery = (
  page: number = 1, 
  limit: number = 50,
  filters?: {
    startDate?: string;
    endDate?: string;
    searchQuery?: string;
    advisor?: string;
    status?: string;
    logisticStatus?: string;
  }
): UseVentasQueryReturn => {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['ventas', page, limit, filters],
    queryFn: async () => {
      if (limit === 0) return { ventas: [], pagination: { page: 1, limit: 0, total: 0 } };
      return getVentas(page, limit, filters);
    },
    select: (data) => ({
      ...data,
      ventas: data.ventas.map(v => mapVentaToSale(v))
    }),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    ventas: data?.ventas || [],
    isLoading,
    isError,
    error,
    pagination: data?.pagination || { page: 1, limit, total: 0 },
    refetch: refetch || (() => {})
  };
};

export default useVentasQuery;