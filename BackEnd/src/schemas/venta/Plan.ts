// Plan.ts
import { z } from "zod";

export const PlanSchema = z.object({
  idplan: z.number().int().positive(),
  nombre: z.string().min(1).max(45),
  precio: z.number().positive().multipleOf(0.01), // DECIMAL(6,2)
  gigabyte: z.number().int().positive(),
  llamadas: z.string().max(45), // Ej: "ilimitadas", "500 min"
  mensajes: z.string().max(45), // Ej: "ilimitados", "100 SMS"
  beneficios: z.string().max(100).nullable().optional(),
});

export const PlanCreateSchema = PlanSchema.omit({
  idplan: true,
});

export const PlanUpdateSchema = PlanSchema.omit({
  idplan: true,
}).partial();

export type Plan = z.infer<typeof PlanSchema>;
export type PlanCreate = z.infer<typeof PlanCreateSchema>;
export type PlanUpdate = z.infer<typeof PlanUpdateSchema>;
