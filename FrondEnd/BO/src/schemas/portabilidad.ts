import { z } from 'zod';
import { commonSchemas } from './common';

export const portabilidadSchema = z.object({
  spn: z.string().min(3, 'SPN requerido').max(50, 'Máximo 50 caracteres'),
  empresa_origen_id: commonSchemas.idNumerico,
  mercado_origen: z.string().min(2, 'Mercado origen requerido').max(50, 'Máximo 50 caracteres'),
  numero_porta: commonSchemas.phone,
  pin: z.number()
    .min(1000, 'PIN inválido')
    .max(9999, 'PIN inválido'),
});

export const portabilidadUpdateSchema = portabilidadSchema.partial();

// Tipos inferidos
export type PortabilidadCreate = z.infer<typeof portabilidadSchema>;
export type PortabilidadUpdate = z.infer<typeof portabilidadUpdateSchema>;