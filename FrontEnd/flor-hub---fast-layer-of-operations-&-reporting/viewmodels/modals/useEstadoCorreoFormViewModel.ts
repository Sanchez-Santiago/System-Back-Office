import { useState } from 'react';
import { z } from 'zod';

export const ESTADOS_CORREO = [
  'INICIAL',
  'ASIGNADO',
  'DEVUELTO AL CLIENTE',
  'EN DEVOLUCION',
  'EN TRANSITO',
  'ENTREGADO',
  'INGRESADO CENTRO LOGISTICO - ECOMMERCE',
  'INGRESADO EN AGENCIA',
  'INGRESADO PICK UP CENTER UES',
  'NO ENTREGADO',
  'PIEZA EXTRAVIADA',
  'RENDIDO AL CLIENTE',
] as const;

const EstadoCorreoFormSchema = z.object({
  estado: z.enum(ESTADOS_CORREO),
  descripcion: z.string().max(255, 'Máximo 255 caracteres').optional(),
  ubicacion_actual: z.string().max(255, 'Máximo 255 caracteres').optional(),
});

export type EstadoCorreoFormData = z.infer<typeof EstadoCorreoFormSchema>;

interface EstadoCorreoFormViewModelProps {
  onSubmit: (data: EstadoCorreoFormData) => void;
}

export function useEstadoCorreoFormViewModel({ onSubmit }: EstadoCorreoFormViewModelProps) {
  const [formData, setFormData] = useState<EstadoCorreoFormData>({
    estado: 'INICIAL',
    descripcion: '',
    ubicacion_actual: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof EstadoCorreoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldSchema = EstadoCorreoFormSchema.shape[field];
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
    const result = EstadoCorreoFormSchema.safeParse(formData);
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

  const getSelectClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  const getInputClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  const getTextareaClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all resize-none ${
      hasError
        ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 focus:ring-4 focus:ring-rose-100'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-900/30'
    }`;
  };

  const state = { formData, errors, touched };
  const actions = { handleChange, handleSubmit, getSelectClass, getInputClass, getTextareaClass };

  return { state, actions };
}
