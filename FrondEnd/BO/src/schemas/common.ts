import { z } from 'zod';

// Validaciones comunes reutilizables
export const phoneRegex = /^\+?[1-9]\d{1,14}$/;
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const commonSchemas = {
  phone: z.string().regex(phoneRegex, 'Formato de teléfono inválido. Use: +34 600 000 000'),
  email: z.string().email('Email inválido'),
  uuid: z.string().regex(uuidRegex, 'ID inválido'),
  nombre: z.string().min(2, 'Mínimo 2 caracteres').max(50, 'Máximo 50 caracteres'),
  precio: z.number().min(0, 'El precio no puede ser negativo'),
  idNumerico: z.number().min(1, 'ID inválido'),
  textoOpcional: z.string().optional(),
  numeroOpcional: z.number().optional(),
  codigoPostal: z.number().min(1000, 'Código postal inválido').max(99999, 'Código postal inválido'),
  password: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener una mayúscula')
    .regex(/[a-z]/, 'Debe contener una minúscula')
    .regex(/\d/, 'Debe contener un número'),
};

// Tipos básicos
export const chipEnum = z.enum(['SIM', 'ESIM'], {
  errorMap: () => ({ message: 'Seleccione un tipo de chip válido' }),
});

export const saleTypeEnum = z.enum(['PORTABILIDAD', 'LINEA_NUEVA'], {
  errorMap: () => ({ message: 'Seleccione un tipo de venta válido' }),
});

export const discountTypeEnum = z.enum(['PORCENTAJE', 'FIJO'], {
  errorMap: () => ({ message: 'Seleccione un tipo de descuento válido' }),
});

export const planTypeEnum = z.enum(['PREPAGO', 'POSTPAGO'], {
  errorMap: () => ({ message: 'Seleccione un tipo de plan válido' }),
});

export const statusEnum = z.enum(['Completada', 'Pendiente', 'Cancelada'], {
  errorMap: () => ({ message: 'Seleccione un estado válido' }),
});