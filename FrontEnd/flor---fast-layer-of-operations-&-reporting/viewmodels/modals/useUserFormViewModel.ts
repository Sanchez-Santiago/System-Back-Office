import { useState, useEffect } from 'react';
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

const ROL_PERMISOS_MAP: Record<string, string[]> = {
  VENDEDOR: ['VENDEDOR'],
  SUPERVISOR: ['SUPERVISOR', 'VENDEDOR'],
  BACK_OFFICE: ['BACK_OFFICE'],
  ADMIN: ['ADMIN', 'BACK_OFFICE', 'SUPERVISOR', 'VENDEDOR'],
  SUPERADMIN: ['SUPERADMIN', 'ADMIN', 'BACK_OFFICE', 'SUPERVISOR', 'VENDEDOR'],
};

const initialFormState = {
  nombre: '',
  apellido: '',
  documento: '',
  tipo_documento: 'DNI' as const,
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

export function useUserFormViewModel(
  editingUser: EditingUser | null,
  onClose: () => void,
  onSuccess: () => void,
) {
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
        tipo_documento: (editingUser.tipo_documento as UserFormData['tipo_documento']) || 'DNI',
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

  const state = {
    formData, errors, touched, loading, error,
    showPassword, showPasswordField, isEditing,
  };

  const actions = {
    handleChange, handleRolChange, togglePermiso, handleSubmit,
    setShowPassword, setShowPasswordField,
  };

  return { state, actions };
}
