import React from 'react';
import { Sale } from '../../types';
import { useCorreoFormViewModel, CorreoFormData } from '../../viewmodels/modals/useCorreoFormViewModel';

interface CorreoFormModalProps {
  sale?: Sale;
  onClose: () => void;
  onSubmit: (data: CorreoFormData) => void;
}

export const CorreoFormModal: React.FC<CorreoFormModalProps> = ({ 
  sale, 
  onClose, 
  onSubmit 
}) => {
  const { state, actions } = useCorreoFormViewModel({ sale, onSubmit });

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-white/5 max-h-[90vh] flex flex-col z-10">
        
        {/* Header con gradiente */}
        <div className="p-8 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-2xl font-black italic tracking-tighter uppercase">
              {sale ? 'Editar Correo' : 'Nuevo Correo'}
            </h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mt-1">
              Gestión de Envíos y Logística
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

        <form onSubmit={actions.handleSubmit} className="p-10 bg-slate-50/50 dark:bg-slate-950/20 overflow-y-auto flex-1 no-scrollbar">
          <div className="space-y-8">
            
            {/* Sección: Identificación */}
            <div className="space-y-5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Identificación del Envío
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    SAP ID <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={state.formData.sap_id}
                    onChange={e => actions.handleChange('sap_id', e.target.value.toUpperCase())}
                    className={`${actions.getInputClass('sap_id')} uppercase`}
                    placeholder="SAP-XXXXXX"
                  />
                  {state.touched.sap_id && state.errors.sap_id && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.sap_id}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Destinatario <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={state.formData.destinatario}
                    onChange={e => actions.handleChange('destinatario', e.target.value)}
                    className={actions.getInputClass('destinatario')}
                    placeholder="Nombre completo"
                  />
                  {state.touched.destinatario && state.errors.destinatario && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.destinatario}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Sección: Contacto */}
            <div className="space-y-5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Información de Contacto
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Teléfono Contacto <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    value={state.formData.telefono_contacto}
                    onChange={e => actions.handleChange('telefono_contacto', e.target.value)}
                    className={actions.getInputClass('telefono_contacto')}
                    placeholder="+54 11 1234-5678"
                  />
                  {state.touched.telefono_contacto && state.errors.telefono_contacto && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.telefono_contacto}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Teléfono Alternativo
                  </label>
                  <input 
                    type="tel" 
                    value={state.formData.telefono_alternativo}
                    onChange={e => actions.handleChange('telefono_alternativo', e.target.value)}
                    className={actions.getInputClass('telefono_alternativo')}
                    placeholder="+54 11 9876-5432"
                  />
                  {state.touched.telefono_alternativo && state.errors.telefono_alternativo && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.telefono_alternativo}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">
                  Persona Autorizada a Recibir
                </label>
                <input 
                  type="text" 
                  value={state.formData.persona_autorizada}
                  onChange={e => actions.handleChange('persona_autorizada', e.target.value)}
                  className={actions.getInputClass('persona_autorizada')}
                  placeholder="Nombre de quien puede recibir si no está el destinatario"
                />
                {state.touched.persona_autorizada && state.errors.persona_autorizada && (
                  <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.persona_autorizada}</span>
                )}
              </div>
            </div>

            {/* Sección: Dirección */}
            <div className="space-y-5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Dirección de Entrega
              </p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Calle / Dirección <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={state.formData.direccion}
                    onChange={e => actions.handleChange('direccion', e.target.value)}
                    className={actions.getInputClass('direccion')}
                    placeholder="Av. Corrientes"
                  />
                  {state.touched.direccion && state.errors.direccion && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.direccion}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Número <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={state.formData.numero_casa || ''}
                    onChange={e => actions.handleChange('numero_casa', e.target.value ? Number(e.target.value) : undefined)}
                    className={actions.getInputClass('numero_casa')}
                    placeholder="1234"
                  />
                  {state.touched.numero_casa && state.errors.numero_casa && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.numero_casa}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Piso
                  </label>
                  <input 
                    type="text" 
                    value={state.formData.piso}
                    onChange={e => actions.handleChange('piso', e.target.value)}
                    className={actions.getInputClass('piso')}
                    placeholder="3"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Departamento
                  </label>
                  <input 
                    type="text" 
                    value={state.formData.departamento_numero}
                    onChange={e => actions.handleChange('departamento_numero', e.target.value)}
                    className={actions.getInputClass('departamento_numero')}
                    placeholder="B"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">
                  Entre Calles
                </label>
                <input 
                  type="text" 
                  value={state.formData.entre_calles}
                  onChange={e => actions.handleChange('entre_calles', e.target.value)}
                  className={actions.getInputClass('entre_calles')}
                  placeholder="Entre Av. Callao y Av. Pueyrredón"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Barrio
                  </label>
                  <input 
                    type="text" 
                    value={state.formData.barrio}
                    onChange={e => actions.handleChange('barrio', e.target.value)}
                    className={actions.getInputClass('barrio')}
                    placeholder="San Nicolás"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Localidad <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={state.formData.localidad}
                    onChange={e => actions.handleChange('localidad', e.target.value)}
                    className={actions.getInputClass('localidad')}
                    placeholder="Buenos Aires"
                  />
                  {state.touched.localidad && state.errors.localidad && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.localidad}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Departamento/Provincia <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={state.formData.departamento}
                    onChange={e => actions.handleChange('departamento', e.target.value)}
                    className={actions.getInputClass('departamento')}
                    placeholder="Capital Federal"
                  />
                  {state.touched.departamento && state.errors.departamento && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.departamento}</span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                    Código Postal <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={state.formData.codigo_postal || ''}
                    onChange={e => actions.handleChange('codigo_postal', e.target.value ? Number(e.target.value) : undefined)}
                    className={actions.getInputClass('codigo_postal')}
                    placeholder="1043"
                  />
                  {state.touched.codigo_postal && state.errors.codigo_postal && (
                    <span className="text-[9px] font-bold text-rose-500 ml-2">{state.errors.codigo_postal}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">
                  Geolocalización (Coordenadas)
                </label>
                <input 
                  type="text" 
                  value={state.formData.geolocalizacion}
                  onChange={e => actions.handleChange('geolocalizacion', e.target.value)}
                  className={actions.getInputClass('geolocalizacion')}
                  placeholder="-34.6037, -58.3816"
                />
              </div>
            </div>

            {/* Sección: Comentarios */}
            <div className="space-y-5">
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">
                Comentarios para el Cartero
              </p>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase ml-2">
                  Instrucciones Especiales
                </label>
                <textarea 
                  value={state.formData.comentario_cartero}
                  onChange={e => actions.handleChange('comentario_cartero', e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 outline-none transition-all resize-none bg-white dark:bg-slate-800 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30"
                  placeholder="Tocar timbre, dejar en portería, llamar antes de entregar..."
                  rows={3}
                  maxLength={255}
                />
                <span className="text-[9px] font-bold text-slate-400 ml-auto">
                  {state.formData.comentario_cartero?.length || 0}/255
                </span>
              </div>
            </div>
          </div>

          <div className="mt-12 flex justify-between items-center pb-6">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Validación de dirección activa
              </p>
            </div>
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="px-8 py-4 rounded-[22px] text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="px-12 py-4 rounded-[22px] bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
              >
                Guardar Correo
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
