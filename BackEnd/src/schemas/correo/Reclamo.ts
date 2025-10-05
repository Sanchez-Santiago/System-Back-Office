// Reclamo.ts
import { z } from "zod";

export const ReclamoSchema = z.object({
  id_reclamo: z.number().int().positive(),
  fecha_creacion: z.coerce.date(),
  datos_adicionales: z.string().max(50).nullable().optional(),
  comentario: z.string().max(600),
  sap: z.string().max(25), // FK a correo.sap
});

export const ReclamoCreateSchema = ReclamoSchema.omit({
  id_reclamo: true,
  fecha_creacion: true,
}).extend({
  fecha_creacion: z.coerce.date().default(() => new Date()),
});

export const ReclamoUpdateSchema = ReclamoSchema.omit({
  id_reclamo: true,
  sap: true,
}).partial();

export type Reclamo = z.infer<typeof ReclamoSchema>;
export type ReclamoCreate = z.infer<typeof ReclamoCreateSchema>;
export type ReclamoUpdate = z.infer<typeof ReclamoUpdateSchema>;
