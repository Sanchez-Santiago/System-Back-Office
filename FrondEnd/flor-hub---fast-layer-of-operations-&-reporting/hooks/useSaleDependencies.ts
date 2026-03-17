import { useQuery } from '@tanstack/react-query';
import { getAllPlanes, getAllPromociones, getEmpresasOrigen } from '../services/plan';
import { useCountry } from '../contexts/CountryContext';

export const DEPENDENCIES_KEYS = {
  planes: ['planes'],
  promociones: ['promociones'],
  empresas: ['empresas'],
};

export const usePlansQuery = () => {
  const { effectiveCountry } = useCountry();
  return useQuery({
    queryKey: [...DEPENDENCIES_KEYS.planes, effectiveCountry],
    queryFn: async () => {
      const result = await getAllPlanes(effectiveCountry);
      return result.data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const usePromotionsQuery = () => {
  const { effectiveCountry } = useCountry();
  return useQuery({
    queryKey: [...DEPENDENCIES_KEYS.promociones, effectiveCountry],
    queryFn: async () => {
      const result = await getAllPromociones(effectiveCountry);
      return result.data || [];
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};

export const useEmpresasQuery = () => {
  const { effectiveCountry } = useCountry();
  return useQuery({
    queryKey: [...DEPENDENCIES_KEYS.empresas, effectiveCountry],
    queryFn: async () => {
      const result = await getEmpresasOrigen(effectiveCountry);
      return result.data || [];
    },
    staleTime: Infinity, // Rarely changes
  });
};
