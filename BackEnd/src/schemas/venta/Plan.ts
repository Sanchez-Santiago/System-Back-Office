// Plan.ts
import { z } from "zod";

export const PlanSchema = z.object({
  plan_id: z.number().int().positive(),
  nombre: z.string().min(1).max(45).transform(val => val.toUpperCase()),
  precio: z.number().positive().multipleOf(0.01), // DECIMAL(6,2)
  gigabyte: z.number().int().positive(),
  llamadas: z.string().max(45), // Ej: "ilimitadas", "500 min"
  mensajes: z.string().max(45), // Ej: "ilimitados", "100 SMS"
  beneficios: z.string().max(100).nullable().optional(),
  whatsapp: z.string().optional().default(""),
  roaming: z.string().optional().default(""),
  fecha_creacion: z.coerce.date().optional().default(() => new Date()),
  empresa_destinada: z.string().optional().default("").transform(val => val.toUpperCase()),
});

export const PlanCreateSchema = PlanSchema.omit({
  plan_id: true,
});

export const PlanUpdateSchema = PlanSchema.omit({
  plan_id: true,
}).partial();

export type Plan = z.infer<typeof PlanSchema>;
export type PlanCreate = z.infer<typeof PlanCreateSchema>;
export type PlanUpdate = z.infer<typeof PlanUpdateSchema>;
