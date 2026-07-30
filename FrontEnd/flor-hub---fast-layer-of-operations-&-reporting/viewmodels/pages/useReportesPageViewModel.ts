import { useState, useMemo } from 'react';
import { useEstadisticas, Periodo } from '../../hooks/useEstadisticas';
import { exportToExcel } from '../../utils/exportExcel';

export type Period = 'DIA' | 'SEMANA' | 'MES' | 'SEMESTRE' | 'AÑO' | 'HISTORICO';

function mapPeriodToBackend(period: Period): Periodo {
  switch (period) {
    case 'DIA': return 'HOY';
    case 'SEMANA': return 'SEMANA';
    case 'MES': return 'MES';
    case 'SEMESTRE': return 'SEMESTRE';
    case 'AÑO': return 'AÑO';
    case 'HISTORICO': return 'TODO';
    default: return 'MES';
  }
}

export function useReportesPageViewModel() {
  const [reportFilter, setReportFilter] = useState({ advisor: 'TODOS', supervisor: 'TODOS', period: 'MES' as Period });

  const { data: estadisticas, isLoading, error } = useEstadisticas({
    periodo: mapPeriodToBackend(reportFilter.period),
    cellaId: reportFilter.supervisor !== 'TODOS' ? reportFilter.supervisor : undefined,
    asesorId: reportFilter.advisor !== 'TODOS' ? reportFilter.advisor : undefined,
  });

  const stats = useMemo(() => {
    if (!estadisticas || !estadisticas.resumen || !estadisticas.totales) {
      return {
        totalBrutas: 0, activados: 0, countNetas: 0, aprobadoAbd: 0,
        rechazados: 0, cancelados: 0, spCancelados: 0, entregados: 0,
        noEntregados: 0, rendidos: 0, agendados: 0, pendienteCarga: 0,
        montoBruto: 0, montoNeto: 0, percActivados: '0', percAprobadoAbd: '0',
        percRechazados: '0', percCancelados: '0', percSpCancelados: '0',
        percEntregados: '0', percNoEntregados: '0', percRendidos: '0',
        percAgendados: '0', percPendiente: '0', avgTicket: '0', conversionRate: '0'
      };
    }

    const resumen = estadisticas.resumen;
    const totales = estadisticas.totales;
    const total = resumen.totalVentas || 1;

    return {
      totalBrutas: resumen.totalVentas || 0,
      activados: totales.totalActivados || 0,
      countNetas: totales.totalActivados || 0,
      aprobadoAbd: resumen.aprobadoAbd || 0,
      rechazados: resumen.rechazados || 0,
      cancelados: resumen.cancelados || 0,
      spCancelados: resumen.spCancelados || 0,
      entregados: resumen.entregados || 0,
      noEntregados: resumen.noEntregados || 0,
      rendidos: resumen.rendidos || 0,
      agendados: resumen.agendados || 0,
      pendienteCarga: resumen.pendientePin || 0,
      montoBruto: 0, montoNeto: 0,
      percActivados: ((totales.totalActivados || 0) / total * 100).toFixed(1),
      percAprobadoAbd: ((resumen.aprobadoAbd || 0) / total * 100).toFixed(1),
      percRechazados: ((resumen.rechazados || 0) / total * 100).toFixed(1),
      percCancelados: ((resumen.cancelados || 0) / total * 100).toFixed(1),
      percSpCancelados: ((resumen.spCancelados || 0) / total * 100).toFixed(1),
      percEntregados: ((resumen.entregados || 0) / total * 100).toFixed(1),
      percNoEntregados: ((resumen.noEntregados || 0) / total * 100).toFixed(1),
      percRendidos: ((resumen.rendidos || 0) / total * 100).toFixed(1),
      percAgendados: ((resumen.agendados || 0) / total * 100).toFixed(1),
      percPendiente: ((resumen.pendientePin || 0) / total * 100).toFixed(1),
      avgTicket: '0',
      conversionRate: String(totales.tasaConversion || 0)
    };
  }, [estadisticas]);

  const chartData = useMemo(() => {
    if (!estadisticas?.detalle?.length) {
      return [{ date: new Date().toISOString().split('T')[0], brutas: 0, netas: 0 }];
    }

    const groups: Record<string, { date: string; brutas: number; netas: number }> = {};
    estadisticas.detalle.forEach((item) => {
      if (!item?.fechaCreacion || !item?.estado) return;
      const fecha = new Date(item.fechaCreacion);
      if (isNaN(fecha.getTime())) return;
      const date = fecha.toISOString().split('T')[0];
      if (!groups[date]) groups[date] = { date, brutas: 0, netas: 0 };
      groups[date].brutas++;
      if (['ACTIVADO NRO PORTADO', 'ACTIVADO NRO CLARO', 'ACTIVADO', 'EXITOSO'].includes(item.estado)) {
        groups[date].netas++;
      }
    });

    const result = Object.values(groups).sort((a, b) => a.date.localeCompare(b.date));
    return result.length > 0 ? result : [{ date: new Date().toISOString().split('T')[0], brutas: 0, netas: 0 }];
  }, [estadisticas]);

  const handlePeriodChange = (period: Period) => {
    setReportFilter(prev => ({ ...prev, period }));
  };

  const handleSupervisorChange = (supervisor: string) => {
    setReportFilter(prev => ({ ...prev, supervisor }));
  };

  const handleAdvisorChange = (advisor: string) => {
    setReportFilter(prev => ({ ...prev, advisor }));
  };

  const handleExportExcel = () => {
    if (estadisticas) {
      exportToExcel(
        {
          totalVentas: estadisticas.resumen.totalVentas,
          agendados: estadisticas.resumen.agendados,
          aprobadoAbd: estadisticas.resumen.aprobadoAbd,
          rechazados: estadisticas.resumen.rechazados,
          noEntregados: estadisticas.resumen.noEntregados,
          entregados: estadisticas.resumen.entregados,
          rendidos: estadisticas.resumen.rendidos,
          activadoPortado: estadisticas.resumen.activadoPortado,
          activadoClaro: estadisticas.resumen.activadoClaro,
          cancelados: estadisticas.resumen.cancelados,
          spCancelados: estadisticas.resumen.spCancelados,
          pendientePin: estadisticas.resumen.pendientePin,
          tasaConversion: estadisticas.totales.tasaConversion,
        },
        estadisticas.recargas.numerosRecargados,
        estadisticas.detalle,
        `estadisticas_${reportFilter.period.toLowerCase()}`
      );
    }
  };

  return {
    state: {
      reportFilter,
      estadisticas,
      stats,
      chartData,
      isLoading,
      error,
    },
    actions: {
      handlePeriodChange,
      handleSupervisorChange,
      handleAdvisorChange,
      handleExportExcel,
    },
  };
}
