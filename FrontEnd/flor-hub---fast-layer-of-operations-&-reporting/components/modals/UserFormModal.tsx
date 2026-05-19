import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { api } from '../../services/api';

const passwordRule = z.string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(100, 'Máximo 100 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un carácter especial');

const baseFields = {
  nombre: z.string().min(1, 'Nombre requerido').max(45, 'Máximo 45 caracteres'),
  apellido: z.string().min(1, 'Apellido requerido').max(45, 'Máximo 45 caracteres'),
  documento: z.string().min(1, 'Documento requerido').max(30, 'Máximo 30 caracteres'),
  tipo_documento: z.enum(['DNI', 'PASAPORTE', 'CI']).default('DNI'),
  email: z.string().email('Email inválido'),
  telefono: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  telefono_alternativo: z.string().max(20, 'Máximo 20 caracteres').optional().or(z.literal('')),
  fecha_nacimiento: z.string().min(1, 'Fecha de nacimiento requerida'),
  nacionalidad: z.enum(['ARGENTINA', 'URUGUAY', 'PARAGUAY', 'OTRO']).default('ARGENTINA'),
  genero: z.enum(['MASCULINO', 'FEMENINO', 'OTRO', 'PREFIERO NO DECIR']).default('PREFIERO NO DECIR'),
  legajo: z.string().length(5, 'El legajo debe tener exactamente 5 caracteres'),
  exa: z.string().min(4, 'Mínimo 4 caracteres').max(8, 'Máximo 8 caracteres'),
  celula: z.number().int().positive('Debe seleccionar una célula'),
  pais_venta: z.string().optional().or(z.literal('')),
  rol: z.enum(['VENDEDOR', 'SUPERVISOR', 'BACK_OFFICE', 'ADMIN', 'SUPERADMIN']),
  permisos: z.array(z.string()).min(1, 'Debe seleccionar al menos un permiso'),
  estado: z.enum(['ACTIVO', 'INACTIVO', 'SUSPENDIDO']).default('ACTIVO'),
};

const UserCreateSchema = z.object({ ...baseFields, password: passwordRule });
const UserEditSchema = z.object({ ...baseFields, password: passwordRule.optional().or(z.literal('')) });

type UserFormData = z.infer<typeof UserCreateSchema>;

interface CelulaOption {
  celula_id: number;
  nombre: string;
  pais_venta?: string | null;
}

interface EditingUser {
  usuario_id: string;
  nombre: string;
  apellido: string;
  documento: string;
  tipo_documento?: string;
  email: string;
  telefono?: string | null;
  telefono_alternativo?: string | null;
  fecha_nacimiento?: string | null;
  nacionalidad: string;
  genero: string;
  legajo: string;
  exa: string;
  celula: number;
  pais_venta?: string | null;
  rol: string;
  permisos: string[];
  estado: string;
}

interface UserFormModalProps {
  onClose: () => void;
  onSuccess: () => void;
  celulas: CelulaOption[];
  editingUser?: EditingUser | null;
}

const ROL_PERMISOS_MAP: Record<string, string[]> = {
  VENDEDOR: ['VENDEDOR'],
  SUPERVISOR: ['SUPERVISOR', 'VENDEDOR'],
  BACK_OFFICE: ['BACK_OFFICE'],
  ADMIN: ['ADMIN', 'BACK_OFFICE', 'SUPERVISOR', 'VENDEDOR'],
  SUPERADMIN: ['SUPERADMIN', 'ADMIN', 'BACK_OFFICE', 'SUPERVISOR', 'VENDEDOR'],
};

const ALL_PERMISOS = ['SUPERADMIN', 'ADMIN', 'BACK_OFFICE', 'SUPERVISOR', 'VENDEDOR'];

