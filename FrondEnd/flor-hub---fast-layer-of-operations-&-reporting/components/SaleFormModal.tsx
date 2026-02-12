import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { Sale, ProductType, OriginMarket } from '../types';
import { PLANES_MOCK } from '../mocks/planes';
import { PROMOCIONES_MOCK, getPromocionesByPlanAndTipo } from '../mocks/promociones';
import { EMPRESAS_ORIGEN_MOCK } from '../mocks/empresasOrigen';
import { SUPERVISORES_MOCK, getSupervisorFullName } from '../mocks/supervisores';

const SaleFormSchema = z.object({
  customerName: z.string().min(1, 'El nombre es requerido').max(100, 'Máximo 100 caracteres'),
  customerLastName: z.string().min(1, 'El apellido es requerido').max(100, 'Máximo 100 caracteres'),
  dni: z.string().min(7, 'DNI inválido').max(15, 'DNI inválido'),
  phoneNumber: z.string().min(8, 'Teléfono inválido').max(20, 'Máximo 20 caracteres'),
  productType: z.enum(['PORTABILITY', 'NEW_LINE']),
  originMarket: z.nativeEnum(OriginMarket),
  chip: z.enum(['SIM', 'ESIM']),
  originCompany: z.string().optional(),
  sds: z.string().optional(),
  stl: z.string().optional(),
  planId: z.number().positive('Debe seleccionar un plan'),
  promotionId: z.number().positive('Debe seleccionar una promoción').optional(),
  supervisorId: z.string().uuid('Debe seleccionar un supervisor'),
  amount: z.number().min(0, 'El monto no puede ser negativo'),
  priority: z.enum(['ALTA', 'MEDIA', 'BAJA']),
}).refine((data) => {
  if (data.productType === 'PORTABILITY') {
    return !!data.originCompany && !!data.sds && !!data.stl;
  }
  return true;
}, {
  message: 'Las portabilidades requieren empresa origen, SPN (SDS) y número de línea (STL)',
  path: ['originCompany'],
});

type SaleFormData = z.infer<typeof SaleFormSchema>;

interface SaleFormModalProps {
  onClose: () => void;
  onSubmit: (sale: Partial<Sale>) => void;
  initialData?: Partial<Sale>;
}

