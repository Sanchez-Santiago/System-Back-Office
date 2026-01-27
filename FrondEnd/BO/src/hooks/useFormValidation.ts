import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

// Hook genérico para validación con Zod
export function useFormValidation<T extends z.ZodSchema>(
  schema: T,
  defaultValues?: Partial<z.infer<T>>
) {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });
}

// Hook para manejar envío de formularios con error handling mejorado
export function handleSubmitWithErrorHandling<T>(
  form: UseFormReturn<T>,
  onSubmit: (data: z.infer<T>) => Promise<void>
) {
  return async (data: z.infer<T>) => {
    try {
      await onSubmit(data);
      toast.success('Operación completada exitosamente');
    } catch (error) {
      console.error('Error en el formulario:', error);
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Ha ocurrido un error inesperado');
      }
      
      // Re-lanzar el error para que el componente pueda manejarlo si es necesario
      throw error;
    }
  };
}

// Hook para validación asíncrona (útil para verificar disponibilidad de datos)
export function useAsyncValidation<T extends z.ZodSchema>(
  schema: T,
  asyncValidations?: Record<string, (value: any) => Promise<string | null>>
) {
  const form = useFormValidation(schema);
  
  const validateFieldAsync = async (fieldName: string, value: any) => {
    if (asyncValidations && asyncValidations[fieldName]) {
      const error = await asyncValidations[fieldName](value);
      if (error) {
        form.setError(fieldName as any, { message: error });
        return false;
      }
    }
    form.clearErrors(fieldName as any);
    return true;
  };

  return {
    form,
    validateFieldAsync,
  };
}

// Hook para resetear formulario con valores por defecto
export function useFormWithReset<T extends z.ZodSchema>(
  schema: T,
  defaultValues: z.infer<T>
) {
  const form = useFormValidation(schema, defaultValues);

  const resetWithDefaults = () => {
    form.reset(defaultValues);
  };

  return {
    form,
    resetWithDefaults,
  };
}