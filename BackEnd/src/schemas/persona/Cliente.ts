// Cliente.ts
import { z } from "zod";

export const ClienteSchema = z.object({
  persona_id: z.string().uuid(), // FK a persona.id_persona
});

export const ClienteCreateSchema = z.object({
  persona_id: z.string().uuid(),
});

// Para respuestas con datos completos
export const ClienteResponseSchema = ClienteSchema.extend({
  nombre: z.string(),
  apellido: z.string(),
  email: z.string().email(),
  documento: z.string(),
  telefono: z.string().optional(),
  fecha_nacimiento: z.coerce.date(),
});

export type Cliente = z.infer<typeof ClienteSchema>;
export type ClienteCreate = z.infer<typeof ClienteCreateSchema>;
export type ClienteResponse = z.infer<typeof ClienteResponseSchema>;
