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
      const isInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        await new Promise(r => setTimeout(r, 400));
        let empresas = [];
        if (effectiveCountry === 'Argentina') {
          empresas = [{ empresa_origen_id: 1, nombre_empresa: 'Personal AR' }, { empresa_origen_id: 2, nombre_empresa: 'Claro AR' }];
        } else if (effectiveCountry === 'Uruguay') {
          empresas = [{ empresa_origen_id: 3, nombre_empresa: 'Antel UY' }, { empresa_origen_id: 4, nombre_empresa: 'Claro UY' }];
        } else if (effectiveCountry === 'Paraguay') {
          empresas = [{ empresa_origen_id: 5, nombre_empresa: 'Tigo PY' }, { empresa_origen_id: 6, nombre_empresa: 'Personal PY' }];
        } else {
          empresas = [{ empresa_origen_id: 1, nombre_empresa: 'Empresa Genérica' }];
        }
        return empresas;
      }

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
      const isInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        if (!empresaId) return [];
        await new Promise(r => setTimeout(r, 400));
        let planes = [];
        if (effectiveCountry === 'Argentina') {
          planes = [{ plan_id: 1, nombre: 'Plan Personal 5GB AR', descripcion: 'Datos libres AR' }];
        } else if (effectiveCountry === 'Uruguay') {
          planes = [{ plan_id: 2, nombre: 'Plan Antel 10GB UY', descripcion: 'LTE libre UY' }];
        } else if (effectiveCountry === 'Paraguay') {
          planes = [{ plan_id: 3, nombre: 'Plan Tigo 8GB PY', descripcion: 'Redes sociales PY' }];
        } else {
          planes = [{ plan_id: 1, nombre: 'Plan Demo 5GB', descripcion: 'Plan genérico' }];
        }
        return planes;
      }

      if (!empresaId) return [];
      const result = await getPlanesPorEmpresa(empresaId, effectiveCountry);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    enabled: !!empresaId || (import.meta.env.VITE_INSPECTION_MODE === 'true' && !!empresaId),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};

export const usePromocionesQuery = (empresaId: number | null) => {
  const { effectiveCountry } = useCountry();
  return useQuery({
    queryKey: ['promociones', empresaId, effectiveCountry],
    queryFn: async () => {
      const isInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        if (!empresaId) return [];
        await new Promise(r => setTimeout(r, 400));
        let promos = [];
        if (effectiveCountry === 'Argentina') {
          promos = [{ promocion_id: 1, nombre: 'Promo Verano AR 50%', descripcion: '50% off por 12 meses' }];
        } else if (effectiveCountry === 'Uruguay') {
          promos = [{ promocion_id: 2, nombre: 'Promo Estudiantes UY', descripcion: 'Descuento + Spotify' }];
        } else if (effectiveCountry === 'Paraguay') {
          promos = [{ promocion_id: 3, nombre: 'Promo Familia PY', descripcion: 'Línea extra gratis' }];
        } else {
          promos = [{ promocion_id: 1, nombre: 'Promo Genérica 20%', descripcion: 'Descuento base' }];
        }
        return promos;
      }

      if (!empresaId) return [];
      const result = await getPromocionesPorEmpresa(empresaId, effectiveCountry);
      if (!result.success) throw new Error(result.message);
      return result.data || [];
    },
    enabled: !!empresaId || (import.meta.env.VITE_INSPECTION_MODE === 'true' && !!empresaId),
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
  });
};
