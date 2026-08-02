import React, { memo } from 'react';
import { SaleDetail, SaleStatus, LogisticStatus } from '../../../types';
import { SectionHeader, getStatusColor } from '../SaleModalHelpers';
import { useTabEstadosViewModel } from '../../../viewmodels/sale/useTabEstadosViewModel';

export const TabEstados = memo(({ 
  editedData, 
  onUpdateStatus, 
  onUpdateLogistic 
}: { 
  editedData: SaleDetail | null,
  onUpdateStatus?: (status: SaleStatus, comment: string) => Promise<void>,
  onUpdateLogistic?: (status: LogisticStatus, comment: string) => Promise<void>
}) => {
  const { state, actions } = useTabEstadosViewModel({ onUpdateStatus, onUpdateLogistic });

  return (
    <div className="space-y-[6vh] animate-in fade-in duration-500 pb-[10vh]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[3vh]">
        {/* Card Operativa */}
        <div className={`relative overflow-hidden p-[4vh] rounded-[4vh] border-2 shadow-xl transition-all duration-500 ${getStatusColor(editedData?.estadoVentaActual ?? SaleStatus.INICIAL)}`}>
          <div className="absolute -right-[2vh] -top-[2vh] text-[12vh] opacity-10 rotate-12 pointer-events-none">📈</div>
          <div className="relative z-10">
            <div className="flex items-center gap-[1.5vh] mb-[2vh]">
              <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-current animate-pulse"></span>
              <span className="font-black uppercase tracking-[0.2em] opacity-70 text-[clamp(0.6rem,1.1vh,1.3rem)]">Estado Operativo</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h4 className="font-black uppercase tracking-tight text-[clamp(2.2rem,4.5vh,5.5rem)] leading-none truncate">{editedData?.estadoVentaActual ?? 'S/D'}</h4>
              {!state.showStatusForm && (
                <button 
                  onClick={actions.openStatusForm}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-400 dark:hover:text-white rounded-xl font-black uppercase text-xs transition-all border border-indigo-600/30 self-start sm:self-center"
                >
                  🔄 Actualizar
                </button>
              )}
            </div>

            {state.showStatusForm && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-white/20 rounded-[2vh] p-4 border border-white/20">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-900/50 dark:text-indigo-300/50 mb-2">Nuevo Estado</label>
                  <select 
                    value={state.newStatus}
                    onChange={(e) => actions.setNewStatus(e.target.value as SaleStatus)}
                    className="w-full bg-white dark:bg-slate-900 border border-indigo-300/30 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Seleccionar estado...</option>
                    {Object.values(SaleStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[2vh] p-4 border border-white/20">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-900/50 dark:text-indigo-300/50 mb-2">Comentario / Descripción</label>
                  <textarea 
                    value={state.comment}
                    onChange={(e) => actions.setComment(e.target.value)}
                    placeholder="Escriba el motivo del cambio..."
                    className="w-full bg-white dark:bg-slate-900 border border-indigo-300/30 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={actions.handleStatusSubmit}
                    disabled={!state.newStatus || state.isSubmitting}
                    className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-black uppercase text-xs hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {state.isSubmitting ? 'Guardando...' : 'Confirmar Cambio'}
                  </button>
                  <button 
                    onClick={() => actions.setShowStatusForm(false)}
                    className="px-6 bg-slate-200 dark:bg-slate-800 rounded-xl py-3 font-black uppercase text-xs hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card Logística */}
        <div className={`relative overflow-hidden p-[4vh] rounded-[4vh] border-2 shadow-xl transition-all duration-500 ${editedData?.estadoCorreoActual ? getStatusColor(editedData.estadoCorreoActual) : 'bg-slate-100/40 text-slate-400 border-slate-200/50'}`}>
          <div className="absolute -right-[2vh] -top-[2vh] text-[12vh] opacity-10 rotate-12 pointer-events-none">📦</div>
          <div className="relative z-10">
            <div className="flex items-center gap-[1.5vh] mb-[2vh]">
              <span className="w-[1.2vh] h-[1.2vh] rounded-full bg-current opacity-50"></span>
              <span className="font-black uppercase tracking-[0.2em] opacity-70 text-[clamp(0.6rem,1.1vh,1.3rem)]">Estado Logístico</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h4 className="font-black uppercase tracking-tight text-[clamp(2.2rem,3.5vh,4.5rem)] leading-none truncate">{editedData?.estadoCorreoActual ?? 'Sin Asignar'}</h4>
              {!state.showLogisticForm && (
                <button 
                  onClick={actions.openLogisticForm}
                  className="px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-700 dark:text-indigo-400 dark:hover:text-white rounded-xl font-black uppercase text-xs transition-all border border-indigo-600/30 self-start sm:self-center"
                >
                  🔄 Actualizar
                </button>
              )}
            </div>

            {state.showLogisticForm && (
              <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                <div className="bg-white/20 rounded-[2vh] p-4 border border-white/20">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-900/50 dark:text-indigo-300/50 mb-2">Nuevo Estado Logístico</label>
                  <select 
                    value={state.newLogistic}
                    onChange={(e) => actions.setNewLogistic(e.target.value as LogisticStatus)}
                    className="w-full bg-white dark:bg-slate-900 border border-indigo-300/30 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Seleccionar estado...</option>
                    {Object.values(LogisticStatus).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-[2vh] p-4 border border-white/20">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-indigo-900/50 dark:text-indigo-300/50 mb-2">Comentario / Detalle</label>
                  <textarea 
                    value={state.comment}
                    onChange={(e) => actions.setComment(e.target.value)}
                    placeholder="Detalles sobre la entrega o incidencia..."
                    className="w-full bg-white dark:bg-slate-900 border border-indigo-300/30 rounded-xl px-4 py-3 font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
                  />
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={actions.handleLogisticSubmit}
                    disabled={!state.newLogistic || state.isSubmitting}
                    className="flex-1 bg-indigo-600 text-white rounded-xl py-3 font-black uppercase text-xs hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {state.isSubmitting ? 'Guardando...' : 'Confirmar Cambio'}
                  </button>
                  <button 
                    onClick={() => actions.setShowLogisticForm(false)}
                    className="px-6 bg-slate-200 dark:bg-slate-800 rounded-xl py-3 font-black uppercase text-xs hover:bg-rose-500 hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[6vh]">
        <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-[4.5vh] p-[4vh] border border-white/40 dark:border-white/10 shadow-sm relative">
          <SectionHeader title="Historial Operativo" icon="📉" />
          <div className="space-y-4 mt-[4vh]">
            {(editedData?.historialEstadosVenta ?? []).map((estado, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-[2.5vh] p-[2.5vh] shadow-sm">
                <div className="flex items-center justify-between mb-[1.5vh]">
                  <span className="font-black uppercase tracking-widest text-[clamp(0.75rem,1.2vh,1.5rem)] text-slate-900 dark:text-white">{estado.estado}</span>
                  <span className="font-bold text-slate-400 text-[clamp(0.55rem,0.9vh,1.1rem)]">{new Date(estado.fecha).toLocaleDateString('es-AR')}</span>
                </div>
                <p className="text-[clamp(0.75rem,1.2vh,1.5rem)] font-medium text-slate-500 italic">"{estado.descripcion || 'Sin descripción'}"</p>
                <div className="mt-2 text-[10px] text-indigo-400 font-bold uppercase tracking-widest">VIA: {estado.usuario}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/30 dark:bg-slate-800/30 backdrop-blur-md rounded-[4.5vh] p-[4vh] border border-white/40 dark:border-white/10 shadow-sm relative">
          <SectionHeader title="Historial Logístico" icon="🚚" />
          <div className="space-y-4 mt-[4vh]">
            {(editedData?.historialEstadosCorreo ?? []).map((estado, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-white/5 rounded-[2.5vh] p-[2.5vh] shadow-sm">
                <div className="flex items-center justify-between mb-[1.5vh]">
                  <span className="font-black uppercase tracking-widest text-[clamp(0.75rem,1.2vh,1.5rem)] text-slate-900 dark:text-white">{estado.estado}</span>
                  <span className="font-bold text-slate-400 text-[clamp(0.55rem,0.9vh,1.1rem)]">{new Date(estado.fecha).toLocaleDateString('es-AR')}</span>
                </div>
                <p className="text-[clamp(0.75rem,1.2vh,1.5rem)] font-medium text-slate-500 italic">"{estado.descripcion || 'Sin descripción'}"</p>
                <div className="mt-2 text-[10px] text-amber-500 font-bold uppercase tracking-widest">
                  {estado.ubicacionActual ? `UBICACIÓN: ${estado.ubicacionActual}` : 'SIN UBICACIÓN'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
