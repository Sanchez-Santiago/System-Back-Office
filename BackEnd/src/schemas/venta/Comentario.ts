// Comentario.ts
import { z } from "zod";

export const ComentarioSchema = z.object({
  id: z.number().int().positive(),
  estado: z.string().max(45),
  contacto: z.string().max(45),
  comentario: z.string().max(600),
  fecha_creacion: z.coerce.date(),
  usuario: z.string().uuid(), // FK a usuario.persona_id
  venta: z.number().int().positive(), // FK a venta.idventa
});

export const ComentarioCreateSchema = ComentarioSchema.omit({
  id: true,
  fecha_creacion: true,
}).extend({
  fecha_creacion: z.coerce.date().default(() => new Date()),
});

export const ComentarioUpdateSchema = ComentarioSchema.omit({
  id: true,
  usuario: true,
  venta: true,
}).partial();

// Para respuestas con datos del usuario
export const ComentarioResponseSchema = ComentarioSchema.extend({
  usuario_nombre: z.string(),
  usuario_apellido: z.string(),
  usuario_legajo: z.string(),
});

export type Comentario = z.infer<typeof ComentarioSchema>;
export type ComentarioCreate = z.infer<typeof ComentarioCreateSchema>;
export type ComentarioUpdate = z.infer<typeof ComentarioUpdateSchema>;
export type ComentarioResponse = z.infer<typeof ComentarioResponseSchema>;
