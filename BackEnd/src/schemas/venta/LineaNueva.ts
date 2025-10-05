// LineaNueva.ts
import { z } from "zod";

export const LineaNuevaSchema = z.object({
  venta: z.number().int().positive(), // FK a venta.idventa (PK)
  numero_gestor: z.number().int().positive(),
});

export const LineaNuevaCreateSchema = LineaNuevaSchema;

export type LineaNueva = z.infer<typeof LineaNuevaSchema>;
export type LineaNuevaCreate = z.infer<typeof LineaNuevaCreateSchema>;
