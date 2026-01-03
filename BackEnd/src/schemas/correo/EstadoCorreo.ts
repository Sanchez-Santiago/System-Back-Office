// ============================================
// BackEnd/src/schemas/correo/EstadoCorreo.ts
// ============================================
import { z } from "zod";

export const EstadoCorreoSchema = z.object({
  estado_correo_id: z.number().int().positive(),
  sap_id: z.string().max(12),
  entregado_ok: z.number().int().min(0).max(1).default(0),
  estado_guia: z.string().max(45).default("INICIAL"),
  ultimo_evento_fecha: z.coerce.date(),
  ubicacion_actual: z.string().max(75).default("PENDIENTE"),
  primera_visita: z.string().max(45).nullable().optional(),
  fecha_primer_visita: z.coerce.date().nullable().optional(),
});

export const EstadoCorreoCreateSchema = EstadoCorreoSchema.omit({
  estado_correo_id: true,
});

export const EstadoCorreoUpdateSchema = EstadoCorreoSchema.omit({
  estado_correo_id: true,
}).partial();

export type EstadoCorreo = z.infer<typeof EstadoCorreoSchema>;
export type EstadoCorreoCreate = z.infer<typeof EstadoCorreoCreateSchema>;
export type EstadoCorreoUpdate = z.infer<typeof EstadoCorreoUpdateSchema>;
