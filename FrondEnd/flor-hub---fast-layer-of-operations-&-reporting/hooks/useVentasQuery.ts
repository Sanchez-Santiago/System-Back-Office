// hooks/useVentasQuery.ts
// Hook para gestión de ventas con React Query

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getVentas, VentaListResponse } from '../services/ventas';

interface UseVentasQueryReturn {
  ventas: VentaListResponse['ventas'];
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
  const buildQueryString = () => {
    const params = new URLSearchParams();
    
    if (filters?.startDate) params.append('start', filters.startDate);
    if (filters?.endDate) params.append('end', filters.endDate);
    if (filters?.searchQuery) params.append('search', filters.searchQuery);
    if (filters?.advisor) params.append('advisor', filters.advisor);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.logisticStatus) params.append('logistic', filters.logisticStatus);
    
    return params.toString() ? `&${params.toString()}` : '';
  };

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
      
      return getVentas(page, limit);
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
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