// Correo.ts
import { z } from "zod";

export const CorreoSchema = z.object({
  sap: z.string().max(25),
  referencia: z.string().max(50).nullable().optional(),
  telefono_contacto: z.string().max(20),
  telefono_alternativo: z.string().max(20).nullable().optional(),
  destinatario: z.string().max(100),
  persona_autorizada: z.string().max(100).nullable().optional(),
  direccion: z.string().max(100),
  localidad: z.string().max(45),
  departamento: z.string().max(45),
  estado_correo: z.string().max(45).default("inicial"),
  fecha_entrega: z.coerce.date().nullable().optional(),
  codigo_postal: z.number().int().positive(),
  entrega_ok: z.string().max(45).nullable().default("inicial"),
  fecha_creacion: z.coerce.date(),
  fecha_limite: z.coerce.date(),
  numero_casa: z.number().int().positive(),
  estado_descripcion: z.string().max(45),
});

export const CorreoCreateSchema = CorreoSchema.omit({
  estado_correo: true,
  entrega_ok: true,
}).extend({
  fecha_limite: z.coerce.date().refine(
    (date, ctx) => {
      const creacion = ctx.parent?.fecha_creacion;
      return !creacion || date >= creacion;
    },
    { message: "Fecha límite debe ser mayor o igual a fecha de creación" },
  ),
});

export const CorreoUpdateSchema = CorreoSchema.partial();

export type Correo = z.infer<typeof CorreoSchema>;
export type CorreoCreate = z.infer<typeof CorreoCreateSchema>;
export type CorreoUpdate = z.infer<typeof CorreoUpdateSchema>;
