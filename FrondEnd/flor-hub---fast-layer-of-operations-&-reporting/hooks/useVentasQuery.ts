// hooks/useVentasQuery.ts
// Hook para gestión de ventas con React Query
// Usa el endpoint optimizado /ventas/ui

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVentasUI, mapVentaUIToSale } from '../services/ventas';
import { getInspectionSales } from '../mocks/ventasInspeccion';
import { useCountry } from '../contexts/CountryContext';
import { Sale } from '../types';

interface UseVentasQueryReturn {
  ventas: Sale[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  total: number;
  page: number;
  limit: number;
  refetch: () => void;
}

/**
 * Hook principal para listar ventas con soporte de filtros y paginación
 */
export const useVentasQuery = (
  page: number = 1, 
  limit: number = 50,
  filters?: {
    startDate?: string;
    endDate?: string;
    search?: string;
  }
): UseVentasQueryReturn => {
  const { effectiveCountry } = useCountry();
  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['ventasUI', page, limit, filters, effectiveCountry],
    queryFn: async () => {
      if (limit === 0) return { ventas: [], total: 0, page: 1, limit: 0 };
      
      const isInspection = localStorage.getItem('inspectionMode') === 'true';
      let result = { ventas: [], total: 0, page: 1, limit: limit };

      try {
        result = await getVentasUI(page, limit, filters, effectiveCountry);
      } catch (error) {
        console.warn('Error cargando ventas desde API, intentando modo inspección:', error);
        // Si no estamos en modo inspección, propagamos el error
        if (!isInspection) throw error;
      }
      
      // Manejar Modo Inspección
      if (isInspection) {
        const mocks = getInspectionSales();
        return {
          ...result,
          ventas: [...mocks, ...result.ventas],
          total: Number(result.total || 0) + mocks.length
        };
      }
      
      return result;
    },
    select: (response) => {
      const ventas = response.ventas?.map((v: any) => {
        // Si ya tiene la estructura de Sale (id como string y camelCase), lo devolvemos tal cual
        if (v.id && typeof v.id === 'string' && v.productType) {
          return v as Sale;
        }
        // De lo contrario, lo mapeamos desde el formato de la API (VentaUIResponse)
        return mapVentaUIToSale(v);
      }) || [];
      
      return {
        ventas,
        total: Number(response.total) || 0,
        page: Number(response.page) || 1,
        limit: Number(response.limit) || 50
      };
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    ventas: data?.ventas || [],
    isLoading,
    isError,
    error,
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 50,
    refetch: refetch || (() => {})
  };
};

/**
 * Hook para la creación de nuevas ventas
 */
export const useCreateSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newSale: any) => 
      import('../services/ventas').then(m => m.createVenta(newSale)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
    },
  });
};

/**
 * Hook para la actualización de ventas existentes
 */
export const useUpdateSaleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string | number; data: any }) => 
      import('../services/ventas').then(m => m.updateVenta(id, data)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ventasUI'] });
      queryClient.invalidateQueries({ queryKey: ['ventaDetalleCompleto'] });
    },
  });
};

export default useVentasQuery;
