import { z } from 'zod';
import { commonSchemas } from './common';

export const correoSchema = z.object({
  telefono_contacto: commonSchemas.phone,
  telefono_alternativo: commonSchemas.phone.optional().or(z.literal('')),
  destinatario: commonSchemas.nombre,
  persona_autorizada: commonSchemas.nombre.optional().or(z.literal('')),
  direccion: z.string().min(5, 'Dirección requerida').max(200, 'Máximo 200 caracteres'),
  numero_casa: commonSchemas.idNumerico,
  entre_calles: z.string().max(100, 'Máximo 100 caracteres').optional(),
  barrio: commonSchemas.nombre.optional(),
  localidad: commonSchemas.nombre,
  departamento: commonSchemas.nombre,
  codigo_postal: commonSchemas.codigoPostal,
});

export const correoUpdateSchema = correoSchema.partial();

export const correoFiltersSchema = z.object({
  estado: z.string().optional(),
  localidad: z.string().optional(),
  departamento: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

// Tipos inferidos
export type CorreoCreate = z.infer<typeof correoSchema>;
export type CorreoUpdate = z.infer<typeof correoUpdateSchema>;
export type CorreoFilters = z.infer<typeof correoFiltersSchema>;