export const SaleFormModal: React.FC<SaleFormModalProps> = ({ onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    customerLastName: '',
    dni: '',
    phoneNumber: '',
    productType: initialData?.productType || ProductType.PORTABILITY,
    originMarket: initialData?.originMarket || OriginMarket.PREPAGO,
    chip: 'SIM' as 'SIM' | 'ESIM',
    originCompany: '',
    sds: '',
    stl: '',
    planId: 0,
    promotionId: 0,
    supervisorId: '',
    amount: initialData?.amount || 0,
    priority: 'MEDIA' as 'ALTA' | 'MEDIA' | 'BAJA',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const isPreloaded = !!initialData?.plan;
  const isPorta = formData.productType === ProductType.PORTABILITY;

  const promocionesDisponibles = useMemo(() => {
    if (!formData.planId) return [];
    const tipoVenta = formData.productType === 'PORTABILITY' ? 'PORTABILIDAD' : 'LINEA_NUEVA';
    return getPromocionesByPlanAndTipo(formData.planId, tipoVenta);
  }, [formData.planId, formData.productType]);

  const handlePlanChange = (planId: number) => {
    const plan = PLANES_MOCK.find(p => p.plan_id === planId);
    setFormData(prev => ({
      ...prev,
      planId,
      amount: plan ? plan.precio : 0,
      promotionId: 0,
    }));
  };

  const validateField = (field: string, value: any) => {
    const fieldSchema = SaleFormSchema.shape[field as keyof SaleFormData];
    if (!fieldSchema) return '';
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0].message;
    }
    return '';
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const validateForm = (): boolean => {
    const result = SaleFormSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as string;
        newErrors[field] = err.message;
      });
      setErrors(newErrors);
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => {
        allTouched[key] = true;
      });
      setTouched(allTouched);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const plan = PLANES_MOCK.find(p => p.plan_id === formData.planId);
    const promocion = PROMOCIONES_MOCK.find(p => p.promocion_id === formData.promotionId);
    const supervisor = SUPERVISORES_MOCK.find(s => s.usuario_id === formData.supervisorId);
    const empresaOrigen = EMPRESAS_ORIGEN_MOCK.find(e => e.empresa_origen_id === Number(formData.originCompany));

    const saleData: Partial<Sale> = {
      customerName: `${formData.customerName} ${formData.customerLastName}`.trim(),
      dni: formData.dni.toUpperCase(),
      phoneNumber: formData.phoneNumber,
      productType: formData.productType,
      originMarket: formData.originMarket,
      originCompany: empresaOrigen?.nombre || '',
      plan: plan?.nombre || '',
      promotion: promocion?.nombre || '',
      amount: formData.amount,
      supervisor: supervisor ? getSupervisorFullName(supervisor) : '',
      priority: formData.priority,
    };

    const backendData = {
      ...saleData,
      chip: formData.chip,
      sds: formData.sds?.toUpperCase() || null,
      stl: formData.stl || null,
      plan_id: formData.planId,
      promocion_id: formData.promotionId || null,
      empresa_origen_id: isPorta ? Number(formData.originCompany) : null,
      vendedor_id: formData.supervisorId,
    };

    onSubmit(backendData as Partial<Sale>);
  };

  const getInputClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `border rounded-[2vh] px-[2vh] py-[1.8vh] font-bold outline-none transition-all text-[clamp(0.8rem,1.2vh,1.5rem)] ${
      hasError
        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 focus:ring-4 focus:ring-rose-100'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30'
    }`;
  };

  const getSelectClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `border rounded-[2vh] px-[2vh] py-[1.8vh] font-bold outline-none transition-all cursor-pointer text-[clamp(0.8rem,1.2vh,1.5rem)] ${
      hasError
        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 focus:ring-4 focus:ring-rose-100'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30'
    }`;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-[2vw] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-[85vw] bg-white dark:bg-slate-900 rounded-[4vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white dark:border-white/5 max-h-[92vh] flex flex-col">
        <div className="p-[4vh] bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-black italic tracking-tighter uppercase text-[clamp(1.5rem,3vh,3rem)]">
              {isPreloaded ? 'Formalizar Venta de Plan' : 'Nueva Carga Directa'}
            </h3>
            <p className="font-black uppercase tracking-[0.3em] opacity-80 mt-[0.5vh] text-[clamp(0.6rem,1.1vh,1.4rem)]">
              Registro Oficial en FLOR HUB
            </p>
          </div>
          <button onClick={onClose} className="p-[1.5vh] bg-white/20 hover:bg-white/40 rounded-[1.8vh] transition-all">
            <svg className="w-[3.5vh] h-[3.5vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-[5vh] bg-slate-50/50 dark:bg-slate-950/20 overflow-y-auto flex-1 no-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-[5vh]">
            <div className="space-y-[3vh]">
                <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-[1.5vh] text-[clamp(0.7rem,1.2vh,1.5rem)]">
                Datos del Titular
              </p>
              
              <div className="grid grid-cols-2 gap-[2vh]">
                <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                    Nombre <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.customerName}
                    onChange={e => handleChange('customerName', e.target.value)}
                    className={getInputClass('customerName')}
                    placeholder="Ej: Juan"
                  />
                  {touched.customerName && errors.customerName && (
                    <span className="font-bold text-rose-500 ml-[1vh] text-[clamp(0.6rem,1vh,1.1rem)]">{errors.customerName}</span>
                  )}
                </div>
                <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                    Apellido <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.customerLastName}
                    onChange={e => handleChange('customerLastName', e.target.value)}
                    className={getInputClass('customerLastName')}
                    placeholder="Ej: Pérez"
                  />
                  {touched.customerLastName && errors.customerLastName && (
                    <span className="font-bold text-rose-500 ml-[1vh] text-[clamp(0.6rem,1vh,1.1rem)]">{errors.customerLastName}</span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-[2vh]">
                <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                    DNI / NIE <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    value={formData.dni}
                    onChange={e => handleChange('dni', e.target.value.toUpperCase())}
                    className={`${getInputClass('dni')} uppercase`}
                    placeholder="12345678X"
                  />
                  {touched.dni && errors.dni && (
                    <span className="font-bold text-rose-500 ml-[1vh] text-[clamp(0.6rem,1vh,1.1rem)]">{errors.dni}</span>
                  )}
                </div>
                <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                    Teléfono Contacto <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    value={formData.phoneNumber}
                    onChange={e => handleChange('phoneNumber', e.target.value)}
                    className={getInputClass('phoneNumber')}
                    placeholder="600000000"
                  />
                  {touched.phoneNumber && errors.phoneNumber && (
                    <span className="font-bold text-rose-500 ml-[1vh] text-[clamp(0.6rem,1vh,1.1rem)]">{errors.phoneNumber}</span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                  Supervisor Asignado <span className="text-rose-500">*</span>
                </label>
                <select 
                  value={formData.supervisorId}
                  onChange={e => handleChange('supervisorId', e.target.value)}
                  className={getSelectClass('supervisorId')}
                >
                  <option value="">Selecciona Supervisor...</option>
                  {SUPERVISORES_MOCK.map(s => (
                    <option key={s.usuario_id} value={s.usuario_id}>
                      {getSupervisorFullName(s)} ({s.legajo})
                    </option>
                  ))}
                </select>
                {touched.supervisorId && errors.supervisorId && (
                  <span className="font-bold text-rose-500 ml-[1vh] text-[clamp(0.6rem,1vh,1.1rem)]">{errors.supervisorId}</span>
                )}
              </div>
            </div>

            <div className="space-y-[3vh]">
                <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-[1.5vh] text-[clamp(0.7rem,1.2vh,1.5rem)]">
                Configuración de Producto
              </p>
              
              <div className="grid grid-cols-2 gap-[2vh]">
                <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                    Tipo de Venta <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={formData.productType}
                    onChange={e => handleChange('productType', e.target.value)}
                    className={getSelectClass('productType')}
                  >
                    <option value="PORTABILITY">PORTABILIDAD</option>
                    <option value="NEW_LINE">LÍNEA NUEVA</option>
                  </select>
                </div>
                <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                    Mercado Origen <span className="text-rose-500">*</span>
                  </label>
                  <select 
                    value={formData.originMarket}
                    onChange={e => handleChange('originMarket', e.target.value)}
                    className={getSelectClass('originMarket')}
                  >
                    {Object.values(OriginMarket).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                  Tipo de Chip <span className="text-rose-500">*</span>
                </label>
                <div className="flex gap-[1.5vh]">
                  {['SIM', 'ESIM'].map(chipType => (
                    <button
                      key={chipType}
                      type="button"
                      onClick={() => handleChange('chip', chipType)}
                      className={`flex-1 py-[1.8vh] rounded-[1.8vh] font-black uppercase tracking-widest border transition-all text-[clamp(0.7rem,1.2vh,1.3rem)] ${
                        formData.chip === chipType 
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' 
                          : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {chipType}
                    </button>
                  ))}
                </div>
              </div>

              {isPorta && (
                <>
                  <div className="flex flex-col gap-[1vh]">
                    <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                      Empresa de Origen <span className="text-rose-500">*</span>
                    </label>
                    <select 
                      value={formData.originCompany}
                      onChange={e => handleChange('originCompany', e.target.value)}
                      className={getSelectClass('originCompany')}
                    >
                      <option value="">Selecciona Operador...</option>
                      {EMPRESAS_ORIGEN_MOCK.map(e => (
                        <option key={e.empresa_origen_id} value={e.empresa_origen_id}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                    {touched.originCompany && errors.originCompany && (
                      <span className="font-bold text-rose-500 ml-[1vh] text-[clamp(0.6rem,1vh,1.1rem)]">{errors.originCompany}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-[2vh]">
                    <div className="flex flex-col gap-[1vh]">
                      <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                        SPN (SDS) <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.sds}
                        onChange={e => handleChange('sds', e.target.value.toUpperCase())}
                        className={`${getInputClass('sds')} uppercase`}
                        placeholder="SPN-XXXXX"
                      />
                      {touched.sds && errors.sds && (
                        <span className="font-bold text-rose-500 ml-[1vh] text-[clamp(0.6rem,1vh,1.1rem)]">{errors.sds}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-[1vh]">
                      <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                        N° Línea (STL) <span className="text-rose-500">*</span>
                      </label>
                      <input 
                        type="text" 
                        value={formData.stl}
                        onChange={e => handleChange('stl', e.target.value)}
                        className={getInputClass('stl')}
                        placeholder="600000000"
                      />
                      {touched.stl && errors.stl && (
                        <span className="font-bold text-rose-500 ml-[1vh] text-[clamp(0.6rem,1vh,1.1rem)]">{errors.stl}</span>
                      )}
                    </div>
                  </div>
                </>
              )}

              <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                  Plan Seleccionado <span className="text-rose-500">*</span>
                </label>
                <select 
                  disabled={isPreloaded}
                  value={formData.planId || ''}
                  onChange={e => handlePlanChange(Number(e.target.value))}
                  className={`${getSelectClass('planId')} ${isPreloaded ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : ''}`}
                >
                  <option value="">Selecciona Plan...</option>
                  {PLANES_MOCK.map(p => (
                    <option key={p.plan_id} value={p.plan_id}>
                      {p.nombre} - ${p.precio.toLocaleString()}
                    </option>
                  ))}
                </select>
                {touched.planId && errors.planId && (
                  <span className="text-[9px] font-bold text-rose-500 ml-2">{errors.planId}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2">
                  Promoción <span className="text-rose-500">*</span>
                </label>
                <select 
                  disabled={isPreloaded || !formData.planId}
                  value={formData.promotionId || ''}
                  onChange={e => handleChange('promotionId', Number(e.target.value))}
                  className={`${getSelectClass('promotionId')} ${isPreloaded ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800/40 text-emerald-600 dark:text-emerald-400' : ''}`}
                >
                  <option value="">
                    {!formData.planId ? 'Selecciona un plan primero' : 'Selecciona Promoción...'}
                  </option>
                  {promocionesDisponibles.map(p => (
                    <option key={p.promocion_id} value={p.promocion_id}>
                      {p.nombre} ({p.descuento_porcentaje}% OFF)
                    </option>
                  ))}
                </select>
                {touched.promotionId && errors.promotionId && (
                  <span className="font-bold text-rose-500 ml-[1vh] text-[clamp(0.6rem,1vh,1.1rem)]">{errors.promotionId}</span>
                )}
              </div>

              <div className="flex flex-col gap-[1vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase ml-[1vh] text-[clamp(0.6rem,1.1vh,1.2rem)]">
                  Prioridad de Carga
                </label>
                <div className="flex gap-[1.5vh]">
                  {['ALTA', 'MEDIA', 'BAJA'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleChange('priority', p)}
                      className={`flex-1 py-[1.8vh] rounded-[1.8vh] font-black uppercase tracking-widest border transition-all text-[clamp(0.7rem,1.2vh,1.3rem)] ${
                        formData.priority === p 
                          ? 'bg-slate-950 dark:bg-slate-700 text-white border-slate-950 dark:border-slate-600 shadow-lg scale-105' 
                          : 'bg-white dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[6vh] flex justify-between items-center pb-[3vh]">
            <div className="flex items-center gap-[1.5vh]">
              <div className="w-[1.2vh] h-[1.2vh] rounded-full bg-emerald-500 animate-pulse"></div>
              <p className="font-black text-slate-400 uppercase tracking-widest text-[clamp(0.6rem,1.1vh,1.4rem)]">Validación de red activa</p>
            </div>
            <div className="flex gap-[2vh]">
              <button 
                type="button"
                onClick={onClose}
                className="px-[4vh] py-[2.2vh] rounded-[2.2vh] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all text-[clamp(0.8rem,1.3vh,1.6rem)]"
              >
                Descartar
              </button>
              <button 
                type="submit"
                className="px-[6vh] py-[2.2vh] rounded-[2.2vh] bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all text-[clamp(0.8rem,1.3vh,1.6rem)]"
              >
                Registrar Venta
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
