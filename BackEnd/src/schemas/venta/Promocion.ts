// Promocion.ts
import { z } from "zod";

export const PromocionSchema = z.object({
  idpromocion: z.number().int().positive(),
  nombre: z.string().min(1).max(45),
  porcentaje: z.number()
    .min(0)
    .max(100)
    .multipleOf(0.01), // DECIMAL(5,2) - porcentaje de descuento
  empresa_destinada: z.string().max(45),
});

export const PromocionCreateSchema = PromocionSchema.omit({
  idpromocion: true,
});

export const PromocionUpdateSchema = PromocionSchema.omit({
  idpromocion: true,
}).partial();

export type Promocion = z.infer<typeof PromocionSchema>;
export type PromocionCreate = z.infer<typeof PromocionCreateSchema>;
export type PromocionUpdate = z.infer<typeof PromocionUpdateSchema>;
