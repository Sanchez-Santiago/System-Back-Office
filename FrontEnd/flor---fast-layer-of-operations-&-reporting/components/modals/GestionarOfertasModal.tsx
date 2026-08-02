import React from 'react';
import { useGestionarOfertasViewModel } from '../../viewmodels/modals/useGestionarOfertasViewModel';

interface GestionarOfertasModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'promociones' | 'planes' | 'empresas';

interface Empresa {
  empresa_origen_id: number;
  nombre_empresa: string;
  pais: string;
}

interface Promocion {
  promocion_id: number;
  nombre: string;
  beneficios?: string;
  empresa_origen_id: number;
  descuento: number;
  activo: boolean;
  empresa?: Empresa;
}

interface Plan {
  plan_id: number;
  nombre: string;
  precio: number;
  gigabyte: number;
  llamadas: string;
  mensajes: string;
  whatsapp: string;
  roaming: string;
  beneficios?: string;
  empresa_origen_id: number;
  promocion_id?: number;
  activo: boolean;
  empresa?: Empresa;
  promocion?: Promocion;
}


export const GestionarOfertasModal: React.FC<GestionarOfertasModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { state, actions } = useGestionarOfertasViewModel(isOpen);

  if (!isOpen) return null;

  const tabs: { key: TabType; label: string }[] = [
    { key: 'promociones', label: 'Promociones' },
    { key: 'planes', label: 'Planes' },
    { key: 'empresas', label: 'Empresas' },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-[5vh]">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-[900px] max-h-[85vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-[3vh] shadow-2xl animate-in fade-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700 p-[3vh] text-white flex-shrink-0 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[2vh]">
              <div className="w-[7vh] h-[7vh] rounded-[2vh] bg-white/10 flex items-center justify-center backdrop-blur-md">
                <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                </svg>
              </div>
              <div>
                <h3 className="font-black uppercase tracking-widest text-[clamp(1rem,2vh,2.5rem)]">Gestionar Ofertas</h3>
                <p className="font-bold text-amber-200 uppercase text-[clamp(0.7rem,1.2vh,1.5rem)]">Promociones, Planes y Empresas</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="w-[6vh] h-[6vh] rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              disabled={state.loading}
            >
              <svg className="w-[3vh] h-[3vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-[1vh] mt-[2vh]">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { actions.setActiveTab(tab.key); actions.resetForm(); }}
                className={`px-[2vh] py-[1vh] rounded-[1.5vh] font-black uppercase tracking-wider text-[clamp(0.7rem,1.2vh,1.3rem)] transition-all ${
                  state.activeTab === tab.key 
                    ? 'bg-white text-amber-700 shadow-lg' 
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-[3vh] space-y-[2.5vh]">
          {/* Error */}
          {state.error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[2vh] p-[2vh] flex items-center gap-[2vh] animate-in slide-in-from-top-2">
              <svg className="w-[3vh] h-[3vh] text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p className="font-bold text-rose-700 dark:text-rose-400 text-[clamp(0.7rem,1.1vh,1.4rem)]">{state.error}</p>
            </div>
          )}

          {/* Loading */}
          {state.loading && (
            <div className="flex items-center justify-center py-[4vh]">
              <svg className="w-[5vh] h-[5vh] animate-spin text-amber-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
            </div>
          )}

          {/* Botón Crear Nuevo */}
          {!state.showForm && !state.loading && (
            <button
              onClick={() => actions.setShowForm(true)}
              className="w-full py-[2vh] rounded-[2vh] font-black uppercase tracking-widest bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all flex items-center justify-center gap-[1.5vh] text-[clamp(0.8rem,1.3vh,1.7rem)]"
            >
              <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/>
              </svg>
              Crear Nuevo
            </button>
          )}

          {/* Formulario */}
          {state.showForm && (
            <form onSubmit={actions.handleSubmit} className="bg-amber-50 dark:bg-amber-900/20 rounded-[2vh] p-[2.5vh] border border-amber-200 dark:border-amber-800 space-y-[2vh]">
              <p className="font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest text-[clamp(0.8rem,1.3vh,1.5rem)]">
                {state.editingId ? 'Editar' : 'Crear'} {state.activeTab === 'promociones' ? 'Promoción' : state.activeTab === 'planes' ? 'Plan' : 'Empresa'}
              </p>

              {state.activeTab === 'promociones' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2vh]">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={state.formPromocion.nombre || ''}
                      onChange={e => actions.setFormPromocion({ ...state.formPromocion, nombre: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="NOMBRE DE PROMOCIÓN"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Empresa *
                    </label>
                    <select
                      value={state.formPromocion.empresa_origen_id || ''}
                      onChange={e => actions.setFormPromocion({ ...state.formPromocion, empresa_origen_id: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      required
                    >
                      <option value="">Seleccionar empresa</option>
                      {state.empresas.map(emp => (
                        <option key={emp.empresa_origen_id} value={emp.empresa_origen_id}>
                          {emp.nombre_empresa}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Descuento (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={state.formPromocion.descuento || 0}
                      onChange={e => actions.setFormPromocion({ ...state.formPromocion, descuento: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Beneficios
                    </label>
                    <input
                      type="text"
                      value={state.formPromocion.beneficios || ''}
                      onChange={e => actions.setFormPromocion({ ...state.formPromocion, beneficios: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Beneficios de la promoción"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-[2vh]">
                    <input
                      type="checkbox"
                      id="promoActivo"
                      checked={state.formPromocion.activo ?? true}
                      onChange={e => actions.setFormPromocion({ ...state.formPromocion, activo: e.target.checked })}
                      className="w-[3vh] h-[3vh] rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="promoActivo" className="font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Activo
                    </label>
                  </div>
                </div>
              )}

              {state.activeTab === 'planes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2vh]">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={state.formPlan.nombre || ''}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, nombre: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="NOMBRE DEL PLAN"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Empresa *
                    </label>
                    <select
                      value={state.formPlan.empresa_origen_id || ''}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, empresa_origen_id: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      required
                    >
                      <option value="">Seleccionar empresa</option>
                      {state.empresas.map(emp => (
                        <option key={emp.empresa_origen_id} value={emp.empresa_origen_id}>
                          {emp.nombre_empresa}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Precio ($) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={state.formPlan.precio || 0}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, precio: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Gigabytes *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={state.formPlan.gigabyte || 0}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, gigabyte: Number(e.target.value) })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Llamadas
                    </label>
                    <input
                      type="text"
                      value={state.formPlan.llamadas || ''}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, llamadas: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Ilimitadas"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Mensajes
                    </label>
                    <input
                      type="text"
                      value={state.formPlan.mensajes || ''}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, mensajes: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Ilimitados"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      WhatsApp
                    </label>
                    <select
                      value={state.formPlan.whatsapp || 'SI'}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, whatsapp: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                    >
                      <option value="SI">SI</option>
                      <option value="NO">NO</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Roaming
                    </label>
                    <select
                      value={state.formPlan.roaming || 'Nacional'}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, roaming: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                    >
                      <option value="Nacional">Nacional</option>
                      <option value="Internacional">Internacional</option>
                      <option value="USA">USA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Promoción
                    </label>
                    <select
                      value={state.formPlan.promocion_id || ''}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, promocion_id: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                    >
                      <option value="">Sin promoción</option>
                      {state.promociones.map(promo => (
                        <option key={promo.promocion_id} value={promo.promocion_id}>
                          {promo.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Beneficios
                    </label>
                    <input
                      type="text"
                      value={state.formPlan.beneficios || ''}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, beneficios: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Beneficios adicionales"
                    />
                  </div>
                  <div className="md:col-span-2 flex items-center gap-[2vh]">
                    <input
                      type="checkbox"
                      id="planActivo"
                      checked={state.formPlan.activo ?? true}
                      onChange={e => actions.setFormPlan({ ...state.formPlan, activo: e.target.checked })}
                      className="w-[3vh] h-[3vh] rounded border-amber-300 text-amber-600 focus:ring-amber-500"
                    />
                    <label htmlFor="planActivo" className="font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Activo
                    </label>
                  </div>
                </div>
              )}

              {state.activeTab === 'empresas' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2vh]">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      Nombre de Empresa *
                    </label>
                    <input
                      type="text"
                      value={state.formEmpresa.nombre_empresa || ''}
                      onChange={e => actions.setFormEmpresa({ ...state.formEmpresa, nombre_empresa: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="NOMBRE DE LA EMPRESA"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-[0.8vh] ml-[0.5vh] text-[clamp(0.65rem,1.2vh,0.8rem)]">
                      País *
                    </label>
                    <input
                      type="text"
                      value={state.formEmpresa.pais || ''}
                      onChange={e => actions.setFormEmpresa({ ...state.formEmpresa, pais: e.target.value })}
                      className="w-full px-[2vh] h-[5vh] bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-[1.5vh] text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium text-[clamp(0.85rem,1.8vh,1rem)]"
                      placeholder="Argentina"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-[2vh] pt-[1vh]">
                <button
                  type="button"
                  onClick={actions.resetForm}
                  className="flex-1 py-[2vh] rounded-[2vh] font-black uppercase tracking-widest border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[clamp(0.8rem,1.3vh,1.7rem)]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={state.loading}
                  className="flex-1 py-[2vh] rounded-[2vh] font-black uppercase tracking-widest bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all disabled:opacity-50 disabled:shadow-none text-[clamp(0.8rem,1.3vh,1.7rem)]"
                >
                  {state.loading ? 'Guardando...' : state.editingId ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          )}

          {/* Lista de Registros */}
          {!state.showForm && !state.loading && (
            <div className="space-y-[1.5vh]">
              {state.activeTab === 'promociones' && (
                <>
                  {state.promociones.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-[4vh] font-bold">No hay promociones</p>
                  ) : (
                    state.promociones.map(promo => (
                      <div key={promo.promocion_id} className="flex items-center justify-between p-[2vh] bg-white dark:bg-slate-800 rounded-[2vh] border border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.85rem,1.3vh,1.4rem)]">{promo.nombre}</p>
                          <p className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.7rem,1vh,1.2rem)]">
                            {actions.getEmpresaName(promo.empresa_origen_id)} • {promo.descuento}% descuento
                          </p>
                        </div>
                        <div className="flex items-center gap-[1vh]">
                          <span className={`px-[1.5vh] py-[0.5vh] rounded-full text-[clamp(0.6rem,1vh,1rem)] font-bold ${promo.activo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {promo.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <button
                            onClick={() => actions.handleEdit(promo)}
                            className="p-[1vh] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-[1vh] hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => actions.handleDelete(promo.promocion_id)}
                            className="p-[1vh] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-[1vh] hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {state.activeTab === 'planes' && (
                <>
                  {state.planes.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-[4vh] font-bold">No hay planes</p>
                  ) : (
                    state.planes.map(plan => (
                      <div key={plan.plan_id} className="flex items-center justify-between p-[2vh] bg-white dark:bg-slate-800 rounded-[2vh] border border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.85rem,1.3vh,1.4rem)]">{plan.nombre}</p>
                          <p className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.7rem,1vh,1.2rem)]">
                            {actions.getEmpresaName(plan.empresa_origen_id)} • ${plan.precio} • {plan.gigabyte}GB
                          </p>
                        </div>
                        <div className="flex items-center gap-[1vh]">
                          <span className={`px-[1.5vh] py-[0.5vh] rounded-full text-[clamp(0.6rem,1vh,1rem)] font-bold ${plan.activo ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                            {plan.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <button
                            onClick={() => actions.handleEdit(plan)}
                            className="p-[1vh] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-[1vh] hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => actions.handleDelete(plan.plan_id)}
                            className="p-[1vh] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-[1vh] hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}

              {state.activeTab === 'empresas' && (
                <>
                  {state.empresas.length === 0 ? (
                    <p className="text-center text-slate-500 dark:text-slate-400 py-[4vh] font-bold">No hay empresas</p>
                  ) : (
                    state.empresas.map(emp => (
                      <div key={emp.empresa_origen_id} className="flex items-center justify-between p-[2vh] bg-white dark:bg-slate-800 rounded-[2vh] border border-amber-100 dark:border-amber-900 hover:border-amber-300 dark:hover:border-amber-700 transition-all">
                        <div className="flex-1">
                          <p className="font-black text-slate-800 dark:text-white uppercase text-[clamp(0.85rem,1.3vh,1.4rem)]">{emp.nombre_empresa}</p>
                          <p className="font-bold text-slate-500 dark:text-slate-400 text-[clamp(0.7rem,1vh,1.2rem)]">{emp.pais}</p>
                        </div>
                        <div className="flex items-center gap-[1vh]">
                          <button
                            onClick={() => actions.handleEdit(emp)}
                            className="p-[1vh] bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-[1vh] hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => actions.handleDelete(emp.empresa_origen_id)}
                            className="p-[1vh] bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 rounded-[1vh] hover:bg-rose-200 dark:hover:bg-rose-900/60 transition-colors"
                          >
                            <svg className="w-[2.5vh] h-[2.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
