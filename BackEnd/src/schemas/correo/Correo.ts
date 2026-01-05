// ============================================
// BackEnd/src/schemas/correo/Correo.ts (CORREGIDO)
// ============================================
import { z } from "zod";

/**
 * Schema completo de Correo según la base de datos
 */
export const CorreoSchema = z.object({
  sap_id: z.string().max(12).transform(val => val.toUpperCase()),
  telefono_contacto: z.string().max(20),
  telefono_alternativo: z.string().max(20).nullable().optional(),
  destinatario: z.string().max(45),
  persona_autorizada: z.string().max(45).nullable().optional(),
  direccion: z.string().max(75),
  numero_casa: z.number().int().positive(),
  entre_calles: z.string().max(85).nullable().optional(),
  barrio: z.string().max(45).nullable().optional(),
  localidad: z.string().max(45),
  departamento: z.string().max(45),
  codigo_postal: z.number().int().positive(),
  fecha_creacion: z.coerce.date(),
  fecha_limite: z.coerce.date(),
});

/**
 * Schema para crear un correo nuevo
 */
export const CorreoCreateSchema = CorreoSchema.omit({
  fecha_creacion: true,
  fecha_limite: true,
});

/**
 * Schema para actualizar un correo existente
 */
export const CorreoUpdateSchema = CorreoSchema.omit({
  sap_id: true,
  fecha_creacion: true,
}).partial();

// ============================================
// TIPOS TYPESCRIPT
// ============================================
export type Correo = z.infer<typeof CorreoSchema>;
export type CorreoCreate = z.infer<typeof CorreoCreateSchema>;
export type CorreoUpdate = z.infer<typeof CorreoUpdateSchema>;
