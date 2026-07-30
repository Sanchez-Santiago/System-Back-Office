import React from 'react';
import { useEstadoCorreoFormViewModel, ESTADOS_CORREO, EstadoCorreoFormData } from '../../viewmodels/modals/useEstadoCorreoFormViewModel';

interface EstadoCorreoFormModalProps {
  sapId?: string;
  currentEstado?: string;
  onClose: () => void;
  onSubmit: (data: EstadoCorreoFormData) => void;
}

export const EstadoCorreoFormModal: React.FC<EstadoCorreoFormModalProps> = ({ 
  sapId, 
  currentEstado,
  onClose, 
  onSubmit 
}) => {
  const { state, actions } = useEstadoCorreoFormViewModel({ onSubmit });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-white/5 z-10">
        
        {/* Header con gradiente */}
        <div className="p-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">
              Actualizar Estado de Correo
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1">
              {sapId ? `SAP: ${sapId}` : 'Gestión Logística'}
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 bg-white/20 hover:bg-white/40 rounded-2xl transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={actions.handleSubmit} className="p-10 bg-slate-50/50 dark:bg-slate-950/20">
          <div className="space-y-6">
            
            {/* Estado actual info */}
            {currentEstado && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/40 rounded-2xl p-4">
                <p className="text-[10px] font-black text-purple-400 dark:text-purple-500 uppercase tracking-widest mb-1">
                  Estado Actual
                </p>
                <p className="text-lg font-black text-purple-900 dark:text-purple-200 uppercase">
                  {currentEstado}
                </p>
              </div>
            )}

            {/* Nuevo Estado */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                Nuevo Estado <span className="text-rose-500">*</span>
              </label>
              <select 
                value={state.formData.estado}
                onChange={e => actions.handleChange('estado', e.target.value)}
                className={actions.getSelectClass('estado')}
              >
                {ESTADOS_CORREO.map(estado => (
                  <option key={estado} value={estado}>
                    {estado}
                  </option>
                ))}
              </select>
              {state.touched.estado && state.errors.estado && (
                <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.estado}</span>
              )}
            </div>

            {/* Ubicación Actual */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                Ubicación Actual
              </label>
              <input 
                type="text" 
                value={state.formData.ubicacion_actual}
                onChange={e => actions.handleChange('ubicacion_actual', e.target.value)}
                className={actions.getInputClass('ubicacion_actual')}
                placeholder="Centro de distribución Buenos Aires, Sucursal Córdoba..."
              />
              {state.touched.ubicacion_actual && state.errors.ubicacion_actual && (
                <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.ubicacion_actual}</span>
              )}
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                Descripción / Detalles
              </label>
              <textarea 
                value={state.formData.descripcion}
                onChange={e => actions.handleChange('descripcion', e.target.value)}
                className={actions.getTextareaClass('descripcion')}
                placeholder="Detalles adicionales sobre el estado..."
                rows={4}
                maxLength={255}
              />
              <div className="flex justify-between">
                {state.touched.descripcion && state.errors.descripcion && (
                  <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.descripcion}</span>
                )}
                <span className="text-[9px] font-bold text-slate-400 ml-auto">
                  {state.formData.descripcion?.length || 0}/255
                </span>
              </div>
            </div>

            {/* Info según estado seleccionado */}
            <div className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                Información del Estado
              </p>
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 space-y-1">
                {state.formData.estado === 'INICIAL' && (
                  <p>El envío ha sido registrado en el sistema pero aún no ha sido procesado.</p>
                )}
                {state.formData.estado === 'ASIGNADO' && (
                  <p>El paquete ha sido asignado a un repartidor o agencia de correo.</p>
                )}
                {state.formData.estado === 'EN TRANSITO' && (
                  <p>El paquete está en camino hacia su destino final.</p>
                )}
                {state.formData.estado === 'ENTREGADO' && (
                  <p>El paquete ha sido entregado exitosamente al destinatario.</p>
                )}
                {state.formData.estado === 'NO ENTREGADO' && (
                  <p>No se pudo realizar la entrega. Se programará un nuevo intento.</p>
                )}
                {state.formData.estado === 'DEVUELTO AL CLIENTE' && (
                  <p>El paquete ha sido devuelto al remitente.</p>
                )}
                {state.formData.estado === 'PIEZA EXTRAVIADA' && (
                  <p>Alerta: El paquete se encuentra extraviado. Iniciar investigación.</p>
                )}
                {!['INICIAL', 'ASIGNADO', 'EN TRANSITO', 'ENTREGADO', 'NO ENTREGADO', 'DEVUELTO AL CLIENTE', 'PIEZA EXTRAVIADA'].includes(state.formData.estado) && (
                  <p>Estado: {state.formData.estado}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-10 flex justify-end gap-4">
            <button 
              type="button"
              onClick={onClose}
              className="px-8 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-12 py-4 rounded-[22px] bg-purple-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-purple-200 hover:bg-purple-700 hover:scale-105 active:scale-95 transition-all"
            >
              Actualizar Estado
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