const PASSWORD_RULES = [
  { key: 'min', label: 'Mínimo 8 caracteres', test: (v: string) => v.length >= 8 },
  { key: 'upper', label: 'Al menos una mayúscula', test: (v: string) => /[A-Z]/.test(v) },
  { key: 'lower', label: 'Al menos una minúscula', test: (v: string) => /[a-z]/.test(v) },
  { key: 'number', label: 'Al menos un número', test: (v: string) => /[0-9]/.test(v) },
  { key: 'special', label: 'Al menos un carácter especial', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

const initialFormState = {
  nombre: '',
  apellido: '',
  documento: '',
  tipo_documento: 'DNI',
  email: '',
  telefono: '',
  telefono_alternativo: '',
  fecha_nacimiento: '',
  nacionalidad: 'ARGENTINA' as const,
  genero: 'PREFIERO NO DECIR' as const,
  legajo: '',
  exa: '',
  celula: undefined as number | undefined,
  pais_venta: '',
  rol: 'VENDEDOR' as const,
  permisos: ['VENDEDOR'] as string[],
  estado: 'ACTIVO' as const,
  password: '',
};

export const UserFormModal: React.FC<UserFormModalProps> = ({ onClose, onSuccess, celulas, editingUser }) => {
  const isEditing = !!editingUser;
  const schema = isEditing ? UserEditSchema : UserCreateSchema;

  const [formData, setFormData] = useState<Partial<UserFormData>>({ ...initialFormState });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordField, setShowPasswordField] = useState(!isEditing);

  useEffect(() => {
    if (editingUser) {
      setFormData({
        nombre: editingUser.nombre || '',
        apellido: editingUser.apellido || '',
        documento: editingUser.documento || '',
        tipo_documento: editingUser.tipo_documento || 'DNI',
        email: editingUser.email || '',
        telefono: editingUser.telefono || '',
        telefono_alternativo: editingUser.telefono_alternativo || '',
        fecha_nacimiento: editingUser.fecha_nacimiento || '',
        nacionalidad: (editingUser.nacionalidad as any) || 'ARGENTINA',
        genero: (editingUser.genero as any) || 'PREFIERO NO DECIR',
        legajo: editingUser.legajo || '',
        exa: editingUser.exa || '',
        celula: editingUser.celula,
        pais_venta: editingUser.pais_venta || '',
        rol: editingUser.rol as any || 'VENDEDOR',
        permisos: editingUser.permisos || ['VENDEDOR'],
        estado: editingUser.estado as any || 'ACTIVO',
        password: '',
      });
      setErrors({});
      setTouched({});
      setShowPasswordField(false);
    } else {
      setFormData({ ...initialFormState });
      setErrors({});
      setTouched({});
      setShowPasswordField(true);
    }
  }, [editingUser]);

  const handleChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldSchema = schema.shape[field];
    if (fieldSchema) {
      const result = fieldSchema.safeParse(value);
      setErrors(prev => ({ ...prev, [field]: result.success ? '' : result.error.issues[0].message }));
    }
  };

  const handleRolChange = (rol: string) => {
    setFormData(prev => ({ ...prev, rol: rol as any, permisos: ROL_PERMISOS_MAP[rol] || [rol] }));
    setTouched(prev => ({ ...prev, rol: true, permisos: true }));
    setErrors(prev => ({ ...prev, rol: '', permisos: '' }));
  };

  const togglePermiso = (permiso: string) => {
    const current = formData.permisos || [];
    const updated = current.includes(permiso)
      ? current.filter(p => p !== permiso)
      : [...current, permiso];
    setFormData(prev => ({ ...prev, permisos: updated }));
  };

  const validateForm = (): boolean => {
    const result = schema.safeParse(formData);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(err => {
        const field = err.path[0] as string;
        if (!newErrors[field]) newErrors[field] = err.message;
      });
      setErrors(newErrors);
      const allTouched: Record<string, boolean> = {};
      Object.keys(formData).forEach(key => { allTouched[key] = true; });
      setTouched(allTouched);
      return false;
    }
    return true;
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {
      nombre: formData.nombre?.toUpperCase(),
      apellido: formData.apellido?.toUpperCase(),
      documento: formData.documento?.toUpperCase(),
      tipo_documento: formData.tipo_documento?.toUpperCase(),
      email: formData.email?.toLowerCase(),
      telefono: formData.telefono || null,
      telefono_alternativo: formData.telefono_alternativo || null,
      fecha_nacimiento: formData.fecha_nacimiento,
      nacionalidad: formData.nacionalidad?.toUpperCase(),
      genero: formData.genero?.toUpperCase(),
      legajo: formData.legajo?.toUpperCase(),
      exa: formData.exa?.toUpperCase(),
      celula: formData.celula,
      pais_venta: formData.pais_venta || null,
      rol: formData.rol,
      permisos: formData.permisos,
      estado: formData.estado,
    };
    if (formData.password) {
      payload.password = formData.password;
    }
    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError(null);

    try {
      const payload = buildPayload();
      if (isEditing && editingUser) {
        await api.put(`/usuarios/${editingUser.usuario_id}`, payload);
      } else {
        await api.post('/usuario/register', { user: payload });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const getInputClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-[1.8vh] px-[2vh] py-[1.6vh] font-bold outline-none transition-all text-[clamp(0.75rem,1.1vh,1.4rem)] ${
      hasError
        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 focus:ring-4 focus:ring-rose-100'
        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30'
    }`;
  };

  const getSelectClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-[1.8vh] px-[2vh] py-[1.6vh] font-bold outline-none transition-all cursor-pointer text-[clamp(0.75rem,1.1vh,1.4rem)] ${
      hasError
        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100'
        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30'
    }`;
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[4vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300" />
      <div
        className="relative w-full max-w-[90vw] max-h-[88vh] flex flex-col bg-white dark:bg-slate-900 rounded-[3.5vh] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/10 z-10"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-[3vh] bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-900 dark:via-slate-900 dark:to-slate-900 text-white flex justify-between items-center relative flex-shrink-0">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
          <div className="relative z-10">
            <h3 className="font-black italic tracking-tighter uppercase text-[clamp(1.3rem,3vh,3rem)]">{isEditing ? 'Editar Usuario' : 'Agregar Usuario'}</h3>
            <p className="font-black uppercase tracking-[0.3em] opacity-80 mt-[0.3vh] text-[clamp(0.55rem,1vh,1.3rem)]">Gestión de Accesos & Legajos • FLOR HUB</p>
          </div>
          <button onClick={onClose} className="p-[1.5vh] bg-white/10 hover:bg-rose-500 rounded-[1.5vh] transition-all duration-300 relative z-10">
            <svg className="w-[2.8vh] h-[2.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mx-[3vh] mt-[1.5vh] bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-[1.5vh] p-[1.5vh] flex items-center gap-[1.5vh] animate-in slide-in-from-top-2">
            <svg className="w-[2.5vh] h-[2.5vh] text-rose-600 dark:text-rose-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="font-bold text-rose-700 dark:text-rose-400 text-[clamp(0.65rem,1vh,1.3rem)]">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-[3vh] space-y-[2.5vh] no-scrollbar">
          <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-[2.5vh] p-[2.5vh] border border-indigo-100 dark:border-indigo-800/30">
            <div className="flex items-center gap-[1.5vh] mb-[2vh]">
              <div className="w-[3.5vh] h-[3.5vh] rounded-[1.2vh] bg-indigo-500/20 flex items-center justify-center">
                <svg className="w-[2vh] h-[2vh] text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-wider text-[clamp(0.75rem,1.3vh,1.6rem)]">Información Personal</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[2vh]">
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Nombre *</label>
                <input type="text" value={formData.nombre} onChange={e => handleChange('nombre', e.target.value)} className={getInputClass('nombre')} placeholder="Juan" />
                {touched.nombre && errors.nombre && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.nombre}</span>}
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Apellido *</label>
                <input type="text" value={formData.apellido} onChange={e => handleChange('apellido', e.target.value)} className={getInputClass('apellido')} placeholder="Pérez" />
                {touched.apellido && errors.apellido && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.apellido}</span>}
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Documento *</label>
                <input type="text" value={formData.documento} onChange={e => handleChange('documento', e.target.value.toUpperCase())} className={`${getInputClass('documento')} uppercase`} placeholder="12345678" />
                {touched.documento && errors.documento && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.documento}</span>}
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Tipo Documento *</label>
                <select value={formData.tipo_documento} onChange={e => handleChange('tipo_documento', e.target.value)} className={getSelectClass('tipo_documento')}>
                  <option value="DNI">DNI</option>
                  <option value="PASAPORTE">Pasaporte</option>
                  <option value="CI">Cédula de Identidad</option>
                </select>
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Email *</label>
                <input type="email" value={formData.email} onChange={e => handleChange('email', e.target.value.toLowerCase())} className={getInputClass('email')} placeholder="juan.perez@email.com" />
                {touched.email && errors.email && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.email}</span>}
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Teléfono</label>
                <input type="tel" value={formData.telefono} onChange={e => handleChange('telefono', e.target.value)} className={getInputClass('telefono')} placeholder="+54 11 1234-5678" />
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Tel. Alternativo</label>
                <input type="tel" value={formData.telefono_alternativo} onChange={e => handleChange('telefono_alternativo', e.target.value)} className={getInputClass('telefono_alternativo')} placeholder="+54 11 8765-4321" />
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Fecha Nacimiento *</label>
                <input type="date" value={formData.fecha_nacimiento} onChange={e => handleChange('fecha_nacimiento', e.target.value)} className={getInputClass('fecha_nacimiento')} />
                {touched.fecha_nacimiento && errors.fecha_nacimiento && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.fecha_nacimiento}</span>}
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Nacionalidad *</label>
                <select value={formData.nacionalidad} onChange={e => handleChange('nacionalidad', e.target.value)} className={getSelectClass('nacionalidad')}>
                  <option value="ARGENTINA">Argentina</option>
                  <option value="URUGUAY">Uruguay</option>
                  <option value="PARAGUAY">Paraguay</option>
                  <option value="OTRO">Otro</option>
                </select>
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Género</label>
                <select value={formData.genero} onChange={e => handleChange('genero', e.target.value)} className={getSelectClass('genero')}>
                  <option value="MASCULINO">Masculino</option>
                  <option value="FEMENINO">Femenino</option>
                  <option value="OTRO">Otro</option>
                  <option value="PREFIERO NO DECIR">Prefiero no decir</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-purple-50/50 dark:bg-purple-900/10 rounded-[2.5vh] p-[2.5vh] border border-purple-100 dark:border-purple-800/30">
            <div className="flex items-center gap-[1.5vh] mb-[2vh]">
              <div className="w-[3.5vh] h-[3.5vh] rounded-[1.2vh] bg-purple-500/20 flex items-center justify-center">
                <svg className="w-[2vh] h-[2vh] text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider text-[clamp(0.75rem,1.3vh,1.6rem)]">Información Laboral</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[2vh]">
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Legajo * (5 chars)</label>
                <input type="text" value={formData.legajo} onChange={e => handleChange('legajo', e.target.value.toUpperCase())} className={`${getInputClass('legajo')} uppercase`} placeholder="V0001" maxLength={5} />
                {touched.legajo && errors.legajo && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.legajo}</span>}
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Código EXA *</label>
                <input type="text" value={formData.exa} onChange={e => handleChange('exa', e.target.value.toUpperCase())} className={`${getInputClass('exa')} uppercase`} placeholder="EXA001" maxLength={8} />
                {touched.exa && errors.exa && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.exa}</span>}
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Célula *</label>
                <select value={formData.celula || ''} onChange={e => handleChange('celula', e.target.value ? Number(e.target.value) : undefined)} className={getSelectClass('celula')}>
                  <option value="">Seleccionar célula...</option>
                  {celulas.map(c => (
                    <option key={c.celula_id} value={c.celula_id}>
                      {c.nombre || `Célula ${c.celula_id}`} {c.pais_venta ? `(${c.pais_venta})` : ''}
                    </option>
                  ))}
                </select>
                {touched.celula && errors.celula && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.celula}</span>}
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">País de Venta</label>
                <select value={formData.pais_venta} onChange={e => handleChange('pais_venta', e.target.value)} className={getSelectClass('pais_venta')}>
                  <option value="">Sin asignar</option>
                  <option value="ARGENTINA">Argentina</option>
                  <option value="URUGUAY">Uruguay</option>
                  <option value="PARAGUAY">Paraguay</option>
                </select>
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Rol *</label>
                <select value={formData.rol} onChange={e => handleRolChange(e.target.value)} className={getSelectClass('rol')}>
                  <option value="VENDEDOR">Vendedor</option>
                  <option value="SUPERVISOR">Supervisor</option>
                  <option value="BACK_OFFICE">Back Office</option>
                  <option value="ADMIN">Admin</option>
                  <option value="SUPERADMIN">Superadmin</option>
                </select>
                {touched.rol && errors.rol && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.rol}</span>}
              </div>
              <div className="flex flex-col gap-[0.8vh]">
                <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Estado</label>
                <select value={formData.estado} onChange={e => handleChange('estado', e.target.value)} className={getSelectClass('estado')}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                  <option value="SUSPENDIDO">Suspendido</option>
                </select>
              </div>
            </div>
            <div className="mt-[2vh]">
              <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)] mb-[0.8vh] block">Permisos *</label>
              <div className="flex flex-wrap gap-[1vh]">
                {ALL_PERMISOS.map(p => {
                  const selected = formData.permisos?.includes(p);
                  return (
                    <button key={p} type="button" onClick={() => togglePermiso(p)}
                      className={`px-[2vh] py-[1vh] rounded-[1.2vh] font-black uppercase tracking-wider text-[clamp(0.6rem,1vh,1.2rem)] transition-all border-2 ${
                        selected
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                          : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              {touched.permisos && errors.permisos && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)] mt-[0.5vh] block">{errors.permisos}</span>}
            </div>
          </div>

          {isEditing && !showPasswordField && (
            <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-[2.5vh] p-[2.5vh] border border-amber-100 dark:border-amber-800/30">
              <button type="button" onClick={() => setShowPasswordField(true)}
                className="px-[3vh] py-[1.5vh] bg-amber-500/20 hover:bg-amber-500/30 rounded-[1.5vh] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 transition-all text-[clamp(0.65rem,1.1vh,1.3rem)]"
              >
                Cambiar Contraseña
              </button>
            </div>
          )}

          {(showPasswordField || !isEditing) && (
            <div className="bg-amber-50/50 dark:bg-amber-900/10 rounded-[2.5vh] p-[2.5vh] border border-amber-100 dark:border-amber-800/30">
              <div className="flex items-center gap-[1.5vh] mb-[2vh]">
                <div className="w-[3.5vh] h-[3.5vh] rounded-[1.2vh] bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-[2vh] h-[2vh] text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h4 className="font-black text-amber-700 dark:text-amber-300 uppercase tracking-wider text-[clamp(0.75rem,1.3vh,1.6rem)]">Contraseña {isEditing && '(opcional)'}</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[2vh]">
                <div className="flex flex-col gap-[0.8vh]">
                  <label className="font-black text-slate-500 dark:text-slate-400 uppercase text-[clamp(0.55rem,1vh,1.2rem)]">Contraseña {isEditing ? '(opcional)' : '*'}</label>
                  <div className="relative">
                    <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={e => handleChange('password', e.target.value)} className={getInputClass('password')} placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-[1.5vh] top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                      <svg className="w-[1.8vh] h-[1.8vh]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {showPassword ? (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a10.059 10.059 0 013.999-5.123m3.999-2.123a9.96 9.96 0 013.542-.75M15 12a3 3 0 11-6 0 3 3 0 016 0z M3 3l18 18" />
                        )}
                      </svg>
                    </button>
                  </div>
                  {touched.password && errors.password && <span className="font-bold text-rose-500 text-[clamp(0.55rem,0.9vh,1rem)]">{errors.password}</span>}
                </div>
                <div className="bg-amber-100/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-[1.5vh] p-[1.5vh]">
                  <p className="font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest mb-[0.8vh] text-[clamp(0.6rem,1vh,1.2rem)]">Requisitos</p>
                  <ul className="font-medium text-amber-800 dark:text-amber-300 space-y-[0.4vh] text-[clamp(0.6rem,0.95vh,1.2rem)]">
                    {PASSWORD_RULES.map(rule => (
                      <li key={rule.key} className={rule.test(formData.password || '') ? 'text-emerald-600 dark:text-emerald-400' : ''}>
                        ✓ {rule.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </form>

        <div className="p-[2.5vh] bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-[2vh] flex-shrink-0">
          <button type="button" onClick={onClose}
            className="px-[4vh] py-[1.8vh] rounded-[22px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all text-[clamp(0.65rem,1.1vh,1.3rem)]"
          >
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit} disabled={loading}
            className="px-[4vh] py-[1.8vh] rounded-[22px] bg-indigo-600 text-white font-black uppercase tracking-widest shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all text-[clamp(0.65rem,1.1vh,1.3rem)] flex items-center gap-[1.5vh]"
          >
            {loading ? (
              <>
                <svg className="w-[2vh] h-[2vh] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {isEditing ? 'Actualizando...' : 'Creando...'}
              </>
            ) : isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
          </button>
        </div>
      </div>
    </div>
  );
};
