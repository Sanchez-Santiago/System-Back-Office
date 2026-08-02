import React from 'react';
import { Sale } from '../../types';
import { useSaleFormViewModel, Fase } from '../../viewmodels/modals/useSaleFormViewModel';

interface SaleFormModalProps {
  onClose: () => void;
  onVentaCreada?: () => void;
  initialData?: Partial<Sale>;
}

export const SaleFormModal: React.FC<SaleFormModalProps> = ({ onClose, onVentaCreada, initialData }) => {
  const { state, actions } = useSaleFormViewModel(onClose, onVentaCreada, initialData);
  const {
    fase, clienteEncontrado, isLoadingCliente,
    planes, empresas, isLoadingPlanes, isLoadingEmpresas,
    formFase1, formFase2, formFase3,
    filteredPlanes, filteredPromociones,
    tipoVenta, chip, planId, inputClass, labelClass, errorClass,
    isPending,
  } = state;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 transition-opacity"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/5 max-h-[90vh] flex flex-col z-10">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black italic uppercase text-xl">Nueva Venta</h3>
            <p className="font-black uppercase tracking-wider text-xs opacity-80">Registro en FLOR</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Steps */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 shrink-0">
             {[1, 2, 3].map((step) => (
                <button key={step} onClick={() => step < fase && actions.setFase(step as Fase)} className={`flex-1 py-3 font-black uppercase text-sm tracking-wider transition-all ${fase === step ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400'}`}>
                    {step === 1 ? 'Cliente' : step === 2 ? 'Venta' : chip === 'ESIM' ? 'Resumen' : 'Logística'}
                </button>
             ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            {/* FASE 1 */}
            {fase === 1 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                             <label className={labelClass}>Tipo <span className="text-red-500">*</span></label>
                             <select {...formFase1.register('tipo_documento')} className={inputClass}>
                                <option value="DNI">DNI</option>
                                <option value="CUIL">CUIL</option>
                                <option value="CI">CI (Cédula Identidad)</option>
                                <option value="PASAPORTE">Pasaporte</option>
                                <option value="LC">LC (Libreta Circulación)</option>
                                <option value="LE">LE (Libreta Enrolamiento)</option>
                             </select>
                        </div>
                        <div className="col-span-2">
                             <label className={labelClass}>Documento <span className="text-red-500">*</span></label>
                             <div className="flex gap-2">
                                <input {...formFase1.register('documento')} className={inputClass} placeholder="12345678" />
                                <button type="button" onClick={actions.handleBuscarCliente} disabled={isLoadingCliente} className="bg-indigo-600 text-white px-6 rounded-xl font-bold">Buscar</button>
                             </div>
                        </div>
                    </div>
                    
                    {clienteEncontrado ? (
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 font-bold mb-4">
                                 ✓ Cliente: {clienteEncontrado.nombre} {clienteEncontrado.apellido}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Nombre <span className="text-red-500">*</span></label><input {...formFase1.register('nombre')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Apellido <span className="text-red-500">*</span></label><input {...formFase1.register('apellido')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Email <span className="text-red-500">*</span></label><input {...formFase1.register('email')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Teléfono <span className="text-red-500">*</span></label><input {...formFase1.register('telefono')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Fecha Nac. <span className="text-red-500">*</span></label><input type="date" {...formFase1.register('fecha_nacimiento')} className={inputClass} readOnly /></div>
                                <div><label className={labelClass}>Género <span className="text-red-500">*</span></label>
                                    <select {...formFase1.register('genero')} className={inputClass} disabled>
                                        <option value="">Seleccionar...</option>
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMENINO">Femenino</option>
                                    </select>
                                </div>
                                <div className="col-span-2"><label className={labelClass}>Nacionalidad <span className="text-red-500">*</span></label>
                                    <select {...formFase1.register('nacionalidad')} className={inputClass} disabled>
                                        <option value="">Seleccionar...</option>
                                        <option value="ARGENTINA">Argentina</option>
                                        <option value="URUGUAY">Uruguay</option>
                                        <option value="PARAGUAY">Paraguay</option>
                                        <option value="BRASIL">Brasil</option>
                                        <option value="CHILE">Chile</option>
                                        <option value="BOLIVIA">Bolivia</option>
                                        <option value="PERU">Perú</option>
                                        <option value="COLOMBIA">Colombia</option>
                                        <option value="VENEZUELA">Venezuela</option>
                                        <option value="ECUADOR">Ecuador</option>
                                        <option value="ESPAÑA">España</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4 border-t border-slate-100 pt-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>Nombre <span className="text-red-500">*</span></label><input {...formFase1.register('nombre')} className={inputClass} /></div>
                                <div><label className={labelClass}>Apellido <span className="text-red-500">*</span></label><input {...formFase1.register('apellido')} className={inputClass} /></div>
                                <div><label className={labelClass}>Email <span className="text-red-500">*</span></label><input {...formFase1.register('email')} className={inputClass} placeholder="correo@ejemplo.com" /></div>
                                <div><label className={labelClass}>Teléfono <span className="text-red-500">*</span></label><input {...formFase1.register('telefono')} inputMode="numeric" className={inputClass} /></div>
                                <div><label className={labelClass}>Fecha Nac. <span className="text-red-500">*</span></label><input type="date" {...formFase1.register('fecha_nacimiento')} className={inputClass} /></div>
                                <div><label className={labelClass}>Género <span className="text-red-500">*</span></label>
                                    <select {...formFase1.register('genero')} className={inputClass}>
                                        <option value="">Seleccionar...</option>
                                        <option value="MASCULINO">Masculino</option>
                                        <option value="FEMENINO">Femenino</option>
                                    </select>
                                </div>
                                <div className="col-span-2"><label className={labelClass}>Nacionalidad <span className="text-red-500">*</span></label>
                                    <select {...formFase1.register('nacionalidad')} className={inputClass}>
                                        <option value="">Seleccionar...</option>
                                        <option value="ARGENTINA">Argentina</option>
                                        <option value="URUGUAY">Uruguay</option>
                                        <option value="PARAGUAY">Paraguay</option>
                                        <option value="BRASIL">Brasil</option>
                                        <option value="CHILE">Chile</option>
                                        <option value="BOLIVIA">Bolivia</option>
                                        <option value="PERU">Perú</option>
                                        <option value="COLOMBIA">Colombia</option>
                                        <option value="VENEZUELA">Venezuela</option>
                                        <option value="ECUADOR">Ecuador</option>
                                        <option value="ESPAÑA">España</option>
                                        <option value="OTRO">Otro</option>
                                    </select>
                                </div>
                            </div>
                            <button type="button" onClick={actions.handleCrearCliente} disabled={isLoadingCliente} className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Crear Cliente</button>
                        </div>
                    )}
                </div>
            )}

            {/* FASE 2 */}
            {fase === 2 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <button type="button" onClick={() => formFase2.setValue('tipo_venta', 'LINEA_NUEVA')} className={`p-4 rounded-xl border-2 ${tipoVenta === 'LINEA_NUEVA' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
                            📱 Línea Nueva
                        </button>
                        <button type="button" onClick={() => formFase2.setValue('tipo_venta', 'PORTABILIDAD')} className={`p-4 rounded-xl border-2 ${tipoVenta === 'PORTABILIDAD' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'}`}>
                            🔄 Portabilidad
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div><label className={labelClass}>SDS</label><input {...formFase2.register('sds')} className={inputClass} placeholder="SDS001" /></div>
                         <div><label className={labelClass}>STL <span className="text-xs text-slate-400">(Opcional - Solo números)</span></label><input {...formFase2.register('stl')} inputMode="numeric" disabled={chip === 'ESIM'} className={`${inputClass} ${chip === 'ESIM' ? 'opacity-50' : ''}`} placeholder={chip === 'ESIM' ? 'No aplica' : '123456'} /></div>
                    </div>

                    {tipoVenta === 'PORTABILIDAD' && (
                        <div>
                             <label className={labelClass}>Empresa Origen <span className="text-red-500">*</span></label>
                             <select {...formFase2.register('empresa_origen_id', { valueAsNumber: true })} className={inputClass}>
                                <option value={0}>Seleccionar...</option>
                                {empresas?.filter(e => e.empresa_origen_id !== 2).map(e => <option key={e.empresa_origen_id} value={e.empresa_origen_id}>{e.nombre_empresa}</option>)}
                             </select>
                             {formFase2.formState.errors.empresa_origen_id && <p className={errorClass}>{formFase2.formState.errors.empresa_origen_id.message}</p>}
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                             <label className={labelClass}>Plan <span className="text-red-500">*</span></label>
                             <select {...formFase2.register('plan_id', { valueAsNumber: true })} className={inputClass}>
                                <option value={0}>Seleccionar...</option>
                                {filteredPlanes?.map(p => <option key={p.plan_id} value={p.plan_id}>{p.nombre} ({p.precio})</option>)}
                             </select>
                        </div>
                        <div>
                             <label className={labelClass}>Promoción</label>
                             <select {...formFase2.register('promocion_id', { valueAsNumber: true })} className={inputClass}>
                                <option value="">Sin promo</option>
                                {filteredPromociones?.map(p => <option key={p.promocion_id} value={p.promocion_id}>{p.nombre}</option>)}
                             </select>
                        </div>
                    </div>

                    {tipoVenta === 'PORTABILIDAD' && (
                        <div className="grid grid-cols-2 gap-4 border-t pt-4 border-slate-100">
                             <div><label className={labelClass}>SPN <span className="text-xs text-slate-400">(Opcional)</span></label><input {...formFase2.register('spn')} className={inputClass} placeholder="Opcional" /></div>
                             <div><label className={labelClass}>Línea a Portar <span className="text-red-500">*</span></label><input {...formFase2.register('numero_portar')} inputMode="numeric" className={inputClass} placeholder="091123456" /></div>
                             <div><label className={labelClass}>PIN <span className="text-xs text-slate-400">(Opcional - 4 dígitos)</span></label><input {...formFase2.register('pin')} inputMode="numeric" maxLength={4} className={inputClass} placeholder="1234" /></div>
                             <div><label className={labelClass}>Vencimiento PIN</label><input type="date" {...formFase2.register('fecha_vencimiento_pin')} className={inputClass} /></div>
                             <div className="col-span-2">
                                 <label className={labelClass}>Mercado Origen <span className="text-red-500">*</span></label>
                                 <select {...formFase2.register('mercado_origen')} className={inputClass}>
                                     <option value="">Seleccionar...</option>
                                     <option value="PREPAGO">Prepago</option>
                                     <option value="POSPAGO">Pospago</option>
                                 </select>
                             </div>
                        </div>
                    )}
                    
                     <div className="grid grid-cols-2 gap-4">
                         <button type="button" onClick={() => formFase2.setValue('chip', 'SIM')} className={`p-4 rounded-xl border-2 ${chip === 'SIM' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'}`}>💳 SIM Física</button>
                         <button type="button" onClick={() => formFase2.setValue('chip', 'ESIM')} className={`p-4 rounded-xl border-2 ${chip === 'ESIM' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'border-slate-200 dark:border-slate-700'}`}>📲 eSIM</button>
                    </div>
                </div>
            )}

            {/* FASE 3 */}
            {fase === 3 && (
                <div className="space-y-6">
                    {chip === 'SIM' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className={labelClass}>SAP <span className="text-xs text-slate-400">(Opcional - Solo números)</span></label><input {...formFase3.register('sap')} inputMode="numeric" className={inputClass} placeholder="123456789" /></div>
                                <div>
                                    <label className={labelClass}>Teléfono Contacto <span className="text-red-500">*</span></label>
                                    <div className="flex gap-2">
                                        <input {...formFase3.register('numero')} inputMode="numeric" className={inputClass} placeholder="091123456" />
                                        {tipoVenta === 'PORTABILIDAD' ? (
                                            <button type="button" onClick={actions.usarNumeroPortarComoContacto} className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 whitespace-nowrap">
                                                Usar N°
                                            </button>
                                        ) : (
                                            <button type="button" onClick={actions.usarTelefonoClienteComoContacto} className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-xs font-medium hover:bg-blue-200 dark:hover:bg-blue-900/50 whitespace-nowrap">
                                                Cliente
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <label className={labelClass}>Persona Autorizada <span className="text-xs text-slate-400">(Opcional)</span></label>
                                    <div className="flex gap-2">
                                        <input {...formFase3.register('persona_autorizada')} className={inputClass} placeholder="Nombre de persona autorizada" />
                                        <button type="button" onClick={actions.usarClienteComoAutorizado} className="px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-200 dark:hover:bg-green-900/50 whitespace-nowrap">
                                            Cliente
                                        </button>
                                    </div>
                                </div>
                                <div className="col-span-2"><label className={labelClass}>Dirección <span className="text-red-500">*</span></label><input {...formFase3.register('direccion')} className={inputClass} /></div>
                                <div><label className={labelClass}>Número <span className="text-red-500">*</span></label><input {...formFase3.register('numero_casa')} inputMode="numeric" className={inputClass} /></div>
                                <div><label className={labelClass}>Entre Calles</label><input {...formFase3.register('entre_calles')} className={inputClass} /></div>
                                <div><label className={labelClass}>Barrio</label><input {...formFase3.register('barrio')} className={inputClass} /></div>
                                <div><label className={labelClass}>Localidad <span className="text-red-500">*</span></label><input {...formFase3.register('localidad')} className={inputClass} /></div>
                                <div><label className={labelClass}>Departamento <span className="text-red-500">*</span></label><input {...formFase3.register('departamento')} className={inputClass} /></div>
                                <div><label className={labelClass}>CP <span className="text-red-500">*</span></label><input {...formFase3.register('codigo_postal')} inputMode="numeric" className={inputClass} placeholder="12345" /></div>
                                <div><label className={labelClass}>Tipo</label>
                                    <select {...formFase3.register('tipo')} className={inputClass}>
                                        <option value="RESIDENCIAL">Residencial</option>
                                        <option value="EMPRESARIAL">Empresarial</option>
                                    </select>
                                </div>
                                <div><label className={labelClass}>Piso <span className="text-xs text-slate-400">(Opcional)</span></label><input {...formFase3.register('piso')} className={inputClass} placeholder="Opcional" /></div>
                                <div><label className={labelClass}>Depto Número <span className="text-xs text-slate-400">(Opcional)</span></label><input {...formFase3.register('departamento_numero')} className={inputClass} placeholder="Opcional" /></div>
                                <div><label className={labelClass}>Teléfono Alternativo</label><input {...formFase3.register('telefono_alternativo')} inputMode="numeric" className={inputClass} placeholder="Opcional" /></div>
                                <div><label className={labelClass}>Comentario Cartero <span className="text-xs text-slate-400">(Opcional)</span></label><input {...formFase3.register('comentario_cartero')} className={inputClass} placeholder="Opcional" /></div>
                                <div className="col-span-2"><label className={labelClass}>Geolocalización</label><input {...formFase3.register('geolocalizacion')} className={inputClass} placeholder="Latitud,Longitud" /></div>
                            </div>
                        </>
                    ) : (
                        <div className="p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl text-center">
                            <h3 className="font-bold text-indigo-800 dark:text-indigo-300">Venta de eSIM</h3>
                            <p className="text-indigo-600 dark:text-indigo-400">No se requieren datos de logística física.</p>
                        </div>
                    )}
                </div>
            )}

            {/* FASE 4 - RESUMEN */}
            {fase === 4 && (
                <div className="space-y-6">
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 p-4 rounded-xl border-l-4 border-indigo-500">
                        <h4 className="font-bold text-indigo-800 dark:text-indigo-300 text-lg mb-4">📋 Resumen de Venta</h4>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                <p className="font-bold text-slate-500 text-xs uppercase">Cliente</p>
                                <p className="font-bold">{clienteEncontrado?.nombre} {clienteEncontrado?.apellido}</p>
                                <p className="text-slate-500">{clienteEncontrado?.email}</p>
                                <p className="text-slate-500">{clienteEncontrado?.telefono}</p>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg">
                                <p className="font-bold text-slate-500 text-xs uppercase">Venta</p>
                                <p className="font-bold">{tipoVenta}</p>
                                <p className="text-slate-500">Chip: {chip}</p>
                                <p className="font-bold text-indigo-600">{filteredPlanes?.find(p => p.plan_id === planId)?.nombre}</p>
                                <p className="font-bold">${filteredPlanes?.find(p => p.plan_id === planId)?.precio}</p>
                            </div>

                            {chip === 'SIM' && (
                                <div className="col-span-2 bg-white dark:bg-slate-800 p-3 rounded-lg">
                                    <p className="font-bold text-slate-500 text-xs uppercase">📍 Datos de Envío</p>
                                    <p>{formFase3.getValues('direccion')} {formFase3.getValues('numero')}</p>
                                    <p>{formFase3.getValues('localidad')}, {formFase3.getValues('departamento')}</p>
                                    <p>CP: {formFase3.getValues('codigo_postal')}</p>
                                    <p className="text-slate-500">Contacto: {formFase3.getValues('numero')}</p>
                                </div>
                            )}

                            {tipoVenta === 'PORTABILIDAD' && (
                                <div className="col-span-2 bg-white dark:bg-slate-800 p-3 rounded-lg">
                                    <p className="font-bold text-slate-500 text-xs uppercase">📱 Portabilidad</p>
                                    <p>Número a portar: {formFase2.getValues('numero_portar')}</p>
                                    <p>Mercado: {formFase2.getValues('mercado_origen')}</p>
                                    {formFase2.getValues('pin') && <p>PIN: {formFase2.getValues('pin')}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-between shrink-0">
             {fase > 1 && <button onClick={() => actions.setFase(prev => (prev - 1) as Fase)} className="px-6 py-3 font-bold text-slate-500">Atrás</button>}
             <div className="ml-auto">
                 {fase < 4 ? (
                     <button onClick={actions.nextFase} disabled={fase === 1 && !clienteEncontrado} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:bg-slate-300">Siguiente</button>
                 ) : (
                     <button 
                        onClick={actions.onSubmit} 
                        disabled={isPending} 
                        className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-slate-300"
                      >
                          {isPending ? 'Procesando...' : 'Confirmar Venta'}
                      </button>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};
