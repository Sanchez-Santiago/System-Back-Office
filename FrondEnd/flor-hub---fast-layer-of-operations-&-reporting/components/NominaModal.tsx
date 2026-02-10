
import React, { useState, useMemo } from 'react';
import { z } from 'zod';
import { MOCK_SELLERS } from '../constants';
import { Seller } from '../types';
import { SUPERVISORES_MOCK } from '../mocks/supervisores';

// Schema Zod para crear vendedor (Persona + Usuario + Vendedor)
const VendedorFormSchema = z.object({
  // Datos de persona
  nombre: z.string().min(1, 'Nombre requerido').max(45, 'Máximo 45 caracteres'),
  apellido: z.string().min(1, 'Apellido requerido').max(45, 'Máximo 45 caracteres'),
  documento: z.string().min(1, 'Documento requerido').max(30, 'Máximo 30 caracteres'),
  tipo_documento: z.string().max(45).default('DNI'),
  email: z.string().email('Email inválido'),
  telefono: z.string().max(20, 'Máximo 20 caracteres').optional(),
  fecha_nacimiento: z.string().optional(),
  nacionalidad: z.string().max(45).default('ARGENTINA'),
  genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO', 'PREFERO NO DECIR']).default('PREFERO NO DECIR'),
  
  // Datos de usuario
  legajo: z.string().length(5, 'El legajo debe tener exactamente 5 caracteres'),
  exa: z.string().min(4, 'Mínimo 4 caracteres').max(8, 'Máximo 8 caracteres'),
  celula: z.number().int().positive('La célula debe ser un número positivo'),
  supervisor_id: z.string().uuid('Debe seleccionar un supervisor'),
  
  // Datos de cuenta (password)
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .max(100, 'Máximo 100 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[a-z]/, 'Debe contener al menos una minúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número')
    .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial'),
});

type VendedorFormData = z.infer<typeof VendedorFormSchema>;

interface NominaModalProps {
  onClose: () => void;
}

export const NominaModal: React.FC<NominaModalProps> = ({ onClose }) => {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sellers, setSellers] = useState<Seller[]>(MOCK_SELLERS);

  const [formData, setFormData] = useState<Partial<VendedorFormData>>({
    nombre: '',
    apellido: '',
    documento: '',
    tipo_documento: 'DNI',
    email: '',
    telefono: '',
    fecha_nacimiento: '',
    nacionalidad: 'ARGENTINA',
    genero: 'PREFERO NO DECIR',
    legajo: '',
    exa: '',
    celula: undefined,
    supervisor_id: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showPassword, setShowPassword] = useState(false);

  const filteredSellers = useMemo(() => {
    return sellers.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      s.legajo.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, sellers]);

  const handleChange = (field: keyof VendedorFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validar campo
    const fieldSchema = VendedorFormSchema.shape[field];
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value);
      if (!result.success) {
        setErrors(prev => ({ ...prev, [field]: result.error.errors[0].message }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const validateForm = (): boolean => {
    const result = VendedorFormSchema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
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
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const supervisor = SUPERVISORES_MOCK.find(s => s.usuario_id === formData.supervisor_id);
    
    const newSeller: Seller = {
      legajo: formData.legajo!,
      exa: formData.exa!,
      name: `${formData.nombre} ${formData.apellido}`,
      email: formData.email!,
      dni: formData.documento!,
      supervisor: supervisor ? `${supervisor.nombre} ${supervisor.apellido}` : '',
      status: 'ACTIVO',
    };

    setSellers(prev => [...prev, newSeller]);
    setShowForm(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      documento: '',
      tipo_documento: 'DNI',
      email: '',
      telefono: '',
      fecha_nacimiento: '',
      nacionalidad: 'ARGENTINA',
      genero: 'PREFERO NO DECIR',
      legajo: '',
      exa: '',
      celula: undefined,
      supervisor_id: '',
      password: '',
    });
    setErrors({});
    setTouched({});
  };

  const getInputClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  const getSelectClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-6xl h-[85vh] flex flex-col bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white">
        
        {/* Header Premium */}
        <div className="p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 text-white flex justify-between items-center relative">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-black italic tracking-tighter uppercase">Nómina de Vendedores</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mt-1">Gestión de Talento & Legajos • FLOR HUB</p>
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <button 
              onClick={() => setShowForm(true)}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4"></path>
              </svg>
              Nuevo Vendedor
            </button>
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Buscar vendedor..."
                className="bg-white/10 border border-white/20 rounded-2xl px-5 py-3 text-sm font-bold text-white placeholder:text-white/40 outline-none focus:ring-2 focus:ring-indigo-400 w-64 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <svg className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </div>
            <button onClick={onClose} className="p-3 bg-white/10 hover:bg-rose-500 rounded-2xl transition-all duration-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>
        </div>

        {/* Formulario de Nuevo Vendedor */}
        {showForm && (
          <div className="p-8 bg-slate-50 border-b border-slate-200 animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-black text-slate-900 uppercase italic">Nuevo Vendedor</h4>
              <button 
                onClick={() => { setShowForm(false); resetForm(); }}
                className="p-2 hover:bg-slate-200 rounded-xl transition-all"
              >
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Nombre */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Nombre *</label>
                  <input 
                    type="text" 
                    value={formData.nombre}
                    onChange={e => handleChange('nombre', e.target.value)}
                    className={getInputClass('nombre')}
                    placeholder="Juan"
                  />
                  {touched.nombre && errors.nombre && (
                    <span className="text-[9px] font-bold text-rose-500">{errors.nombre}</span>
                  )}
                </div>

                {/* Apellido */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Apellido *</label>
                  <input 
                    type="text" 
                    value={formData.apellido}
                    onChange={e => handleChange('apellido', e.target.value)}
                    className={getInputClass('apellido')}
                    placeholder="Pérez"
                  />
                  {touched.apellido && errors.apellido && (
                    <span className="text-[9px] font-bold text-rose-500">{errors.apellido}</span>
                  )}
                </div>

                {/* Documento */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">DNI *</label>
                  <input 
                    type="text" 
                    value={formData.documento}
                    onChange={e => handleChange('documento', e.target.value.toUpperCase())}
                    className={`${getInputClass('documento')} uppercase`}
                    placeholder="12345678"
                  />
                  {touched.documento && errors.documento && (
                    <span className="text-[9px] font-bold text-rose-500">{errors.documento}</span>
                  )}
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Email *</label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value.toLowerCase())}
                    className={getInputClass('email')}
                    placeholder="juan.perez@email.com"
                  />
                  {touched.email && errors.email && (
                    <span className="text-[9px] font-bold text-rose-500">{errors.email}</span>
                  )}
                </div>

                {/* Teléfono */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Teléfono</label>
                  <input 
                    type="tel" 
                    value={formData.telefono}
                    onChange={e => handleChange('telefono', e.target.value)}
                    className={getInputClass('telefono')}
                    placeholder="+54 11 1234-5678"
                  />
                </div>

                {/* Fecha Nacimiento */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Fecha Nacimiento</label>
                  <input 
                    type="date" 
                    value={formData.fecha_nacimiento}
                    onChange={e => handleChange('fecha_nacimiento', e.target.value)}
                    className={getInputClass('fecha_nacimiento')}
                  />
                </div>

                {/* Legajo */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Legajo * (5 chars)</label>
                  <input 
                    type="text" 
                    value={formData.legajo}
                    onChange={e => handleChange('legajo', e.target.value.toUpperCase())}
                    className={`${getInputClass('legajo')} uppercase`}
                    placeholder="V0001"
                    maxLength={5}
                  />
                  {touched.legajo && errors.legajo && (
                    <span className="text-[9px] font-bold text-rose-500">{errors.legajo}</span>
                  )}
                </div>

                {/* EXA */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Código EXA *</label>
                  <input 
                    type="text" 
                    value={formData.exa}
                    onChange={e => handleChange('exa', e.target.value.toUpperCase())}
                    className={`${getInputClass('exa')} uppercase`}
                    placeholder="EXA001"
                    maxLength={8}
                  />
                  {touched.exa && errors.exa && (
                    <span className="text-[9px] font-bold text-rose-500">{errors.exa}</span>
                  )}
                </div>

                {/* Célula */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Célula *</label>
                  <input 
                    type="number" 
                    value={formData.celula || ''}
                    onChange={e => handleChange('celula', e.target.value ? Number(e.target.value) : undefined)}
                    className={getInputClass('celula')}
                    placeholder="1"
                  />
                  {touched.celula && errors.celula && (
                    <span className="text-[9px] font-bold text-rose-500">{errors.celula}</span>
                  )}
                </div>

                {/* Supervisor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Supervisor *</label>
                  <select 
                    value={formData.supervisor_id}
                    onChange={e => handleChange('supervisor_id', e.target.value)}
                    className={getSelectClass('supervisor_id')}
                  >
                    <option value="">Seleccionar...</option>
                    {SUPERVISORES_MOCK.map(s => (
                      <option key={s.usuario_id} value={s.usuario_id}>
                        {s.nombre} {s.apellido}
                      </option>
                    ))}
                  </select>
                  {touched.supervisor_id && errors.supervisor_id && (
                    <span className="text-[9px] font-bold text-rose-500">{errors.supervisor_id}</span>
                  )}
                </div>

                {/* Género */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Género</label>
                  <select 
                    value={formData.genero}
                    onChange={e => handleChange('genero', e.target.value)}
                    className={getSelectClass('genero')}
                  >
                    <option value="MASCULINO">Masculino</option>
                    <option value="FEMENINO">Femenino</option>
                    <option value="OTRO">Otro</option>
                    <option value="PREFERO NO DECIR">Prefiero no decir</option>
                  </select>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase">Contraseña *</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={e => handleChange('password', e.target.value)}
                      className={getInputClass('password')}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.059 10.059 0 013.999-5.123m3.999-2.123a9.96 9.96 0 013.542-.75M15 12a3 3 0 11-6 0 3 3 0 016 0z M3 3l18 18"></path>
                        )}
                      </svg>
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <span className="text-[9px] font-bold text-rose-500">{errors.password}</span>
                  )}
                </div>
              </div>

              {/* Requisitos de contraseña */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2">
                  Requisitos de Contraseña
                </p>
                <ul className="text-[10px] font-medium text-indigo-700 space-y-1">
                  <li className={formData.password && formData.password.length >= 8 ? 'text-emerald-600' : ''}>
                    ✓ Mínimo 8 caracteres
                  </li>
                  <li className={formData.password && /[A-Z]/.test(formData.password) ? 'text-emerald-600' : ''}>
                    ✓ Al menos una mayúscula
                  </li>
                  <li className={formData.password && /[a-z]/.test(formData.password) ? 'text-emerald-600' : ''}>
                    ✓ Al menos una minúscula
                  </li>
                  <li className={formData.password && /[0-9]/.test(formData.password) ? 'text-emerald-600' : ''}>
                    ✓ Al menos un número
                  </li>
                  <li className={formData.password && /[^A-Za-z0-9]/.test(formData.password) ? 'text-emerald-600' : ''}>
                    ✓ Al menos un carácter especial
                  </li>
                </ul>
              </div>

              <div className="flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
                  className="px-8 py-3 rounded-[22px] text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-3 rounded-[22px] bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
                >
                  Crear Vendedor
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Content - Table Bento Style */}
        <div className="flex-1 overflow-auto p-8 bg-slate-50/50">
          <div className="grid grid-cols-1 gap-4">
            {/* Table Header */}
            <div className="hidden lg:grid grid-cols-7 gap-4 px-6 py-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Legajo / EXA</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nombre Completo</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Cédula</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supervisor</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</span>
            </div>

            {/* Seller Cards */}
            {filteredSellers.map((seller) => (
              <div key={seller.legajo} className="group grid grid-cols-1 lg:grid-cols-7 gap-4 items-center bg-white hover:bg-indigo-50/50 px-6 py-5 rounded-3xl border border-slate-100 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md">
                <div className="flex flex-col">
                  <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg w-fit mb-1">{seller.legajo}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{seller.exa}</span>
                </div>
                <div>
                  <h4 className="text-[13px] font-black text-slate-900 uppercase italic">{seller.name}</h4>
                </div>
                <div className="text-[12px] font-bold text-slate-500 uppercase">
                  {seller.dni}
                </div>
                <div className="text-[12px] font-medium text-slate-600 truncate">
                  {seller.email}
                </div>
                <div>
                  <span className="text-[9px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded-lg">{seller.supervisor}</span>
                </div>
                <div className="flex justify-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${seller.status === 'ACTIVO' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                    {seller.status}
                  </span>
                </div>
                <div className="flex justify-end gap-2">
                  <button className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                  <button className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
            ))}

            {filteredSellers.length === 0 && (
              <div className="py-20 text-center glass-panel rounded-[40px]">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No se encontraron vendedores registrados.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Summary */}
        <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center">
          <div className="flex gap-8">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Plantilla</span>
              <span className="text-xl font-black text-slate-900">{sellers.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Vendedores Activos</span>
              <span className="text-xl font-black text-emerald-600">{sellers.filter(s => s.status === 'ACTIVO').length}</span>
            </div>
          </div>
          <button className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl hover:bg-indigo-600 transition-all active:scale-95">
            Exportar Nómina CSV
          </button>
        </div>
      </div>
    </div>
  );
};
