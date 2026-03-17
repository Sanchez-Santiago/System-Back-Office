import { useQuery } from '@tanstack/react-query';
import { getEmpresasOrigen, getPlanesPorEmpresa, getPromocionesPorEmpresa } from '../services/plan';
import { useCountry } from '../contexts/CountryContext';

// Cache configuration
const STALE_TIME = 10 * 60 * 1000; // 10 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export const useEmpresasQuery = () => {
  const { effectiveCountry } = useCountry();
  return useQuery({
    queryKey: ['empresasOrigen', effectiveCountry],
    queryFn: async () => {
      const result = await getEmpresasOrigen(effectiveCountry);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};

export const usePlanesQuery = (empresaId: number | null) => {
  const { effectiveCountry } = useCountry();
  return useQuery({
    queryKey: ['planes', empresaId, effectiveCountry],
    queryFn: async () => {
      if (!empresaId) return [];
      const result = await getPlanesPorEmpresa(empresaId, effectiveCountry);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    enabled: !!empresaId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};

export const usePromocionesQuery = (empresaId: number | null) => {
  const { effectiveCountry } = useCountry();
  return useQuery({
    queryKey: ['promociones', empresaId, effectiveCountry],
    queryFn: async () => {
      if (!empresaId) return [];
      const result = await getPromocionesPorEmpresa(empresaId, effectiveCountry);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    enabled: !!empresaId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};
