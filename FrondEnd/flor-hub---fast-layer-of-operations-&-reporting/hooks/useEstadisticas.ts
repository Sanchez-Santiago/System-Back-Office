// hooks/useEstadisticas.ts
// Hook para obtener estadísticas del backend

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { api } from '../services/api';
import { useCountry } from '../contexts/CountryContext';

export type Periodo = 'HOY' | 'SEMANA' | 'MES' | 'SEMESTRE' | 'AÑO' | 'TODO';

export interface EstadisticaResumen {
  totalVentas: number;
  agendados: number;
  aprobadoAbd: number;
  rechazados: number;
  noEntregados: number;
  entregados: number;
  rendidos: number;
  activadoPortado: number;
  activadoClaro: number;
  cancelados: number;
  spCancelados: number;
  pendientePin: number;
  
  percAgendados: number;
  percAprobadoAbd: number;
  percRechazados: number;
  percNoEntregados: number;
  percEntregados: number;
  percRendidos: number;
  percActivadoPortado: number;
  percActivadoClaro: number;
  percCancelados: number;
  percSpCancelados: number;
  percPendientePin: number;
}

export interface TopAsesorRecarga {
  vendedorId: string;
  vendedorNombre: string;
  cantidadRecargas: number;
}

export interface TopCellRecarga {
  cellaId: string;
  cellaNombre: string;
  cantidadRecargas: number;
}

export interface RecargaInfo {
  numeroPortar: string;
  cantidadPortaciones: number;
  ultimaVentaId: number;
  ultimaFecha: string;
}

export interface RecargaDetallada {
  totalRecargas: number;
  totalPortacionesRecargadas: number;
  topAsesorRecargas: TopAsesorRecarga[];
  topCellRecargas: TopCellRecarga[];
  numerosRecargados: RecargaInfo[];
}

export interface EstadisticaVendedor {
  vendedorId: string;
  vendedorNombre: string;
  legajo: string;
  exa: string;
  email: string;
  cellaId: string;
  cellaNombre: string;
  totalVentas: number;
  agendados: number;
  aprobadoAbd: number;
  rechazados: number;
  noEntregados: number;
  entregados: number;
  rendidos: number;
  activadoPortado: number;
  activadoClaro: number;
  cancelados: number;
  spCancelados: number;
  pendientePin: number;
  percActivados: number;
}

export interface EstadisticaCell {
  cellaId: string;
  cellaNombre: string;
  totalVentas: number;
  agendados: number;
  aprobadoAbd: number;
  rechazados: number;
  noEntregados: number;
  entregados: number;
  rendidos: number;
  activadoPortado: number;
  activadoClaro: number;
  cancelados: number;
  spCancelados: number;
  pendientePin: number;
  percActivados: number;
}

export interface EstadisticaDetalle {
  ventaId: number;
  sds: string;
  sap: string | null;
  tipoVenta: string;
  estado: string;
  fechaCreacion: string;
  fechaPortacion: string | null;
  clienteNombre: string;
  clienteDocumento: string;
  clienteEmail: string;
  vendedorId: string;
  vendedorNombre: string;
  vendedorLegajo: string;
  vendedorExa: string;
  vendedorEmail: string;
  cellaNombre: string;
}

export interface EstadisticaCompleta {
  resumen: EstadisticaResumen;
  ventasPorVendedor: EstadisticaVendedor[];
  ventasPorCell: EstadisticaCell[];
  detalle: EstadisticaDetalle[];
  recargas: RecargaDetallada;
  totales: {
    totalVentas: number;
    totalActivados: number;
    tasaConversion: number;
  };
}

interface UseEstadisticasParams {
  periodo: Periodo;
  cellaId?: string;
  asesorId?: string;
  fechaPortacionDesde?: string;
  fechaPortacionHasta?: string;
}

