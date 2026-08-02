import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useFilterOptions(isAuthenticated: boolean, authUser: any, effectiveCountry: string | null) {
  const [planesData, setPlanesData] = useState<any[]>([]);
  const [promocionesData, setPromocionesData] = useState<any[]>([]);
  const [empresasOrigenData, setEmpresasOrigenData] = useState<any[]>([]);
  const [celulasData, setCelulasData] = useState<number[]>([]);

  useEffect(() => {
    const fetchFilterData = async () => {
      if (!isAuthenticated) return;

      const isInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true' || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        setEmpresasOrigenData([
          { empresa_origen_id: 1, nombre_empresa: 'Personal AR', pais: 'Argentina' },
          { empresa_origen_id: 2, nombre_empresa: 'Claro AR', pais: 'Argentina' }
        ]);
        setPlanesData([
          { plan_id: 1, nombre: 'Plan Personal 5GB AR', descripcion: 'Datos libres AR' }
        ]);
        setPromocionesData([
          { promocion_id: 1, nombre: 'Promo Verano AR 50%', descuento: 50 }
        ]);
        setCelulasData([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
        return;
      }

      const withPais = (path: string) => {
        if (!effectiveCountry) return path;
        return `${path}${path.includes('?') ? '&' : '?'}pais=${encodeURIComponent(effectiveCountry)}`;
      };

      try {
        const empresasRes = await api.get<any[]>(withPais('/empresa-origen'));
        if (empresasRes.success && empresasRes.data) {
          setEmpresasOrigenData(empresasRes.data);
        }

        const planesRes = await api.get<any[]>(withPais('/planes'));
        if (planesRes.success && planesRes.data) {
          setPlanesData(planesRes.data);
        }

        const promoRes = await api.get<any[]>(withPais('/promociones'));
        if (promoRes.success && promoRes.data) {
          setPromocionesData(promoRes.data);
        }

        setCelulasData([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      } catch (error) {
        console.error('Error cargando datos de filtros:', error);
      }
    };

    fetchFilterData();
  }, [isAuthenticated, authUser, effectiveCountry]);

  return { planesData, promocionesData, empresasOrigenData, celulasData };
}
