import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useReportesPageViewModel, Period } from '../viewmodels/pages/useReportesPageViewModel';
import { StatCard } from '../components/analytics/StatCard';
import { MiniStatusBadge } from '../components/analytics/MiniStatusBadge';
import { KPICardsSkeleton, SaleDetailSkeleton } from '../components/common/Skeletons';

export const ReportesPage: React.FC = () => {
  const { state, actions } = useReportesPageViewModel();
  const { reportFilter, estadisticas, stats, chartData, isLoading, error } = state;

  if (isLoading) {
    return (
      <div className="space-y-[4vh] p-[2vh] w-full max-w-7xl mx-auto">
        <div className="w-[30vh] h-[5vh] bg-slate-200 dark:bg-slate-700/50 rounded-[1.5vh] animate-pulse mb-[4vh]"></div>
        <KPICardsSkeleton />
        <KPICardsSkeleton />
        <SaleDetailSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <p className="text-red-500 font-black text-lg">Error al cargar estadísticas</p>
          <p className="text-slate-400 text-sm">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-[3vh] animate-in fade-in slide-in-from-bottom-6 duration-700">
      <div className="flex flex-col gap-[2vh] glass-panel p-[3vh] rounded-[3.5vh] border border-white/60 dark:border-white/5">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-[2vh]">
          <div>
            <h2 className="font-black tracking-tighter text-slate-900 dark:text-white italic uppercase leading-none text-[clamp(1.5rem,3.5vh,4rem)]">Intelligence Hub</h2>
            <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mt-[0.8vh] text-[clamp(0.6rem,1.2vh,1.5rem)]">Métricas de Rendimiento & Analytics</p>
          </div>
          <div className="flex flex-wrap items-center gap-[0.8vh] bg-slate-900/5 dark:bg-white/5 p-[1vh] rounded-[2vh]">
            {(['DIA', 'SEMANA', 'MES', 'SEMESTRE', 'AÑO', 'HISTORICO'] as Period[]).map(p => (
                <button
                    key={p}
                    onClick={() => actions.handlePeriodChange(p)}
                    className={`px-[2vh] py-[1vh] rounded-[1.2vh] font-black uppercase tracking-widest transition-all text-[clamp(0.6rem,1vh,1.4rem)] ${reportFilter.period === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/40' : 'text-slate-500 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10'}`}
                >
                    {p === 'DIA' ? 'Hoy' : p}
                </button>
            ))}
            <button
              onClick={actions.handleExportExcel}
              disabled={!estadisticas}
              className="px-[2vh] py-[1vh] rounded-[1.2vh] font-black uppercase tracking-widest transition-all text-[clamp(0.6rem,1vh,1.4rem)] bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Excel
            </button>
          </div>
        </div>

        <div className="h-px bg-slate-200/50 dark:bg-slate-800/50"></div>

        <div className="flex flex-wrap gap-[1vw]">
          <div className="flex-1 min-w-[200px] flex flex-col gap-[1vh]">
            <label className="text-[clamp(0.6rem,1.1vh,1.2rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-[1vh]">Célula</label>
            <select 
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.8vh] px-[2.5vh] py-[1.5vh] font-black text-slate-800 dark:text-slate-200 outline-none hover:shadow-md transition-all cursor-pointer text-[clamp(0.7rem,1.2vh,1.5rem)]"
              value={reportFilter.supervisor}
              onChange={(e) => actions.handleSupervisorChange(e.target.value)}
            >
              <option value="TODOS">TODAS LAS CÉLULAS</option>
              {estadisticas?.ventasPorCell?.map(c => (
                <option key={c.cellaId} value={c.cellaId}>{c.cellaNombre}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[200px] flex flex-col gap-[1vh]">
            <label className="text-[clamp(0.6rem,1.1vh,1.2rem)] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-[1vh]">Asesor Comercial</label>
            <select 
              className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[1.8vh] px-[2.5vh] py-[1.5vh] font-black text-slate-800 dark:text-slate-200 outline-none hover:shadow-md transition-all cursor-pointer text-[clamp(0.7rem,1.2vh,1.5rem)]"
              value={reportFilter.advisor}
              onChange={(e) => actions.handleAdvisorChange(e.target.value)}
            >
              <option value="TODOS">TODOS LOS ASESORES</option>
              {estadisticas?.ventasPorVendedor?.map(v => (
                <option key={v.vendedorId} value={v.vendedorId}>{v.vendedorNombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[2vh]">
        <StatCard title="Ventas Brutas" value={stats.totalBrutas} color="bg-slate-900" subtitle="Total registros" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Activados" value={stats.countNetas} percentage={stats.conversionRate} color="bg-emerald-500" subtitle="Ventas efectivas" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <StatCard title="Recargas" value={estadisticas?.recargas.totalRecargas || 0} color="bg-amber-500" subtitle="Números re-portados" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
        <StatCard title="Tasa Conversión" value={stats.conversionRate} suffix="%" color="bg-purple-600" subtitle="Activados/Ventas" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[1vw]">
        <MiniStatusBadge label="Agendados" percentage={stats.percAgendados} count={stats.agendados} colorClass="bg-amber-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
        <MiniStatusBadge label="Aprob. ABD" percentage={stats.percAprobadoAbd} count={stats.aprobadoAbd} colorClass="bg-teal-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <MiniStatusBadge label="Activ. Portado" percentage={((estadisticas?.resumen.activadoPortado || 0) / (stats.totalBrutas || 1) * 100).toFixed(1)} count={estadisticas?.resumen.activadoPortado || 0} colorClass="bg-emerald-600" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>} />
        <MiniStatusBadge label="Activ. Claro" percentage={((estadisticas?.resumen.activadoClaro || 0) / (stats.totalBrutas || 1) * 100).toFixed(1)} count={estadisticas?.resumen.activadoClaro || 0} colorClass="bg-emerald-400" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>} />
        <MiniStatusBadge label="Rechazados" percentage={stats.percRechazados} count={stats.rechazados} colorClass="bg-rose-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>} />
        <MiniStatusBadge label="Cancelados" percentage={stats.percCancelados} count={stats.cancelados} colorClass="bg-slate-400" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12H9" /></svg>} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-[1vw]">
        <MiniStatusBadge label="SP Cancelado" percentage={stats.percSpCancelados} count={stats.spCancelados} colorClass="bg-red-400" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 12H9" /></svg>} />
        <MiniStatusBadge label="Entregados" percentage={stats.percEntregados} count={stats.entregados} colorClass="bg-indigo-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>} />
        <MiniStatusBadge label="No Entreg." percentage={stats.percNoEntregados} count={stats.noEntregados} colorClass="bg-orange-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>} />
        <MiniStatusBadge label="Rendidos" percentage={stats.percRendidos} count={stats.rendidos} colorClass="bg-cyan-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
        <MiniStatusBadge label="Pdte. PIN" percentage={stats.percPendiente} count={stats.pendienteCarga} colorClass="bg-fuchsia-500" icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>} />
      </div>

      {estadisticas && estadisticas.recargas?.totalRecargas > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2vh]">
          <div className="bento-card p-[3vh] rounded-[3.5vh] dark:bg-slate-900/40 dark:border-white/5">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest mb-[2vh] text-[clamp(0.8rem,1.3vh,1.5rem)]">Top Asesores con Más Recargas</h3>
            <div className="space-y-[1vh]">
              {estadisticas.recargas.topAsesorRecargas?.slice(0, 5).map((asesor, idx) => (
                <div key={asesor.vendedorId} className="flex justify-between items-center p-[1.5vh] rounded-[1vh] bg-white/50 dark:bg-white/5">
                  <div className="flex items-center gap-[1vh]">
                    <span className="font-black text-slate-400">{idx + 1}.</span>
                    <span className="font-black text-slate-700 dark:text-slate-300 text-[clamp(0.7rem,1.1vh,1.3rem)]">{asesor.vendedorNombre}</span>
                  </div>
                  <span className="font-black text-amber-500 text-[clamp(0.8rem,1.2vh,1.4rem)]">{asesor.cantidadRecargas} recargas</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bento-card p-[3vh] rounded-[3.5vh] dark:bg-slate-900/40 dark:border-white/5">
            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest mb-[2vh] text-[clamp(0.8rem,1.3vh,1.5rem)]">Top Células con Más Recargas</h3>
            <div className="space-y-[1vh]">
              {estadisticas.recargas.topCellRecargas?.slice(0, 5).map((cell, idx) => (
                <div key={cell.cellaId} className="flex justify-between items-center p-[1.5vh] rounded-[1vh] bg-white/50 dark:bg-white/5">
                  <div className="flex items-center gap-[1vh]">
                    <span className="font-black text-slate-400">{idx + 1}.</span>
                    <span className="font-black text-slate-700 dark:text-slate-300 text-[clamp(0.7rem,1.1vh,1.3rem)]">{cell.cellaNombre}</span>
                  </div>
                  <span className="font-black text-amber-500 text-[clamp(0.8rem,1.2vh,1.4rem)]">{cell.cantidadRecargas} recargas</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2vh]">
        <div className="lg:col-span-2 bento-card p-[3vh] rounded-[3.5vh] h-[50vh] flex flex-col dark:bg-slate-900/40 dark:border-white/5">
          <div className="flex justify-between items-start mb-[3vh]">
            <div>
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none text-[clamp(0.8rem,1.3vh,1.5rem)]">Análisis de Tendencia</h3>
                <p className="font-bold text-slate-400 dark:text-slate-500 uppercase mt-[0.8vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">Ventas Brutas (Azul) vs Activaciones (Verde)</p>
            </div>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gradBrutas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gradNetas" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--chart-grid)" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fontWeight: 700, fill: '#64748b'}} />
                <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', padding: '15px'}} itemStyle={{fontSize: '10px', fontWeight: '800', textTransform: 'uppercase'}} />
                <Area type="monotone" dataKey="brutas" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#gradBrutas)" />
                <Area type="monotone" dataKey="netas" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#gradNetas)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bento-card p-[3vh] rounded-[3.5vh] h-[50vh] flex flex-col items-center justify-center text-center dark:bg-slate-900/40 dark:border-white/5">
            <div className="mb-[3vh]">
                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest leading-none text-[clamp(0.8rem,1.3vh,1.5rem)]">Ratio de Conversión</h3>
                <p className="font-bold text-slate-400 dark:text-slate-500 uppercase mt-[0.8vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">Eficiencia del Embudo</p>
            </div>
            <div className="relative w-[25vh] h-[25vh] flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[2.5vh] border-indigo-100 dark:border-indigo-900/20"></div>
                <div className="absolute inset-0 rounded-full border-[2.5vh] border-emerald-500 border-t-transparent border-l-transparent transition-all duration-1000" style={{ transform: `rotate(${(Number(stats.conversionRate) * 3.6) - 45}deg)` }}></div>
                <div className="relative z-10 flex flex-col items-center">
                    <span className="font-black text-slate-900 dark:text-white italic tracking-tighter leading-none text-[clamp(2.5rem,5.5vh,6rem)]">{stats.conversionRate}%</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-[0.8vh] text-[clamp(0.65rem,1.1vh,1.4rem)]">Éxito Neto</span>
                </div>
            </div>
            <div className="mt-[4vh] grid grid-cols-2 gap-[1.5vw] w-full">
                <div className="bg-slate-50 dark:bg-white/5 p-[2.2vh] rounded-[2.5vh]"><p className="font-black text-slate-400 dark:text-slate-500 uppercase mb-[0.5vh] text-[clamp(0.6rem,1vh,1.2rem)]">Total Recargas</p><p className="font-black text-amber-500 italic text-[clamp(1.2rem,2vh,2rem)]">{estadisticas?.recargas.totalRecargas || 0}</p></div>
                <div className="bg-slate-50 dark:bg-white/5 p-[2.2vh] rounded-[2.5vh]"><p className="font-black text-slate-400 dark:text-slate-500 uppercase mb-[0.5vh] text-[clamp(0.6rem,1vh,1.2rem)]">Portaciones</p><p className="font-black text-amber-600 italic text-[clamp(1.2rem,2vh,2rem)]">{estadisticas?.recargas.totalPortacionesRecargadas || 0}</p></div>
            </div>
        </div>
      </div>
    </div>
  );
};
