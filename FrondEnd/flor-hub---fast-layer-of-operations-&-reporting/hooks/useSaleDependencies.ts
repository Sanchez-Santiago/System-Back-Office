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
      const isInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        await new Promise(r => setTimeout(r, 400));
        let planes = [];
        if (effectiveCountry === 'Argentina') {
          planes = [{ plan_id: 1, nombre: 'Plan Personal 5GB AR', descripcion: 'Datos libres AR', empresa_origen_id: 1 }];
        } else if (effectiveCountry === 'Uruguay') {
          planes = [{ plan_id: 2, nombre: 'Plan Antel 10GB UY', descripcion: 'LTE libre UY', empresa_origen_id: 2 }];
        } else if (effectiveCountry === 'Paraguay') {
          planes = [{ plan_id: 3, nombre: 'Plan Tigo 8GB PY', descripcion: 'Redes sociales PY', empresa_origen_id: 3 }];
        } else {
          planes = [{ plan_id: 1, nombre: 'Plan Demo 5GB', descripcion: 'Plan genérico', empresa_origen_id: 1 }];
        }
        return planes;
      }

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
      const isInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
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
      return result.data || [];
    },
    staleTime: Infinity, // Rarely changes
  });
};
