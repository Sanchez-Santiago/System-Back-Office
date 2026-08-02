import { useState } from 'react';
import { z } from 'zod';
import { SaleStatus } from '../../types';

const EstadoVentaFormSchema = z.object({
  estado: z.nativeEnum(SaleStatus),
  descripcion: z.string().max(75, 'Máximo 75 caracteres').optional(),
});

type EstadoVentaFormData = z.infer<typeof EstadoVentaFormSchema>;

interface EstadoVentaFormViewModelProps {
  onSubmit: (data: { estado: string; descripcion?: string }) => void;
}

export function useEstadoVentaFormViewModel({ onSubmit }: EstadoVentaFormViewModelProps) {
  const [formData, setFormData] = useState<EstadoVentaFormData>({
    estado: SaleStatus.INICIAL,
    descripcion: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (field: keyof EstadoVentaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    const fieldSchema = EstadoVentaFormSchema.shape[field];
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      setErrors(prev => ({ ...prev, [field]: result.error.issues[0].message }));
    } else {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = EstadoVentaFormSchema.safeParse(formData);
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
    onSubmit({
      estado: formData.estado,
      descripcion: formData.descripcion || undefined,
    });
  };

  const getSelectClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-bold outline-none transition-all cursor-pointer ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-900 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  const getTextareaClass = (field: string) => {
    const hasError = touched[field] && errors[field];
    return `w-full border rounded-2xl px-4 py-3 text-xs font-medium outline-none transition-all resize-none ${
      hasError
        ? 'border-rose-500 bg-rose-50 text-rose-900 focus:ring-4 focus:ring-rose-100'
        : 'bg-white border-slate-200 text-slate-700 focus:ring-4 focus:ring-indigo-50'
    }`;
  };

  const state = { formData, errors, touched };
  const actions = { handleChange, handleSubmit, getSelectClass, getTextareaClass };

  return { state, actions };
}
