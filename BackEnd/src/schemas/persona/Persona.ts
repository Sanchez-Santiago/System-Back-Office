import { z } from "zod";

export const PersonaSchema = z.object({
  id_persona: z.string().uuid(),
  nombre: z.string().min(1).max(45),
  apellido: z.string().min(1).max(45),
  fecha_nacimiento: z.coerce.date(),
  documento: z.string().min(1).max(30),
  email: z.string().email().max(255),
  creado_en: z.coerce.date().default(() => new Date()),
  telefono: z.string().max(20).nullable().optional(),
  tipo_documento: z.string().max(45),
  nacionalidad: z.string().max(45),
  genero: z.enum(["Masculino", "Femenino", "Otro", "Prefiero no decir"])
    .nullable().optional(),
});

export const PersonaCreateSchema = PersonaSchema.omit({
  id_persona: true,
  creado_en: true,
});

export const PersonaUpdateSchema = PersonaSchema.omit({
  id_persona: true,
  creado_en: true,
}).partial();

export type Persona = z.infer<typeof PersonaSchema>;
export type PersonaCreate = z.infer<typeof PersonaCreateSchema>;
export type PersonaUpdate = z.infer<typeof PersonaUpdateSchema>;
