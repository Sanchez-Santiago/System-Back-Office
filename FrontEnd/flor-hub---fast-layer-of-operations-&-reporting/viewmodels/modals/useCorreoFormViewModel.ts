import { useState } from 'react';
import { z } from 'zod';
import { Sale } from '../../types';

const CorreoFormSchema = z.object({
  sap_id: z.string()
    .min(1, 'SAP ID es requerido')
    .max(255, 'Máximo 255 caracteres')
    .transform(val => val.toUpperCase()),

  telefono_contacto: z.string()
    .min(1, 'Teléfono de contacto es requerido')
    .max(20, 'Máximo 20 caracteres'),

  destinatario: z.string()
    .min(1, 'Destinatario es requerido')
    .max(255, 'Máximo 255 caracteres'),

  direccion: z.string()
    .min(1, 'Dirección es requerida')
    .max(255, 'Máximo 255 caracteres'),

  numero_casa: z.number()
    .int('Debe ser un número entero')
    .positive('Debe ser positivo'),

  localidad: z.string()
    .min(1, 'Localidad es requerida')
    .max(255, 'Máximo 255 caracteres'),

  departamento: z.string()
    .min(1, 'Departamento es requerido')
    .max(255, 'Máximo 255 caracteres'),

  codigo_postal: z.number()
    .int('Debe ser un número entero')
    .min(1000, 'Código postal inválido')
    .max(9999, 'Código postal inválido'),

  telefono_alternativo: z.string().max(20, 'Máximo 20 caracteres').optional(),
  persona_autorizada: z.string().max(255, 'Máximo 255 caracteres').optional(),
  entre_calles: z.string().max(255, 'Máximo 255 caracteres').optional(),
  barrio: z.string().max(255, 'Máximo 255 caracteres').optional(),
  piso: z.string().max(255, 'Máximo 255 caracteres').optional(),
  departamento_numero: z.string().max(255, 'Máximo 255 caracteres').optional(),
  geolocalizacion: z.string().max(255, 'Máximo 255 caracteres').optional(),
  comentario_cartero: z.string().max(255, 'Máximo 255 caracteres').optional(),
});

export type CorreoFormData = z.infer<typeof CorreoFormSchema>;

interface CorreoFormViewModelProps {
  sale?: Sale;
  onSubmit: (data: CorreoFormData) => void;
}

export function useCorreoFormViewModel({ sale, onSubmit }: CorreoFormViewModelProps) {
  const [formData, setFormData] = useState<Partial<CorreoFormData>>({
    sap_id: sale?.id || '',
    telefono_contacto: sale?.phoneNumber || '',
    destinatario: sale?.customerName || '',
    direccion: '',
    numero_casa: undefined,
    localidad: '',
    departamento: '',
    codigo_postal: undefined,
    telefono_alternativo: '',
    persona_autorizada: '',
    entre_calles: '',
    barrio: '',
    piso: '',
    departamento_numero: '',
    geolocalizacion: '',
    comentario_cartero: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof CorreoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldSchema = CorreoFormSchema.shape[field];
    if (fieldSchema) {
      const fieldResult = fieldSchema.safeParse(value);
      if (!fieldResult.success) {
        setErrors(prev => ({ ...prev, [field]: fieldResult.error.issues[0].message }));
      } else {
        setErrors(prev => ({ ...prev, [field]: '' }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = CorreoFormSchema.safeParse(formData);
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
      return;
    }
    onSubmit(result.data);
  };

  const getInputClass = (field: string, _isOptional = false) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  const state = {
    formData, errors, touched,
  };

  const actions = {
    handleChange, handleSubmit, getInputClass,
  };

  return { state, actions };
}