export const useEstadisticas = (
  params: UseEstadisticasParams
): UseQueryResult<EstadisticaCompleta> => {
  const { effectiveCountry } = useCountry();
  return useQuery({
    queryKey: ['estadisticas', params, effectiveCountry],
    queryFn: async () => {
      const envInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true';
      const isInspectionMode = envInspectionMode || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        await new Promise(r => setTimeout(r, 800));
        return {
          resumen: {
            totalVentas: 350, agendados: 40, aprobadoAbd: 90, rechazados: 10,
            noEntregados: 15, entregados: 85, rendidos: 70, activadoPortado: 60,
            activadoClaro: 15, cancelados: 15, spCancelados: 5, pendientePin: 20,
            percAgendados: 11, percAprobadoAbd: 25, percRechazados: 2.8, percNoEntregados: 4.2,
            percEntregados: 24.2, percRendidos: 20, percActivadoPortado: 17.1, percActivadoClaro: 4.2,
            percCancelados: 4.2, percSpCancelados: 1.4, percPendientePin: 5.7
          },
          ventasPorVendedor: [
            { vendedorId: '1', vendedorNombre: 'Juan Perez', totalVentas: 80 }
          ],
          ventasPorCell: [
            { cellaId: '1', cellaNombre: 'Célula Norte', totalVentas: 300 }
          ],
          detalle: [
            { fechaCreacion: new Date().toISOString(), estado: 'ACTIVADO NRO PORTADO' },
            { fechaCreacion: new Date(Date.now() - 86400000).toISOString(), estado: 'PENDIENTE_DOCU_PIN' }
          ],
          recargas: { totalRecargas: 25, totalPortacionesRecargadas: 15, topAsesorRecargas: [{ vendedorId: '1', vendedorNombre: 'Juan Perez', cantidadRecargas: 5 }], topCellRecargas: [], numerosRecargados: [] },
          totales: { totalVentas: 350, totalActivados: 75, tasaConversion: 21.4 }
        } as any;
      }
      const queryParams = new URLSearchParams();
      queryParams.append('periodo', params.periodo);
      if (params.cellaId) queryParams.append('cellaId', params.cellaId);
      if (params.asesorId) queryParams.append('asesorId', params.asesorId);
      if (params.fechaPortacionDesde) queryParams.append('fechaPortacionDesde', params.fechaPortacionDesde);
      if (params.fechaPortacionHasta) queryParams.append('fechaPortacionHasta', params.fechaPortacionHasta);
      if (effectiveCountry) queryParams.append('pais', effectiveCountry);

      const response = await api.get<EstadisticaCompleta>(
        `/estadisticas?${queryParams.toString()}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener estadísticas');
      }

      return response.data!;
    },
    enabled: true,
    staleTime: 30000,
  });
};

export const useRecargas = (
  periodo: Periodo,
  cellaId?: string,
  fechaPortacionDesde?: string,
  fechaPortacionHasta?: string
): UseQueryResult<RecargaDetallada> => {
  const { effectiveCountry } = useCountry();
  return useQuery({
    queryKey: ['recargas', periodo, cellaId, fechaPortacionDesde, fechaPortacionHasta, effectiveCountry],
    queryFn: async () => {
      const envInspectionMode = import.meta.env.VITE_INSPECTION_MODE === 'true';
      const isInspectionMode = envInspectionMode || localStorage.getItem('inspectionMode') === 'true';
      if (isInspectionMode) {
        await new Promise(r => setTimeout(r, 400));
        return {
          totalRecargas: 25, totalPortacionesRecargadas: 15, topAsesorRecargas: [], topCellRecargas: [], numerosRecargados: []
        } as any;
      }
      const queryParams = new URLSearchParams();
      queryParams.append('periodo', periodo);
      if (cellaId) queryParams.append('cellaId', cellaId);
      if (fechaPortacionDesde) queryParams.append('fechaPortacionDesde', fechaPortacionDesde);
      if (fechaPortacionHasta) queryParams.append('fechaPortacionHasta', fechaPortacionHasta);
      if (effectiveCountry) queryParams.append('pais', effectiveCountry);

      const response = await api.get<RecargaDetallada>(
        `/estadisticas/recargas?${queryParams.toString()}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Error al obtener recargas');
      }

      return response.data || {
        totalRecargas: 0,
        totalPortacionesRecargadas: 0,
        topAsesorRecargas: [],
        topCellRecargas: [],
        numerosRecargados: [],
      };
    },
    enabled: true,
    staleTime: 30000,
  });
};
